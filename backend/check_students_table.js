const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const students = await sequelize.query("SELECT email, first_name, last_name FROM students LIMIT 10", { type: QueryTypes.SELECT });
    console.log('Students Table Data:', students);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
