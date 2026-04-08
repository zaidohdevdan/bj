import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RoomController } from '../controllers/room.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();
const roomController = new RoomController();

// Auth Routes (Public)
router.post('/auth/register', (req, res) => authController.register(req, res));
router.post('/auth/login', (req, res) => authController.login(req, res));
router.post('/auth/guest-join', (req, res) => authController.guestJoin(req, res));

// Room Routes (Public metadata for joining)
router.get('/rooms/:id', (req, res) => roomController.getRoom(req, res));

// Room Routes (Private)
router.post('/rooms', authMiddleware, (req, res) => roomController.create(req, res));
router.get('/rooms', authMiddleware, (req, res) => roomController.list(req, res));
router.delete('/rooms', authMiddleware, (req, res) => roomController.clearRooms(req, res));
router.post('/rooms/:id/join', authMiddleware, (req, res) => roomController.join(req, res));
router.post('/rooms/:id/verify-key', authMiddleware, (req, res) => roomController.verifyKey(req, res));
router.delete('/rooms/:id', authMiddleware, (req, res) => roomController.destroy(req, res));
router.post('/rooms/:id/close', authMiddleware, (req, res) => roomController.close(req, res));

export { router };
