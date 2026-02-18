const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile/');
    },
    filename: function (req, file, cb) {
        cb(null, `user-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// Init upload with more permissive settings
const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5000000, // 5MB
        files: 1, // Limit to 1 file per request
        fieldSize: 1024 * 1024, // 1MB for field size
        fields: 10 // Limit number of fields
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    // Add more permissive parsing options
    preserveNullAndUndefined: true,
    defParamCharset: 'utf8',
    defCharset: 'utf8'
});

module.exports = upload;
