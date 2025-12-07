const { BlobServiceClient } = require("@azure/storage-blob");

let blobServiceClient;
let containerClient;

const initializeAzureStorage = async () => {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || "docuflow-files";

    if (!connectionString) {
      console.warn(
        "Azure Storage connection string not found. Using local storage."
      );
      return null;
    }

    blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    const exists = await containerClient.exists();
    if (!exists) {
      console.log(`Creating container: ${containerName}`);
      await containerClient.create();
      console.log(`Container ${containerName} created successfully`);
    }

    console.log("Azure Blob Storage initialized successfully");
    return containerClient;
  } catch (error) {
    console.error("Failed to initialize Azure Storage:", error.message);
    return null;
  }
};

const uploadToAzure = async (file) => {
  if (!containerClient) {
    throw new Error(
      "Azure Storage not initialized. Check your connection string and container name."
    );
  }

  try {
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return {
      blobName,
      url: blockBlobClient.url,
    };
  } catch (error) {
    console.error("Error uploading to Azure:", error.message);
    throw new Error(`Failed to upload file to Azure: ${error.message}`);
  }
};

const downloadFromAzure = async (blobName) => {
  if (!containerClient) {
    throw new Error("Azure Storage not initialized");
  }

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download(0);
  return downloadResponse.readableStreamBody;
};

const deleteFromAzure = async (blobName) => {
  if (!containerClient) {
    throw new Error("Azure Storage not initialized");
  }

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.delete();
};

const generateSasUrl = async (blobName, expiryMinutes = 60) => {
  if (!containerClient) {
    throw new Error("Azure Storage not initialized");
  }

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const expiresOn = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // For simplicity, return the blob URL
  // In production, you should generate proper SAS tokens
  return blockBlobClient.url;
};

module.exports = {
  initializeAzureStorage,
  uploadToAzure,
  downloadFromAzure,
  deleteFromAzure,
  generateSasUrl,
  getContainerClient: () => containerClient,
};
