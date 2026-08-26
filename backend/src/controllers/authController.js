import bcrypt from 'bcrypt';
import User from "../models/User.js";
import Session from "../models/Session.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_TTL = '30m';// thuong access token se song 15p
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000;// 14 days

export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;

        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({ message: "Không thể thiếu username, password, email, firstName, lastName" });
        }

        // 1. Check nếu đã tồn tại username HOẶC email
        const duplicate = await User.findOne({
            $or: [{ userName: username }, { email }]
        });

        if (duplicate) {
            return res.status(400).json({ message: "Username hoặc email đã tồn tại" });
        }

        // 2. Mã hoá password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Tạo user mới (Khớp đúng tên userName theo User.js)
        await User.create({
            userName: username,
            hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`,
        });

        // 4. Trả về thành công
        return res.status(201).json({ message: "Đăng ký thành công" }); // Hoặc res.sendStatus(204);

    } catch (error) {
        console.log('Lỗi khi gọi signUp:', error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const signIn = async (req, res) => {
    try {
        // lay input tu req body
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Thiếu username và password' });
        }

        // lay hashpassword trong db de so voi password input
        const user = await User.findOne({ userName: username });

        if (!user) {
            return res.status(401).json({ message: 'username hoặc password không chính xác' });
        }
        // kiem tra password
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordCorrect) {
            return res.status(401).json({ message: 'username hoặc password không chính xác' });
        }
        // neu khop, tao access token voi JWT
        const accessToken = jwt.sign(
            {
                userId: user._id
            },
            process.env.ACCESS_TOKEN_SECRET,

            { expiresIn: ACCESS_TOKEN_TTL }
        )


        // tao refesh token 
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // tao session mới để lưu refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        // trả refresh token về trong cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', //cho phep backend va fronend chay tren 2 doumain khac nhau, 
            maxAge: REFRESH_TOKEN_TTL,
        })

        // access token sẽ trả thằng về trong res
        return res.status(200).json({
            message: `User ${user.displayName} đã logged in !`,
            accessToken
        });
    } catch (error) {
        console.log('Lỗi khi gọi signIn:', error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const signOut = async (req, res) => {
    try {
        // lay refresh token tu trong cookie
        const token = req.cookies.refreshToken;
        if (token) {
            // xoa refresh token trong session trong db
            await Session.deleteOne({ refreshToken: token });
            // xoa refresh token trong cookie
            res.clearCookie('refreshToken');
        }
        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        console.log('Lỗi khi gọi signOut:', error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};