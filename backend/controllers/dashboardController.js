const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getDashboardStats = async (req, res) => {
  try {
    const { institutionId } = req.query;
    let whereClause = '';
    let replacements = {};

    if (institutionId && institutionId !== 'all') {
      whereClause = ' WHERE institution_id = :institutionId';
      replacements = { institutionId };
    }

    const [studentsCount] = await sequelize.query(`SELECT COUNT(*) as count FROM students${whereClause}`, { replacements, type: QueryTypes.SELECT });
    const [staffCount] = await sequelize.query(`SELECT COUNT(*) as count FROM staff${whereClause}`, { replacements, type: QueryTypes.SELECT });
    const [placementsCount] = await sequelize.query(`SELECT COUNT(*) as count FROM placement_records${whereClause}`, { replacements, type: QueryTypes.SELECT });
    const [institutionsCount] = await sequelize.query(`SELECT COUNT(*) as count FROM institution WHERE LOWER(status) = 'active'`, { type: QueryTypes.SELECT });

    const recentActivity = await sequelize.query(
      `SELECT * FROM institution_merge_log ORDER BY merge_date DESC LIMIT 5`,
      { type: QueryTypes.SELECT }
    );

    res.json({
      success: true,
      stats: [
        { label: 'Total Students', value: studentsCount.count, change: '+2%', isUp: true },
        { label: 'Staff Members', value: staffCount.count, change: '+1', isUp: true },
        { label: 'Placements', value: placementsCount.count, change: '+5%', isUp: true },
        { label: 'Institutions', value: institutionsCount.count, change: '0', isUp: true },
      ],
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats };
