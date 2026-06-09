const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const res = await sequelize.query("SELECT COUNT(*) as count FROM payments", { type: QueryTypes.SELECT });
    console.log('Count result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit();
  }
}
check();
