const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const students = await sequelize.query(`
      SELECT u.email, u.user_password, u.user_name, i.institution_name 
      FROM users u
      JOIN institution i ON u.institution_id = i.institution_id
      WHERE u.role_id = 5
    `, { type: QueryTypes.SELECT });
    console.log('All Student Logins:', students);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
