// In your routes file (e.g., routes/messages.js)
import { Router } from 'express';
import { messagesController } from '../../controllers/messages_controller.js';
import { requireToken } from '../../middleware/auth.js';

const router = Router();

// GET /api/messages - Get messages between parent and tutor
router.get('/', requireToken, messagesController.getMessages);

// GET /api/messages/conversations/:user_id/:user_type - Get user conversations
router.get('/conversations/:user_id/:user_type', requireToken, messagesController.getUserConversations);

// GET /api/messages/:id - Get single message
router.get('/:id', requireToken, messagesController.getMessageById);

// POST /api/messages - Send message
router.post('/', requireToken, messagesController.sendMessage);

// PUT /api/messages/:id - Update message
router.put('/:id', requireToken, messagesController.updateMessage);

// DELETE /api/messages/:id - Delete message
router.delete('/:id', requireToken, messagesController.deleteMessage);

// GET /api/messages/unread/:user_id/:user_type - Get unread count
router.get('/unread/:user_id/:user_type', requireToken, messagesController.getUnreadCount);

// PUT /api/messages/mark-read/:user_id/:user_type - Mark messages as read
router.put('/mark-read/:user_id/:user_type', requireToken, messagesController.markMessagesAsRead);

export default router;