const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const auth = require("../middleware/auth");
const File = require("../models/File");
const Share = require("../models/Share");
const User = require("../models/User");

// Share file with specific users
router.post("/user", auth, async (req, res) => {
  try {
    const { fileId, userIds, role, expiresIn } = req.body;

    if (
      !fileId ||
      !userIds ||
      !Array.isArray(userIds) ||
      userIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "File ID and user IDs are required" });
    }

    // Check if file exists and user is owner
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only file owner can share" });
    }

    // Verify all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: "Some users not found" });
    }

    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiresIn) {
      const hours = parseInt(expiresIn);
      if (!isNaN(hours) && hours > 0) {
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }
    }

    // Create or update individual shares for each user
    const createdShares = [];

    for (const userId of userIds) {
      // Check if share already exists for this specific user
      let share = await Share.findOne({
        file: fileId,
        owner: req.user._id,
        shareType: "user",
        sharedWith: userId,
      });

      if (share) {
        // Update existing share for this user
        share.role = role || share.role;
        if (expiresAt) share.expiresAt = expiresAt;
        console.log(
          `Updated share for user ${userId} with role: ${share.role}`
        );
      } else {
        // Create new share for this user
        share = new Share({
          file: fileId,
          owner: req.user._id,
          shareType: "user",
          sharedWith: [userId],
          role: role || "viewer",
          expiresAt,
        });
        console.log(
          `Created new share for user ${userId} with role: ${role || "viewer"}`
        );
      }

      await share.save();
      await share.populate("sharedWith", "username email");
      createdShares.push(share);
    }

    res.status(201).json({
      message: "File shared successfully",
      shares: createdShares,
    });
  } catch (error) {
    console.error("Share with user error:", error);
    res.status(500).json({ message: "Error sharing file" });
  }
});

// Generate shareable link
router.post("/link", auth, async (req, res) => {
  try {
    const { fileId, role, expiresIn } = req.body;

    if (!fileId) {
      return res.status(400).json({ message: "File ID is required" });
    }

    // Check if file exists and user is owner
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only file owner can share" });
    }

    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiresIn) {
      const hours = parseInt(expiresIn);
      if (!isNaN(hours) && hours > 0) {
        expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
      }
    }

    // Check if link share already exists
    let share = await Share.findOne({
      file: fileId,
      owner: req.user._id,
      shareType: "link",
    });

    if (share) {
      // Update existing share
      console.log(
        `Updating existing share from role: ${share.role} to role: ${role}`
      );
      share.role = role || share.role;
      if (expiresAt) share.expiresAt = expiresAt;
    } else {
      // Create new share link
      console.log(`Creating new share link with role: ${role}`);
      const shareLink = uuidv4();

      share = new Share({
        file: fileId,
        owner: req.user._id,
        shareType: "link",
        shareLink,
        role: role || "viewer",
        expiresAt,
      });
    }

    await share.save();
    console.log(`Share saved with final role: ${share.role}`);

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${share.shareLink}`;

    res.status(201).json({
      message: share.isNew
        ? "Share link created successfully"
        : "Share link updated successfully",
      share,
      shareUrl,
    });
  } catch (error) {
    console.error("Create share link error:", error);
    res.status(500).json({ message: "Error creating share link" });
  }
});

// Access file via share link
router.get("/link/:shareLink", auth, async (req, res) => {
  try {
    const { shareLink } = req.params;

    const share = await Share.findOne({ shareLink }).populate({
      path: "file",
      populate: { path: "owner", select: "username email" },
    });

    if (!share) {
      return res.status(404).json({ message: "Share link not found" });
    }

    if (!share.file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if expired
    if (share.isExpired()) {
      return res.status(403).json({ message: "Share link has expired" });
    }

    // Log access
    share.accessLog.push({
      user: req.user._id,
      action: "view",
    });
    await share.save();

    res.json({
      file: share.file,
      share: {
        role: share.role,
        expiresAt: share.expiresAt,
        shareType: share.shareType,
      },
    });
  } catch (error) {
    console.error("Access share link error:", error);
    res.status(500).json({ message: "Error accessing share link" });
  }
});

// Get all shares for a file
router.get("/file/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if file exists and user is owner
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const shares = await Share.find({ file: fileId })
      .populate("sharedWith", "username email")
      .sort({ createdAt: -1 });

    res.json({ shares });
  } catch (error) {
    console.error("Get shares error:", error);
    res.status(500).json({ message: "Error fetching shares" });
  }
});

// Revoke share
router.delete("/:shareId", auth, async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(404).json({ message: "Share not found" });
    }

    // Check if user is owner
    if (share.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Share.findByIdAndDelete(shareId);

    res.json({ message: "Share revoked successfully" });
  } catch (error) {
    console.error("Revoke share error:", error);
    res.status(500).json({ message: "Error revoking share" });
  }
});

// Remove specific user from share
router.delete("/:shareId/user/:userId", auth, async (req, res) => {
  try {
    const { shareId, userId } = req.params;

    const share = await Share.findById(shareId);
    if (!share) {
      return res.status(404).json({ message: "Share not found" });
    }

    // Check if user is owner
    if (share.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (share.shareType !== "user") {
      return res.status(400).json({ message: "This is not a user share" });
    }

    // Remove user from sharedWith array
    share.sharedWith = share.sharedWith.filter(
      (id) => id.toString() !== userId
    );

    if (share.sharedWith.length === 0) {
      // Delete share if no users left
      await Share.findByIdAndDelete(shareId);
      return res.json({ message: "Share deleted (no users remaining)" });
    }

    await share.save();
    res.json({ message: "User removed from share", share });
  } catch (error) {
    console.error("Remove user from share error:", error);
    res.status(500).json({ message: "Error removing user from share" });
  }
});

// Get audit log for a file
router.get("/audit/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    // Check if file exists and user is owner
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const shares = await Share.find({ file: fileId })
      .populate("accessLog.user", "username email")
      .select("accessLog shareType sharedWith shareLink");

    // Flatten and sort access logs
    const logs = [];
    shares.forEach((share) => {
      share.accessLog.forEach((log) => {
        logs.push({
          user: log.user,
          action: log.action,
          timestamp: log.timestamp,
          shareType: share.shareType,
        });
      });
    });

    logs.sort((a, b) => b.timestamp - a.timestamp);

    res.json({ logs });
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({ message: "Error fetching audit log" });
  }
});

module.exports = router;
