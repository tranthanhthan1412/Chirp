import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        userA: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        userB: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// 1. Tạo compound unique index (đặt TRƯỚC khi tạo model)
friendSchema.index(
    {
        userA: 1,
        userB: 1,
    },
    { unique: true }
);

// 2. Tự động chuẩn hoá thứ tự userA < userB để tránh trùng lặp 2 chiều
friendSchema.pre("save", function (next) {
    if (this.userA && this.userB) {
        const a = this.userA.toString();
        const b = this.userB.toString();
        if (a > b) {
            const temp = this.userA;
            this.userA = this.userB;
            this.userB = temp;
        }
    }
    next();
});

// 3. Khởi tạo và export model Ở CUỐI CÙNG
const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
