const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');
const { sendEmail, buildEmailHtml } = require('../services/emailService');
const { sendSms } = require('../services/smsService');

const getCommsLogs = async (req, res) => {
  try {
    const { institution_id } = req.query;
    const parsedId = parseInt(institution_id, 10);
    let query = `
      SELECT cl.*, s.student_name AS recipient_name 
      FROM communication_log cl
      LEFT JOIN students s ON cl.student_id = s.student_id
    `;
    const replacements = {};
    if (!isNaN(parsedId)) {
      query += " WHERE cl.institution_id = :instId";
      replacements.instId = parsedId;
    }
    query += " ORDER BY cl.communication_id DESC";

    const data = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCommsLog = async (req, res) => {
  try {
    const { 
      student_id, 
      staff_id, 
      parent_id, 
      institution_id, 
      communication_message, 
      type, 
      subject, 
      sent_by, 
      delivery_status 
    } = req.body;

    const [result] = await sequelize.query(
      `INSERT INTO communication_log (student_id, staff_id, parent_id, institution_id, communication_message, type, subject, sent_by, sent_at, delivery_status)
       VALUES (:student_id, :staff_id, :parent_id, :institution_id, :communication_message, :type, :subject, :sent_by, NOW(), :delivery_status) RETURNING *`,
      {
        replacements: {
          student_id: student_id || null,
          staff_id: staff_id || null,
          parent_id: parent_id || null,
          institution_id: institution_id || 1,
          communication_message,
          type: type || 'sms',
          subject: subject || null,
          sent_by: sent_by || 'System',
          delivery_status: delivery_status || 'delivered'
        },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCommsLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const [data] = await sequelize.query(
      `SELECT cl.*, s.student_name AS recipient_name 
       FROM communication_log cl
       LEFT JOIN students s ON cl.student_id = s.student_id
       WHERE cl.communication_id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendAlert = async (req, res) => {
  try {
    const {
      student_id,
      parent_id,
      institution_id,
      type,           // 'email' or 'sms'
      subject,
      message,
      recipient_name,
      recipient_email,
      recipient_phone,
      sent_by,
    } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message body is required.' });
    }

    let result = { success: false, status: 'failed' };

    if (type === 'email') {
      if (!recipient_email) {
        return res.status(400).json({ success: false, message: 'Recipient email is required for email alerts.' });
      }
      const html = buildEmailHtml({ recipientName: recipient_name || 'Student/Parent', message });
      result = await sendEmail({ to: recipient_email, subject: subject || 'EduERP Notification', html });
    } else if (type === 'sms') {
      if (!recipient_phone) {
        return res.status(400).json({ success: false, message: 'Recipient phone is required for SMS alerts.' });
      }
      result = await sendSms({ to: recipient_phone, message });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type. Must be "email" or "sms".' });
    }

    // Log to communication_log regardless of success/failure
    const [logResult] = await sequelize.query(
      `INSERT INTO communication_log (student_id, parent_id, institution_id, communication_message, type, subject, sent_by, sent_at, delivery_status)
       VALUES (:student_id, :parent_id, :institution_id, :message, :type, :subject, :sent_by, NOW(), :delivery_status) RETURNING *`,
      {
        replacements: {
          student_id: student_id || null,
          parent_id: parent_id || null,
          institution_id: institution_id || 1,
          message,
          type,
          subject: subject || null,
          sent_by: sent_by || 'Admin (Manual)',
          delivery_status: result.status,
        },
        type: QueryTypes.INSERT,
      }
    );

    res.status(201).json({
      success: result.success,
      status: result.status,
      previewUrl: result.previewUrl || null,
      log: logResult[0],
      message: result.success
        ? `${type === 'email' ? 'Email' : 'SMS'} sent successfully!`
        : `Failed to send ${type}. Logged as failed.`,
    });
  } catch (error) {
    console.error('sendAlert error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCommsLogs, createCommsLog, getCommsLogById, sendAlert };

