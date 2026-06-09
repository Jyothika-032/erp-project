const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function check() {
  try {
    const [activeInst] = await sequelize.query(
      "SELECT COUNT(*) as count FROM institution WHERE LOWER(status) = 'active'",
      { type: QueryTypes.SELECT }
    );
    console.log('Active Institutions:', activeInst.count);

    const [courses] = await sequelize.query(
      "SELECT COUNT(*) as count FROM courses",
      { type: QueryTypes.SELECT }
    );
    console.log('Courses:', courses.count);
  } catch (e) {
    console.error('courses error:', e.message);
  }

  try {
    const [admissions] = await sequelize.query(
      "SELECT COUNT(*) as count FROM admissions",
      { type: QueryTypes.SELECT }
    );
    console.log('Admissions:', admissions.count);
  } catch (e) {
    console.error('admissions error:', e.message);
  }

  try {
    const [batches] = await sequelize.query(
      "SELECT COUNT(*) as count FROM batches",
      { type: QueryTypes.SELECT }
    );
    console.log('Batches:', batches.count);
  } catch (e) {
    console.error('batches error:', e.message);
  }

  process.exit();
}

check();
