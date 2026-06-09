const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function checkCounts() {
  try {
    const [students] = await sequelize.query("SELECT COUNT(*) as count FROM students", { type: QueryTypes.SELECT });
    const [staff] = await sequelize.query("SELECT COUNT(*) as count FROM staff", { type: QueryTypes.SELECT });
    const [placements] = await sequelize.query("SELECT COUNT(*) as count FROM placement_records", { type: QueryTypes.SELECT });
    const [institutions] = await sequelize.query("SELECT COUNT(*) as count FROM institution", { type: QueryTypes.SELECT });
    const [activeInstitutions] = await sequelize.query("SELECT COUNT(*) as count FROM institution WHERE status = 'Active'", { type: QueryTypes.SELECT });

    console.log('Real DB Counts:');
    console.log('Students:', students.count);
    console.log('Staff:', staff.count);
    console.log('Placements:', placements.count);
    console.log('Total Institutions:', institutions.count);
    console.log('Active Institutions:', activeInstitutions.count);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
checkCounts();
