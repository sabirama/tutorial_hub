import { Router } from 'express';
import { parentsController } from '../../controllers/parents_controller.js';

const router = Router();

// Public routes
router.post('/register', parentsController.registerParent);
router.post('/login', parentsController.loginParent);

// Protected routes
router.get('/', parentsController.getParents);
router.get('/:id', parentsController.getParentById);
router.get('/:id/profile', parentsController.getParentProfile);
router.get('/:id/children', parentsController.getParentChildren);
router.put('/:id', parentsController.updateParent);
router.put('/:id/password', parentsController.changePassword);
router.post('/:id/reset-password', parentsController.resetPassword);
router.delete('/:id', parentsController.deleteParent);

export default router;