import User from "../models/User.js";
import { uploadImageFromBuffer, deleteAvatar } from "../middlewares/uploadMiddleware.js";
import { io } from "../socket/index.js";

const publicUser = user => {
    const value = user.toObject ? user.toObject() : user;
    const { hashedPassword, avatarId, ...safe } = value;
    return { ...safe, username: safe.userName };
};

export const authMe = async (req, res) => {
    try {
        const user = req.user; // lay tu middleware
        return res.status(200).json(publicUser(user));
    } catch (error) {
        console.error('Lỗi khi gọi authMe', error);
        return res.status(500).json({ message: 'Lỗi hệ thống' })
    }
};

export const test = async (req, res) => {
    return res.status(204).json({ message: 'test' });
};

export const searchUsers = async (req, res) => {
    const username = typeof req.query.username === "string" ? req.query.username.trim().toLowerCase() : "";
    if (!username || username.length > 100) return res.status(400).json({ message: "Nhập tên đăng nhập hợp lệ" });
    const user = await User.findOne({ userName: username, _id: { $ne: req.user._id } }).select("_id userName displayName avatarUrl bio");
    return res.json({ user: user ? publicUser(user) : null });
};

export const updateProfile = async (req, res) => {
    const { displayName, bio = "", phone = "" } = req.body;
    if (typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 80 ||
        typeof bio !== "string" || bio.length > 1000 || typeof phone !== "string" || phone.length > 30) {
        return res.status(400).json({ message: "Tên tối đa 80 ký tự, giới thiệu 1000 ký tự, điện thoại 30 ký tự" });
    }
    // Chỉ cập nhật các trường cho phép; không nhận role/password/id từ client.
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { displayName: displayName.trim(), bio: bio.trim(), phone: phone.trim() } }, { returnDocument: 'after', runValidators: true });
    const safe = publicUser(user);
    io.emit("profile-updated", { _id: String(user._id), displayName: user.displayName, avatarUrl: user.avatarUrl });
    return res.json({ user: safe });
};

export const uploadAvatar = async (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: "Vui lòng chọn ảnh" });
    let uploaded;
    try {
        uploaded = await uploadImageFromBuffer(req.file.buffer);
        // Đổi URL sau khi upload thành công; giữ avatar cũ nếu upload lỗi.
        const previous = await User.findByIdAndUpdate(req.user._id, { $set: { avatarUrl: uploaded.secure_url, avatarId: uploaded.public_id } });
        if (previous?.avatarId) void deleteAvatar(previous.avatarId).catch(() => console.warn("Không xóa được avatar cũ"));
        const user = { ...publicUser(req.user), avatarUrl: uploaded.secure_url };
        io.emit("profile-updated", { _id: String(user._id), displayName: user.displayName, avatarUrl: user.avatarUrl });
        return res.json({ user });
    } catch (error) {
        if (uploaded) void deleteAvatar(uploaded.public_id).catch(() => {});
        next(error);
    }
};
