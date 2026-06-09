const cron = require('node-cron');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const { sendEmail, buildEmailHtml } = require('./emailService');
const { sendSms } = require('./smsService');

/**
 * Save a communication log entry to the DB.
 */
async function logCommunication({ student_id, parent_id, institution_id, type, subject, message, sent_by, delivery_status }) {
  try {
    await sequelize.query(
      `INSERT INTO communication_log (student_id, parent_id, institution_id, type, subject, communication_message, sent_by, sent_at, delivery_status)
       VALUES (:student_id, :parent_id, :institution_id, :type, :subject, :message, :sent_by, NOW(), :delivery_status)`,
      {
        replacements: {
          student_id: student_id || null,
          parent_id: parent_id || null,
          institution_id: institution_id || 1,
          type,
          subject: subject || null,
          message,
          sent_by,
          delivery_status,
        },
        type: QueryTypes.INSERT,
      }
    );
  } catch (err) {
    console.error('❌ Failed to log communication:', err.message);
  }
}

/**
 * AUTO-ALERT 1: Fee Reminder
 * Runs every day at 8:00 AM.
 * Finds students with pending payments and sends email/SMS to their parents.
 */
async function runFeeReminderJob() {
  console.log('🔔 [Scheduler] Running Fee Reminder job...');
  try {
    const pendingPayments = await sequelize.query(
      `SELECT p.payment_id, p.student_id, p.institution_id, p.amount, p.payment_date, p.status,
              s.student_name, s.email as student_email, s.phone_number as student_phone,
              par.parent_id, par.father_name, par.email as parent_email, par.phone_number as parent_phone
       FROM payments p
       LEFT JOIN students s ON p.student_id = s.student_id
       LEFT JOIN parents par ON par.student_id = p.student_id
       WHERE p.status = 'pending'
         AND p.payment_date <= NOW() + INTERVAL '3 days'
         AND p.payment_date >= NOW() - INTERVAL '1 day'`,
      { type: QueryTypes.SELECT }
    );

    console.log(`📋 [Fee Reminder] Found ${pendingPayments.length} pending payment(s).`);

    for (const payment of pendingPayments) {
      const recipientName = payment.father_name || 'Parent/Guardian';
      const recipientEmail = payment.parent_email || payment.student_email;
      const recipientPhone = payment.parent_phone || payment.student_phone;
      const subject = `Fee Payment Reminder — ${payment.student_name}`;
      const message = `Dear ${recipientName},\n\nThis is a reminder that the fee of ₹${payment.amount} for ${payment.student_name} is due on ${new Date(payment.payment_date).toLocaleDateString('en-IN')}.\n\nPlease make the payment at the earliest to avoid any inconvenience.\n\nThank you.`;

      let emailStatus = 'failed';
      let smsStatus = 'failed';

      // Send Email
      if (recipientEmail) {
        const html = buildEmailHtml({ recipientName, message });
        const result = await sendEmail({ to: recipientEmail, subject, html });
        emailStatus = result.status;
        await logCommunication({
          student_id: payment.student_id,
          parent_id: payment.parent_id,
          institution_id: payment.institution_id,
          type: 'email',
          subject,
          message,
          sent_by: 'System (Auto - Fee Reminder)',
          delivery_status: emailStatus,
        });
      }

      // Send SMS
      if (recipientPhone) {
        const smsMessage = `Reminder: Fee of ₹${payment.amount} for ${payment.student_name} is due on ${new Date(payment.payment_date).toLocaleDateString('en-IN')}. Please pay at the earliest.`;
        const result = await sendSms({ to: recipientPhone, message: smsMessage });
        smsStatus = result.status;
        await logCommunication({
          student_id: payment.student_id,
          parent_id: payment.parent_id,
          institution_id: payment.institution_id,
          type: 'sms',
          subject: 'Fee Reminder',
          message: smsMessage,
          sent_by: 'System (Auto - Fee Reminder)',
          delivery_status: smsStatus,
        });
      }

      console.log(`  ✅ Fee reminder sent for ${payment.student_name} — Email: ${emailStatus}, SMS: ${smsStatus}`);
    }
  } catch (err) {
    console.error('❌ [Fee Reminder Job] Error:', err.message);
  }
}

