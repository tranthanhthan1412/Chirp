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
        }, (error, result) => {
            if (!error) return resolve(result);

            // Cloudinary credentials belong to the server, not the user's session.
            // Do not expose provider errors, which may include API keys/signatures.
            const invalidCredentials = error.http_code === 401 || error.http_code === 403;
            const status = error.http_code === 400 ? 400 : 503;
            const message = invalidCredentials
                ? "Cấu hình Cloudinary không hợp lệ. Vui lòng kiểm tra Cloud name, API key và API secret trên máy chủ."
                : status === 400
                    ? "Không thể xử lý ảnh. Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ."
                    : "Không thể tải ảnh lên dịch vụ lưu trữ. Vui lòng thử lại sau.";
            reject(Object.assign(new Error(message), { status }));
        }).end(buffer);
    });
}

export const deleteAvatar = (id) => cloudinary.uploader.destroy(id);
