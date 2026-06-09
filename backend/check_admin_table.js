const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const adminExists = await sequelize.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin')", { type: QueryTypes.SELECT });
    console.log('Admin table exists:', adminExists[0].exists);
    
    const tables = await sequelize.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'", { type: QueryTypes.SELECT });
    console.log('Public tables:', tables.map(t => t.tablename));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
