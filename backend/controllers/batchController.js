const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getBatches = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.*, 
        c.course_name, 
        b.max_students as capacity, 
        (SELECT count(*) FROM students s WHERE s.batch_id = b.batch_id AND s.status = 'active')::int as filled, 
        EXTRACT(YEAR FROM b.start_date) || '-' || EXTRACT(YEAR FROM b.end_date) as academic_year 
      FROM batch b 
      LEFT JOIN course c ON b.course_id = c.course_id
    `;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBatch = async (req, res) => {
  try {
    const { batch_name, max_students, status } = req.body;
    const { id } = req.params;
    
    // We update batch_name, max_students, and status as primary editable fields
    const [result] = await sequelize.query(
      `UPDATE batch 
       SET batch_name = :batch_name, max_students = :max_students, status = :status, updated_at = CURRENT_TIMESTAMP
       WHERE batch_id = :id RETURNING *`,
      {
        replacements: { batch_name, max_students, status, id },
        type: QueryTypes.UPDATE
      }
    );
    
    if (!result.length) return res.status(404).json({ success: false, message: 'Batch not found' });
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    await sequelize.query('DELETE FROM batch WHERE batch_id = :id', {
      replacements: { id },
      type: QueryTypes.DELETE
    });
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBatches, updateBatch, deleteBatch };
