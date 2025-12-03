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
            const additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;

            // Get sessions with basic query first
            const queryConfig = {
                action: 'read',
                table: 'sessions',
                other: additionalSQL
            };

            // Only add where clause if we have actual filters
            if (Object.keys(whereClause).length > 0) {
                queryConfig.where = whereClause;
            }

            const sessions = await query(queryConfig);

            // Get total count for pagination
            const countConfig = {
                action: 'count',
                table: 'sessions'
            };

            if (Object.keys(whereClause).length > 0) {
                countConfig.where = whereClause;
            }

            const countResult = await query(countConfig);

            // Now get the joined data for each session
            const sessionIds = sessions.map(session => session.id);

            if (sessionIds.length > 0) {
                // Get joined data in separate queries
                const sessionsWithJoins = await Promise.all(
                    sessions.map(async (session) => {
                        // Get parent data
                        const [parentData] = await query({
                            action: 'read',
                            table: 'parents',
                            where: { id: session.parent_id }
                        });

                        // Get tutor data
                        const [tutorData] = await query({
                            action: 'read',
                            table: 'tutors',
                            where: { id: session.tutor_id }
                        });

                        // Get child data
                        const [childData] = await query({
                            action: 'read',
                            table: 'children',
                            where: { id: session.child_id }
                        });

                        // Get subject data
                        const [subjectData] = await query({
                            action: 'read',
                            table: 'subject',
                            where: { id: session.subject_id }
                        });

                        return {
                            ...session,
                            parent_name: parentData?.full_name,
                            parent_email: parentData?.email,
                            parent_contact: parentData?.contact_number,
                            tutor_name: tutorData?.full_name,
                            tutor_email: tutorData?.email,
                            tutor_contact: tutorData?.contact_number,
                            tutor_rating: tutorData?.rating,
                            child_name: childData?.name,
                            child_grade: childData?.grade,
                            child_age: childData?.age,
                            subject_name: subjectData?.subject,
                            subject_description: subjectData?.description
                        };
                    })
                );

                res.json({
                    success: true,
                    data: sessionsWithJoins,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: countResult[0].count,
                        pages: Math.ceil(countResult[0].count / limit)
                    }
                });
            } else {
                res.json({
                    success: true,
                    data: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        pages: 0
                    }
                });
            }

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
                status = 'pending',
                duration = '1 hour',
                location = 'Online',
                notes,
                hourly_rate
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

            // Check if child exists and belongs to parent
            const childExists = await query({
                action: 'read',
                table: 'children',
                where: { id: child_id, parent_id }
            });

            if (childExists.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Child not found or does not belong to parent'
                });
            }

            // Check if tutor offers the subject
            const tutorSubjectExists = await query({
                action: 'read',
                table: 'tutors_subjects',
                where: { tutor_id, subject_id }
            });

            if (tutorSubjectExists.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Tutor does not offer this subject'
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
                    status,
                    duration,
                    location,
                    notes: notes || null,
                    hourly_rate: hourly_rate || null
                }
            });

            // Fetch the created session with joins
            const newSession = await query({
                action: 'read',
                table: 'sessions',
                where: { id: result.insertId }
            });

            // Get related data for the response
            const [parent, tutor, child, subject] = await Promise.all([
                query({
                    action: 'read',
                    table: 'parents',
                    where: { id: parent_id }
                }),
                query({
                    action: 'read',
                    table: 'tutors',
                    where: { id: tutor_id }
                }),
                query({
                    action: 'read',
                    table: 'children',
                    where: { id: child_id }
                }),
                query({
                    action: 'read',
                    table: 'subject',
                    where: { id: subject_id }
                })
            ]);

            const sessionWithDetails = {
                ...newSession[0],
                parent_name: parent[0]?.full_name,
                tutor_name: tutor[0]?.full_name,
                child_name: child[0]?.name,
                subject_name: subject[0]?.subject
            };

            res.status(201).json({
                success: true,
                message: 'Session created successfully',
                data: sessionWithDetails
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

            await query({
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
            const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
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
                status: ['pending', 'confirmed'],
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
                'pending',
                'confirmed',
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
                    table: 'subject',
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

    // GET /api/sessions/tutor-subjects/:tutor_id - Get tutor's offered subjects
    async getTutorSubjects(req, res) {
        try {
            const { tutor_id } = req.params;
            console.log('=== DEBUG: Tutor ID:', tutor_id);

            // Get subject IDs from tutors_subjects
            const subjectRelations = await query({
                action: 'read',
                table: 'tutors_subjects',
                where: { tutor_id }
            });

            const subjectIds = subjectRelations.map(rel => rel.subject_id);
            console.log('Subject IDs to fetch:', subjectIds);

            let tutorSubjects = [];
            if (subjectIds.length > 0) {
                // Try different approach - query each subject individually
                for (const subjectId of subjectIds) {
                    const subject = await query({
                        action: 'read',
                        table: 'subject',
                        where: { id: subjectId }
                    });
                    if (subject.length > 0) {
                        tutorSubjects.push(subject[0]);
                    }
                }
                console.log('Subjects fetched individually:', tutorSubjects);
            }

            res.json({
                success: true,
                data: tutorSubjects
            });

        } catch (error) {
            console.error('Get tutor subjects error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tutor subjects',
                message: error.message
            });
        }
    }
}

export const sessionsController = new SessionsController();