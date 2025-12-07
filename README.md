# DocuFlow - File Sharing Application

A full-stack file sharing application similar to Google Drive, built with React, Node.js, Express, and MongoDB.

## Features

### Core Features

- ✅ **User Authentication** - Secure registration and login with JWT tokens
- ✅ **File Upload** - Upload multiple files with drag-and-drop support
- ✅ **File Management** - View, download, and delete files
- ✅ **User-based Sharing** - Share files with specific users
- ✅ **Link-based Sharing** - Generate shareable links for files
- ✅ **Access Control** - Only authenticated users can access shared files
- ✅ **File Metadata** - Display filename, size, type, and upload date

### Bonus Features

- ✅ **Link Expiry** - Set expiration time for shares (hours)
- ✅ **Audit Log** - Track file views and downloads
- ✅ **Per-user Roles** - Owner/Viewer access levels
- ✅ **Bulk Upload** - Upload multiple files at once

### Security Features

- Authorization checks on all routes
- JWT-based authentication
- Password hashing with bcrypt
- File type and size validation
- Protected API endpoints
- Middleware for authentication

## Tech Stack

### Frontend

- React 18+
- React Router DOM
- Axios for API calls
- React Icons
- CSS3 with modern styling

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd DocuFlow
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Required variables:
# - PORT=5000
# - MONGODB_URI=mongodb://localhost:27017/docuflow
# - JWT_SECRET=your_secret_key
# - FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file:
# REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or start MongoDB service (macOS)
brew services start mongodb-community

# Or start MongoDB service (Linux)
sudo systemctl start mongod
```

### 5. Run the Application

**Backend (Terminal 1):**

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Frontend (Terminal 2):**

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
DocuFlow/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema
│   │   ├── File.js          # File schema
│   │   └── Share.js         # Share schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── files.js         # File management routes
│   │   └── share.js         # Sharing routes
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── upload.js        # File upload middleware
│   ├── uploads/             # Uploaded files storage
│   ├── server.js            # Express server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js      # File upload component
│   │   │   ├── FileList.js        # File list component
│   │   │   ├── ShareModal.js      # Share modal component
│   │   │   └── PrivateRoute.js    # Protected route component
│   │   ├── context/
│   │   │   └── AuthContext.js     # Auth context provider
│   │   ├── pages/
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Register.js        # Register page
│   │   │   ├── Dashboard.js       # Main dashboard
│   │   │   └── SharedFile.js      # Shared file viewer
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance
│   │   │   └── services.js        # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users/search` - Search users

### Files

- `POST /api/files/upload` - Upload files (authenticated)
- `GET /api/files/my-files` - Get user's files
- `GET /api/files/shared-with-me` - Get shared files
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

### Sharing

- `POST /api/share/user` - Share with specific users
- `POST /api/share/link` - Generate share link
- `GET /api/share/link/:shareLink` - Access via share link
- `GET /api/share/file/:fileId` - Get file shares
- `DELETE /api/share/:shareId` - Revoke share
- `DELETE /api/share/:shareId/user/:userId` - Remove user from share
- `GET /api/share/audit/:fileId` - Get audit log

## Usage Guide

### 1. Register/Login

- Navigate to `/register` to create an account
- Or login at `/login` with existing credentials

### 2. Upload Files

- Drag and drop files or click to browse
- Support for PDF, images, CSV, Excel, Word, text files, ZIP
- Maximum file size: 10MB
- Bulk upload supported (up to 10 files)

### 3. Share Files

#### Share with Users:

1. Click the share icon on a file
2. Select "Share with Users" tab
3. Search for users by username or email
4. Select users and set access level
5. Optionally set expiration time (in hours)
6. Click "Share with Users"

#### Share via Link:

1. Click the share icon on a file
2. Select "Share via Link" tab
3. Set access level (Viewer/Editor)
4. Optionally set expiration time
5. Click "Generate Share Link"
6. Copy and share the generated link

### 4. Access Shared Files

- View files shared with you in the "Shared With Me" tab
- Access share links (must be logged in)
- Download shared files

## Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables:

```
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
FRONTEND_URL=<your-frontend-url>
NODE_ENV=production
```

2. Build command: `npm install`
3. Start command: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. Set environment variable:

```
REACT_APP_API_URL=<your-backend-url>/api
```

2. Build command: `npm run build`
3. Publish directory: `build`

### Database (MongoDB Atlas)

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docuflow
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Security Considerations

1. **Authentication**: JWT tokens stored in localStorage
2. **Authorization**: Middleware checks on all protected routes
3. **File Access**: Verified ownership or share permissions
4. **Password Security**: Bcrypt hashing with salt
5. **File Validation**: Type and size checks
6. **CORS**: Configured for frontend URL only

## Supported File Types

- **Documents**: PDF, Word (.doc, .docx), Text (.txt)
- **Spreadsheets**: Excel (.xls, .xlsx), CSV
- **Images**: JPEG, PNG, GIF, WebP
- **Archives**: ZIP

## File Size Limits

- Maximum file size: 10MB per file
- Maximum files per upload: 10 files

## Features Demo

1. **Bulk Upload**: Select multiple files at once
2. **Drag & Drop**: Drag files directly to upload area
3. **Share Management**: View and revoke existing shares
4. **Audit Log**: Track who accessed your files
5. **Expiry**: Automatic access revocation after expiry

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access (for MongoDB Atlas)

### File Upload Error

- Check file size (max 10MB)
- Verify file type is supported
- Ensure `uploads/` directory exists

### Authentication Error

- Clear localStorage and login again
- Check JWT_SECRET in backend `.env`
- Verify token is being sent in headers

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # Hot reload enabled
```

## Future Enhancements

- File preview functionality
- Folder organization
- File compression
- Search and filtering
- Advanced permissions
- File versioning
- Activity notifications
- Mobile app

## License

ISC

## Author

Your Name

## Support

For issues and questions, please open an issue on GitHub.
