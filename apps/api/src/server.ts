import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { router } from './routes';
import { SocketHandler } from './socket.handler';
import { RoomService } from './services/room.service';
import { NotificationService, ConsoleNotificationProvider } from './services/notification.service';
import { EmailNotificationProvider } from './services/email.provider';
import { PrismaRoomRepository } from './repositories/prisma/prisma-room-repository';

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

app.get('/', (req, res) => {
  res.json({ message: 'Ephemeral Chat API is running.', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Setup Socket.io e Notification Provider
const roomRepository = new PrismaRoomRepository();

// Usa Email (Resend) como canal de notificação — anônimo e gratuito
const notificationProvider = process.env.RESEND_API_KEY
  ? new EmailNotificationProvider()
  : new ConsoleNotificationProvider(); // fallback para dev sem API key
const notificationService = new NotificationService(notificationProvider);
const roomService = new RoomService(roomRepository, notificationService);
app.set('roomService', roomService); // Inject into Express app
new SocketHandler(io, roomService);

const PORT = process.env.PORT || 3333;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server API is running on port ${PORT}`);
  });
}

export { app, server, io };
