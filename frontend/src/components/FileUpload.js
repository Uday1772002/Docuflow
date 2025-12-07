import React, { useState, useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { fileService } from "../services/services";
import Notification from "./Notification";
import "./FileUpload.css";

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Check file sizes (10MB limit per file)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles
        .map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)}MB)`)
        .join(", ");
      showNotification(
        "error",
        `The following files exceed the 10MB size limit:\n${fileNames}\n\nPlease select smaller files.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    // Check file sizes (10MB limit per file)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles
        .map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)}MB)`)
        .join(", ");
      showNotification(
        "error",
        `The following files exceed the 10MB size limit:\n${fileNames}\n\nPlease select smaller files.`
      );
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showNotification("warning", "Please select files to upload");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const response = await fileService.uploadFiles(
        selectedFiles,
        (percent) => {
          setProgress(percent);
        }
      );

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Show detailed success message with duplicates info
      const summary = response.data?.summary;
      if (summary) {
        let message = "";
        let notifType = "success";

        if (summary.uploaded > 0) {
          message += `${summary.uploaded} file(s) uploaded successfully!`;
        }
        if (summary.duplicates > 0) {
          const duplicateNames =
            response.data.duplicates?.map((d) => d.name).join(", ") || "";
          message += `${message ? "\n\n" : ""}${
            summary.duplicates
          } file(s) already exist and were skipped:\n${duplicateNames}`;
          notifType = summary.uploaded > 0 ? "warning" : "warning";
        }
        if (summary.failed > 0) {
          message += `${message ? "\n\n" : ""}${
            summary.failed
          } file(s) failed to upload.`;
          notifType = "error";
        }
        showNotification(notifType, message || "Upload completed!");
      } else {
        showNotification("success", "Files uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error uploading files";
      if (error.response?.data?.error === "FILE_TOO_LARGE") {
        showNotification(
          "error",
          `${errorMessage}\n\nPlease select files smaller than 10MB.`
        );
      } else {
        showNotification("error", `Upload failed: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="file-upload">
      <div
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <FiUpload size={48} />
        <p>Drag & drop files here or click to browse</p>
        <p className="upload-hint">
          Support: PDF, Images, CSV, Excel, Word, Text, ZIP (Max 10MB)
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          style={{ display: "none" }}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({selectedFiles.length})</h3>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>
                <span>{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-upload"
          >
            {uploading ? `Uploading... ${progress}%` : "Upload Files"}
          </button>
          {uploading && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default FileUpload;
