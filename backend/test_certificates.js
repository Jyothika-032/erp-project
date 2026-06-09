const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    // Test 1: basic certificates query with join
    const rows = await sequelize.query(
      `SELECT c.*, s.student_name 
       FROM certificates c
       LEFT JOIN students s ON c.student_id = s.student_id
       WHERE c.institution_id = 1 
       ORDER BY c.certification_id DESC 
       LIMIT 3`,
      { type: QueryTypes.SELECT }
    );
    console.log('SUCCESS - certificates rows:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);

    // Test 2: try without join to isolate issue
    try {
      const rows2 = await sequelize.query(
        'SELECT * FROM certificates LIMIT 3',
        { type: QueryTypes.SELECT }
      );
      console.log('Plain query works:', rows2);
    } catch (err2) {
      console.error('Plain query also failed:', err2.message);
    }

    // Test 3: check students table column name
    try {
      const cols = await sequelize.query(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'students' ORDER BY ordinal_position",
        { type: QueryTypes.SELECT }
      );
      console.log('students columns:', cols.map(c => c.column_name));
    } catch (err3) {
      console.error('Column check failed:', err3.message);
    }
  } finally {
    process.exit();
  }
}
check();
