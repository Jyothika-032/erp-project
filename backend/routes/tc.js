const { Router } = require('express');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const router = Router();

// GET /api/tc
router.get('/', async (req, res, next) => {
    try {
        const { institution_id, search } = req.query;
        const parsedId = parseInt(institution_id, 10);
        let q = `
            SELECT t.*, s.student_name 
            FROM tc t
            LEFT JOIN students s ON t.student_id = s.student_id
            WHERE t.institution_id = :institution_id
        `;
        const replacements = { institution_id: isNaN(parsedId) ? 1 : parsedId };

        if (search) {
            q += ' AND (s.student_name ILIKE :search OR t.reason ILIKE :search)';
            replacements.search = `%${search}%`;
        }

        q += ' ORDER BY t.tc_id DESC';
        const rows = await sequelize.query(q, { replacements, type: QueryTypes.SELECT });
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// POST /api/tc
router.post('/', async (req, res, next) => {
    try {
        const { student_id, institution_id, tc_number, issued_by, issue_date, reason, status } = req.body;
        const [result] = await sequelize.query(
            `INSERT INTO tc (student_id, institution_id, tc_number, issued_by, issue_date, reason, status)
             VALUES (:student_id, :institution_id, :tc_number, :issued_by, :issue_date, :reason, :status) RETURNING *`,
            {
                replacements: { 
                    student_id, institution_id, tc_number, issue_date, reason,
                    issued_by: issued_by || null, 
                    status: status || 'pending' 
                },
                type: QueryTypes.INSERT
            }
        );
        res.status(201).json(result[0]);
    } catch (err) { next(err); }
});

// PUT /api/tc/:id - Update status or other fields
router.put('/:id', async (req, res, next) => {
    try {
        const { tc_number, issued_by, issue_date, reason, status } = req.body;
        
        // Find existing TC first to merge
        const [existing] = await sequelize.query('SELECT * FROM tc WHERE tc_id = :id', {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });
        if (!existing) return res.status(404).json({ success: false, error: 'TC not found' });

        const updatedTcNumber = tc_number !== undefined ? tc_number : existing.tc_number;
        const updatedIssuedBy = issued_by !== undefined ? issued_by : existing.issued_by;
        const updatedIssueDate = issue_date !== undefined ? issue_date : existing.issue_date;
        const updatedReason = reason !== undefined ? reason : existing.reason;
        const updatedStatus = status !== undefined ? status : existing.status;

        const [rows] = await sequelize.query(
            `UPDATE tc 
             SET tc_number = :tc_number, 
                 issued_by = :issued_by, 
                 issue_date = :issue_date, 
                 reason = :reason, 
                 status = :status,
                 updated_at = CURRENT_TIMESTAMP
             WHERE tc_id = :id RETURNING *`,
            {
                replacements: {
                    tc_number: updatedTcNumber,
                    issued_by: updatedIssuedBy,
                    issue_date: updatedIssueDate,
                    reason: updatedReason,
                    status: updatedStatus,
                    id: req.params.id
                },
                type: QueryTypes.UPDATE
            }
        );
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
});

// DELETE /api/tc/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await sequelize.query('DELETE FROM tc WHERE tc_id = :id', {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });
        res.json({ success: true, message: 'TC deleted successfully' });
    } catch (err) { next(err); }
});

module.exports = router;
