import React, { useState, useEffect } from "react";
import { FiX, FiCopy, FiLink, FiUsers } from "react-icons/fi";
import { shareService, authService } from "../services/services";
import Notification from "./Notification";
import "./ShareModal.css";

const ShareModal = ({ file, onClose, onSuccess }) => {
  const [shareType, setShareType] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expiresIn, setExpiresIn] = useState("");
  const [role, setRole] = useState("viewer");
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingShares, setExistingShares] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    loadExistingShares();
  }, [file._id]);

  const loadExistingShares = async () => {
    try {
      const data = await shareService.getFileShares(file._id);
      setExistingShares(data.shares);

      // Find existing link share
      const linkShare = data.shares.find((s) => s.shareType === "link");
      if (linkShare) {
        setShareLink(`${window.location.origin}/shared/${linkShare.shareLink}`);
        // Pre-fill role from existing share
        setRole(linkShare.role);
      }
    } catch (error) {
      console.error("Error loading shares:", error);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await authService.searchUsers(query);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleSelectUser = (user) => {
    if (!selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleShareWithUsers = async () => {
    if (selectedUsers.length === 0) {
      showNotification("warning", "Please select at least one user");
      return;
    }

    setLoading(true);
    try {
      await shareService.shareWithUsers(
        file._id,
        selectedUsers.map((u) => u._id),
        role,
        expiresIn
      );
      showNotification("success", "File shared successfully!");
      setSelectedUsers([]);
      loadExistingShares();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error sharing file:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Error sharing file"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const data = await shareService.createShareLink(
        file._id,
        role,
        expiresIn
      );
      setShareLink(data.shareUrl);
      showNotification("success", data.message || "Share link generated!");
      loadExistingShares();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error generating link:", error);
      showNotification(
        "error",
        error.response?.data?.message || "Error generating link"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    showNotification("success", "Link copied to clipboard!");
  };

  const handleRevokeShare = async (shareId) => {
    if (window.confirm("Are you sure you want to revoke this share?")) {
      try {
        await shareService.revokeShare(shareId);
        showNotification("success", "Share access revoked successfully");
        loadExistingShares();
        setShareLink("");
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Error revoking share:", error);
        showNotification("error", "Error revoking share");
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share File</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="file-info-box">
          <p>
            <strong>File:</strong> {file.originalName}
          </p>
        </div>

        <div className="share-tabs">
          <button
            className={`share-tab ${shareType === "user" ? "active" : ""}`}
            onClick={() => setShareType("user")}
          >
            <FiUsers /> Share with Users
          </button>
          <button
            className={`share-tab ${shareType === "link" ? "active" : ""}`}
            onClick={() => setShareType("link")}
          >
            <FiLink /> Share via Link
          </button>
        </div>

        <div className="modal-body">
          {shareType === "user" ? (
            <div className="share-user-section">
              <div className="form-group">
                <label>Search Users</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search by username or email..."
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="search-result-item"
                        onClick={() => handleSelectUser(user)}
                      >
                        <strong>{user.username}</strong>
                        <span>{user.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="selected-users">
                  <label>Selected Users:</label>
                  <div className="user-tags">
                    {selectedUsers.map((user) => (
                      <div key={user._id} className="user-tag">
                        {user.username}
                        <button onClick={() => handleRemoveUser(user._id)}>
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Access Level</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Expires In (hours)</label>
                  <input
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    placeholder="Leave empty for no expiry"
                    min="1"
                  />
                </div>
              </div>

              <button
                onClick={handleShareWithUsers}
                disabled={loading || selectedUsers.length === 0}
                className="btn-primary"
              >
                {loading ? "Sharing..." : "Share with Users"}
              </button>
            </div>
          ) : (
            <div className="share-link-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Access Level</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Expires In (hours)</label>
                  <input
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    placeholder="Leave empty for no expiry"
                    min="1"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="btn-primary"
              >
                {loading
                  ? shareLink
                    ? "Updating..."
                    : "Generating..."
                  : shareLink
                  ? "Update Share Link"
                  : "Generate Share Link"}
              </button>

              {shareLink && (
                <div className="link-display">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="link-input"
                  />
                  <button onClick={handleCopyLink} className="btn-copy">
                    <FiCopy /> Copy
                  </button>
                </div>
              )}
            </div>
          )}

          {existingShares.length > 0 && (
            <div className="existing-shares">
              <h3>Existing Shares</h3>
              {existingShares.map((share) => (
                <div key={share._id} className="share-item">
                  <div className="share-info">
                    {share.shareType === "user" ? (
                      <>
                        <FiUsers />
                        <span>
                          {share.sharedWith?.map((u) => u.username).join(", ")}
                        </span>
                        <span className="role-badge">{share.role}</span>
                      </>
                    ) : (
                      <>
                        <FiLink />
                        <span>Share Link</span>
                        <span className="role-badge">{share.role}</span>
                      </>
                    )}
                    {share.expiresAt && (
                      <span className="expiry">
                        Expires: {new Date(share.expiresAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRevokeShare(share._id)}
                    className="btn-revoke"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

export default ShareModal;
