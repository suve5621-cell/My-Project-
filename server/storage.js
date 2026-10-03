const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists outside public directory
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Save file buffer to local disk
 */
function saveFile(originalName, buffer) {
  const ext = path.extname(originalName).toLowerCase();
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(UPLOADS_DIR, safeName);
  
  fs.writeFileSync(filePath, buffer);
  return {
    storedFileName: safeName,
    storagePath: filePath
  };
}

/**
 * Delete file from disk if it exists
 */
function deleteFile(storagePath) {
  if (!storagePath) return;
  try {
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
    }
  } catch (err) {
    console.warn(`Failed to delete file at ${storagePath}:`, err.message);
  }
}

/**
 * Get file buffer from disk
 */
function getFileBuffer(storagePath) {
  if (!storagePath || !fs.existsSync(storagePath)) {
    return null;
  }
  return fs.readFileSync(storagePath);
}

module.exports = {
  UPLOADS_DIR,
  saveFile,
  deleteFile,
  getFileBuffer
};
