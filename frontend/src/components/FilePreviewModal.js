import React from "react";
import { FiX, FiDownload } from "react-icons/fi";
import "./FilePreviewModal.css";

const FilePreviewModal = ({ file, role, onDownload, onClose }) => {
  const getPreviewUrl = () => {
    const token = localStorage.getItem("token");
    return `http://localhost:5001/api/files/${file._id}/view?token=${token}`;
  };

  const isPreviewable = () => {
    if (!file) return false;
    const previewableTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "text/plain",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
    ];
    return previewableTypes.includes(file.mimetype);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div
        className="preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preview-modal-header">
          <div className="preview-file-info">
            <h2>{file.originalName}</h2>
            <p>
              {formatFileSize(file.size)} • {file.mimetype}
              {role && <span className="role-badge-header">{role}</span>}
            </p>
          </div>
          <div className="preview-header-actions">
            {role === "editor" && onDownload && (
              <button
                className="preview-download-btn"
                onClick={() => onDownload(file)}
                title="Download File"
              >
                <FiDownload /> Download
              </button>
            )}
            <button className="preview-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="preview-modal-body">
          {isPreviewable() ? (
            <>
              {file.mimetype.startsWith("image/") ? (
                <div className="preview-image-container">
                  <img
                    src={getPreviewUrl()}
                    alt={file.originalName}
                    className="preview-image"
                  />
                </div>
              ) : file.mimetype === "application/pdf" ? (
                <iframe
                  src={getPreviewUrl()}
                  title={file.originalName}
                  className="preview-iframe"
                />
              ) : (
                <iframe
                  src={getPreviewUrl()}
                  title={file.originalName}
                  className="preview-iframe"
                />
              )}
            </>
          ) : (
            <div className="preview-not-available">
              <p>📄</p>
              <p>Preview not available for this file type</p>
              <p className="file-type">{file.mimetype}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
