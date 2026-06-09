const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const data = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", { type: QueryTypes.SELECT });
    console.log('Tables Raw:', data);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
