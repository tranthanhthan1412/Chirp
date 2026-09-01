import express from 'express';
import { 
    sendFriendRequest, 
    acceptFriendRequest, 
    declineFriendRequest, 
    getAllFriends, 
    getFriendRequests 
} from '../controllers/friendController.js';

const router = express.Router();

// Gửi lời mời kết bạn (hỗ trợ cả /request và /requests)
router.post('/request', sendFriendRequest);
router.post('/requests', sendFriendRequest);

// Chấp nhận / từ chối lời mời kết bạn
router.post('/request/:requestId/accept', acceptFriendRequest);
router.post('/requests/:requestId/accept', acceptFriendRequest);
router.post('/request/:requestId/decline', declineFriendRequest);
router.post('/requests/:requestId/decline', declineFriendRequest);

// Lấy danh sách bạn bè
router.get('/', getAllFriends);

// Lấy danh sách lời mời kết bạn nhận được
router.get('/requests', getFriendRequests);

export default router;  