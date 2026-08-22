import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    avatarUrl: {
        type: String, // link CDN de hien thi hinh
    },
    avatarId: {
        type: String, // cloudiary id de xoa anh khi can
    },
    bio: {
        type: String,
        maxlength: 1000,
    },
    phone: {
        type: String,
        sparse: true, // cho phep null, nhu khi nhap gia tri thi se dam bao la khong bi trung 
    },
},
    {
        timestamps: true,
    });
const User = mongoose.model('User', userSchema);
export default User;