import { RoomService } from '../src/services/room.service';
import { IRoomRepository } from '../src/repositories/interfaces/room-repository.interface';
import bcrypt from 'bcrypt';

const mockRoomRepository: jest.Mocked<IRoomRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
};

describe('RoomService Lifecycle', () => {
  let roomService: RoomService;

  beforeEach(() => {
    roomService = new RoomService(mockRoomRepository);
    jest.clearAllMocks();
  });

  it('should create a room with correct expiration time', async () => {
    const userId = 'user-1';
    const roomData = {
      name: 'Test Room',
      durationMin: 15,
      secret: 'my-secret-key'
    };

    mockRoomRepository.create.mockResolvedValue({
      id: 'room-1',
      name: 'Test Room',
      status: 'CREATED',
      creatorId: userId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      createdAt: new Date(),
      secretHash: 'hashed-secret',
      guestId: null,
      guestVerifiedAt: null,
      closedAt: null
    } as any);

    const room = await roomService.createRoom(userId, roomData as any);

    expect(room).toBeDefined();
    expect(room.name).toBe('Test Room');
    expect(mockRoomRepository.create).toHaveBeenCalledWith(userId, expect.objectContaining({
      name: 'Test Room',
      expiresAt: expect.any(Date),
      secretHash: expect.any(String)
    }));
  });

  it('should mark room as EXPIRED when time is up', async () => {
    const roomId = 'room-1';
    const pastDate = new Date(Date.now() - 1000); // 1 second ago

    mockRoomRepository.findById.mockResolvedValue({
      id: roomId,
      status: 'CREATED',
      expiresAt: pastDate,
    } as any);

    mockRoomRepository.updateStatus.mockResolvedValue({
      id: roomId,
      status: 'EXPIRED',
      expiresAt: pastDate,
    } as any);

    const room = await roomService.validateAndGetRoom(roomId);

    expect(room?.status).toBe('EXPIRED');
    expect(mockRoomRepository.updateStatus).toHaveBeenCalledWith(roomId, 'EXPIRED');
  });

  it('should not mark room as EXPIRED if still valid', async () => {
    const roomId = 'room-1';
    const futureDate = new Date(Date.now() + 10000); // 10 seconds in future

    mockRoomRepository.findById.mockResolvedValue({
      id: roomId,
      status: 'CREATED',
      expiresAt: futureDate,
    } as any);

    const room = await roomService.validateAndGetRoom(roomId);

    expect(room?.status).toBe('CREATED');
    expect(mockRoomRepository.updateStatus).not.toHaveBeenCalled();
  });
});
