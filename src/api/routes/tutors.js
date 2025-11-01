import express from 'express';
import { tutorsController } from '../../controllers/tutors_controller.js';

const router = express.Router();

// Public routes
router.post('/register', tutorsController.createTutor);
router.post('/login', tutorsController.loginTutor);

// Stats and filters
router.get('/stats/courses', tutorsController.getUniqueCourses);
router.get('/stats/locations', tutorsController.getUniqueLocations);

// Tutor management
router.get('/', tutorsController.getTutors);
router.get('/:id', tutorsController.getTutorById);
router.get('/:id/profile', tutorsController.getTutorProfile);
router.put('/:id', tutorsController.updateTutor);
router.put('/:id/password', tutorsController.changePassword);
router.post('/:id/reset-password', tutorsController.resetPassword);
router.delete('/:id', tutorsController.deleteTutor);

// Tutor related data
router.get('/:id/availability', tutorsController.getTutorAvailability);
router.get('/:id/sessions', tutorsController.getTutorSessions);
router.get('/:id/session-requests', tutorsController.getTutorSessionRequests);

export default router;