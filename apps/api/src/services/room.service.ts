import { CreateRoomDTO, VerifyRoomKeyDTO } from '@ephemeral/shared';
import { IRoomRepository } from '../repositories/interfaces/room-repository.interface';
import { NotificationService } from './notification.service';
import bcrypt from 'bcrypt';

export class RoomService {
  constructor(
    private roomRepository: IRoomRepository,
    private notificationService: NotificationService
  ) {}

  async createRoom(userId: string, data: CreateRoomDTO) {
    const { durationMin, secret } = data;
    
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + durationMin * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const secretHash = await bcrypt.hash(secret, salt);

    const room = await this.roomRepository.create(userId, {
      ...data,
      expiresAt,
      secretHash,
    });

    // ESTRATÉGIA SEM RASTROS:
    // Notificação é fire-and-forget — falha no email NÃO derruba a criação da sala.
    if (data.receiverEmail) {
      this.notificationService
        .sendRoomAccessLink(data.receiverEmail, room.id, expiresAt)
        .catch((err) => console.error('[RoomService] Falha ao enviar notificação (não-fatal):', err));
    }

    // Remove sensitive data from response
    const { secretHash: _, ...safeRoom } = room;
    return safeRoom;
  }

  async verifyRoomKey(roomId: string, userId: string, data: VerifyRoomKeyDTO) {
    const room = await this.validateAndGetRoom(roomId);
    if (!room) throw new Error('Room not found');

    if (room.status === 'EXPIRED' || room.status === 'CLOSED') {
      throw new Error('Room is no longer available');
    }

    // Apenas o convidado precisa verificar a chave (o criador já sabe)
    if (room.guestId && room.guestId !== userId && room.creatorId !== userId) {
       throw new Error('Unauthorized');
    }

    if (room.accessCount >= 3) {
      throw new Error('O link de acesso atingiu o limite máximo de 3 usos e foi bloqueado.');
    }

    const isMatch = await bcrypt.compare(data.secret, room.secretHash);
    if (!isMatch) {
      throw new Error('Invalid password-phrase');
    }

    // Marca o convidado como verificado e incrementa o contador
    const updatedRoom = await this.roomRepository.update(roomId, {
      guestVerifiedAt: new Date(),
      accessCount: room.accessCount + 1
    });
    
    const { secretHash: _, ...safeRoom } = updatedRoom;
    return safeRoom;
  }

  /**
   * Valida o estado da sala e a expiração no servidor.
   * Se a sala expirou, atualiza o status para 'EXPIRED'.
   */
  async validateAndGetRoom(roomId: string) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) return null;

    // Se estiver fechada, não há o que validar de tempo
    if (room.status === 'CLOSED' || room.status === 'EXPIRED') {
      return room;
    }

    // Validação de Tempo (Server-side)
    const now = new Date();
    if (now > room.expiresAt) {
      // Atualiza status para EXPIRED se ainda não estiver
      const updatedRoom = await this.roomRepository.updateStatus(roomId, 'EXPIRED');
      return updatedRoom;
    }

    return room;
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.validateAndGetRoom(roomId);
    
    if (!room) throw new Error('Room not found');
    if (room.status === 'EXPIRED' || room.status === 'CLOSED') {
      throw new Error('Room is no longer available');
    }

    // Se for o criador, ele só está "re-entrando"
    if (room.creatorId === userId) {
      return room;
    }

    // Se já houver um convidado e for um novo diferente
    if (room.guestId && room.guestId !== userId) {
      throw new Error('Room is full (1-on-1)');
    }

    // Se for o primeiro convidado entrando
    if (!room.guestId) {
      return this.roomRepository.update(roomId, {
        guestId: userId,
        status: 'CONNECTED'
      });
    }

    return room;
  }

  async closeRoom(roomId: string, userId: string) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    if (room.creatorId !== userId && room.guestId !== userId) {
      throw new Error('Unauthorized to close this room');
    }

    return this.roomRepository.update(roomId, {
      status: 'CLOSED',
      closedAt: new Date()
    });
  }

  async destroyRoom(roomId: string, userId: string) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) throw new Error('Room not found');

    if (room.creatorId !== userId && room.guestId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.roomRepository.delete(roomId);
  }

  async getRoomById(roomId: string) {
    return this.validateAndGetRoom(roomId);
  }

  async listRoomsByUser(userId: string) {
    return this.roomRepository.findByUserId(userId);
  }

  async verifyGuestSecret(roomId: string, secret: string, guestUserId?: string) {
    const room = await this.validateAndGetRoom(roomId);
    if (!room) throw new Error('Room not found');

    if (room.accessCount >= 3) {
      throw new Error('O link de acesso atingiu o limite máximo de 3 usos e foi bloqueado.');
    }

    const isMatch = await bcrypt.compare(secret, room.secretHash);
    if (!isMatch) throw new Error('Invalid secret phrase');

    // Se o guestUserId for fornecido (no fluxo de guest-join), marca imediatamente como verificado
    if (guestUserId) {
       await this.roomRepository.update(roomId, { 
         guestId: guestUserId,
         guestVerifiedAt: new Date(),
         status: 'CONNECTED',
         accessCount: room.accessCount + 1
       });
    }

    return room;
  }

  async clearUserRooms(userId: string) {
    return this.roomRepository.deleteManyByUserId(userId);
  }
}
