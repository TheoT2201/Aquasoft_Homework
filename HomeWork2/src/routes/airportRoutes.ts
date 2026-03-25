import * as express from 'express';
import { getBestOffersNearAirport } from '../controllers/airportController';

const router = express.Router();

// Public route — no authentication needed for browsing offers
router.get('/:iata_code/best-offers', getBestOffersNearAirport);

export default router;