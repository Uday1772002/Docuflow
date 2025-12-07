const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const File = require("../models/File");
const Share = require("../models/Share");
const {
  uploadToAzure,
  downloadFromAzure,
  deleteFromAzure,
} = require("../config/azureStorage");

// Upload single or multiple files
router.post(
  "/upload",
  auth,
  (req, res, next) => {
    upload.array("files", 10)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message:
              "File size exceeds limit. Maximum file size is 10MB per file.",
            error: "FILE_TOO_LARGE",
          });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
          return res.status(400).json({
            message:
              "Too many files. Maximum 10 files can be uploaded at once.",
          });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];
      const duplicateFiles = [];
      const failedFiles = [];

      for (const file of req.files) {
        try {
          // Check if file with same original name already exists for this user
          const existingFile = await File.findOne({
            owner: req.user._id,
            originalName: file.originalname,
          });

          if (existingFile) {
            duplicateFiles.push({
              name: file.originalname,
              uploadDate: existingFile.uploadDate,
            });
            continue;
          }

          // Upload to Azure Blob Storage
          const azureUpload = await uploadToAzure(file);

          const newFile = new File({
            filename: azureUpload.blobName,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: azureUpload.url, // Store Azure URL instead of local path
            owner: req.user._id,
          });

          await newFile.save();
          uploadedFiles.push(newFile);
        } catch (uploadError) {
          console.error(
            `Error uploading file ${file.originalname}:`,
            uploadError.message
          );
          failedFiles.push({
            name: file.originalname,
            error: uploadError.message,
          });
        }
      }

      // Build response message
      let message = "";
      if (uploadedFiles.length > 0) {
        message = `${uploadedFiles.length} file(s) uploaded successfully`;
      }
      if (duplicateFiles.length > 0) {
        const duplicateNames = duplicateFiles.map((f) => f.name).join(", ");
        message += message
          ? `. ${duplicateFiles.length} duplicate file(s) skipped: ${duplicateNames}`
          : `${duplicateFiles.length} duplicate file(s) already exist: ${duplicateNames}`;
      }
      if (failedFiles.length > 0) {
        const failedNames = failedFiles.map((f) => f.name).join(", ");
        message += message
          ? `. ${failedFiles.length} file(s) failed: ${failedNames}`
          : `${failedFiles.length} file(s) failed to upload: ${failedNames}`;
      }

      const statusCode =
        uploadedFiles.length > 0 ? 201 : duplicateFiles.length > 0 ? 400 : 500;

      res.status(statusCode).json({
        message,
        files: uploadedFiles,
        duplicates: duplicateFiles,
        failed: failedFiles,
        summary: {
          uploaded: uploadedFiles.length,
          duplicates: duplicateFiles.length,
          failed: failedFiles.length,
          total: req.files.length,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        message: "Error uploading files",
        details: error.message,
      });
    }
  }
);

// Get user's files
router.get("/my-files", auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .sort({ uploadDate: -1 })
      .populate("owner", "username email");

    res.json({ files });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Get files shared with user
router.get("/shared-with-me", auth, async (req, res) => {
  try {
    // Only get user-type shares where this user is explicitly in sharedWith array
    const shares = await Share.find({
      shareType: "user",
      sharedWith: req.user._id,
    })
      .populate({
        path: "file",
        populate: { path: "owner", select: "username email" },
      })
      .sort({ createdAt: -1 });

    // Filter out expired shares and null files
    const validShares = shares.filter((share) => {
      if (!share.file) return false;
      if (share.isExpired()) return false;
      return true;
    });

    res.json({ shares: validShares });
  } catch (error) {
    console.error("Get shared files error:", error);
    res.status(500).json({ message: "Error fetching shared files" });
  }
});

// Get single file details
router.get("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id).populate(
      "owner",
      "username email"
    );

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user has access
    const hasAccess =
      file.owner._id.toString() === req.user._id.toString() ||
      (await Share.exists({
        file: file._id,
        $or: [{ sharedWith: req.user._id }, { shareType: "link" }],
      }));

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ file });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ message: "Error fetching file" });
  }
});

// Download file
router.get("/:id/download", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user has access
    const isOwner = file.owner.toString() === req.user._id.toString();

    let share = null;
    if (!isOwner) {
      share = await Share.findOne({
        file: file._id,
        $or: [{ sharedWith: req.user._id }, { shareType: "link" }],
      });

      if (!share || share.isExpired()) {
        return res
          .status(403)
          .json({ message: "Access denied or share expired" });
      }

      // Check role permissions - only owner and editor can download
      if (share.role === "viewer") {
        return res.status(403).json({
          message: "Viewers cannot download files. Only viewing is allowed.",
        });
      }
    }

    // Log download activity
    if (share) {
      share.accessLog.push({
        user: req.user._id,
        action: "download",
      });
      await share.save();
    }

    // Download from Azure Blob Storage
    const stream = await downloadFromAzure(file.filename);

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );

    stream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
});

// View/Preview file (for viewers and editors)
router.get("/:id/view", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user has access
    const isOwner = file.owner.toString() === req.user._id.toString();

    let share = null;
    if (!isOwner) {
      share = await Share.findOne({
        file: file._id,
        $or: [{ sharedWith: req.user._id }, { shareType: "link" }],
      });

      if (!share || share.isExpired()) {
        return res
          .status(403)
          .json({ message: "Access denied or share expired" });
      }
    }

    // Log view activity
    if (share) {
      share.accessLog.push({
        user: req.user._id,
        action: "view",
      });
      await share.save();
    }

    // Stream from Azure Blob Storage
    const stream = await downloadFromAzure(file.filename);

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${file.originalName}"`
    );

    stream.pipe(res);
  } catch (error) {
    console.error("View file error:", error);
    res.status(500).json({ message: "Error viewing file" });
  }
});

// Delete file
router.delete("/:id", auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user is owner
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete file from Azure Blob Storage
    try {
      await deleteFromAzure(file.filename);
    } catch (err) {
      console.error("Error deleting file from Azure:", err);
    }

    // Delete all shares
    await Share.deleteMany({ file: file._id });

    // Delete file record
    await File.findByIdAndDelete(req.params.id);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
});

module.exports = router;
