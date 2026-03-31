import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { router } from './routes';
import { PrismaClient } from '../prisma/generated/client';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api/v1', router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(`Server API is running on port ${PORT}`);
});
