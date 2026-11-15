const multer = require('multer');
const path = require('path');
const fs = require('fs');

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET)
);

let cloudinary = null;
if (cloudinaryConfigured) {
  cloudinary = require('cloudinary').v2;
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

// Ensure uploads directory exists for the local-disk fallback
const uploadDir = path.join(__dirname, '../uploads');
if (!cloudinaryConfigured && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'crop-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) under 5MB are permitted.'));
};

const upload = multer({
  storage: cloudinaryConfigured ? multer.memoryStorage() : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

const uploadBufferToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'krishisetu/crops', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

// Uploads buffered files to Cloudinary and exposes their URLs to controllers
const persistUploads = async (req, res, next) => {
  if (!cloudinaryConfigured || !req.files || req.files.length === 0) {
    return next();
  }
  try {
    req.uploadedImageUrls = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer))
    );
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, persistUploads };
