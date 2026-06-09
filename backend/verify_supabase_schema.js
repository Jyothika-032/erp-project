const { sequelize } = require('./config/database');

const verify = async () => {
  try {
    console.log('🔍 Fetching Supabase Table Schema...');
    const [results] = await sequelize.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    const tables = {};
    results.forEach(row => {
      if (!tables[row.table_name]) tables[row.table_name] = [];
      tables[row.table_name].push(`${row.column_name} (${row.data_type})`);
    });

    console.log('✅ Current Supabase Tables:');
    console.log(JSON.stringify(tables, null, 2));

  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  } finally {
    process.exit();
  }
};

verify();
