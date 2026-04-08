import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtPayloadSession } from '@ephemeral/shared';
import { RoomService } from './services/room.service';
import { PrismaRoomRepository } from './repositories/prisma/prisma-room-repository';

export class SocketHandler {
  private jwtSecret = process.env.JWT_SECRET || 'ephemeral_dev_secret';
  private expirationTimers = new Map<string, NodeJS.Timeout[]>();

  constructor(
    private io: Server,
    private roomService: RoomService
  ) {
    this.setupMiddleware();
    this.setupEvents();
  }

  private setupMiddleware() {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      try {
        const decoded = jwt.verify(token, this.jwtSecret) as JwtPayloadSession;
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEvents() {
    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user as JwtPayloadSession;
      console.log(`[Socket] User connected: ${user.username} (${socket.id})`);

      socket.on('join_room', async (roomId: string) => {
        try {
          // Usar RoomService para lidar com a lógica de entrada (incluindo atribuição de guestId)
          const room = await this.roomService.joinRoom(roomId, user.userId);
          
          if (!room) {
            socket.emit('room_error', 'Room not found');
            return;
          }

          socket.join(roomId);
          console.log(`[Socket] ${user.username} joined room ${roomId}`);

          // Notificar outros na sala
          socket.to(roomId).emit('user_joined', { username: user.username });

          // Lógica de alerta de expiração
          this.setupExpirationTimers(socket, room);
        } catch (error: any) {
          console.error('[Socket/join_room] error:', error.message);
          socket.emit('room_error', error.message || 'Failed to join room');
        }
      });

      socket.on('send_message', async (data: { roomId: string; encryptedData: string }) => {
        const { roomId, encryptedData } = data;
        console.log(`[Socket] Message from ${user.username} for room ${roomId}. Data length: ${encryptedData.length}`);
        
        // Relayer: repassa para todos os outros na sala
        // Removida verificação restritiva de 'guestVerifiedAt' para evitar race conditions no relay
        socket.to(roomId).emit('receive_message', {
          sender: user.username,
          encryptedData,
          timestamp: new Date().toISOString()
        });
      });
      
      socket.on('panic_button', async (roomId: string) => {
        try {
          // Destruição imediata da sala (Hard Delete no DB)
          await this.roomService.destroyRoom(roomId, user.userId);
          
          // Notificar destruição para todos na sala (incluindo quem apertou)
          this.io.to(roomId).emit('room_destroyed', { 
            reason: 'panic_button',
            by: user.username 
          });

          // Limpar timers e forçar saída
          this.clearSocketTimers(socket.id);
          this.io.in(roomId).socketsLeave(roomId);
          
          console.log(`[Socket] Panic button triggered by ${user.username} for room ${roomId}`);
        } catch (error: any) {
          // Se a sala já foi deletada, ignorar erro para evitar logs confusos
          if (error.message === 'Room not found') {
            return;
          }
          console.error('[Socket/panic_button] error:', error);
          socket.emit('room_error', 'Failed to trigger panic button');
        }
      });

      socket.on('disconnecting', () => {
        console.log(`[Socket] User disconnecting: ${user.username}`);
        this.clearSocketTimers(socket.id);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected: ${socket.id}`);
      });
    });
  }

  private clearSocketTimers(socketId: string) {
    const timers = this.expirationTimers.get(socketId);
    if (timers) {
      timers.forEach(timer => clearTimeout(timer));
      this.expirationTimers.delete(socketId);
    }
  }

  private setupExpirationTimers(socket: Socket, room: any) {
    const now = new Date().getTime();
    const expiresAt = new Date(room.expiresAt).getTime();
    const timeLeft = expiresAt - now;

    const socketTimers: NodeJS.Timeout[] = [];

    // Alerta de 30 segundos
    const warningTime = timeLeft - (30 * 1000);
    if (warningTime > 0) {
      const warningTimer = setTimeout(() => {
        if (socket.connected && socket.rooms.has(room.id)) {
          socket.emit('room_expiring', { secondsLeft: 30 });
        }
      }, warningTime);
      socketTimers.push(warningTimer);
    }

    // Evento de Expiração final
    if (timeLeft > 0) {
      const expirationTimer = setTimeout(() => {
        if (socket.connected && socket.rooms.has(room.id)) {
          socket.emit('room_expired');
          socket.leave(room.id);
        }
      }, timeLeft);
      socketTimers.push(expirationTimer);
    }

    if (socketTimers.length > 0) {
      this.expirationTimers.set(socket.id, socketTimers);
    }
  }
}
