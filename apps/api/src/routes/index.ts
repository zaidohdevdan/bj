import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RoomController } from '../controllers/room.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();
const roomController = new RoomController();

// Auth Routes (Public)
router.post('/auth/login', (req, res) => authController.login(req, res));

// Room Routes (Private)
router.post('/rooms', authMiddleware, (req, res) => roomController.create(req, res));
router.get('/rooms/:id', authMiddleware, (req, res) => roomController.getRoom(req, res));

export { router };
