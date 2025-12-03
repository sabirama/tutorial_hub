import express from 'express';
import { parentRatingsController } from '../../controllers/parent_rating_controller.js';

const router = express.Router();

// POST /api/parent-ratings - Submit a parent rating
router.post('/', parentRatingsController.createRating);

// GET /api/parent-ratings/tutor/:tutor_id/parent/:parent_id - Get specific rating
router.get('/tutor/:tutor_id/parent/:parent_id', parentRatingsController.getTutorParentRating);

// GET /api/parent-ratings/tutor/:tutor_id - Get ratings for a tutor
router.get('/tutor/:tutor_id', parentRatingsController.getTutorRatings);

// GET /api/parent-ratings/parent/:parent_id - Get ratings for a parent
router.get('/parent/:parent_id', parentRatingsController.getParentRatings);

export default router;