import multer from "multer";
import path from "path";

const __dirname = path.resolve(path.dirname(""));
const allowedTypes: Readonly<Record<string, string>> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/mpeg": ".mpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        ".xlsx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        ".pptx",
};

const extensionFor = (mimetype: string): string | undefined =>
    Object.hasOwn(allowedTypes, mimetype) ? allowedTypes[mimetype] : undefined;

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

        const extension = extensionFor(file.mimetype);

        if (!extension) {
            return cb(new Error("Invalid file type"), "");
        }

        const newStoredFileName = `${file.fieldname.replace(/[^A-Za-z0-9]/g, "").slice(0, 20) || "file"}-${crypto.randomUUID()}${extension}`;

        cb(null, newStoredFileName);
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

        if (!extensionFor(file.mimetype)) {
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
