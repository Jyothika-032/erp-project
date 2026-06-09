const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const roles = await sequelize.query("SELECT * FROM roles", { type: QueryTypes.SELECT });
    console.log('Roles:', roles);
    
    const studentUsers = await sequelize.query("SELECT email, user_password, user_name, role_id FROM users WHERE role_id IN (SELECT role_id FROM roles WHERE role_name ILIKE '%student%') LIMIT 3", { type: QueryTypes.SELECT });
    console.log('Student Users:', studentUsers);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
check();
