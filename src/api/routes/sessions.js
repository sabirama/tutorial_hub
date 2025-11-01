import express from 'express';
import { sessionsController } from '../../controllers/sessions_controller.js';

const router = express.Router();

// GET /api/sessions - Get all sessions
router.get('/', sessionsController.getSessions);

// GET /api/sessions/upcoming - Get upcoming sessions
router.get('/upcoming', sessionsController.getUpcomingSessions);

// GET /api/sessions/stats - Get session statistics
router.get('/stats', sessionsController.getSessionStats);

// GET /api/sessions/:id - Get single session
router.get('/:id', sessionsController.getSessionById);

// GET /api/sessions/:id/details - Get session with related data
router.get('/:id/details', sessionsController.getSessionDetails);

// POST /api/sessions - Create new session
router.post('/', sessionsController.createSession);

// PUT /api/sessions/:id - Update session
router.put('/:id', sessionsController.updateSession);

// PUT /api/sessions/:id/status - Update session status
router.put('/:id/status', sessionsController.updateSessionStatus);

// DELETE /api/sessions/:id - Delete session
router.delete('/:id', sessionsController.deleteSession);

export default router;