const { Router } = require('express');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const router = Router();

// GET /api/certificates
router.get('/', async (req, res, next) => {
    try {
        const { institution_id, search } = req.query;
        const parsedId = parseInt(institution_id, 10);
        let q = `
            SELECT c.*, s.student_name 
            FROM certificates c
            LEFT JOIN students s ON c.student_id = s.student_id
            WHERE c.institution_id = :institution_id
        `;
        const replacements = { institution_id: isNaN(parsedId) ? 1 : parsedId };

        if (search) {
            q += ' AND (s.student_name ILIKE :search OR c.certificate_type ILIKE :search)';
            replacements.search = `%${search}%`;
        }

        q += ' ORDER BY c.certification_id DESC';
        const rows = await sequelize.query(q, { replacements, type: QueryTypes.SELECT });
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
});

// GET /api/certificates/:id
router.get('/:id', async (req, res, next) => {
    try {
        const rows = await sequelize.query('SELECT * FROM certificates WHERE certification_id = :id', {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });
        if (!rows.length) return res.status(404).json({ error: 'Certificate not found' });
        res.json(rows[0]);
    } catch (err) { next(err); }
});

// POST /api/certificates
router.post('/', async (req, res, next) => {
    try {
        const { student_id, institution_id, certificate_type, certificate_no, issued_by, issued_date, status } = req.body;
        const [result] = await sequelize.query(
            `INSERT INTO certificates (student_id, institution_id, certificate_type, certificate_no, issued_by, issued_date, status)
             VALUES (:student_id, :institution_id, :certificate_type, :certificate_no, :issued_by, :issued_date, :status) RETURNING *`,
            {
                replacements: { 
                    student_id, institution_id, certificate_no, issued_date, 
                    certificate_type: certificate_type || 'Bonafide', 
                    issued_by: issued_by || null, 
                    status: status || 'issued' 
                },
                type: QueryTypes.INSERT
            }
        );
        res.status(201).json(result[0]);
    } catch (err) { next(err); }
});

// PUT /api/certificates/:id
router.put('/:id', async (req, res, next) => {
    try {
        const { certificate_type, certificate_no, issued_by, issued_date, status } = req.body;
        const [result] = await sequelize.query(
            `UPDATE certificates 
             SET certificate_type = :certificate_type, 
                 certificate_no = :certificate_no, 
                 issued_by = :issued_by, 
                 issued_date = :issued_date, 
                 status = :status,
                 updated_at = CURRENT_TIMESTAMP
             WHERE certification_id = :id RETURNING *`,
            {
                replacements: { 
                    id: req.params.id,
                    certificate_type, 
                    certificate_no, 
                    issued_by, 
                    issued_date, 
                    status 
                },
                type: QueryTypes.UPDATE
            }
        );
        if (!result.length) return res.status(404).json({ success: false, error: 'Certificate not found' });
        res.json({ success: true, data: result[0] });
    } catch (err) { next(err); }
});

// DELETE /api/certificates/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await sequelize.query('DELETE FROM certificates WHERE certification_id = :id', {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });
        res.json({ success: true, message: 'Certificate deleted successfully' });
    } catch (err) { next(err); }
});

module.exports = router;
