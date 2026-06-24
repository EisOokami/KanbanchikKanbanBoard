import multer from "multer";
import path from "path";

const __dirname = path.resolve(path.dirname(""));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "/src/uploads"));
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname),
        );
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/webp",
            "image/gif",
            "image/avif",
            "application/pdf",
            "video/mp4",
            "video/webm",
            "video/mpeg",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/vnd.ms-",
            "application/vnd.openxmlformats-",
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type"));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

export { upload };
