import express from 'express';
import { tutorsController } from '../../controllers/tutors_controller.js';
import { parentTutorsController } from '../../controllers/parent_tutors_controller.js';
import { requireToken } from '../../middleware/auth.js';
const router = express.Router();

// Public routes
router.post('/register', tutorsController.registerTutor);
router.post('/login', tutorsController.loginTutor);

// Stats and filters
router.get('/stats/courses', requireToken, tutorsController.getUniqueCourses);
router.get('/stats/locations', requireToken, tutorsController.getUniqueLocations);

// Tutor management
router.get('/', requireToken, tutorsController.getTutors);
router.get('/:id', requireToken, tutorsController.getTutorById);
router.get('/:id/profile', requireToken, tutorsController.getTutorProfile);
router.put('/:id', requireToken, tutorsController.updateTutor);
router.put('/:id/password', requireToken, tutorsController.changePassword);
router.post('/:id/reset-password', requireToken, tutorsController.resetPassword);
router.delete('/:id', requireToken, tutorsController.deleteTutor);

// Tutor related data
router.get('/:id/availability', requireToken, tutorsController.getTutorAvailability);
router.get('/:id/sessions', requireToken, tutorsController.getTutorSessions);
router.get('/:id/session-requests', requireToken, tutorsController.getTutorSessionRequests);
router.put('/:id/subjects', requireToken, tutorsController.updateTutorSubjects);
router.get('/by-subject/:subject_id', tutorsController.getTutorsBySubject);
// Parents
router.get('/:id/parents', requireToken, parentTutorsController.getParentsByTutor);

export default router;