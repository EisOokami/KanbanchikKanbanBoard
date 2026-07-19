import multer from "multer";
import path from "path";

const __dirname = path.resolve(path.dirname(""));
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "/uploads"));
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;

        if (originalName.length > 50) {
            return cb(
                new Error(
                    "Filename is too long. Maximum length is 50 characters.",
                ),
                "",
            );
        }

        cb(
            null,
            `${file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`,
        );
    },
});

const upload = multer({
    storage,
    fileFilter: async (req, file, cb) => {
        if (file.originalname.length > 50) {
            return cb(
                new Error("File rejection: Filename exceeds 50 characters."),
            );
        }

        if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
            return cb(new Error("Invalid file type"));
        }

        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024,
        fieldNameSize: 100,
        files: 5,
        fields: 10,
    },
});

export { upload };
