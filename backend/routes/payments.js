const { Router } = require('express');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const router = Router();

// GET /api/payments?institution_id=1&status=&page=1&limit=10&from=&to=
router.get('/', async (req, res, next) => {
    let q = ''; 
    try {
        const { institution_id, status, page = 1, limit = 10, from, to, search } = req.query;
        const parsedId = parseInt(institution_id, 10);
        
        // 1. Build the dynamic WHERE clause
        let whereConditions = [];
        const replacements = {};

        if (!isNaN(parsedId) && parsedId !== 0) { 
            whereConditions.push('p.institution_id = :institution_id'); 
            replacements.institution_id = parsedId; 
        }
        if (status) { 
            whereConditions.push('p.status = :status'); 
            replacements.status = status; 
        }
        if (from) { 
            whereConditions.push('p.payment_date >= :from'); 
            replacements.from = from; 
        }
        if (to) { 
            whereConditions.push('p.payment_date <= :to'); 
            replacements.to = to; 
        }
        if (search) { 
            whereConditions.push('(CAST(p.student_id AS TEXT) ILIKE :search OR p.transaction_id ILIKE :search)'); 
            replacements.search = `%${search}%`; 
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // 2. Get the Total Count
        const countQ = `SELECT COUNT(*) as count FROM payments p ${whereClause}`;
        const countResult = await sequelize.query(countQ, { replacements, type: QueryTypes.SELECT });
        const total = parseInt(countResult[0].count, 10);

        // 3. Get the Paginated Data with Student and Staff Names
        q = `
            SELECT p.*, s.student_name, st.staff_name as received_by_name
            FROM payments p 
            LEFT JOIN students s ON p.student_id = s.student_id 
            LEFT JOIN staff st ON p.received_by = st.staff_id
            ${whereClause} 
            ORDER BY p.payment_date DESC 
            LIMIT :limit OFFSET :offset
        `;
        replacements.limit = parseInt(limit);
        replacements.offset = (parseInt(page) - 1) * parseInt(limit);

        const rows = await sequelize.query(q, { replacements, type: QueryTypes.SELECT });
        
        res.json({ 
            success: true, 
            data: rows, 
            total, 
            totalPages: Math.ceil(total / limit), 
            page: parseInt(page) 
        });
    } catch (err) { 
        console.error('PAYMENTS ERROR:', err.message);
        next(err); 
    }
});

// GET /api/payments/:id
router.get('/:id', async (req, res, next) => {
    try {
        const rows = await sequelize.query(`
            SELECT p.*, s.student_name, st.staff_name as received_by_name
            FROM payments p 
            LEFT JOIN students s ON p.student_id = s.student_id 
            LEFT JOIN staff st ON p.received_by = st.staff_id
            WHERE p.payment_id = :id
        `, {
            replacements: { id: req.params.id },
            type: QueryTypes.SELECT
        });
        if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
});

// POST /api/payments
router.post('/', async (req, res, next) => {
    try {
        const { student_id, institution_id, received_by, amount, payment_method, transaction_id, payment_date, status } = req.body;
        const [result] = await sequelize.query(
            `INSERT INTO payments (student_id, institution_id, received_by, amount, payment_method, transaction_id, payment_date, status)
             VALUES (:student_id, :institution_id, :received_by, :amount, :payment_method, :transaction_id, :payment_date, :status)
             RETURNING *`,
            {
                replacements: { 
                    student_id, institution_id, amount, payment_date,
                    received_by: received_by || null, 
                    payment_method: payment_method || 'Cash', 
                    transaction_id: transaction_id || null, 
                    status: status || 'pending' 
                },
                type: QueryTypes.INSERT
            }
        );
        res.status(201).json(result[0]);
    } catch (err) { next(err); }
});

// PUT /api/payments/:id
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const allowedFields = ['amount', 'payment_method', 'transaction_id', 'payment_date', 'status'];
        
        const filteredUpdates = {};
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) filteredUpdates[key] = updates[key];
        });

        const setClause = Object.keys(filteredUpdates).map(k => `${k} = :${k}`).join(', ');
        if (!setClause) return res.status(400).json({ error: 'No valid fields provided' });

        await sequelize.query(`UPDATE payments SET ${setClause} WHERE payment_id = :id`, {
            replacements: { ...filteredUpdates, id },
            type: QueryTypes.UPDATE
        });
        res.json({ success: true, message: 'Payment updated in DB' });
    } catch (err) { next(err); }
});

// DELETE /api/payments/:id
router.delete('/:id', async (req, res, next) => {
    try {
        await sequelize.query('DELETE FROM payments WHERE payment_id = :id', {
            replacements: { id: req.params.id },
            type: QueryTypes.DELETE
        });
        res.json({ success: true, message: 'Payment deleted from DB' });
    } catch (err) { next(err); }
});

module.exports = router;
