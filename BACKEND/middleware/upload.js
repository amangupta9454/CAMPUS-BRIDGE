const multer = require('multer');

// Store files in memory so we can upload them directly to cloudinary buffer stream
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;
