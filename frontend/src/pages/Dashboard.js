import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fileService } from "../services/services";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ShareModal from "../components/ShareModal";
import FilePreviewModal from "../components/FilePreviewModal";
import Notification from "../components/Notification";
import "./Dashboard.css";

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("my-files");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    loadFiles();
  }, [activeTab]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      if (activeTab === "my-files") {
        const data = await fileService.getMyFiles();
        setFiles(data.files);
      } else {
        const data = await fileService.getSharedFiles();
        setSharedFiles(data.shares);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    if (activeTab === "my-files") {
      loadFiles();
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file._id, file.originalName);
      showNotification(
        "success",
        `${file.originalName} downloaded successfully`
      );
    } catch (error) {
      console.error("Error downloading file:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Error downloading file"
      );
    }
  };

  const handleView = (file, role) => {
    // Open file preview in modal with role info
    setSelectedFile(file);
    setSelectedRole(role);
    setShowPreviewModal(true);
  };

  const handleDelete = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await fileService.deleteFile(fileId);
        showNotification("success", "File deleted successfully");
        loadFiles();
      } catch (error) {
        console.error("Error deleting file:", error);
        showNotification("error", "Error deleting file");
      }
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>DocuFlow</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "my-files" ? "active" : ""}`}
            onClick={() => setActiveTab("my-files")}
          >
            My Files
          </button>
          <button
            className={`tab ${activeTab === "shared" ? "active" : ""}`}
            onClick={() => setActiveTab("shared")}
          >
            Shared With Me
          </button>
        </div>

        {activeTab === "my-files" && (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        )}

        <div className="files-section">
          {loading ? (
            <div className="loading">Loading files...</div>
          ) : activeTab === "my-files" ? (
            <FileList
              files={files}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onShare={handleShare}
              showActions={true}
            />
          ) : (
            <FileList
              files={sharedFiles.map((share) => share.file)}
              shares={sharedFiles}
              onDownload={handleDownload}
              onView={handleView}
              showActions={false}
            />
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          file={selectedFile}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFile(null);
          }}
          onSuccess={loadFiles}
        />
      )}

      {showPreviewModal && (
        <FilePreviewModal
          file={selectedFile}
          role={selectedRole}
          onDownload={handleDownload}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedFile(null);
            setSelectedRole(null);
          }}
        />
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

export default Dashboard;
