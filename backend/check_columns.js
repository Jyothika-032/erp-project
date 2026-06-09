const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const roles = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'roles'", { type: QueryTypes.SELECT });
    console.log('roles columns:', roles.map(c => c.column_name));
    
    const settings = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'", { type: QueryTypes.SELECT });
    console.log('settings columns:', settings.map(c => c.column_name));
    
    const reports = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'reports'", { type: QueryTypes.SELECT });
    console.log('reports columns:', reports.map(c => c.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
