import { query } from '../database/connection.js';

export class SessionsController {
    
    // GET /api/sessions - Get all sessions with filtering
    async getSessions(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                parent_id, 
                tutor_id, 
                child_id,
                subject_id,
                status,
                date_from,
                date_to,
                sort = 'date',
                order = 'DESC'
            } = req.query;
            
            let whereClause = {};
            let additionalSQL = '';
            
            // Apply filters
            if (parent_id) whereClause.parent_id = parent_id;
            if (tutor_id) whereClause.tutor_id = tutor_id;
            if (child_id) whereClause.child_id = child_id;
            if (subject_id) whereClause.subject_id = subject_id;
            if (status) whereClause.status = status;
            
            // Date range filter
            if (date_from || date_to) {
                if (date_from && date_to) {
                    whereClause['__RAW__'] = `date BETWEEN '${date_from}' AND '${date_to}'`;
                } else if (date_from) {
                    whereClause['__RAW__'] = `date >= '${date_from}'`;
                } else if (date_to) {
                    whereClause['__RAW__'] = `date <= '${date_to}'`;
                }
            }
            
            // Pagination and sorting
            const offset = (page - 1) * limit;
            additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;
            
            const sessions = await query({
                action: 'read',
                table: 'sessions',
                where: whereClause,
                other: additionalSQL
            });
            
            // Get total count for pagination
            const countResult = await query({
                action: 'count',
                table: 'sessions',
                where: whereClause
            });
            
