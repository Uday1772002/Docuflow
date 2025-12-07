# 🚀 Quick Start Guide - Deploy DocuFlow in 15 Minutes

## Step 1: Update Environment Variables (2 minutes)

### Backend

1. Open `/backend/.env`
2. Generate a strong JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Copy the output and update your .env:
   ```
   JWT_SECRET=<paste_your_generated_secret_here>
   NODE_ENV=production
   ```

### Frontend

1. Create `/frontend/.env.production`:
   ```bash
   # Will update after backend deployment
   REACT_APP_API_URL=http://localhost:5001/api
   ```

## Step 2: MongoDB Atlas Setup (3 minutes)

1. Go to https://cloud.mongodb.com
2. Login to your cluster
3. Click "Network Access" (left sidebar)
4. Click "Add IP Address"
5. Select "Allow Access From Anywhere"
6. Click "Confirm"
7. **Wait 2 minutes** for changes to take effect

## Step 3: Push to GitHub (2 minutes)

```bash
cd /Users/jayaramuday/Desktop/DocuFlow

# Initialize git (if not already done)
git init
git add .
git commit -m "Production ready - DocuFlow v1.0"

# Create GitHub repo and push
# Go to https://github.com/new
# Create repo named "docuflow"
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/docuflow.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy Backend on Render (4 minutes)

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Click "Connect GitHub" → Select "docuflow" repo
4. Configure:

   - **Name**: `docuflow-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Click "Advanced" → Add Environment Variables:

   ```
   NODE_ENV=production
   MONGODB_URI=<your_mongodb_connection_string_from_atlas>
   JWT_SECRET=<generate_using_command_in_step_1>
   AZURE_STORAGE_CONNECTION_STRING=<your_azure_connection_string>
   AZURE_STORAGE_CONTAINER_NAME=docflow-files
   FRONTEND_URL=http://localhost:3000
   ```
   
   **⚠️ IMPORTANT: Use YOUR actual credentials from:**
   - MongoDB URI: MongoDB Atlas → Connect → Connection String
   - JWT Secret: Generated in Step 1
   - Azure Connection: Azure Portal → Storage Account → Access Keys

6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. **Copy the URL**: `https://docuflow-backend.onrender.com`

## Step 5: Deploy Frontend on Render (3 minutes)

1. Click "New +" → "Static Site"
2. Select "docuflow" repo
3. Configure:

   - **Name**: `docuflow-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variable:

   ```
   REACT_APP_API_URL=https://docuflow-backend.onrender.com/api
   ```

5. Click "Create Static Site"
6. Wait for deployment (2-3 minutes)
7. **Copy the URL**: `https://docuflow-frontend.onrender.com`

## Step 6: Update CORS (1 minute)

1. Go back to backend service on Render
2. Environment → Edit `FRONTEND_URL`
3. Change to: `https://docuflow-frontend.onrender.com`
4. Save → Service will auto-redeploy

## Step 7: Test Your App! 🎉

1. Open `https://docuflow-frontend.onrender.com`
2. Register a new account
3. Upload a file
4. Share the file
5. Generate a link
6. **IT WORKS!** 🎊

---

## Alternative: Deploy to Vercel (Frontend)

If you prefer Vercel for frontend:

1. Go to https://vercel.com
2. Import GitHub repo
3. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://docuflow-backend.onrender.com/api
   ```
5. Deploy!

---

## Troubleshooting

### Backend won't start

- Check MongoDB Atlas IP whitelist (Step 2)
- Wait 2 minutes after whitelisting
- Check environment variables are all set

### Frontend shows errors

- Verify REACT_APP_API_URL is correct
- Check backend is deployed and running
- Clear browser cache

### CORS errors

- Update backend FRONTEND_URL with actual frontend domain
- Redeploy backend after updating

### "Too many requests" error

- Rate limit reached, wait 15 minutes
- Normal behavior for security

---

## Your Deployed URLs

**Backend API**: `https://docuflow-backend.onrender.com`

- Health check: https://docuflow-backend.onrender.com/api/health

**Frontend App**: `https://docuflow-frontend.onrender.com`

---

## Next Steps

- [ ] Share the app URL with users
- [ ] Set up uptime monitoring (uptimerobot.com)
- [ ] Monitor logs in Render dashboard
- [ ] Bookmark DEPLOYMENT.md for reference
- [ ] Review PRODUCTION_CHECKLIST.md

---

## Need Help?

1. Check DEPLOYMENT.md for detailed guide
2. Review PRODUCTION_CHECKLIST.md
3. Check platform logs (Render dashboard)
4. Test health endpoint: GET /api/health

---

**🎉 Congratulations! Your app is live!**

Total time: ~15 minutes
Difficulty: Easy
Cost: Free (on Render free tier)
