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
                sort = 'rating',
                order = 'DESC'
            } = req.query;

            let whereClause = {};
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

            // Get subjects for each tutor
            const tutorsWithSubjects = await Promise.all(
                tutors.map(async (tutor) => {
                    const tutorSubjects = await query({
                        action: 'read',
                        table: 'tutors_subjects',
                        where: { tutor_id: tutor.id }
                    });

                    const subjects = [];
                    for (const ts of tutorSubjects) {
                        const subjectDetails = await query({
                            action: 'read',
                            table: 'subject',
                            where: { id: ts.subject_id }
                        });
                        if (subjectDetails.length > 0) {
                            subjects.push(subjectDetails[0]);
                        }
                    }

                    return {
                        ...tutor,
                        subjects: subjects.map(s => s.subject)
                    };
                })
            );

            // Get total count for pagination
            const countResult = await query({
                action: 'count',
                table: 'tutors',
                where: whereClause
            });

            res.json({
                success: true,
                data: tutorsWithSubjects,
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

            // Only include fields that exist in the database
            const allowedFields = [
                'full_name',
                'contact_number',
                'email',
                'course',
                'location',
                'facebook',
                'profile_image',
                'bio',
                'hourly_rate',
                'experience',
                'education'
            ];

            const filteredUpdateData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredUpdateData[field] = updateData[field];
                }
            }

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
                filteredUpdateData.password = await AuthUtils.hashPassword(updateData.password);
            }

            // Check if there's any data to update
            if (Object.keys(filteredUpdateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
            }

            const result = await query({
                action: 'update',
                table: 'tutors',
                where: { id },
                data: filteredUpdateData
            });

            // Fetch updated tutor (without password)
            const updatedTutor = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });

            // Remove password from response
            const { password, ...safeTutor } = updatedTutor[0];

            res.json({
                success: true,
                message: 'Tutor updated successfully',
                data: safeTutor
            });

        } catch (error) {
            console.error('Update tutor error:', error);

            if (error.code === 'ER_BAD_FIELD_ERROR') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid field in update data',
                    message: 'One or more fields do not exist in the database'
                });
            }

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

    // GET /api/tutors/:id/availability - Get tutor's availability via relationship table
    async getTutorAvailability(req, res) {
        try {
            const { id } = req.params;

            // Get availability records from relationship table
            const availabilityRecords = await query({
                action: 'read',
                table: 'tutor_availability',
                where: { tutor_id: id }
            });

            // Get schedule details for each availability record
            const availability = [];
            for (const record of availabilityRecords) {
                const scheduleData = await query({
                    action: 'read',
                    table: 'schedules',
                    where: { id: record.schedule_id }
                });
                if (scheduleData.length > 0) {
                    availability.push(scheduleData[0]);
                }
            }

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

    // GET /api/tutors/:id/subjects - Get tutor's subjects via relationship table
    async getTutorSubjects(req, res) {
        try {
            const { id } = req.params;

            // Get subject IDs from relationship table
            const tutorSubjects = await query({
                action: 'read',
                table: 'tutors_subjects',
                where: { tutor_id: id }
            });

            // Get subject details for each subject ID
            const subjects = [];
            for (const tutorSubject of tutorSubjects) {
                const subjectDetails = await query({
                    action: 'read',
                    table: 'subject',
                    where: { id: tutorSubject.subject_id }
                });
                if (subjectDetails.length > 0) {
                    subjects.push(subjectDetails[0]);
                }
            }

            res.json({
                success: true,
                data: subjects
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

    // In tutors_controller.js - add this new method
    async updateTutorSubjects(req, res) {
        try {
            const { id } = req.params;
            const { subjects } = req.body; // Array of subject IDs

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

            // Delete existing subjects
            await query({
                action: 'destroy',
                table: 'tutors_subjects',
                where: { tutor_id: id }
            });

            // Add new subjects
            if (subjects && subjects.length > 0) {
                for (const subjectId of subjects) {
                    // Verify subject exists
                    const subjectExists = await query({
                        action: 'read',
                        table: 'subject',
                        where: { id: subjectId }
                    });

                    if (subjectExists.length > 0) {
                        await query({
                            action: 'create',
                            table: 'tutors_subjects',
                            data: {
                                tutor_id: id,
                                subject_id: subjectId
                            }
                        });
                    }
                }
            }

            // Get updated subjects
            const tutorSubjects = await query({
                action: 'read',
                table: 'tutors_subjects',
                where: { tutor_id: id }
            });

            const subjectDetails = [];
            for (const ts of tutorSubjects) {
                const subjectInfo = await query({
                    action: 'read',
                    table: 'subject',
                    where: { id: ts.subject_id }
                });
                if (subjectInfo.length > 0) {
                    subjectDetails.push(subjectInfo[0]);
                }
            }

            res.json({
                success: true,
                message: 'Tutor subjects updated successfully',
                data: {
                    tutor_id: id,
                    subjects: subjectDetails
                }
            });

        } catch (error) {
            console.error('Update tutor subjects error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update tutor subjects',
                message: error.message
            });
        }
    }

    // GET /api/tutors/:id/ratings - Get tutor's ratings
    async getTutorRatings(req, res) {
        try {
            const { id } = req.params;

            const ratings = await query({
                action: 'read',
                table: 'tutor_rating',
                where: { tutor_id: id },
                other: 'ORDER BY created_at DESC'
            });

            res.json({
                success: true,
                data: ratings
            });

        } catch (error) {
            console.error('Get tutor ratings error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tutor ratings',
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
                table: 'sessions',
                where: {
                    tutor_id: id,
                    status
                },
                other: 'ORDER BY time DESC'
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

    // In tutors_controller.js - add this method
async getTutorsBySubject(req, res) {
    try {
        const { subject_id } = req.params;
        const { page = 1, limit = 50 } = req.query;

        // Verify subject exists
        const subjectExists = await query({
            action: 'read',
            table: 'subject',
            where: { id: subject_id }
        });

        if (subjectExists.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found'
            });
        }

        // Get tutor IDs who teach this subject
        const tutorSubjects = await query({
            action: 'read',
            table: 'tutors_subjects',
            where: { subject_id }
        });

        const tutorIds = tutorSubjects.map(ts => ts.tutor_id);

        if (tutorIds.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No tutors found for this subject'
            });
        }

        // Pagination
        const offset = (page - 1) * limit;
        const tutorIdsString = tutorIds.join(',');

        // Get tutors
        const tutors = await query({
            action: 'read',
            table: 'tutors',
            where: {
                '__RAW__': `id IN (${tutorIdsString}) AND status = 'active'`
            },
            other: `ORDER BY rating DESC LIMIT ${limit} OFFSET ${offset}`
        });

        // Get total count
        const countResult = await query({
            action: 'count',
            table: 'tutors',
            where: {
                '__RAW__': `id IN (${tutorIdsString}) AND status = 'active'`
            }
        });

        res.json({
            success: true,
            data: tutors,
            subject: subjectExists[0],
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: countResult[0].count,
                pages: Math.ceil(countResult[0].count / limit)
            }
        });

    } catch (error) {
        console.error('Get tutors by subject error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tutors by subject',
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

    // POST /api/tutors - Create new tutor
    // In your tutors_controller.js - update the registerTutor method
    async registerTutor(req, res) {
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
                status = 'pending',
                rating = 0.0,
                subjects_offered = [] // ADD THIS: Expect array of subject IDs
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
                    rating: parseFloat(rating) || 0.0
                }
            });

            const tutorId = result.insertId;

            // Save subjects to tutors_subjects table if provided
            if (subjects_offered && subjects_offered.length > 0) {
                for (const subjectId of subjects_offered) {
                    await query({
                        action: 'create',
                        table: 'tutors_subjects',
                        data: {
                            tutor_id: tutorId,
                            subject_id: subjectId
                        }
                    });
                }
            }

            // Fetch the created tutor with subjects
            const newTutor = await query({
                action: 'read',
                table: 'tutors',
                get: 'id, full_name, email, course, location, status, rating',
                where: { id: tutorId }
            });

            // Get tutor's subjects
            const tutorSubjects = await query({
                action: 'read',
                table: 'tutors_subjects',
                where: { tutor_id: tutorId }
            });

            // Get subject details
            const subjectDetails = [];
            for (const ts of tutorSubjects) {
                const subjectInfo = await query({
                    action: 'read',
                    table: 'subject',
                    where: { id: ts.subject_id }
                });
                if (subjectInfo.length > 0) {
                    subjectDetails.push(subjectInfo[0]);
                }
            }

            const responseData = {
                ...newTutor[0],
                subjects: subjectDetails
            };

            res.status(201).json({
                success: true,
                message: 'Tutor created successfully',
                data: responseData
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
    // POST /api/tutors/login - Tutor login
    async loginTutor(req, res) {
        try {
            const { username, password } = req.body;
  
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Username and password are required'
                });
            }

            // Find tutor by username
            const tutors = await query({
                action: 'read',
                table: 'tutors',
                where: {
                    username: username.toLowerCase().trim(),
                }
            });

            if (tutors.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid username or password'
                });
            }

            const tutor = tutors[0];

            // Verify password
            const isPasswordValid = await AuthUtils.verifyPassword(password, tutor.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid username or password'
                });
            }

            const token = AuthUtils.generateTempPassword(20);

            const createToken = await query({
                action: 'create',
                table: 'auth_tokens',
                data: {
                    user_id: tutor.id,
                    type: 'tutor_token',
                    token: token
                }
            });

            // Remove password from response
            const { password: _, ...safeTutor } = tutor;

            res.json({
                success: true,
                message: 'Login successful',
                data: { safeTutor, token: `${safeTutor.id}|${token}` }
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

    //Get utor profile
    async getTutorProfile(req, res) {
        try {
            const { id } = req.params;

            // Get basic tutor info
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

            // Get tutor's subjects from tutors_subjects table
            const tutorSubjects = await query({
                action: 'read',
                table: 'tutors_subjects',
                where: { tutor_id: id }
            });

            // Get subject details
            const subjects = [];
            for (const ts of tutorSubjects) {
                const subjectDetails = await query({
                    action: 'read',
                    table: 'subject',
                    where: { id: ts.subject_id }
                });
                if (subjectDetails.length > 0) {
                    subjects.push(subjectDetails[0]);
                }
            }

            // Get other data (availability, ratings, sessions)...
            // ... (keep your existing code for other data)

            // Remove password from response
            const { password, ...safeTutor } = tutor;

            const enhancedTutor = {
                ...safeTutor,
                subjects: subjects.map(s => s.subject), // Extract just subject names
                subject_details: subjects, // Include full subject details
                // ... rest of your enhanced tutor data
            };

            res.json({
                success: true,
                data: enhancedTutor
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

            // Only include fields that exist in the database
            const allowedFields = [
                'full_name',
                'contact_number',
                'email',
                'course',
                'location',
                'facebook',
                'profile_image',
                'bio',
                'hourly_rate',
                'experience',
                'education',
                'status',      // ADD THIS
                'verified',    // ADD THIS
                'rating'       // ADD THIS if needed
            ];

            const filteredUpdateData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredUpdateData[field] = updateData[field];
                }
            }

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
                filteredUpdateData.password = await AuthUtils.hashPassword(updateData.password);
            }

            // Check if there's any data to update
            if (Object.keys(filteredUpdateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No valid fields to update'
                });
            }

            console.log('Updating tutor with data:', filteredUpdateData); // For debugging

            const result = await query({
                action: 'update',
                table: 'tutors',
                where: { id },
                data: filteredUpdateData
            });

            // Fetch updated tutor (without password)
            const updatedTutor = await query({
                action: 'read',
                table: 'tutors',
                where: { id }
            });

            // Remove password from response
            const { password, ...safeTutor } = updatedTutor[0];

            res.json({
                success: true,
                message: 'Tutor updated successfully',
                data: safeTutor
            });

        } catch (error) {
            console.error('Update tutor error:', error);

            if (error.code === 'ER_BAD_FIELD_ERROR') {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid field in update data',
                    message: 'One or more fields do not exist in the database'
                });
            }

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

}

export const tutorsController = new TutorsController();