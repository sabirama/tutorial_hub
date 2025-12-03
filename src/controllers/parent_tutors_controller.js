import { query } from '../database/connection.js';

export class ParentTutorsController {

    // GET /api/parent-tutors - Get all parent-tutor relationships with filtering
    async getParentTutors(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                parent_id,
                tutor_id,
                subject_id,
                status,
                sort = 'created_at',
                order = 'DESC'
            } = req.query;

            let whereClause = {};

            // Apply filters
            if (parent_id) whereClause.parent_id = parent_id;
            if (tutor_id) whereClause.tutor_id = tutor_id;
            if (subject_id) whereClause.subject_id = subject_id;
            if (status) whereClause.status = status;

            // Pagination and sorting
            const offset = (page - 1) * limit;
            const additionalSQL = `ORDER BY ${sort} ${order.toUpperCase()} LIMIT ${limit} OFFSET ${offset}`;

            // Get parent-tutors with basic query first
            const queryConfig = {
                action: 'read',
                table: 'parent_tutors',
                other: additionalSQL
            };

            // Only add where clause if we have actual filters
            if (Object.keys(whereClause).length > 0) {
                queryConfig.where = whereClause;
            }

            const parentTutors = await query(queryConfig);

            // Get total count for pagination
            const countConfig = {
                action: 'count',
                table: 'parent_tutors'
            };

            if (Object.keys(whereClause).length > 0) {
                countConfig.where = whereClause;
            }

            const countResult = await query(countConfig);

            // Now get the joined data for each parent-tutor relationship
            const parentTutorIds = parentTutors.map(pt => pt.id);

            if (parentTutorIds.length > 0) {
                // Get joined data in separate queries
                const parentTutorsWithJoins = await Promise.all(
                    parentTutors.map(async (parentTutor) => {
                        // Get parent data
                        const [parentData] = await query({
                            action: 'read',
                            table: 'parents',
                            where: { id: parentTutor.parent_id }
                        });

                        // Get tutor data
                        const [tutorData] = await query({
                            action: 'read',
                            table: 'tutors',
                            where: { id: parentTutor.tutor_id }
                        });

                        // Get subject data
                        const [subjectData] = await query({
                            action: 'read',
                            table: 'subject',
                            where: { id: parentTutor.subject_id }
                        });

                        return {
                            ...parentTutor,
                            parent_name: parentData?.full_name,
                            parent_email: parentData?.email,
                            parent_contact: parentData?.contact_number,
                            tutor_name: tutorData?.full_name,
                            tutor_email: tutorData?.email,
                            tutor_contact: tutorData?.contact_number,
                            tutor_rating: tutorData?.rating,
                            subject_name: subjectData?.subject,
                            subject_description: subjectData?.description
                        };
                    })
                );

                res.json({
                    success: true,
                    data: parentTutorsWithJoins,
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
            console.error('Get parent-tutors error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parent-tutor relationships',
                message: error.message
            });
        }
    }

    // POST /api/parent-tutors - Create new parent-tutor relationship
    async createParentTutor(req, res) {
        try {
            const {
                parent_id,
                tutor_id,
                subject_id,
                status = 'active'
            } = req.body;

            // Validation
            if (!parent_id || !tutor_id || !subject_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Parent ID, tutor ID, and subject ID are required'
                });
            }

            // Check if relationship already exists
            const existingRelationship = await query({
                action: 'read',
                table: 'parent_tutors',
                where: {
                    parent_id,
                    tutor_id,
                    subject_id
                }
            });

