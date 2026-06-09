const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

/* ── GET all placements (filtered by institution) ── */
const getPlacements = async (req, res) => {
  try {
    const { institution_id } = req.query;
    const parsedId = parseInt(institution_id, 10);
    let query = `
      SELECT pr.*, s.student_name 
      FROM placement_records pr 
      LEFT JOIN students s ON pr.student_id = s.student_id
    `;
    const replacements = {};
    if (!isNaN(parsedId)) {
      query += ' WHERE pr.institution_id = :institution_id';
      replacements.institution_id = parsedId;
    }
    query += ' ORDER BY pr.placement_date DESC NULLS LAST';
    const data = await sequelize.query(query, { replacements, type: QueryTypes.SELECT });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── GET single placement by id ── */
const getPlacementById = async (req, res) => {
  try {
    const { id } = req.params;
    const [record] = await sequelize.query(
      `SELECT pr.*, s.student_name
       FROM placement_records pr
       LEFT JOIN students s ON pr.student_id = s.student_id
       WHERE pr.placement_id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ── POST create placement ── */
const createPlacement = async (req, res) => {
  try {
    const {
      student_id, institution_id, company_name, job_role,
      salary_package, placement_date, placement_location, status
    } = req.body;

    const [result] = await sequelize.query(
      `INSERT INTO placement_records
         (student_id, institution_id, company_name, job_role, salary_package, placement_date, placement_location, status)
       VALUES
         (:student_id, :institution_id, :company_name, :job_role, :salary_package, :placement_date, :placement_location, :status)
       RETURNING *`,
      {
        replacements: {
          student_id, institution_id, company_name, job_role,
          salary_package: salary_package || null,
          placement_date: placement_date || null,
          placement_location: placement_location || null,
          status: status || 'Placed',
        },
        type: QueryTypes.INSERT,
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ── PUT update placement ── */
const updatePlacement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name, job_role, salary_package,
      placement_date, placement_location, status
    } = req.body;

    const [result] = await sequelize.query(
      `UPDATE placement_records
       SET company_name        = :company_name,
           job_role            = :job_role,
           salary_package      = :salary_package,
           placement_date      = :placement_date,
           placement_location  = :placement_location,
           status              = :status
       WHERE placement_id = :id
       RETURNING *`,
      {
        replacements: {
          id, company_name, job_role,
          salary_package: salary_package || null,
          placement_date: placement_date || null,
          placement_location: placement_location || null,
          status: status || 'Placed',
        },
        type: QueryTypes.UPDATE,
      }
    );
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/* ── DELETE placement ── */
const deletePlacement = async (req, res) => {
  try {
    const { id } = req.params;
    await sequelize.query(
      'DELETE FROM placement_records WHERE placement_id = :id',
      { replacements: { id }, type: QueryTypes.DELETE }
    );
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPlacements, getPlacementById, createPlacement, updatePlacement, deletePlacement };
