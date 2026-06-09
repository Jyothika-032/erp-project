const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const data = await sequelize.query("SELECT * FROM placement_records LIMIT 3", { type: QueryTypes.SELECT });
    console.log('placement_records data:', data);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