            if (existingRelationship.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Parent-tutor relationship already exists for this subject'
                });
            }

            const result = await query({
                action: 'create',
                table: 'parent_tutors',
                data: {
                    parent_id,
                    tutor_id,
                    subject_id,
                    status
                }
            });

            // Fetch the created relationship
            const newParentTutor = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { id: result.insertId }
            });

            res.status(201).json({
                success: true,
                message: 'Parent-tutor relationship created successfully',
                data: newParentTutor[0]
            });

        } catch (error) {
            console.error('Create parent-tutor error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create parent-tutor relationship',
                message: error.message
            });
        }
    }

    // PUT /api/parent-tutors/:id - Update parent-tutor relationship
    async updateParentTutor(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if relationship exists
            const existingRelationship = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { id }
            });

            if (existingRelationship.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent-tutor relationship not found'
                });
            }

            // Remove non-updatable fields
            const { id: _, parent_id, tutor_id, subject_id, ...allowedUpdates } = updateData;

            // Validate status if being updated
            if (allowedUpdates.status) {
                const validStatuses = ['active', 'inactive'];
                if (!validStatuses.includes(allowedUpdates.status)) {
                    return res.status(400).json({
                        success: false,
                        error: `Status must be one of: ${validStatuses.join(', ')}`
                    });
                }
            }

            const result = await query({
                action: 'update',
                table: 'parent_tutors',
                where: { id },
                data: allowedUpdates
            });

            // Fetch updated relationship
            const updatedParentTutor = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Parent-tutor relationship updated successfully',
                data: updatedParentTutor[0]
            });

        } catch (error) {
            console.error('Update parent-tutor error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update parent-tutor relationship',
                message: error.message
            });
        }
    }

    // PUT /api/parent-tutors/:id/status - Update parent-tutor relationship status
    async updateParentTutorStatus(req, res) {
        try {
            console.log(req.params.id);
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required'
                });
            }

            // Check if relationship exists
            const existingRelationship = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { id }
            });

            if (existingRelationship.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent-tutor relationship not found'
                });
            }

            // Validate status
            const validStatuses = ['active', 'inactive'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }

            await query({
                action: 'update',
                table: 'parent_tutors',
                where: { id },
                data: { status }
            });

            // Fetch updated relationship
            const updatedParentTutor = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { id }
            });

            res.json({
                success: true,
                message: `Parent-tutor relationship status updated to ${status}`,
                data: updatedParentTutor[0]
            });

        } catch (error) {
            console.error('Update parent-tutor status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update parent-tutor relationship status',
                message: error.message
            });
        }
    }

    // DELETE /api/parent-tutors/:id - Delete parent-tutor relationship
    async deleteParentTutor(req, res) {
        try {
            const { id } = req.params;

            // Check if relationship exists
            const existingRelationship = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { id }
            });

            if (existingRelationship.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Parent-tutor relationship not found'
                });
            }

            await query({
                action: 'destroy',
                table: 'parent_tutors',
                where: { id }
            });

            res.json({
                success: true,
                message: 'Parent-tutor relationship deleted successfully'
            });

        } catch (error) {
            console.error('Delete parent-tutor error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete parent-tutor relationship',
                message: error.message
            });
        }
    }

    // GET /api/parent-tutors/parent/:parent_id - Get all tutors for a parent
    async getTutorsByParent(req, res) {
        try {
            const { parent_id } = req.params;
            const { status = 'active' } = req.query;

            const parentTutors = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { parent_id, status },
                other: 'ORDER BY created_at DESC'
            });

            // Get joined tutor and subject data
            const tutorsWithDetails = await Promise.all(
                parentTutors.map(async (parentTutor) => {
                    // Get tutor data
                    const [tutorData] = await query({
                        action: 'read',
                        table: 'tutors',
                        where: { id: parentTutor.tutor_id }
                    });

                    // Get subject data
                    const [subjectData] = await query({
                        action: 'read',
                        table: 'subject',
                        where: { id: parentTutor.subject_id }
                    });

                    return {
                        ...parentTutor,
                        tutor_name: tutorData?.full_name,
                        tutor_email: tutorData?.email,
                        tutor_contact: tutorData?.contact_number,
                        tutor_rating: tutorData?.rating,
                        tutor_course: tutorData?.course,
                        tutor_location: tutorData?.location,
                        subject_name: subjectData?.subject,
                        subject_description: subjectData?.description
                    };
                })
            );

            res.json({
                success: true,
                data: tutorsWithDetails,
                count: tutorsWithDetails.length
            });

        } catch (error) {
            console.error('Get tutors by parent error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tutors for parent',
                message: error.message
            });
        }
    }

    // GET /api/parent-tutors/tutor/:tutor_id - Get all parents for a tutor
    async getParentsByTutor(req, res) {
        try {
            const tutor_id  = req.params.id;
            const { status = 'active' } = req.query;

            const parentTutors = await query({
                action: 'read',
                table: 'parent_tutors',
                where: { tutor_id, status },
                other: 'ORDER BY created_at DESC'
            });

            // Get joined parent and subject data
            const parentsWithDetails = await Promise.all(
                parentTutors.map(async (parentTutor) => {
                    // Get parent data
                    const [parentData] = await query({
                        action: 'read',
                        table: 'parents',
                        where: { id: parentTutor.parent_id }
                    });

                    // Get subject data
                    const [subjectData] = await query({
                        action: 'read',
                        table: 'subject',
                        where: { id: parentTutor.subject_id }
                    });

                    return {
                        ...parentTutor,
                        parent_name: parentData?.full_name,
                        parent_email: parentData?.email,
                        parent_contact: parentData?.contact_number,
                        parent_location: parentData?.location,
                        subject_name: subjectData?.subject,
                        subject_description: subjectData?.description
                    };
                })
            );
            res.json({
                success: true,
                data: parentsWithDetails,
                count: parentsWithDetails.length
            });

        } catch (error) {
            console.error('Get parents by tutor error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch parents for tutor',
                message: error.message
            });
        }
    }

    // GET /api/parent-tutors/check - Check if parent-tutor relationship exists
    async checkParentTutorRelationship(req, res) {
        try {
            const { parent_id, tutor_id, subject_id } = req.query;

            if (!parent_id || !tutor_id || !subject_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Parent ID, tutor ID, and subject ID are required'
                });
            }

            const relationship = await query({
                action: 'read',
                table: 'parent_tutors',
                where: {
                    parent_id,
                    tutor_id,
                    subject_id
                }
            });

            res.json({
                success: true,
                exists: relationship.length > 0,
                data: relationship[0] || null
            });

        } catch (error) {
            console.error('Check parent-tutor relationship error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to check parent-tutor relationship',
                message: error.message
            });
        }
    }
}

export const parentTutorsController = new ParentTutorsController();