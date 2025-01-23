const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const petId = req.params.id;
            console.log("Pet ID:", petId); // Debug Pet ID

            const dir = path.join(__dirname, '../uploads/pets', petId);
            console.log("Directory to create:", dir); // Debug Directory Path

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log("Directory created successfully:", dir);
            }

            cb(null, dir);
        } catch (err) {
            console.error("Error creating directory:", err.message);
            cb(new Error("Failed to create directory for photo upload"));
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    },
});


// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }
};

// Multer configuration
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
    fileFilter,
});

module.exports = { upload };
