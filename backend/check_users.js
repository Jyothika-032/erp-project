const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const cols = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'", { type: QueryTypes.SELECT });
    console.log(cols.map(c => c.column_name));
    const users = await sequelize.query("SELECT * FROM users LIMIT 3", { type: QueryTypes.SELECT });
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
