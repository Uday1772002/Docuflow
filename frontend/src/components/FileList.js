import React from "react";
import { FiDownload, FiTrash2, FiShare2, FiEye } from "react-icons/fi";
import "./FileList.css";

const FileList = ({
  files,
  shares,
  onDownload,
  onView,
  onDelete,
  onShare,
  showActions,
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype.includes("pdf")) return "📄";
    if (mimetype.includes("sheet") || mimetype.includes("csv")) return "📊";
    if (mimetype.includes("word") || mimetype.includes("document")) return "📝";
    if (mimetype.includes("zip")) return "🗜️";
    return "📎";
  };

  if (!files || files.length === 0) {
    return <div className="no-files">No files found</div>;
  }

  // Get share role for a file
  const getShareRole = (fileId) => {
    if (!shares) return null;
    const share = shares.find((s) => s.file._id === fileId);
    return share?.role;
  };

  return (
    <div className="file-list">
      <div className="file-grid">
        {files.map((file) => {
          const shareRole = getShareRole(file._id);
          const isViewer = shareRole === "viewer";
          const isEditor = shareRole === "editor";

          return (
            <div key={file._id} className="file-card">
              <div className="file-icon">
                <span>{getFileIcon(file.mimetype)}</span>
              </div>
              <div className="file-info">
                <h3 className="file-name" title={file.originalName}>
                  {file.originalName}
                </h3>
                <p className="file-meta">
                  <span>{formatFileSize(file.size)}</span>
                  <span className="separator">•</span>
                  <span>{formatDate(file.uploadDate)}</span>
                </p>
                {file.owner && (
                  <p className="file-owner">Owner: {file.owner.username}</p>
                )}
                {shareRole && (
                  <span className="role-badge-small">{shareRole}</span>
                )}
              </div>
              <div className="file-actions">
                {/* Show View button for both viewers and editors when onView is available */}
                {(isViewer || isEditor) && onView ? (
                  <button
                    onClick={() => onView(file, shareRole)}
                    className="action-btn"
                    title={isViewer ? "View Only" : "View & Download"}
                  >
                    <FiEye />
                  </button>
                ) : (
                  <button
                    onClick={() => onDownload(file)}
                    className="action-btn"
                    title="Download"
                  >
                    <FiDownload />
                  </button>
                )}
                {showActions && (
                  <>
                    <button
                      onClick={() => onShare(file)}
                      className="action-btn"
                      title="Share"
                    >
                      <FiShare2 />
                    </button>
                    <button
                      onClick={() => onDelete(file._id)}
                      className="action-btn delete"
                      title="Delete"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;
