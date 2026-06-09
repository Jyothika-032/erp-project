require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/database');
const { QueryTypes } = require('sequelize');
const { startScheduler } = require('./services/schedulerService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB then start scheduler (only in non-serverless environments)
connectDB().then(() => {
  // node-cron doesn't work on Vercel serverless — skip scheduler there
  if (!process.env.VERCEL) {
    startScheduler();
  }
}).catch(() => {
  // DB error handled inside connectDB
});

/* ---------------- ROOT ---------------- */
app.get('/', (req, res) => {
  res.send('EduERP API is running with Supabase (Sequelize)...');
});

/* ---------------- HEALTH CHECK ---------------- */
app.get('/api/health', async (req, res) => {
  try {
    const [result] = await sequelize.query('SELECT NOW() as now', { type: QueryTypes.SELECT });
    res.status(200).json({
      status: 'success',
      message: 'EduERP Backend is running and connected to Supabase!',
      db_time: result.now
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});



/* ---------------- ROUTES ---------------- */

// System Management (Alfiya)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/institutions', require('./routes/institutionRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/role-permissions', require('./routes/rolePermissionsRoutes'));
app.use('/api/merge-log', require('./routes/mergeLogRoutes'));
app.use('/api/comms-logs', require('./routes/commsRoutes'));

// Finance & Documents (Amaljith)
app.use('/api/payments', require('./routes/payments'));
app.use('/api/fee-structure', require('./routes/feeStructure'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/tc', require('./routes/tc'));

// Academic & Attendance
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/parents', require('./routes/parentRoutes'));
app.use('/api/admissions', require('./routes/admissionRoutes'));

/* ---------------- ERROR HANDLER ---------------- */
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

/* ---------------- START SERVER ---------------- */
const PORT = process.env.PORT || 5000;
// Only listen on port if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 EduERP Server running on port ${PORT}`);
  });
}

module.exports = app;