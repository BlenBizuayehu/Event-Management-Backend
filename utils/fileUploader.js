const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for in-memory storage
const storage = multer.memoryStorage();

// Middleware to handle the file upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check for allowed image types
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB file size limit
}).single('profilePicture'); // The field name in the form-data


const uploadSingle = multer({
  storage: storage,
  // ... fileFilter and limits ...
}).single('profilePicture');

// Middleware for multiple uploads (like product images)
const uploadMultiple = multer({
  storage: storage,
  // ... fileFilter and limits ...
}).array('images', 5);

module.exports =  { uploadSingle, uploadMultiple, cloudinary };