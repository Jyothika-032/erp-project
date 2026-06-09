const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function go() {
  const [s] = await sequelize.query('SELECT COUNT(*) as c FROM students', { type: QueryTypes.SELECT });
  const [st] = await sequelize.query('SELECT COUNT(*) as c FROM staff', { type: QueryTypes.SELECT });
  const [p] = await sequelize.query('SELECT COUNT(*) as c FROM placement_records', { type: QueryTypes.SELECT });
  const [i] = await sequelize.query("SELECT COUNT(*) as c FROM institution WHERE LOWER(status) = 'active'", { type: QueryTypes.SELECT });
  const [allI] = await sequelize.query("SELECT COUNT(*) as c FROM institution", { type: QueryTypes.SELECT });
  console.log('Students:', s.c);
  console.log('Staff:', st.c);
  console.log('Placements:', p.c);
  console.log('Active Institutions:', i.c);
  console.log('All Institutions:', allI.c);
  process.exit();
}

go().catch(e => { console.error(e.message); process.exit(1); });
