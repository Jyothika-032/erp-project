const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const tables = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", { type: QueryTypes.SELECT });
    console.log('Tables in public schema:', tables.map(t => t.table_name));
  } catch (err) {
    console.error('Error listing tables:', err.message);
  } finally {
    process.exit();
  }
}
check();
