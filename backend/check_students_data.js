const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const count = await sequelize.query('SELECT COUNT(*) as count FROM students', { type: QueryTypes.SELECT });
    console.log('Total students in DB:', count[0].count);
    
    const sample = await sequelize.query('SELECT * FROM students LIMIT 5', { type: QueryTypes.SELECT });
    console.log('Sample students:', JSON.stringify(sample, null, 2));
  } catch (err) {
    console.error('Error fetching students:', err.message);
  } finally {
    process.exit();
  }
}
check();
