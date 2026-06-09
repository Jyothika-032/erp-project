const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getInstitutions = async (req, res) => {
  try {
    const data = await sequelize.query(
      'SELECT institution_id as id, institution_name as name, address, email, phone, status, created_at FROM institution ORDER BY created_at DESC',
      { type: QueryTypes.SELECT }
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInstitution = async (req, res) => {
  try {
    const { id, name, address, email, phone, status } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO institution (institution_name, address, email, phone, status)
       VALUES (:name, :address, :email, :phone, :status) RETURNING *`,
      {
        replacements: { id, name, address, email, phone, status: status || 'Active' },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getInstitutions, createInstitution };
