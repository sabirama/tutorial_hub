// src/api/routes/subjects.js
import { Router } from 'express';
import { subjectsController } from '../../controllers/subjects_controller.js';
import { requireToken } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', subjectsController.getSubjects);
router.get('/categories', subjectsController.getCategories);
router.get('/:id', subjectsController.getSubjectById);

// Admin-only routes (protected)
router.post('/', requireToken, subjectsController.createSubject);
router.put('/:id', requireToken, subjectsController.updateSubject);
router.delete('/:id', requireToken, subjectsController.deleteSubject);

export default router;