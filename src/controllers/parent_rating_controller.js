import { query } from '../database/connection.js';

export class ParentRatingsController {
    // POST /api/parent-ratings - Submit a parent rating
    async createRating(req, res) {
        try {
            const { tutor_id, parent_id, rating, review } = req.body;

            // Validation
            if (!tutor_id || !parent_id || !rating) {
                return res.status(400).json({
                    success: false,
                    error: 'Tutor ID, parent ID, and rating are required'
                });
            }

            // Check if rating already exists for this tutor-parent combination
            const existingRating = await query({
                action: 'read',
                table: 'parent_rating',
                where: { tutor_id, parent_id }
            });

            let result;
            if (existingRating.length > 0) {
                // Update existing rating
                result = await query({
                    action: 'update',
                    table: 'parent_rating',
                    where: { id: existingRating[0].id },
                    data: {
                        rating,
                        review: review || null,
                    }
                });
            } else {
                // Create new rating
                result = await query({
                    action: 'create',
                    table: 'parent_rating',
                    data: {
                        tutor_id,
                        parent_id,
                        rating,
                        review: review || null,
                    }
                });
            }

            res.status(201).json({
                success: true,
                message: existingRating.length > 0 ? 'Rating updated successfully' : 'Rating submitted successfully',
                data: { id: result.insertId || existingRating[0].id }
            });

        } catch (error) {
            console.error('Create parent rating error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit rating',
                message: error.message
            });
        }
    }

    // GET /api/parent-ratings/tutor/:tutor_id/parent/:parent_id - Get specific rating
    async getTutorParentRating(req, res) {
        try {
            const { tutor_id, parent_id } = req.params;

            const ratings = await query({
                action: 'read',
                table: 'parent_rating',
                where: { tutor_id, parent_id }
            });

            res.json({
                success: true,
                data: ratings.length > 0 ? ratings[0] : null
            });

        } catch (error) {
            console.error('Get tutor-parent rating error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch rating',
                message: error.message
            });
        }
    }

    // GET /api/parent-ratings/tutor/:tutor_id - Get all ratings for a tutor
    async getTutorRatings(req, res) {
        try {
            const { tutor_id } = req.params;

            const ratings = await query({
                action: 'read',
                table: 'parent_rating',
                where: { tutor_id },
                other: 'ORDER BY created_at DESC'
            });

            res.json({
                success: true,
                data: ratings
            });

        } catch (error) {
            console.error('Get tutor ratings error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch ratings',
                message: error.message
            });
        }
    }

    // GET /api/parent-ratings/parent/:parent_id - Get all ratings for a parent
    async getParentRatings(req, res) {
        try {
            const { parent_id } = req.params;

            const ratings = await query({
                action: 'read',
                table: 'parent_rating',
                where: { parent_id },
                other: 'ORDER BY created_at DESC'
            });

            res.json({
                success: true,
                data: ratings
            });

        } catch (error) {
            console.error('Get parent ratings error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch ratings',
                message: error.message
            });
        }
    }
}

export const parentRatingsController = new ParentRatingsController();