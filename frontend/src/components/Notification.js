import React, { useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from "react-icons/fi";
import "./Notification.css";

const Notification = ({
  type = "success",
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FiCheckCircle className="notification-icon success" />;
      case "error":
        return <FiAlertCircle className="notification-icon error" />;
      case "warning":
        return <FiAlertCircle className="notification-icon warning" />;
      case "info":
        return <FiInfo className="notification-icon info" />;
      default:
        return <FiInfo className="notification-icon" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      case "warning":
        return "Warning";
      case "info":
        return "Info";
      default:
        return "Notification";
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <div className="notification-header">
          {getIcon()}
          <span className="notification-title">{getTitle()}</span>
          <button className="notification-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="notification-message">{message}</div>
      </div>
    </div>
  );
};

export default Notification;
