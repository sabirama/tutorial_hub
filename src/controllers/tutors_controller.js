import { query } from '../database/connection.js';
import AuthUtils from '../middleware/hashing.js';

export class TutorsController {
    
    // GET /api/tutors - Get all tutors with filtering, search, and pagination
    async getTutors(req, res) {
        try {
            const { 
                page = 1, 
                limit = 50, 
                search, 
                course, 
                location, 
                status = 'active',
                sort = 'rating', 
                order = 'DESC' 
            } = req.query;
            
            let whereClause = { status };
            let additionalSQL = '';
            
            // Search functionality
            if (search) {
                whereClause['__RAW__'] = `(full_name LIKE '%${search}%' OR email LIKE '%${search}%' OR course LIKE '%${search}%')`;
            }
            
            // Filter by course
            if (course) {
                whereClause.course = course;
            }
            
            // Filter by location
            if (location) {
                whereClause.location = location;
            }
            
            // Pagination and sorting
            const offset = (page - 1) * limit;
            additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;
            
            const tutors = await query({
                action: 'read',
                table: 'tutors',
                where: whereClause,
                other: additionalSQL
            });
            
            // Get total count for pagination - FIXED: Remove ORDER BY and LIMIT from count query
            const countResult = await query({
                action: 'count',
                table: 'tutors',
                where: whereClause
                // No 'other' parameter for count queries
            });
            
            res.json({
                success: true,
                data: tutors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].count,
                    pages: Math.ceil(countResult[0].count / limit)
                }
            });
            
        } catch (error) {
            console.error('Get tutors error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch tutors',
                message: error.message 
            });
        }
    }
    
    // GET /api/tutors/:id - Get single tutor by ID
    async getTutorById(req, res) {
        try {
            const { id } = req.params;
            
            const tutors = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });
            
            if (tutors.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }
            
            res.json({
                success: true,
                data: tutors[0]
            });
            
        } catch (error) {
            console.error('Get tutor by ID error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch tutor',
                message: error.message 
            });
        }
    }
    
    // POST /api/tutors - Create new tutor
    async createTutor(req, res) {
        try {
            const {
                full_name,
                contact_number,
                email,
                course,
                location,
                facebook,
                username,
                password,
                status = 'active',
                rating = 0.0
            } = req.body;
            
            // Validation
            if (!full_name || !email || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Full name, email, username, and password are required'
                });
            }
            
            // Validate password strength
            const strengthCheck = AuthUtils.validatePasswordStrength(password);
            if (!strengthCheck.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Password does not meet security requirements',
                    suggestions: strengthCheck.suggestions
                });
            }
            
            // Hash password
            const hashedPassword = await AuthUtils.hashPassword(password);
            
            const result = await query({
                action: 'create',
                table: 'tutors',
                data: {
                    full_name,
                    contact_number: contact_number || null,
                    email,
                    course: course || null,
                    location: location || null,
                    facebook: facebook || null,
                    username,
                    password: hashedPassword,
                    status,
                    join_date: new Date().toISOString().split('T')[0],
                    rating: parseFloat(rating) || 0.0
                }
            });
            
            // Fetch the created tutor (without password)
            const newTutor = await query({
                action: 'read',
                table: 'tutors',
                get: 'id, full_name, email, course, location, status, join_date, rating',
                where: { id: result.insertId }
            });
            
            res.status(201).json({
                success: true,
                message: 'Tutor created successfully',
                data: newTutor[0]
            });
            
        } catch (error) {
            console.error('Create tutor error:', error);
            
            // Handle duplicate entry errors
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    error: 'Email or username already exists'
                });
            }
            
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create tutor',
                message: error.message 
            });
        }
    }
    
    // PUT /api/tutors/:id - Update tutor
    async updateTutor(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Check if tutor exists
            const existingTutor = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });
            
            if (existingTutor.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }
            
            // Remove id and password from update data
            delete updateData.id;
            
            // If password is being updated, hash it
            if (updateData.password) {
                const strengthCheck = AuthUtils.validatePasswordStrength(updateData.password);
                if (!strengthCheck.isValid) {
                    return res.status(400).json({
                        success: false,
                        error: 'New password does not meet security requirements',
                        suggestions: strengthCheck.suggestions
                    });
                }
                updateData.password = await AuthUtils.hashPassword(updateData.password);
            }
            
            const result = await query({
                action: 'update',
                table: 'tutors',
                where: { id },
                data: updateData
            });
            
            // Fetch updated tutor (without password)
            const updatedTutor = await query({
                action: 'read',
                table: 'tutors',
                get: 'id, full_name, email, course, location, status, join_date, rating',
                where: { id }
            });
            
            res.json({
                success: true,
                message: 'Tutor updated successfully',
                data: updatedTutor[0]
            });
            
        } catch (error) {
            console.error('Update tutor error:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    error: 'Email or username already exists'
                });
            }
            
            res.status(500).json({ 
                success: false, 
                error: 'Failed to update tutor',
                message: error.message 
            });
        }
    }
    
    // DELETE /api/tutors/:id - Delete tutor (soft delete by setting status to inactive)
    async deleteTutor(req, res) {
        try {
            const { id } = req.params;
            
            // Check if tutor exists
            const existingTutor = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });
            
            if (existingTutor.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }
            
            // Soft delete by setting status to inactive
            await query({
                action: 'update',
                table: 'tutors',
                where: { id },
                data: { status: 'inactive' }
            });
            
            res.json({
                success: true,
                message: 'Tutor deleted successfully'
            });
            
        } catch (error) {
            console.error('Delete tutor error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to delete tutor',
                message: error.message 
            });
        }
    }
    
    // GET /api/tutors/:id/availability - Get tutor's availability
    async getTutorAvailability(req, res) {
        try {
            const { id } = req.params;
            
            const availability = await query({
                action: 'read',
                table: 'tutor_availability',
                where: { tutor_id: id }
            });
            
            res.json({
                success: true,
                data: availability
            });
            
        } catch (error) {
            console.error('Get tutor availability error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch tutor availability',
                message: error.message 
            });
        }
    }
    
    // GET /api/tutors/:id/sessions - Get tutor's sessions
    async getTutorSessions(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.query;
            
            let whereClause = { tutor_id: id };
            if (status) {
                whereClause.status = status;
            }
            
            const sessions = await query({
                action: 'read',
                table: 'sessions',
                where: whereClause,
                other: 'ORDER BY date DESC, time DESC'
            });
            
            res.json({
                success: true,
                data: sessions
            });
            
        } catch (error) {
            console.error('Get tutor sessions error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch tutor sessions',
                message: error.message 
            });
        }
    }
    
    // GET /api/tutors/:id/session-requests - Get tutor's session requests
    async getTutorSessionRequests(req, res) {
        try {
            const { id } = req.params;
            const { status = 'pending' } = req.query;
            
            const sessionRequests = await query({
                action: 'read',
                table: 'session_requests',
                where: { 
                    tutor_id: id,
                    status 
                },
                other: 'ORDER BY preferred_date DESC'
            });
            
            res.json({
                success: true,
                data: sessionRequests
            });
            
        } catch (error) {
            console.error('Get tutor session requests error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch tutor session requests',
                message: error.message 
            });
        }
    }
    
    // GET /api/tutors/stats/courses - Get unique courses
    async getUniqueCourses(req, res) {
        try {
            const courses = await query({
                action: 'read',
                table: 'tutors',
                get: 'DISTINCT course',
                where: { status: 'active' },
                other: 'ORDER BY course'
            });
            
            res.json({
                success: true,
                data: courses.map(item => item.course).filter(Boolean)
            });
            
        } catch (error) {
            console.error('Get courses error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch courses',
                message: error.message 
            });
        }
    }
    
    // GET /api/tutors/stats/locations - Get unique locations
    async getUniqueLocations(req, res) {
        try {
            const locations = await query({
                action: 'read',
                table: 'tutors',
                get: 'DISTINCT location',
                where: { status: 'active' },
                other: 'ORDER BY location'
            });
            
            res.json({
                success: true,
                data: locations.map(item => item.location).filter(Boolean)
            });
            
        } catch (error) {
            console.error('Get locations error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch locations',
                message: error.message 
            });
        }
    }

    // POST /api/tutors/login - Tutor login
    async loginTutor(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }
            
            // Find tutor by email
            const tutors = await query({
                action: 'read',
                table: 'tutors',
                where: { 
                    email: email.toLowerCase().trim(),
                    status: 'active'
                }
            });
            
            if (tutors.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            
            const tutor = tutors[0];
            
            // Verify password
            const isPasswordValid = await AuthUtils.verifyPassword(password, tutor.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            
            // Remove password from response
            const { password: _, ...safeTutor } = tutor;
            
            res.json({
                success: true,
                message: 'Login successful',
                data: safeTutor
            });
            
        } catch (error) {
            console.error('Login tutor error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Login failed',
                message: error.message 
            });
        }
    }

    // PUT /api/tutors/:id/password - Change password
    async changePassword(req, res) {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password and new password are required'
                });
            }
            
            // Get tutor with password
            const tutors = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });
            
            if (tutors.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }
            
            const tutor = tutors[0];
            
            // Verify current password
            const isCurrentPasswordValid = await AuthUtils.verifyPassword(currentPassword, tutor.password);
            
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }
            
            // Validate new password strength
            const strengthCheck = AuthUtils.validatePasswordStrength(newPassword);
            if (!strengthCheck.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'New password does not meet security requirements',
                    suggestions: strengthCheck.suggestions
                });
            }
            
            // Hash new password
            const hashedNewPassword = await AuthUtils.hashPassword(newPassword);
            
            // Update password
            await query({
                action: 'update',
                table: 'tutors',
                where: { id },
                data: { password: hashedNewPassword }
            });
            
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
            
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to change password',
                message: error.message 
            });
        }
    }

    // POST /api/tutors/:id/reset-password - Reset password (admin function)
    async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            
            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'New password is required'
                });
            }
            
            // Check if tutor exists
            const existingTutor = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });
            
            if (existingTutor.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }
            
            // Validate new password strength
            const strengthCheck = AuthUtils.validatePasswordStrength(newPassword);
            if (!strengthCheck.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'New password does not meet security requirements',
                    suggestions: strengthCheck.suggestions
                });
            }
            
            // Hash new password
            const hashedPassword = await AuthUtils.hashPassword(newPassword);
            
            // Update password
            await query({
                action: 'update',
                table: 'tutors',
                where: { id },
                data: { password: hashedPassword }
            });
            
            res.json({
                success: true,
                message: 'Password reset successfully'
            });
            
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to reset password',
                message: error.message 
            });
        }
    }

    // GET /api/tutors/:id/profile - Get tutor profile with stats
    async getTutorProfile(req, res) {
        try {
            const { id } = req.params;
            
            const tutors = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });
            
            if (tutors.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Tutor not found'
                });
            }
            
            const tutor = tutors[0];
            
            // Get additional data
            const [sessions, sessionRequests, availability] = await Promise.all([
                // Get sessions
                query({
                    action: 'read',
                    table: 'sessions',
                    where: { tutor_id: id },
                    other: 'ORDER BY date DESC LIMIT 10'
                }),
                
                // Get session requests
                query({
                    action: 'read',
                    table: 'session_requests',
                    where: { tutor_id: id },
                    other: 'ORDER BY preferred_date DESC LIMIT 10'
                }),
                
                // Get availability
                query({
                    action: 'read',
                    table: 'tutor_availability',
                    where: { tutor_id: id }
                })
            ]);
            
            // Remove password from response
            const { password, ...safeTutor } = tutor;
            
            res.json({
                success: true,
                data: {
                    ...safeTutor,
                    recent_sessions: sessions,
                    recent_requests: sessionRequests,
                    availability: availability,
                    stats: {
                        total_sessions: sessions.length,
                        upcoming_sessions: sessions.filter(s => s.status === 'upcoming').length,
                        completed_sessions: sessions.filter(s => s.status === 'completed').length,
                        pending_requests: sessionRequests.filter(r => r.status === 'pending').length
                    }
                }
            });
            
        } catch (error) {
            console.error('Get tutor profile error:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch tutor profile',
                message: error.message 
            });
        }
    }
}

export const tutorsController = new TutorsController();