const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const cols = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admins'", { type: QueryTypes.SELECT });
    console.log('admins columns:', cols.map(c => c.column_name));
    const data = await sequelize.query("SELECT * FROM admins LIMIT 1", { type: QueryTypes.SELECT });
    console.log('admins data:', data);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
