import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';
import { SocketHandler } from '../src/socket.handler';
import { RoomService } from '../src/services/room.service';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'ephemeral_dev_secret';

describe('Socket.io Chat Relay', () => {
  let io: Server;
  let server: any;
  let clientSocket1: ClientSocket;
  let clientSocket2: ClientSocket;
  let port: number;

  const mockRoomService = {
    validateAndGetRoom: async (id: string) => {
      console.log(`[Mock] validateAndGetRoom actual call for ID: ${id}`);
      return {
        id: 'room-1',
        status: 'CONNECTED',
        creatorId: 'user-1',
        guestId: 'user-2',
        guestVerifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000000)
      };
    },
    getRoomById: async (id: string) => {
      console.log(`[Mock] getRoomById actual call for ID: ${id}`);
      return {
        id: 'room-1',
        status: 'CONNECTED',
        creatorId: 'user-1',
        guestId: 'user-2',
        guestVerifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000000)
      };
    },
    createRoom: jest.fn(),
    closeRoom: jest.fn()
  };

  beforeAll((done) => {
    server = createServer();
    io = new Server(server);
    
    // Pass the mock object directly
    new SocketHandler(io, mockRoomService as any);
    
    server.listen(() => {
      port = (server.address() as any).port;
      done();
    });
  });

  afterAll(() => {
    io.close();
    server.close();
  });

  beforeEach((done) => {
    const token1 = jwt.sign({ userId: 'user-1', username: 'João' }, JWT_SECRET);
    const token2 = jwt.sign({ userId: 'user-2', username: 'Amigo' }, JWT_SECRET);

    clientSocket1 = Client(`http://localhost:${port}`, {
      auth: { token: token1 }
    });
    clientSocket2 = Client(`http://localhost:${port}`, {
      auth: { token: token2 }
    });

    let connectedCount = 0;
    let connectionTimeout: NodeJS.Timeout;

    const checkConnected = () => {
      connectedCount++;
      if (connectedCount === 2) {
        if (connectionTimeout) clearTimeout(connectionTimeout);
        done();
      }
    };

    clientSocket1.on('connect', checkConnected);
    clientSocket2.on('connect', checkConnected);

    // Timeout para evitar travamento em caso de falha de conexão
    connectionTimeout = setTimeout(() => {
      if (connectedCount < 2) done('Connection timeout');
    }, 2000);
  });

  afterEach(() => {
    if (clientSocket1 && clientSocket1.connected) clientSocket1.disconnect();
    if (clientSocket2 && clientSocket2.connected) clientSocket2.disconnect();
  });

  it('should relay messages between João and his friend', (done) => {
    const roomId = 'room-1';
    const messageData = {
      roomId,
      encryptedData: 'secret-content'
    };

    // Client 2 (Amigo) listening for messages
    clientSocket2.on('receive_message', (data) => {
      try {
        expect(data.sender).toBe('João');
        expect(data.encryptedData).toBe('secret-content');
        done();
      } catch (err) {
        done(err);
      }
    });

    clientSocket2.on('room_error', (err) => {
      done(new Error(`Room error on socket 2: ${err}`));
    });

    clientSocket1.on('room_error', (err) => {
      done(new Error(`Room error on socket 1: ${err}`));
    });

    // Both clients join the room
    clientSocket1.emit('join_room', roomId);
    clientSocket2.emit('join_room', roomId);

    // Give time to join then send
    setTimeout(() => {
      clientSocket1.emit('send_message', messageData);
    }, 1000);
  }, 10000);

  it('should destroy the room immediately when panic button is triggered', (done) => {
    const roomId = 'room-1';

    // Client 2 (Amigo) listening for destruction
    clientSocket2.on('room_destroyed', (data) => {
      try {
        expect(data.reason).toBe('panic_button');
        expect(data.by).toBe('João');
        done();
      } catch (err) {
        done(err);
      }
    });

    // Join room
    clientSocket1.emit('join_room', roomId);
    clientSocket2.emit('join_room', roomId);

    // João triggers panic
    setTimeout(() => {
      clientSocket1.emit('panic_button', roomId);
    }, 500);
  }, 10000);
});
