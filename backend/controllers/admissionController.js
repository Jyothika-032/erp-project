const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getAdmissions = async (req, res) => {
  try {
    const { institution_id } = req.query;
    const parsedId = parseInt(institution_id, 10);
    const data = await sequelize.query(
      `SELECT a.*, s.student_name, c.course_name, b.batch_name, u.user_name as handled_by_name
       FROM admission a 
       LEFT JOIN students s ON a.student_id = s.student_id
       LEFT JOIN course c ON a.course_id = c.course_id
       LEFT JOIN batch b ON a.batch_id = b.batch_id
       LEFT JOIN users u ON a.handled_by = u.user_id
       WHERE a.institution_id = :instId
       ORDER BY a.admission_id DESC`,
      { 
        replacements: { instId: isNaN(parsedId) ? 1 : parsedId },
        type: QueryTypes.SELECT 
      }
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAdmission = async (req, res) => {
  try {
    const { student_id, institution_id, admission_date, status, remarks } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO admission (student_id, institution_id, admission_date, status, remarks)
       VALUES (:student_id, :institution_id, :admission_date, :status, :remarks) RETURNING *`,
      {
        replacements: { 
          student_id, institution_id, 
          admission_date: admission_date || new Date().toISOString().split('T')[0], 
          status: status || 'pending', 
          remarks: remarks || '' 
        },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAdmissions, createAdmission };
