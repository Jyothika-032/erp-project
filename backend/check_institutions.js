const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const cols = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'institution'", { type: QueryTypes.SELECT });
    console.log('institution columns:', cols.map(c => c.column_name));
    const data = await sequelize.query("SELECT * FROM institution LIMIT 3", { type: QueryTypes.SELECT });
    console.log('institution data:', data);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
