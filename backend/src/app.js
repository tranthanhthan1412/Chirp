import express from 'express'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import cookieParser from 'cookie-parser'
import userRoute from './routes/userRoute.js';
import friendRoute from './routes/friendRoute.js';
import messageRoute from './routes/messageRoute.js';
import conversationRoute from './routes/conversationRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js';
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import fs from "fs";
import { app } from "./socket/index.js";

dotenv.config()


// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

//swagger 
const swaggerDocument = JSON.parse(fs.readFileSync(new URL('./swagger.json', import.meta.url), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// public routes
app.use('/api/auth', authRoute)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// private routes 
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/friends', friendRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversations', conversationRoute);

app.use((error, _req, res, _next) => {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : error.status || (error.name === 'MulterError' ? 400 : 500);
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Ảnh không được vượt quá 2 MB' : status < 500 || status === 503 ? error.message : 'Lỗi hệ thống, vui lòng thử lại';
    console.error('Request failed:', error.name);
    res.status(status).json({ message });
});

export default app;

