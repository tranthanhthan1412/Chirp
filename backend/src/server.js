import express from 'express'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import connectDB from './libs/db.js'
import cookieParser from 'cookie-parser'
import userRoute from './routes/userRoute.js';
import friendRoute from './routes/friendRoute.js';
import messageRoute from './routes/messageRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import cors from "cors";

dotenv.config()

const app = express();
const PORT = process.env.PORT || 5001

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// public routes
app.use('/api/auth', authRoute)

// private routes 
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/friends', friendRoute);
app.use('/api/messages', messageRoute);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
})
