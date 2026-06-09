const { Router } = require('express');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const router = Router();

// GET /api/fee-structure?institution_id=1
router.get('/', async (req, res, next) => {
    try {
        const { institution_id, search } = req.query;
        const parsedId = parseInt(institution_id, 10);
        // Join with course table to get course_name
        let q = `
            SELECT fs.*, c.course_name 
            FROM fee_structure fs
            LEFT JOIN course c ON fs.course_id = c.course_id
            WHERE fs.institution_id = :institution_id
        `;
        const replacements = { institution_id: isNaN(parsedId) ? 1 : parsedId };

        if (search) { 
            q += ' AND (c.course_name ILIKE :search OR fs.status ILIKE :search)'; 
            replacements.search = `%${search}%`; 
        }

        q += ' ORDER BY fs.fee_id DESC';
        const rows = await sequelize.query(q, { replacements, type: QueryTypes.SELECT });
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/fee-structure
router.post('/', async (req, res, next) => {
    try {
        const { course_id, institution_id, total_amount, tuition_fee, admission_fee, exam_fee, other_fee, duration_months, status } = req.body;
        const [result] = await sequelize.query(
            `INSERT INTO fee_structure (course_id, institution_id, total_amount, tuition_fee, admission_fee, exam_fee, other_fee, duration_months, status)
             VALUES (:course_id, :institution_id, :total_amount, :tuition_fee, :admission_fee, :exam_fee, :other_fee, :duration_months, :status) RETURNING *`,
            {
                replacements: { course_id, institution_id, total_amount, tuition_fee, admission_fee, exam_fee, other_fee, duration_months, status: status || 'active' },
                type: QueryTypes.INSERT
            }
        );
        res.status(201).json({ success: true, data: result[0] });
    } catch (err) { next(err); }
});

// PUT /api/fee-structure/:id
router.put('/:id', async (req, res, next) => {
    try {
        const { course_id, total_amount, tuition_fee, admission_fee, exam_fee, other_fee, duration_months, status } = req.body;
        const [rows] = await sequelize.query(
            `UPDATE fee_structure SET 
                course_id=:course_id, 
                total_amount=:total_amount, 
                tuition_fee=:tuition_fee, 
                admission_fee=:admission_fee, 
                exam_fee=:exam_fee, 
                other_fee=:other_fee, 
                duration_months=:duration_months, 
                status=:status 
             WHERE fee_id=:id RETURNING *`,
            {
                replacements: { course_id, total_amount, tuition_fee, admission_fee, exam_fee, other_fee, duration_months, status, id: req.params.id },
                type: QueryTypes.UPDATE
            }
        );
        if (!rows.length) return res.status(404).json({ error: 'Fee structure not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
});

// DELETE /api/fee-structure/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await sequelize.query('DELETE FROM fee_structure WHERE fee_id = :id', {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });
        res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) { next(err); }
});

module.exports = router;