/**
 * AUTO-ALERT 2: Attendance Alert
 * Runs every day at 9:00 AM.
 * Finds students marked Absent today and notifies parents.
 */
async function runAttendanceAlertJob() {
  console.log('🔔 [Scheduler] Running Attendance Alert job...');
  try {
    const today = new Date().toISOString().split('T')[0];

    const absentStudents = await sequelize.query(
      `SELECT a.student_id, a.institution_id, a.attendance_date,
              s.student_name, s.email as student_email, s.phone_number as student_phone,
              par.parent_id, par.father_name, par.email as parent_email, par.phone_number as parent_phone
       FROM student_attendance a
       LEFT JOIN students s ON a.student_id = s.student_id
       LEFT JOIN parents par ON par.student_id = a.student_id
       WHERE a.status = 'Absent'
         AND DATE(a.attendance_date) = :today`,
      { replacements: { today }, type: QueryTypes.SELECT }
    );

    console.log(`📋 [Attendance Alert] Found ${absentStudents.length} absent student(s) today.`);

    for (const record of absentStudents) {
      const recipientName = record.father_name || 'Parent/Guardian';
      const recipientEmail = record.parent_email || record.student_email;
      const recipientPhone = record.parent_phone || record.student_phone;
      const subject = `Attendance Alert — ${record.student_name}`;
      const message = `Dear ${recipientName},\n\nThis is to inform you that ${record.student_name} was marked ABSENT today (${new Date(record.attendance_date).toLocaleDateString('en-IN')}).\n\nIf this is an error or if you need to inform the institution about a planned leave, please contact us.\n\nThank you.`;

      let emailStatus = 'failed';
      let smsStatus = 'failed';

      // Send Email
      if (recipientEmail) {
        const html = buildEmailHtml({ recipientName, message });
        const result = await sendEmail({ to: recipientEmail, subject, html });
        emailStatus = result.status;
        await logCommunication({
          student_id: record.student_id,
          parent_id: record.parent_id,
          institution_id: record.institution_id,
          type: 'email',
          subject,
          message,
          sent_by: 'System (Auto - Attendance Alert)',
          delivery_status: emailStatus,
        });
      }

      // Send SMS
      if (recipientPhone) {
        const smsMessage = `Alert: ${record.student_name} was marked ABSENT today (${new Date(record.attendance_date).toLocaleDateString('en-IN')}). Contact the institution if needed.`;
        const result = await sendSms({ to: recipientPhone, message: smsMessage });
        smsStatus = result.status;
        await logCommunication({
          student_id: record.student_id,
          parent_id: record.parent_id,
          institution_id: record.institution_id,
          type: 'sms',
          subject: 'Attendance Alert',
          message: smsMessage,
          sent_by: 'System (Auto - Attendance Alert)',
          delivery_status: smsStatus,
        });
      }

      console.log(`  ✅ Attendance alert sent for ${record.student_name} — Email: ${emailStatus}, SMS: ${smsStatus}`);
    }
  } catch (err) {
    console.error('❌ [Attendance Alert Job] Error:', err.message);
  }
}

/**
 * Register all cron jobs.
 * Call this once from server.js after DB connects.
 */
function startScheduler() {
  // Fee Reminder — every day at 8:00 AM
  cron.schedule('0 8 * * *', runFeeReminderJob, {
    timezone: 'Asia/Kolkata',
  });

  // Attendance Alert — every day at 9:00 AM
  cron.schedule('0 9 * * *', runAttendanceAlertJob, {
    timezone: 'Asia/Kolkata',
  });

  console.log('⏰ Scheduler started:');
  console.log('   📅 Fee Reminder    → Daily at 8:00 AM IST');
  console.log('   📋 Attendance Alert → Daily at 9:00 AM IST');
}

module.exports = { startScheduler, runFeeReminderJob, runAttendanceAlertJob };
