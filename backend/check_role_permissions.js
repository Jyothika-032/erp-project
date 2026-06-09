const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const perms = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'role_permissions'", { type: QueryTypes.SELECT });
    console.log('role_permissions columns:', perms.map(c => c.column_name));
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
