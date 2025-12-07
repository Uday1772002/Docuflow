# Azure Blob Storage Setup Guide for DocuFlow

## Step 1: Create Azure Storage Account

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Storage Account**:

   - Click "Create a resource"
   - Search for "Storage account"
   - Click "Create"

3. **Configure Storage Account**:

   ```
   Subscription: Your Azure subscription
   Resource Group: Create new (e.g., "DocuFlow-RG")
   Storage account name: docuflowstorage (must be globally unique, lowercase, no spaces)
   Region: Choose closest to you (e.g., East US, West Europe)
   Performance: Standard
   Redundancy: LRS (Locally-redundant storage) for dev, or GRS for production
   ```

4. **Review + Create**: Click "Review + create" → "Create"
5. **Wait**: Deployment takes about 1-2 minutes

## Step 2: Get Connection String

1. **Navigate to Storage Account**: Go to your newly created storage account
2. **Access Keys**:

   - Left sidebar → "Security + networking" → "Access keys"
   - Click "Show keys"
   - Copy **Connection string** from key1

   It will look like:

   ```
   DefaultEndpointsProtocol=https;AccountName=docuflowstorage;AccountKey=xxxxx==;EndpointSuffix=core.windows.net
   ```

## Step 3: Create Container

1. **Go to Containers**:

   - Left sidebar → "Data storage" → "Containers"
   - Click "+ Container" at the top

2. **Create Container**:
   ```
   Name: docuflow-files
   Public access level: Private (no anonymous access)
   ```
   - Click "Create"

## Step 4: Update Your .env File

Open `/Users/jayaramuday/Desktop/DocuFlow/backend/.env` and replace:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT_NAME;AccountKey=YOUR_KEY==;EndpointSuffix=core.windows.net
```

**IMPORTANT**: Replace with your actual connection string from Step 2!

## Step 5: Test the Setup

1. **Start Backend**:

   ```bash
   cd /Users/jayaramuday/Desktop/DocuFlow/backend
   npm start
   ```

2. **Check Console**: You should see:

   ```
   Azure Blob Storage initialized successfully
   MongoDB connected successfully
   Server running on port 5001
   ```

3. **Start Frontend**:

   ```bash
   cd /Users/jayaramuday/Desktop/DocuFlow/frontend
   npm start
   ```

4. **Test Upload**:
   - Login to your app
   - Upload a file
   - Check Azure Portal → Storage Account → Containers → docuflow-files
   - You should see your uploaded file!

## What Changed in the Code

### ✅ Files Modified:

1. **`config/azureStorage.js`** - NEW: Azure Blob Storage client
2. **`middleware/upload.js`** - Changed from disk storage to memory storage
3. **`routes/files.js`** - Updated upload, download, view, delete to use Azure
4. **`server.js`** - Initialize Azure Storage on startup
5. **`.env`** - Added Azure configuration

### Benefits:

- ✅ Files stored in cloud (not local disk)
- ✅ Scalable and reliable
- ✅ Works on any hosting platform
- ✅ Automatic backups by Azure
- ✅ Fast CDN delivery
- ✅ No disk space limits

## Pricing (Approximate)

**Free Tier**: Azure offers free storage limits:

- First 5 GB: Free
- 20,000 Read operations: Free
- 2,000 Write operations: Free

**After Free Tier**:

- Storage: ~$0.02 per GB/month
- Operations: $0.004 per 10,000 operations

For a small app with 100 users uploading ~10 files each:

- Storage: 1 GB = $0.02/month
- Operations: ~1,000 uploads = $0.0004/month
- **Total: Less than $1/month**

## Troubleshooting

### Error: "Azure Storage not initialized"

- Check your connection string in `.env`
- Make sure there are no extra spaces
- Verify the storage account exists in Azure Portal

### Error: "Container not found"

- Go to Azure Portal → Containers
- Verify `docuflow-files` container exists
- Check the name matches exactly (case-sensitive)

### Files not uploading

- Check backend console for errors
- Verify connection string is correct
- Try uploading a small file (< 1 MB) first

## Next Steps

After setup works:

1. ✅ Test file upload
2. ✅ Test file download
3. ✅ Test file sharing
4. ✅ Test file deletion
5. ✅ Verify files appear in Azure Portal

Your app is now ready for production deployment! 🚀
