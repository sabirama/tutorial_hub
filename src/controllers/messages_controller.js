import { query } from '../database/connection.js';

export class MessagesController {
    
    // GET /api/messages - Get messages between a parent and tutor (REQUIRES parent_id AND tutor_id)
    async getMessages(req, res) {
        try {
            const {
                parent_id,
                tutor_id,
                page = 1,
                limit = 50,
                sort = 'created_at',
                order = 'DESC'
            } = req.query;

            // Both parent_id and tutor_id are required
            if (!parent_id || !tutor_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Both parent_id and tutor_id are required parameters'
                });
            }

            const whereClause = {
                parent_id: parseInt(parent_id),
                tutor_id: parseInt(tutor_id)
            };

            // Pagination and sorting
            const offset = (page - 1) * limit;
            const additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;

            // Get messages for this conversation
            const messages = await query({
                action: 'read',
                table: 'messages',
                where: whereClause,
                other: additionalSQL
            });

            // Get total count for pagination
            const countResult = await query({
                action: 'count',
                table: 'messages',
                where: whereClause
            });

            res.json({
                success: true,
                data: messages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].count,
                    pages: Math.ceil(countResult[0].count / limit)
                }
            });

        } catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch messages',
                message: error.message
            });
        }
    }

    // GET /api/messages/conversations/:user_id/:user_type - Get all conversations for a user
    async getUserConversations(req, res) {
        try {
            const { user_id, user_type } = req.params; // user_type: 'parent' or 'tutor'
            
            if (!['parent', 'tutor'].includes(user_type.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'user_type must be either "parent" or "tutor"'
                });
            }

            let conversations = [];

            if (user_type.toLowerCase() === 'parent') {
                // Get all unique tutors this parent has messaged with
                const tutorMessages = await query({
                    action: 'read',
                    table: 'messages',
                    get: 'DISTINCT tutor_id',
                    where: { parent_id: parseInt(user_id) },
                    other: 'ORDER BY created_at DESC'
                });

                // Get latest message for each tutor
                for (const msg of tutorMessages) {
                    const latestMessage = await query({
                        action: 'read',
                        table: 'messages',
                        where: {
                            parent_id: parseInt(user_id),
                            tutor_id: msg.tutor_id
                        },
                        other: 'ORDER BY created_at DESC LIMIT 1'
                    });

                    if (latestMessage.length > 0) {
                        // Get tutor info
                        const tutorInfo = await query({
                            action: 'read',
                            table: 'tutors',
                            where: { id: msg.tutor_id }
                        });

                        conversations.push({
                            tutor_id: msg.tutor_id,
                            tutor_name: tutorInfo[0]?.full_name || 'Unknown Tutor',
                            last_message: latestMessage[0].message,
                            last_message_time: latestMessage[0].created_at,
                            sender: latestMessage[0].sender,
                            unread_count: 0 // You can implement unread count logic
                        });
                    }
                }
            } else {
                // Get all unique parents this tutor has messaged with
                const parentMessages = await query({
                    action: 'read',
                    table: 'messages',
                    get: 'DISTINCT parent_id',
                    where: { tutor_id: parseInt(user_id) },
                    other: 'ORDER BY created_at DESC'
                });

                // Get latest message for each parent
                for (const msg of parentMessages) {
                    const latestMessage = await query({
                        action: 'read',
                        table: 'messages',
                        where: {
                            tutor_id: parseInt(user_id),
                            parent_id: msg.parent_id
                        },
                        other: 'ORDER BY created_at DESC LIMIT 1'
                    });

                    if (latestMessage.length > 0) {
                        // Get parent info
                        const parentInfo = await query({
                            action: 'read',
                            table: 'parents',
                            where: { id: msg.parent_id }
                        });

                        conversations.push({
                            parent_id: msg.parent_id,
                            parent_name: parentInfo[0]?.full_name || 'Unknown Parent',
                            last_message: latestMessage[0].message,
                            last_message_time: latestMessage[0].created_at,
                            sender: latestMessage[0].sender,
                            unread_count: 0 // You can implement unread count logic
                        });
                    }
                }
            }

            res.json({
                success: true,
                data: conversations,
                count: conversations.length
            });

        } catch (error) {
            console.error('Get user conversations error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch conversations',
                message: error.message
            });
        }
    }

    // GET /api/messages/:id - Get single message by ID
    async getMessageById(req, res) {
        try {
            const { id } = req.params;

            const messages = await query({
                action: 'read',
                table: 'messages',
                where: { id }
            });

            if (messages.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            res.json({
                success: true,
                data: messages[0]
            });

        } catch (error) {
            console.error('Get message by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch message',
                message: error.message
            });
        }
    }

    // POST /api/messages - Send a new message
    async sendMessage(req, res) {
        try {
            const { parent_id, tutor_id, sender, message } = req.body;

            // Validation
            if (!parent_id || !tutor_id || !sender || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'parent_id, tutor_id, sender, and message are required'
                });
            }

            // Validate sender is either 'parent' or 'tutor'
            if (!['parent', 'tutor'].includes(sender.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Sender must be either "parent" or "tutor"'
                });
            }

            // Check if parent exists
            const parentExists = await query({
                action: 'read',
                table: 'parents',
                where: { id: parent_id }
            });

            if (parentExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
                });
            }

            // Check if tutor exists
            const tutorExists = await query({
                action: 'read',
                table: 'tutors',
                where: { id: tutor_id }
            });

            if (tutorExists.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }

            const result = await query({
                action: 'create',
                table: 'messages',
                data: {
                    parent_id: parseInt(parent_id),
                    tutor_id: parseInt(tutor_id),
                    sender: sender.toLowerCase(),
                    message: message.trim()
                }
            });

            // Fetch the created message
            const newMessage = await query({
                action: 'read',
                table: 'messages',
                where: { id: result.insertId }
            });

            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: newMessage[0]
            });

        } catch (error) {
            console.error('Send message error:', error);
            
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({
                    success: false,
                    error: 'Parent or tutor does not exist'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to send message',
                message: error.message
            });
        }
    }

    // PUT /api/messages/:id - Update a message (only the message text)
    async updateMessage(req, res) {
        try {
            const { id } = req.params;
            const { message } = req.body;

            if (!message || message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Message content is required'
                });
            }

            // Check if message exists
            const existingMessage = await query({
                action: 'read',
                table: 'messages',
                where: { id }
            });

            if (existingMessage.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            // Update only the message content
            await query({
                action: 'update',
                table: 'messages',
                where: { id },
                data: { 
                    message: message.trim(),
                    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }
            });

            // Fetch updated message
            const updatedMessage = await query({
                action: 'read',
                table: 'messages',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Message updated successfully',
                data: updatedMessage[0]
            });

        } catch (error) {
            console.error('Update message error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update message',
                message: error.message
            });
        }
    }

    // DELETE /api/messages/:id - Delete a message
    async deleteMessage(req, res) {
        try {
            const { id } = req.params;

            // Check if message exists
            const existingMessage = await query({
                action: 'read',
                table: 'messages',
                where: { id }
            });

            if (existingMessage.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            await query({
                action: 'destroy',
                table: 'messages',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });

        } catch (error) {
            console.error('Delete message error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete message',
                message: error.message
            });
        }
    }

    // GET /api/messages/unread/:user_id/:user_type - Get unread message count
    async getUnreadCount(req, res) {
        try {
            const { user_id, user_type } = req.params;

            if (!['parent', 'tutor'].includes(user_type.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'user_type must be either "parent" or "tutor"'
                });
            }

            // Note: You need to add a 'read_status' field to your messages table for this to work
            // Example: read_status: 'BOOLEAN DEFAULT FALSE'
            
            let unreadCount = 0;
            
            if (user_type.toLowerCase() === 'parent') {
                const result = await query({
                    action: 'count',
                    table: 'messages',
                    where: {
                        parent_id: parseInt(user_id),
                        sender: 'tutor',
                        read_status: false // Assuming you add this field
                    }
                });
                unreadCount = result[0]?.count || 0;
            } else {
                const result = await query({
                    action: 'count',
                    table: 'messages',
                    where: {
                        tutor_id: parseInt(user_id),
                        sender: 'parent',
                        read_status: false // Assuming you add this field
                    }
                });
                unreadCount = result[0]?.count || 0;
            }

            res.json({
                success: true,
                data: { unread_count: unreadCount }
            });

        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get unread count',
                message: error.message
            });
        }
    }

    // PUT /api/messages/mark-read/:user_id/:user_type - Mark all messages as read
    async markMessagesAsRead(req, res) {
        try {
            const { user_id, user_type } = req.params;

            if (!['parent', 'tutor'].includes(user_type.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'user_type must be either "parent" or "tutor"'
                });
            }

            // Note: You need to add a 'read_status' field to your messages table for this to work
            
            let whereClause = {};
            
            if (user_type.toLowerCase() === 'parent') {
                whereClause = {
                    parent_id: parseInt(user_id),
                    sender: 'tutor',
                    read_status: false
                };
            } else {
                whereClause = {
                    tutor_id: parseInt(user_id),
                    sender: 'parent',
                    read_status: false
                };
            }

            await query({
                action: 'update',
                table: 'messages',
                where: whereClause,
                data: { 
                    read_status: true,
                    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
                }
            });

            res.json({
                success: true,
                message: 'All messages marked as read'
            });

        } catch (error) {
            console.error('Mark messages as read error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to mark messages as read',
                message: error.message
            });
        }
    }
}

export const messagesController = new MessagesController();