            res.json({
                success: true,
                data: sessions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].count,
                    pages: Math.ceil(countResult[0].count / limit)
                }
            });
            
        } catch (error) {
            console.error('Get sessions error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch sessions',
                message: error.message 
            });
        }
    }
    
    // GET /api/sessions/:id - Get single session by ID
    async getSessionById(req, res) {
        try {
            const { id } = req.params;
            
            const sessions = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            if (sessions.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            res.json({
                success: true,
                data: sessions[0]
            });
            
        } catch (error) {
            console.error('Get session by ID error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch session',
                message: error.message 
            });
        }
    }
    
    // POST /api/sessions - Create new session
    async createSession(req, res) {
        try {
            const {
                parent_id,
                child_id,
                tutor_id,
                subject_id,
                date,
                time,
                tutor,
                parent,
                student,
                status = 'upcoming',
                duration,
                location,
                notes
            } = req.body;
            
            // Validation
            if (!parent_id || !child_id || !tutor_id || !subject_id || !date || !time) {
                return res.status(400).json({
                    success: false,
                    error: 'Parent ID, child ID, tutor ID, subject ID, date, and time are required'
                });
            }
            
            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                return res.status(400).json({
                    success: false,
                    error: 'Date must be in YYYY-MM-DD format'
                });
            }
            
            const result = await query({
                action: 'create',
                table: 'sessions',
                data: {
                    parent_id,
                    child_id,
                    tutor_id,
                    subject_id,
                    date,
                    time,
                    tutor: tutor || null,
                    parent: parent || null,
                    student: student || null,
                    status,
                    duration: duration || null,
                    location: location || 'Online',
                    notes: notes || null
                }
            });
            
            // Fetch the created session
            const newSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id: result.insertId }
            });
            
            res.status(201).json({
                success: true,
                message: 'Session created successfully',
                data: newSession[0]
            });
            
        } catch (error) {
            console.error('Create session error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create session',
                message: error.message 
            });
        }
    }
    
    // PUT /api/sessions/:id - Update session
    async updateSession(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Check if session exists
            const existingSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            if (existingSession.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            // Remove non-updatable fields
            const { id: _, ...allowedUpdates } = updateData;
            
            // Validate date format if being updated
            if (allowedUpdates.date) {
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(allowedUpdates.date)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Date must be in YYYY-MM-DD format'
                    });
                }
            }
            
            const result = await query({
                action: 'update',
                table: 'sessions',
                where: { id },
                data: allowedUpdates
            });
            
            // Fetch updated session
            const updatedSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            res.json({
                success: true,
                message: 'Session updated successfully',
                data: updatedSession[0]
            });
            
        } catch (error) {
            console.error('Update session error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to update session',
                message: error.message 
            });
        }
    }
    
    // PUT /api/sessions/:id/status - Update session status
    async updateSessionStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required'
                });
            }
            
            // Check if session exists
            const existingSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            if (existingSession.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            // Validate status
            const validStatuses = ['upcoming', 'completed', 'cancelled', 'rescheduled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }
            
            await query({
                action: 'update',
                table: 'sessions',
                where: { id },
                data: { status }
            });
            
            // Fetch updated session
            const updatedSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            res.json({
                success: true,
                message: `Session status updated to ${status}`,
                data: updatedSession[0]
            });
            
        } catch (error) {
            console.error('Update session status error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to update session status',
                message: error.message 
            });
        }
    }
    
    // DELETE /api/sessions/:id - Delete session
    async deleteSession(req, res) {
        try {
            const { id } = req.params;
            
            // Check if session exists
            const existingSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            if (existingSession.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            await query({
                action: 'destroy',
                table: 'sessions',
                where: { id }
            });
            
            res.json({
                success: true,
                message: 'Session deleted successfully'
            });
            
        } catch (error) {
            console.error('Delete session error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to delete session',
                message: error.message 
            });
        }
    }
    
    // GET /api/sessions/upcoming - Get upcoming sessions
    async getUpcomingSessions(req, res) {
        try {
            const { 
                parent_id, 
                tutor_id, 
                days = 30 
            } = req.query;
            
            let whereClause = {
                status: 'upcoming',
                '__RAW__': `date >= CURDATE() AND date <= DATE_ADD(CURDATE(), INTERVAL ${days} DAY)`
            };
            
            if (parent_id) whereClause.parent_id = parent_id;
            if (tutor_id) whereClause.tutor_id = tutor_id;
            
            const sessions = await query({
                action: 'read',
                table: 'sessions',
                where: whereClause,
                other: 'ORDER BY date ASC, time ASC'
            });
            
            res.json({
                success: true,
                data: sessions,
                count: sessions.length
            });
            
        } catch (error) {
            console.error('Get upcoming sessions error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch upcoming sessions',
                message: error.message 
            });
        }
    }
    
    // GET /api/sessions/stats - Get session statistics
    async getSessionStats(req, res) {
        try {
            const { parent_id, tutor_id, month, year } = req.query;
            
            let whereClause = {};
            if (parent_id) whereClause.parent_id = parent_id;
            if (tutor_id) whereClause.tutor_id = tutor_id;
            
            // Month and year filter
            if (month && year) {
                whereClause['__RAW__'] = `YEAR(date) = ${year} AND MONTH(date) = ${month}`;
            } else if (year) {
                whereClause['__RAW__'] = `YEAR(date) = ${year}`;
            }
            
            // Get counts by status
            const statusCounts = await Promise.all([
                'upcoming',
                'completed',
                'cancelled'
            ].map(async (status) => {
                const result = await query({
                    action: 'count',
                    table: 'sessions',
                    where: { ...whereClause, status }
                });
                return { status, count: result[0].count };
            }));
            
            // Get monthly stats for the last 6 months
            const monthlyStats = await query({
                action: 'read',
                table: 'sessions',
                get: `YEAR(date) as year, MONTH(date) as month, 
                      COUNT(*) as total_sessions,
                      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_sessions`,
                where: whereClause,
                other: `GROUP BY YEAR(date), MONTH(date) 
                       ORDER BY year DESC, month DESC 
                       LIMIT 6`
            });
            
            res.json({
                success: true,
                data: {
                    by_status: statusCounts.reduce((acc, { status, count }) => {
                        acc[status] = count;
                        return acc;
                    }, {}),
                    monthly: monthlyStats,
                    total: statusCounts.reduce((sum, { count }) => sum + count, 0)
                }
            });
            
        } catch (error) {
            console.error('Get session stats error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch session statistics',
                message: error.message 
            });
        }
    }
    
    // GET /api/sessions/:id/details - Get session with related data
    async getSessionDetails(req, res) {
        try {
            const { id } = req.params;
            
            const sessions = await query({
                action: 'read',
                table: 'sessions',
                where: { id }
            });
            
            if (sessions.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }
            
            const session = sessions[0];
            
            // Get related data
            const [parent, tutor, child, subject] = await Promise.all([
                // Get parent details
                query({
                    action: 'read',
                    table: 'parents',
                    get: 'id, full_name, email, contact_number',
                    where: { id: session.parent_id }
                }),
                
                // Get tutor details
                query({
                    action: 'read',
                    table: 'tutors',
                    get: 'id, full_name, email, contact_number, course',
                    where: { id: session.tutor_id }
                }),
                
                // Get child details
                query({
                    action: 'read',
                    table: 'children',
                    get: 'id, name, grade, age',
                    where: { id: session.child_id }
                }),
                
                // Get subject details
                query({
                    action: 'read',
                    table: 'subjects',
                    get: 'id, subject',
                    where: { id: session.subject_id }
                })
            ]);
            
            res.json({
                success: true,
                data: {
                    ...session,
                    parent_details: parent[0] || null,
                    tutor_details: tutor[0] || null,
                    child_details: child[0] || null,
                    subject_details: subject[0] || null
                }
            });
            
        } catch (error) {
            console.error('Get session details error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch session details',
                message: error.message 
            });
        }
    }
}

export const sessionsController = new SessionsController();