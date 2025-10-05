import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import threadsRoutes from './routes/threads.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import communityRoutes from './routes/community.routes.js';
import { configureSocket, emitTrendingRefresh } from './sockets/io.js';
import { computeTrending } from './services/trending.service.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.corsOrigin } });
global.io = io;

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

await connectDB();
configureSocket(io);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/threads', threadsRoutes);
app.use('/api/threads/:courseCode/comments', commentsRoutes);
app.use('/api/community', communityRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

server.listen(env.port, () => {
  console.log(`🚀 Community backend running on port ${env.port}`);
});

// periodic trending refresh broadcast every 5 minutes
setInterval(async () => {
  try {
    const trending = await computeTrending({ window: '7d', limit: 5 });
    emitTrendingRefresh(trending);
  } catch (error) {
    console.error('trending broadcast error', error.message);
  }
}, 5 * 60 * 1000);
