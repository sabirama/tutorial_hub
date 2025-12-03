import express from 'express';
import { tutorRatingsController } from '../../controllers/rating_controller.js';

const router = express.Router();

// POST /api/ratings - Submit a rating
router.post('/', tutorRatingsController.createRating);

// GET /api/ratings/tutor/:tutor_id - Get ratings for a tutor
router.get('/tutor/:tutor_id', tutorRatingsController.getTutorRatings);

export default router;