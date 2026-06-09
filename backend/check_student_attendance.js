const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const cols = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'attendance'", { type: QueryTypes.SELECT });
    console.log('attendance columns:', cols.map(c => c.column_name));
    const data = await sequelize.query("SELECT * FROM attendance LIMIT 3", { type: QueryTypes.SELECT });
    console.log('attendance data:', data);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
