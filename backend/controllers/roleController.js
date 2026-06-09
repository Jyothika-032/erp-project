const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getRoles = async (req, res) => {
  try {
    const data = await sequelize.query(
      'SELECT * FROM roles ORDER BY role_id',
      { type: QueryTypes.SELECT }
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, role_name, description } = req.body;
    const resolvedRoleName = role_name || name;
    const [result] = await sequelize.query(
      `INSERT INTO roles (role_name, description) VALUES (:role_name, :description) RETURNING *`,
      {
        replacements: { role_name: resolvedRoleName, description },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getRoles, createRole };
