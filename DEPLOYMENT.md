# DocuFlow - Production Deployment Guide

## 🚀 Production-Ready Features

### Backend Security & Performance
- ✅ **Helmet.js** - Security headers protection
- ✅ **Rate Limiting** - DDoS protection
  - Global: 100 requests per 15 minutes
  - Auth: 5 attempts per 15 minutes
  - Upload: 20 uploads per 15 minutes
- ✅ **Compression** - Gzip compression for responses
- ✅ **Morgan** - HTTP request logging
- ✅ **Graceful Shutdown** - Proper cleanup on exit
- ✅ **Error Handling** - Centralized error middleware
- ✅ **Input Validation** - Express-validator for all inputs
- ✅ **CORS** - Configured for specific origins
- ✅ **File Size Limits** - 10MB per file, duplicate detection

### Frontend Features
- ✅ **Environment Configuration** - Separate dev/prod configs
- ✅ **Custom Notifications** - Professional UI feedback
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Optimized Build** - Production React build

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

#### Backend (.env)
```bash
# IMPORTANT: Generate a strong JWT secret
JWT_SECRET=your_very_strong_secret_minimum_32_characters_use_crypto

# Set to production
NODE_ENV=production

# Update MongoDB connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Update frontend URL to production domain
FRONTEND_URL=https://your-frontend-domain.com

# Azure Storage (already configured)
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
AZURE_STORAGE_CONTAINER_NAME=docflow-files

# Port (optional, deployment platforms usually set this)
PORT=5001
```

#### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### 2. MongoDB Atlas Configuration
- ✅ Go to MongoDB Atlas → Network Access
- ✅ Add IP Address: **0.0.0.0/0** (or specific IPs for better security)
- ✅ Wait 1-2 minutes for changes to propagate

### 3. Azure Blob Storage
- ✅ Container created: `docflow-files`
- ✅ Connection string configured in .env
- ✅ Public access: Off (files accessed via signed URLs)

---

## 🌐 Deployment Options

### Option 1: Deploy to Render (Recommended)

#### Backend Deployment on Render
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   ```
   Name: docuflow-backend
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
6. Add Environment Variables (from .env)
7. Click "Create Web Service"
8. Copy the service URL: `https://docuflow-backend.onrender.com`

#### Frontend Deployment on Render
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   ```
   Name: docuflow-frontend
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: build
   ```
4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://docuflow-backend.onrender.com/api
   ```
5. Click "Create Static Site"

### Option 2: Deploy to Railway

#### Backend on Railway
1. Go to [Railway](https://railway.app/)
2. "New Project" → "Deploy from GitHub repo"
3. Select repository and `backend` folder
4. Add all environment variables
5. Railway auto-detects Node.js and deploys
6. Copy the generated domain

#### Frontend on Railway
1. Create another service for frontend
2. Select `frontend` folder
3. Add `REACT_APP_API_URL` environment variable
4. Deploy

### Option 3: Deploy to Vercel (Frontend) + Render (Backend)

#### Frontend on Vercel
1. Go to [Vercel](https://vercel.com/)
2. Import GitHub repository
3. Configure:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```
4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```
5. Deploy

### Option 4: Deploy to Azure (Full Stack)

#### Create Azure Resources
```bash
# Login to Azure
az login

# Create resource group
az group create --name docuflow-rg --location eastus

# Backend: Create Azure Container Instance
az container create \
  --resource-group docuflow-rg \
  --name docuflow-backend \
  --image node:18-alpine \
  --cpu 1 --memory 1.5 \
  --ports 5001 \
  --dns-name-label docuflow-backend \
  --environment-variables \
    NODE_ENV=production \
    MONGODB_URI=$MONGODB_URI \
    JWT_SECRET=$JWT_SECRET

# Frontend: Create Azure Static Web App
az staticwebapp create \
  --name docuflow-frontend \
  --resource-group docuflow-rg \
  --location eastus \
  --source frontend \
  --branch main
```

---

## 🔧 Post-Deployment Steps

### 1. Update Frontend URL in Backend
- Update `FRONTEND_URL` in backend .env with actual frontend domain
- Restart backend service

### 2. Test All Features
- ✅ User registration and login
- ✅ File upload (single and multiple)
- ✅ File size validation (test >10MB file)
- ✅ Duplicate file detection
- ✅ File download
- ✅ File sharing with users
- ✅ Link generation and expiry
- ✅ Role-based access (viewer/editor)
- ✅ File preview modal
- ✅ Notifications display properly

### 3. Monitor Application
- Check logs for errors
- Monitor MongoDB Atlas metrics
- Check Azure Blob Storage usage
- Set up uptime monitoring (UptimeRobot, Pingdom)

### 4. Security Best Practices
- ✅ Never commit .env files
- ✅ Use strong JWT secret (32+ characters)
- ✅ Rotate secrets periodically
- ✅ Enable MongoDB IP whitelist
- ✅ Review Azure Storage access policies
- ✅ Set up HTTPS (automatic on most platforms)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MongoDB connection
# Ensure IP is whitelisted in MongoDB Atlas

# Check Azure Storage
# Verify connection string in .env

# Check logs
# Most platforms show logs in dashboard
```

### Frontend can't connect to backend
```bash
# Verify REACT_APP_API_URL is correct
# Check CORS settings in backend
# Ensure backend is running and accessible
```

### Rate limiting too strict
```javascript
// backend/server.js
// Adjust these values:
max: 100  // Increase for higher traffic
windowMs: 15 * 60 * 1000  // Adjust time window
```

### File upload issues
```bash
# Check file size (max 10MB)
# Verify Azure Storage container exists
# Check Azure connection string
```

---

## 📊 Performance Optimization

### Backend
- ✅ Compression enabled (gzip)
- ✅ MongoDB connection pooling (default)
- ✅ Azure Blob Storage for files
- ✅ Graceful shutdown implemented

### Frontend
```bash
# Build optimized production bundle
cd frontend
npm run build

# Files minified and compressed automatically
```

---

## 🔒 Security Headers (Helmet.js)

Automatically applied:
- Content-Security-Policy
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

---

## 📈 Monitoring & Logging

### Backend Logs
```bash
# Morgan logging formats:
# Development: 'dev' (colorful)
# Production: 'combined' (Apache-style)
```

### Health Check Endpoint
```bash
GET /api/health

Response:
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-12-07T10:30:00.000Z",
  "uptime": 3600
}
```

---

## 🚦 CI/CD (Optional)

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 📞 Support

For issues or questions:
- Check logs first
- Review this deployment guide
- Verify all environment variables
- Check MongoDB Atlas connectivity
- Verify Azure Storage access

---

## ✅ Production Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] MongoDB Atlas IP whitelisted
- [ ] Azure Blob Storage configured
- [ ] Environment variables set correctly
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] CORS configured for production domain
- [ ] Strong JWT secret generated
- [ ] File upload tested
- [ ] User authentication tested
- [ ] File sharing tested
- [ ] Rate limiting verified
- [ ] Error notifications working
- [ ] Health check endpoint accessible
- [ ] Logs monitoring set up

---

**🎉 Your DocuFlow application is now production-ready!**

Remember to:
- Never commit sensitive data (.env files)
- Monitor your application regularly
- Keep dependencies updated
- Review logs for errors
- Set up automated backups for MongoDB
