import { query } from '../database/connection.js';
import AuthUtils from '../middleware/hashing.js';
export class ParentsController {

    // GET /api/parents - Get all parents (admin only)
    async getParents(req, res) {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                location,
                sort = 'created_at',
                order = 'DESC'
            } = req.query;
            let whereClause;
            let additionalSQL = '';

            // Search functionality
            if (search) {
                whereClause['__RAW__'] = `(
                    full_name LIKE '%${search}%' OR 
                    email LIKE '%${search}%' OR 
                    location LIKE '%${search}%' OR
                    username LIKE '%${search}%'
                )`;
            }

            // Filter by location
            if (location) {
                whereClause.location = location;
            }

            // Pagination and sorting
            const offset = (page - 1) * limit;
            additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;

            const parents = await query({
                action: 'read',
                table: 'parents',
                where: whereClause,
                other: additionalSQL
            });

            // Remove passwords from response
            const safeParents = parents.map(parent => {
                const { password, ...safeParent } = parent;
                return safeParent;
            });

            // Get total count for pagination
            const countResult = await query({
                action: 'count',
                table: 'parents',
                where: whereClause
            });

            res.json({
                success: true,
                data: safeParents,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].count,
                    pages: Math.ceil(countResult[0].count / limit)
                }
            });

        } catch (error) {
            console.error('Get parents error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parents',
                message: error.message
            });
        }
    }

    // GET /api/parents/:id - Get single parent
    async getParentById(req, res) {
        try {
            const { id } = req.params;

            const parents = await query({
                action: 'read',
                table: 'parents',
                where: { id }
            });

            if (parents.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
                });
            }

            const parent = parents[0];

            // Remove password from response
            const { password, ...safeParent } = parent;

            res.json({
                success: true,
                data: safeParent
            });

        } catch (error) {
            console.error('Get parent by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parent',
                message: error.message
            });
        }
    }

    // POST /api/parents/register - Register new parent
    async registerParent(req, res) {
        try {
            const {
                full_name,
                contact_number,
                email,
                location,
                facebook,
                username,
                password,
                bio
            } = req.body;
            console.log(req.body)
            // Validation
            if (!full_name || !contact_number || !email || !username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Full name, contact_number, email, username, and password are required'
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email format'
                });
            }

            // Password strength validation
            const strengthCheck = AuthUtils.validatePasswordStrength(password);
            if (!strengthCheck.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Password does not meet security requirements',
                    requirements: strengthCheck.requirements,
                    suggestions: strengthCheck.suggestions
                });
            }

            // Hash password
            const hashedPassword = await AuthUtils.hashPassword(password);

            const result = await query({
                action: 'create',
                table: 'parents',
                data: {
                    full_name: full_name.trim(),
                    contact_number: contact_number || null,
                    email: email.toLowerCase().trim(),
                    location: location || null,
                    facebook: facebook || null,
                    username: username.toLowerCase().trim(),
                    password: hashedPassword,
                    bio: bio || null,
                    status: 'active'
                }
            });

            // Fetch the created parent (without password)
            const newParent = await query({
                action: 'read',
                table: 'parents',
                get: 'id, full_name, email, contact_number, location, facebook, username, profile_image, bio, status, created_at',
                where: { id: result.insertId }
            });

            const token = AuthUtils.generateTempPassword(20);

            const createToken = await query({
                action: 'create',
                table: 'auth_tokens',
                data: {
                    user_id: newParent[0].id,
                    type: 'parent_token',
                    token: token
                }
            })

            res.status(201).json({
                success: true,
                message: 'Parent registered successfully',
                data: { parent: newParent[0], token: `${newParent[0].id}|${token}` }
            });

        } catch (error) {
            console.error('Register parent error:', error);

            // Handle specific MySQL errors
            if (error.code === 'ER_DUP_ENTRY') {
                const field = error.message.includes('email') ? 'Email' : 'Username';
                return res.status(400).json({
                    success: false,
                    error: `${field} already exists`
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to register parent',
                message: error.message
            });
        }
    }

    // POST /api/parents/login - Parent login
    async loginParent(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'username and password are required'
                });
            }

            // Find parent by username
            const parents = await query({
                action: 'read',
                table: 'parents',
                where: {
                    username: username.toLowerCase().trim(),
                    status: 'active'
                }
            });

            if (parents.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid username or password'
                });
            }

            const parent = parents[0];

            // Verify password
            const isPasswordValid = await AuthUtils.verifyPassword(password, parent.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            const token = AuthUtils.generateTempPassword(20);

            const createToken = await query({
                action: 'create',
                table: 'auth_tokens',
                data: {
                    user_id: parent.id,
                    type: 'parent_token',
                    token: token
                }
            })

            // Remove password from response
            const { password: _, ...safeParent } = parent;

            res.json({
                success: true,
                message: 'Login successful',
                data: { safeParent, token: `${safeParent.id}|${token}` }
            });

        } catch (error) {
            console.error('Login parent error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed',
                message: error.message
            });
        }
    }

    // PUT /api/parents/:id - Update parent profile
    async updateParent(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if parent exists
            const existingParent = await query({
                action: 'read',
                table: 'parents',
                where: { id }
            });

            if (existingParent.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
                });
            }

            // Remove non-updatable fields
            const { id: _, password, created_at, ...allowedUpdates } = updateData;

            // Validate email if being updated
            if (allowedUpdates.email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(allowedUpdates.email)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid email format'
                    });
                }
                allowedUpdates.email = allowedUpdates.email.toLowerCase().trim();
            }

            // Validate username if being updated
            if (allowedUpdates.username) {
                allowedUpdates.username = allowedUpdates.username.toLowerCase().trim();
            }

            const result = await query({
                action: 'update',
                table: 'parents',
                where: { id },
                data: allowedUpdates
            });

            // Fetch updated parent (without password)
            const updatedParent = await query({
                action: 'read',
                table: 'parents',
                get: 'id, full_name, email, contact_number, location, facebook, username, profile_image, bio, status, created_at',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Parent updated successfully',
                data: updatedParent[0]
            });

        } catch (error) {
            console.error('Update parent error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                const field = error.message.includes('email') ? 'Email' : 'Username';
                return res.status(400).json({
                    success: false,
                    error: `${field} already exists`
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update parent',
                message: error.message
            });
        }
    }

    // PUT /api/parents/:id/password - Change password
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

            // Get parent with password
            const parents = await query({
                action: 'read',
                table: 'parents',
                where: { id }
            });

            if (parents.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
                });
            }

            const parent = parents[0];

            // Verify current password
            const isCurrentPasswordValid = await AuthUtils.verifyPassword(currentPassword, parent.password);

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
                table: 'parents',
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

    // POST /api/parents/:id/reset-password - Reset password (admin function)
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

            // Check if parent exists
            const existingParent = await query({
                action: 'read',
                table: 'parents',
                where: { id }
            });

            if (existingParent.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
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
                table: 'parents',
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

    // DELETE /api/parents/:id - Soft delete parent
    async deleteParent(req, res) {
        try {
            const { id } = req.params;

            // Check if parent exists
            const existingParent = await query({
                action: 'read',
                table: 'parents',
                where: { id }
            });

            if (existingParent.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
                });
            }

            // Soft delete by setting status to inactive
            await query({
                action: 'update',
                table: 'parents',
                where: { id },
                data: { status: 'inactive' }
            });

            res.json({
                success: true,
                message: 'Parent deleted successfully'
            });

        } catch (error) {
            console.error('Delete parent error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete parent',
                message: error.message
            });
        }
    }

    // GET /api/parents/:id/profile - Get parent profile with stats
    async getParentProfile(req, res) {
        try {
            const { id } = req.params;

            const parents = await query({
                action: 'read',
                table: 'parents',
                where: { id }
            });

            if (parents.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent not found'
                });
            }

            const parent = parents[0];

            // Get additional data - REMOVED session_requests since it doesn't exist
            const [children, sessions] = await Promise.all([
                // Get children
                query({
                    action: 'read',
                    table: 'children',
                    where: { parent_id: id }
                }),

                // Get sessions
                query({
                    action: 'read',
                    table: 'sessions',
                    where: { parent_id: id },
                    other: 'ORDER BY date DESC LIMIT 10'
                })
            ]);

            // Remove password from response
            const { password, ...safeParent } = parent;

            res.json({
                success: true,
                data: {
                    ...safeParent,
                    children: children,
                    stats: {
                        children_count: children.length,
                        total_sessions: sessions.length,
                        upcoming_sessions: sessions.filter(s => s.status === 'upcoming').length,
                        completed_sessions: sessions.filter(s => s.status === 'completed').length
                    }
                }
            });

        } catch (error) {
            console.error('Get parent profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parent profile',
                message: error.message
            });
        }
    }

    // GET /api/parents/:id/children - Get parent's children
    async getParentChildren(req, res) {
        try {
            const { id } = req.params;

            const children = await query({
                action: 'read',
                table: 'children',
                where: { parent_id: id },
                other: 'ORDER BY name ASC'
            });

            res.json({
                success: true,
                data: children,
                count: children.length
            });

        } catch (error) {
            console.error('Get parent children error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parent children',
                message: error.message
            });
        }
    }

    // POST /api/parents/:id/children - Add new child
    async addChild(req, res) {
        try {
            const { id } = req.params;
            const { name, grade, age } = req.body;

            // Validation
            if (!name || !grade || !age) {
                return res.status(400).json({
                    success: false,
                    error: 'Child name, grade, and age are required'
                });
            }

            const result = await query({
                action: 'create',
                table: 'children',
                data: {
                    parent_id: id,
                    name: name.trim(),
                    grade: grade.trim(),
                    age: parseInt(age)
                }
            });

            // Fetch the created child
            const newChild = await query({
                action: 'read',
                table: 'children',
                where: { id: result.insertId }
            });

            res.status(201).json({
                success: true,
                message: 'Child added successfully',
                data: newChild[0]
            });

        } catch (error) {
            console.error('Add child error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to add child',
                message: error.message
            });
        }
    }

    // PUT /api/parents/:parent_id/children/:child_id - Update child
    async updateChild(req, res) {
        try {
            const { parent_id, child_id } = req.params;
            const updateData = req.body;

            // Check if child exists and belongs to parent
            const existingChild = await query({
                action: 'read',
                table: 'children',
                where: { id: child_id, parent_id }
            });

            if (existingChild.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Child not found or does not belong to this parent'
                });
            }

            // Remove non-updatable fields
            const { id, parent_id: _, ...allowedUpdates } = updateData;

            const result = await query({
                action: 'update',
                table: 'children',
                where: { id: child_id },
                data: allowedUpdates
            });

            // Fetch updated child
            const updatedChild = await query({
                action: 'read',
                table: 'children',
                where: { id: child_id }
            });

            res.json({
                success: true,
                message: 'Child updated successfully',
                data: updatedChild[0]
            });

        } catch (error) {
            console.error('Update child error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update child',
                message: error.message
            });
        }
    }

    // DELETE /api/parents/:parent_id/children/:child_id - Delete child
    async deleteChild(req, res) {
        try {
            const { parent_id, child_id } = req.params;

            // Check if child exists and belongs to parent
            const existingChild = await query({
                action: 'read',
                table: 'children',
                where: { id: child_id, parent_id }
            });

            if (existingChild.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Child not found or does not belong to this parent'
                });
            }

            await query({
                action: 'destroy',
                table: 'children',
                where: { id: child_id }
            });

            res.json({
                success: true,
                message: 'Child deleted successfully'
            });

        } catch (error) {
            console.error('Delete child error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete child',
                message: error.message
            });
        }
    }
}

export const parentsController = new ParentsController();