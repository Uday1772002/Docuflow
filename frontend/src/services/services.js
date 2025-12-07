import api from "./api";

export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  searchUsers: async (query) => {
    const response = await api.get(`/auth/users/search?query=${query}`);
    return response.data;
  },
};

export const fileService = {
  uploadFiles: async (files, onProgress) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  getMyFiles: async () => {
    const response = await api.get("/files/my-files");
    return response.data;
  },

  getSharedFiles: async () => {
    const response = await api.get("/files/shared-with-me");
    return response.data;
  },

  getFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  downloadFile: async (fileId, filename) => {
    const response = await api.get(`/files/${fileId}/download`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },
};

export const shareService = {
  shareWithUsers: async (fileId, userIds, role, expiresIn) => {
    const response = await api.post("/share/user", {
      fileId,
      userIds,
      role,
      expiresIn,
    });
    return response.data;
  },

  createShareLink: async (fileId, role, expiresIn) => {
    const response = await api.post("/share/link", {
      fileId,
      role,
      expiresIn,
    });
    return response.data;
  },

  getShareLink: async (shareLink) => {
    const response = await api.get(`/share/link/${shareLink}`);
    return response.data;
  },

  getFileShares: async (fileId) => {
    const response = await api.get(`/share/file/${fileId}`);
    return response.data;
  },

  revokeShare: async (shareId) => {
    const response = await api.delete(`/share/${shareId}`);
    return response.data;
  },

  removeUserFromShare: async (shareId, userId) => {
    const response = await api.delete(`/share/${shareId}/user/${userId}`);
    return response.data;
  },

  getAuditLog: async (fileId) => {
    const response = await api.get(`/share/audit/${fileId}`);
    return response.data;
  },
};
