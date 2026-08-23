import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectedRoute = async (req, res, next) => {
    try {
        // Lấy access token từ Authorization header
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!token) {
            return res.status(401).json({ message: 'Không có token hoặc token không hợp lệ' });
        }

        // Xác minh token
        const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Tìm user trong database
        const user = await User.findById(decodedUser.userId).select('-hashedPassword');

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Gán user vào req.user để các route tiếp theo sử dụng
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(403).json({ message: 'Access token hết hạn hoặc không đúng' });
        }
        console.error('Lỗi khi xác minh JWT trong authMiddleware:', error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
};