const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getCourses = async (req, res) => {
  try {
    const { institution_id } = req.query;
    const parsedId = parseInt(institution_id, 10);
    let query = 'SELECT * FROM course';
    const replacements = {};
    if (!isNaN(parsedId)) {
      query += ' WHERE institution_id = :institution_id';
      replacements.institution_id = parsedId;
    }
    const data = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { institution_id, course_name, course_code, duration_in_months, total_fees, description, syllabus, status } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO course (institution_id, course_name, course_code, duration_in_months, total_fees, description, syllabus, status, created_at, updated_at)
       VALUES (:institution_id, :course_name, :course_code, :duration_in_months, :total_fees, :description, :syllabus, :status, NOW(), NOW()) RETURNING *`,
      {
        replacements: {
          institution_id: institution_id || 1,
          course_name,
          course_code,
          duration_in_months: parseInt(duration_in_months, 10) || 0,
          total_fees: total_fees || 0.00,
          description: description || null,
          syllabus: syllabus || null,
          status: status || 'active'
        },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getCourses, createCourse };
