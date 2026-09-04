import mongoose from "mongoose";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import Friend from "../models/Friend.js";
// 1. Gửi lời mời kết bạn
export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body;
        const from = req.user._id;
        if (!to) {
            return res.status(400).json({ message: 'Vui lòng cung cấp ID người nhận' });
        }
        if (!mongoose.Types.ObjectId.isValid(to)) {
            return res.status(400).json({ message: 'ID người dùng không hợp lệ' });
        }
        if (from.toString() === to.toString()) {
            return res.status(400).json({
                message: 'Bạn không thể gửi yêu cầu kết bạn với chính mình'
            });
        }
        const userExists = await User.exists({ _id: to });
        if (!userExists) {
            return res.status(404).json({
                message: 'Người dùng không tồn tại'
            });
        }
        // Chuẩn hóa thứ tự userA < userB theo quy ước của Friend model
        const [userA, userB] = [from.toString(), to.toString()].sort();
        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({ userA, userB }),
            FriendRequest.findOne({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            })
        ]);
        if (alreadyFriends) {
            return res.status(400).json({
                message: 'Bạn đã là bạn bè với người này'
            });
        }
        if (existingRequest) {
            const isSender = existingRequest.from.toString() === from.toString();
            return res.status(400).json({
                message: isSender
                    ? 'Bạn đã gửi yêu cầu kết bạn với người này'
                    : 'Người này đã gửi yêu cầu kết bạn cho bạn'
            });
        }
        // Tạo yêu cầu kết bạn
        const request = await FriendRequest.create({
            from,
            to,
            message
        });
        return res.status(201).json({
            message: 'Yêu cầu kết bạn đã được gửi thành công',
            request
        });
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu kết bạn:', error);
        return res.status(500).json({
            message: 'Lỗi khi gửi yêu cầu kết bạn'
        });
    }
};
// 2. Chấp nhận lời mời kết bạn
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'ID yêu cầu kết bạn không hợp lệ' });
        }
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                message: 'Yêu cầu kết bạn không tồn tại'
            });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'Bạn không có quyền chấp nhận yêu cầu kết bạn này'
            });
        }
        // Chuẩn hóa thứ tự userA, userB
        const [userA, userB] = [request.from.toString(), request.to.toString()].sort();
        // Tạo quan hệ bạn bè
        const friend = await Friend.create({ userA, userB });
        // Xóa yêu cầu kết bạn
        await FriendRequest.findByIdAndDelete(requestId);
        // Lấy thông tin người gửi lời mời
        const fromUser = await User.findById(request.from)
            .select('_id displayName userName avatarUrl email')
            .lean();
        return res.status(200).json({
            message: 'Yêu cầu kết bạn đã được chấp nhận thành công',
            newFriend: fromUser
        });
    } catch (error) {
        console.error('Lỗi khi chấp nhận yêu cầu kết bạn:', error);
        return res.status(500).json({
            message: 'Lỗi khi chấp nhận yêu cầu kết bạn'
        });
    }
};
// 3. Từ chối lời mời kết bạn
export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: 'ID yêu cầu kết bạn không hợp lệ' });
        }
        const request = await FriendRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({
                message: 'Yêu cầu kết bạn không tồn tại'
            });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'Bạn không có quyền từ chối yêu cầu kết bạn này'
            });
        }
        // Xóa yêu cầu kết bạn
        await FriendRequest.findByIdAndDelete(requestId);
        return res.status(200).json({
            message: 'Đã từ chối yêu cầu kết bạn'
        });
    } catch (error) {
        console.error('Lỗi khi từ chối yêu cầu kết bạn:', error);
        return res.status(500).json({
            message: 'Lỗi khi từ chối yêu cầu kết bạn'
        });
    }
};


// 4. Lấy danh sách bạn bè
export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await Friend.find({
            $or: [{ userA: userId }, { userB: userId }]
        })
            .populate('userA', '_id displayName userName avatarUrl bio email')
            .populate('userB', '_id displayName userName avatarUrl bio email')
            .lean();

        if (!friendships.length) {
            return res.status(200).json({ friends: [] });
        }
        // Lọc lấy thông tin của người bạn (không phải chính mình)
        const friends = friendships
            .filter(friendship => friendship.userA && friendship.userB)
            .map(friendship => {
                const isUserA = friendship.userA._id.toString() === userId.toString();
                return isUserA ? friendship.userB : friendship.userA;
            });

        return res.status(200).json({ friends });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bạn bè:', error);
        return res.status(500).json({
            message: 'Lỗi khi lấy danh sách bạn bè'
        });
    }
};

// 5. Lấy danh sách lời mời kết bạn nhận được
export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;

        const populateFields = '_id displayName userName avatarUrl';

        const [sent, received] = await Promise.all([
            FriendRequest.find({
                from: userId
            })
                .populate('to', populateFields)
                .lean(),
            FriendRequest.find({
                to: userId
            })
                .populate('from', populateFields)
                .lean()
        ]);

        return res.status(200).json({
            sent: sent,
            received: received
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu kết bạn:', error);
        return res.status(500).json({
            message: 'Lỗi khi lấy danh sách yêu cầu kết bạn'
        });
    }
};

