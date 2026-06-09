const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// @desc    Get all merge logs
// @route   GET /api/merge-log
const getMergeLogs = async (req, res) => {
  try {
    const data = await sequelize.query(
      'SELECT * FROM institution_merge_log ORDER BY merge_date DESC',
      { type: QueryTypes.SELECT }
    );
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new merge log entry
// @route   POST /api/merge-log
const createMergeLog = async (req, res) => {
  try {
    const { action, status, details } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO institution_merge_log (action, status, details)
       VALUES (:action, :status, :details) RETURNING *`,
      {
        replacements: { action, status, details },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getMergeLogs, createMergeLog };
