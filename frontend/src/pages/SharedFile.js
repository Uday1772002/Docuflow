import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shareService, fileService } from "../services/services";
import { useAuth } from "../context/AuthContext";
import "./SharedFile.css";

const SharedFile = () => {
  const { shareLink } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [shareInfo, setShareInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadSharedFile();
  }, [shareLink, isAuthenticated]);

  const loadSharedFile = async () => {
    try {
      const data = await shareService.getShareLink(shareLink);
      setFile(data.file);
      setShareInfo(data.share);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to access this file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await fileService.downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file");
    }
  };

  const getFilePreviewUrl = () => {
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

  if (loading) {
    return (
      <div className="shared-file-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-file-container">
        <div className="error-box">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="shared-file-container">
      <div className="shared-file-card">
        <h1>Shared File</h1>

        {/* File Preview Section */}
        {isPreviewable() && (
          <div className="file-preview">
            {file.mimetype.startsWith("image/") ? (
              <img
                src={getFilePreviewUrl()}
                alt={file.originalName}
                className="preview-image"
              />
            ) : file.mimetype === "application/pdf" ? (
              <iframe
                src={getFilePreviewUrl()}
                title={file.originalName}
                className="preview-iframe"
              />
            ) : (
              <iframe
                src={getFilePreviewUrl()}
                title={file.originalName}
                className="preview-iframe"
              />
            )}
          </div>
        )}

        <div className="file-details">
          <div className="detail-row">
            <strong>Filename:</strong>
            <span>{file.originalName}</span>
          </div>
          <div className="detail-row">
            <strong>Size:</strong>
            <span>{formatFileSize(file.size)}</span>
          </div>
          <div className="detail-row">
            <strong>Type:</strong>
            <span>{file.mimetype}</span>
          </div>
          <div className="detail-row">
            <strong>Owner:</strong>
            <span>{file.owner?.username}</span>
          </div>
          <div className="detail-row">
            <strong>Uploaded:</strong>
            <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
          </div>
          {shareInfo && (
            <div className="detail-row">
              <strong>Access Level:</strong>
              <span className="access-badge">{shareInfo.role}</span>
            </div>
          )}
        </div>
        <div className="action-buttons">
          {shareInfo?.role === "editor" && (
            <button onClick={handleDownload} className="btn-primary">
              Download File
            </button>
          )}
          {shareInfo?.role === "viewer" && (
            <div className="viewer-notice">
              <p>📄 You have view-only access to this file</p>
            </div>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-secondary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedFile;
