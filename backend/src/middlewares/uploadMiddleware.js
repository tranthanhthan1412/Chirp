import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
            return cb(Object.assign(new Error("Chỉ nhận ảnh JPG, PNG hoặc WebP"), { status: 400 }));
        }
        cb(null, true);
    },
});

export function uploadImageFromBuffer(buffer) {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw Object.assign(new Error("Chưa cấu hình Cloudinary trên máy chủ"), { status: 503 });
    }
    cloudinary.config({ cloud_name: CLOUDINARY_CLOUD_NAME, api_key: CLOUDINARY_API_KEY, api_secret: CLOUDINARY_API_SECRET, secure: true });
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            folder: "chirp/avatars", resource_type: "image",
            allowed_formats: ["jpg", "png", "webp"],
            transformation: [{ width: 256, height: 256, crop: "fill", gravity: "auto" }],
        }, (error, result) => error ? reject(error) : resolve(result)).end(buffer);
    });
}

export const deleteAvatar = (id) => cloudinary.uploader.destroy(id);
