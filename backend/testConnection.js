const { Client } = require('pg');

const client = new Client({
  host: 'db.ahvhbkioncgrfklwpqos.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'Ke1sbKTNOhYPDrdr',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect()
  .then(() => {
    console.log('✅ CONNECTED TO SUPABASE');
    return client.end();
  })
  .catch(err => {
    console.error('❌ CONNECTION FAILED:', err.message);
  });