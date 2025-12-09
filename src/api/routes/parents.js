import { Router } from 'express';
import { parentsController } from '../../controllers/parents_controller.js';
import { parentTutorsController } from '../../controllers/parent_tutors_controller.js';
import { requireToken } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', parentsController.registerParent);
router.post('/login', parentsController.loginParent);

// Protected routes
router.get('/', requireToken, parentsController.getParents);
router.get('/:id', requireToken, parentsController.getParentById);
router.get('/:id/profile', requireToken, parentsController.getParentProfile);
router.get('/:id/children', requireToken, parentsController.getParentChildren);
router.put('/:id', requireToken, parentsController.updateParent);
router.put('/:id/password', requireToken, parentsController.changePassword);
router.post('/:id/reset-password', requireToken, parentsController.resetPassword);
router.delete('/:id', requireToken, parentsController.deleteParent);

// Parent-Tutors relationship routes
router.get('/:parent_id/tutors', requireToken, parentTutorsController.getTutorsByParent);
router.post('/:parent_id/tutors', requireToken, parentTutorsController.createParentTutor);
router.get('/:parent_id/tutors/check', requireToken, parentTutorsController.checkParentTutorRelationship);

// Parent-Children relationship routes
router.post('/:id/children', requireToken, parentsController.addChild);
router.put('/:parent_id/children/:child_id', requireToken, parentsController.updateChild);
router.delete('/:parent_id/children/:child_id', requireToken, parentsController.deleteChild);

// Profile image routes
router.post('/upload-profile-image', requireToken, parentsController.uploadProfileImage);
router.delete('/:id/profile-image', requireToken, parentsController.deleteProfileImage);

export default router;