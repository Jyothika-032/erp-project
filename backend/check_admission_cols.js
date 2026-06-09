const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const cols = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admission'", { type: QueryTypes.SELECT });
    console.log('admission columns:', cols);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
