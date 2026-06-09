const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const data = await sequelize.query("SELECT * FROM payment_records LIMIT 1", { type: QueryTypes.SELECT });
    console.log('payment_records exists');
  } catch (err) {
    console.log('payment_records DOES NOT exist');
  }
  try {
    const data = await sequelize.query("SELECT * FROM payments LIMIT 1", { type: QueryTypes.SELECT });
    console.log('payments exists');
  } catch (err) {
    console.log('payments DOES NOT exist');
  }
  process.exit();
}
check();
