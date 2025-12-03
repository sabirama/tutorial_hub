// src/api/controllers/subjects_controller.js
import { query } from '../database/connection.js';

export class SubjectsController {
    
    // GET /api/subjects - Get all subjects
    async getSubjects(req, res) {
        try {
            const {
                page = 1,
                limit = 100,
                search,
                category,
                sort = 'name',
                order = 'ASC'
            } = req.query;

            let whereClause = {};
            let additionalSQL = '';

            // Search functionality
            if (search) {
                whereClause['__RAW__'] = `(name LIKE '%${search}%' OR description LIKE '%${search}%')`;
            }

            // Filter by category
            if (category) {
                whereClause.category = category;
            }

            // Pagination and sorting
            const offset = (page - 1) * limit;
            additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;

            // Get subjects
            const subjects = await query({
                action: 'read',
                table: 'subject',
                where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
                other: additionalSQL
            });

            // Get total count for pagination
            const countResult = await query({
                action: 'count',
                table: 'subject',
                where: Object.keys(whereClause).length > 0 ? whereClause : undefined
            });

            res.json({
                success: true,
                data: subjects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].count,
                    pages: Math.ceil(countResult[0].count / limit)
                }
            });

        } catch (error) {
            console.error('Get subjects error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch subjects',
                message: error.message
            });
        }
    }

    // GET /api/subjects/categories - Get all unique categories
    async getCategories(req, res) {
        try {
            const categories = await query({
                action: 'read',
                table: 'subject',
                get: 'DISTINCT category',
                other: 'ORDER BY category'
            });

            res.json({
                success: true,
                data: categories.map(item => item.category).filter(Boolean)
            });

        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch categories',
                message: error.message
            });
        }
    }

    // GET /api/subjects/:id - Get single subject by ID
    async getSubjectById(req, res) {
        try {
            const { id } = req.params;

            const subjects = await query({
                action: 'read',
                table: 'subject',
                where: { id }
            });

            if (subjects.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Subject not found'
                });
            }

            res.json({
                success: true,
                data: subjects[0]
            });

        } catch (error) {
            console.error('Get subject by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch subject',
                message: error.message
            });
        }
    }

    // POST /api/subjects - Create new subject (admin only)
    async createSubject(req, res) {
        try {
            const { name, description, category = 'General' } = req.body;

            // Validation
            if (!name) {
                return res.status(400).json({
                    success: false,
                    error: 'Subject name is required'
                });
            }

            const result = await query({
                action: 'create',
                table: 'subject',
                data: {
                    name: name.trim(),
                    description: description || null,
                    category: category.trim()
                }
            });

            // Fetch the created subject
            const newSubject = await query({
                action: 'read',
                table: 'subject',
                where: { id: result.insertId }
            });

            res.status(201).json({
                success: true,
                message: 'Subject created successfully',
                data: newSubject[0]
            });

        } catch (error) {
            console.error('Create subject error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    error: 'Subject name already exists'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to create subject',
                message: error.message
            });
        }
    }

    // PUT /api/subjects/:id - Update subject (admin only)
    async updateSubject(req, res) {
        try {
            const { id } = req.params;
            const { name, description, category } = req.body;

            // Check if subject exists
            const existingSubject = await query({
                action: 'read',
                table: 'subject',
                where: { id }
            });

            if (existingSubject.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Subject not found'
                });
            }

            const updateData = {};
            if (name !== undefined) updateData.name = name.trim();
            if (description !== undefined) updateData.description = description;
            if (category !== undefined) updateData.category = category.trim();

            // Check if there's any data to update
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No data provided for update'
                });
            }

            await query({
                action: 'update',
                table: 'subject',
                where: { id },
                data: updateData
            });

            // Fetch updated subject
            const updatedSubject = await query({
                action: 'read',
                table: 'subject',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Subject updated successfully',
                data: updatedSubject[0]
            });

        } catch (error) {
            console.error('Update subject error:', error);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    error: 'Subject name already exists'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Failed to update subject',
                message: error.message
            });
        }
    }

    // DELETE /api/subjects/:id - Delete subject (admin only)
    async deleteSubject(req, res) {
        try {
            const { id } = req.params;

            // Check if subject exists
            const existingSubject = await query({
                action: 'read',
                table: 'subject',
                where: { id }
            });

            if (existingSubject.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Subject not found'
                });
            }

            await query({
                action: 'destroy',
                table: 'subject',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Subject deleted successfully'
            });

        } catch (error) {
            console.error('Delete subject error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete subject',
                message: error.message
            });
        }
    }
}

export const subjectsController = new SubjectsController();