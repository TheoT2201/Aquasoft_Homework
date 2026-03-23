import * as express from 'express';
import {
    getAllHotels,
    getHotelByName,
    createHotel,
    updateHotel,
    deleteHotel
} from '../controllers/hotelController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────
router.get('/', getAllHotels);
router.get('/:name', getHotelByName);

// ── Protected routes (require JWT) ────────────────────────────
router.post('/', authenticate, createHotel);
router.put('/:id', authenticate, updateHotel);
router.delete('/:id', authenticate, deleteHotel);

export default router;