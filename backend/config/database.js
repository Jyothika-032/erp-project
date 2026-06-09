require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,       // postgres
  process.env.DB_USER,       // postgres
  process.env.DB_PASSWORD,   // your password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connected to Supabase');
  } catch (error) {
    console.error('❌ Sequelize connection error:', error);
  }
};

module.exports = { sequelize, connectDB };