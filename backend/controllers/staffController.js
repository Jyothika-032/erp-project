const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getStaff = async (req, res) => {
  try {
    const { institution_id } = req.query;
    const parsedId = parseInt(institution_id, 10);
    let query = `
      SELECT s.*, u.email, u.user_name, u.gender, u.date_of_birth, i.institution_name 
      FROM staff s 
      LEFT JOIN users u ON s.user_id = u.user_id 
      LEFT JOIN institution i ON s.institution_id = i.institution_id
    `;
    const replacements = {};
    if (!isNaN(parsedId)) {
      query += " WHERE s.institution_id = :instId";
      replacements.instId = parsedId;
    }
    query += " ORDER BY s.staff_id DESC";

    const data = await sequelize.query(query, { 
      replacements,
      type: QueryTypes.SELECT 
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    const [data] = await sequelize.query(
      `SELECT s.*, u.email, u.user_name, u.gender, u.date_of_birth, i.institution_name 
       FROM staff s 
       LEFT JOIN users u ON s.user_id = u.user_id 
       LEFT JOIN institution i ON s.institution_id = i.institution_id
       WHERE s.staff_id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Staff member not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStaff = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      staff_name, 
      email, 
      gender, 
      date_of_birth, 
      designation, 
      contract_end_date, 
      experience_years, 
      qualification, 
      status, 
      institution_id 
    } = req.body;

    // 1. Create a user record first
    const username = email ? email.split('@')[0] : staff_name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 100);
    const [userResult] = await sequelize.query(
      `INSERT INTO users (user_name, user_password, email, role_id, institution_id, status, gender, date_of_birth)
       VALUES (:user_name, 'pass123', :email, 3, :institution_id, :status, :gender, :date_of_birth) RETURNING *`,
      {
        replacements: {
          user_name: username,
          email: email || null,
          institution_id: institution_id || 1,
          status: status || 'active',
          gender: gender || null,
          date_of_birth: date_of_birth || null
        },
        type: QueryTypes.INSERT,
        transaction
      }
    );

    const createdUser = userResult[0];
    const user_id = createdUser.user_id;

    // 2. Insert into the staff table referencing the user_id
    const [staffResult] = await sequelize.query(
      `INSERT INTO staff (user_id, institution_id, staff_name, designation, contract_end_date, experience_years, qualification, status)
       VALUES (:user_id, :institution_id, :staff_name, :designation, :contract_end_date, :experience_years, :qualification, :status) RETURNING *`,
      {
        replacements: {
          user_id,
          institution_id: institution_id || 1,
          staff_name,
          designation: designation || null,
          contract_end_date: contract_end_date || null,
          experience_years: experience_years ? parseInt(experience_years) : 0,
          qualification: qualification || null,
          status: status || 'active'
        },
        type: QueryTypes.INSERT,
        transaction
      }
    );

    await transaction.commit();
    res.status(201).json({ success: true, data: staffResult[0] });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateStaff = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  
  try {
    const [staffRecord] = await sequelize.query(
      'SELECT * FROM staff WHERE staff_id = :id',
      { replacements: { id }, type: QueryTypes.SELECT, transaction }
    );
    
    if (!staffRecord) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    
    const { user_id } = staffRecord;
    const updates = { ...req.body };
    
    // Update staff table
    const allowedStaffFields = [
      'institution_id', 'staff_name', 'designation', 'contract_end_date', 'experience_years', 'qualification', 'status'
    ];
    
    const staffUpdates = {};
    allowedStaffFields.forEach(key => {
      if (updates[key] !== undefined) {
        staffUpdates[key] = updates[key];
      }
    });
    
    if (Object.keys(staffUpdates).length > 0) {
      const staffFields = Object.keys(staffUpdates).map(key => `${key} = :${key}`).join(', ');
      await sequelize.query(
        `UPDATE staff SET ${staffFields} WHERE staff_id = :id`,
        { replacements: { ...staffUpdates, id }, type: QueryTypes.UPDATE, transaction }
      );
    }
    
    // Update associated users table if relevant fields are changed
    const allowedUserFields = {
      email: 'email',
      gender: 'gender',
      date_of_birth: 'date_of_birth',
      staff_name: 'user_name',
      status: 'status'
    };
    
    const userUpdates = {};
    Object.keys(allowedUserFields).forEach(key => {
      if (updates[key] !== undefined) {
        userUpdates[allowedUserFields[key]] = updates[key];
      }
    });
    
    if (Object.keys(userUpdates).length > 0 && user_id) {
      const userFields = Object.keys(userUpdates).map(key => `${key} = :${key}`).join(', ');
      await sequelize.query(
        `UPDATE users SET ${userFields} WHERE user_id = :user_id`,
        { replacements: { ...userUpdates, user_id }, type: QueryTypes.UPDATE, transaction }
      );
    }
    
    await transaction.commit();
    res.json({ success: true, message: 'Staff and user record updated successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  try {
    const [staffRecord] = await sequelize.query(
      'SELECT * FROM staff WHERE staff_id = :id',
      { replacements: { id }, type: QueryTypes.SELECT, transaction }
    );
    
    if (!staffRecord) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    
    const { user_id } = staffRecord;
    
    await sequelize.query(
      'DELETE FROM staff WHERE staff_id = :id',
      { replacements: { id }, type: QueryTypes.DELETE, transaction }
    );
    
    if (user_id) {
      await sequelize.query(
        'DELETE FROM users WHERE user_id = :user_id',
        { replacements: { user_id }, type: QueryTypes.DELETE, transaction }
      );
    }
    
    await transaction.commit();
    res.json({ success: true, message: 'Staff member and associated user deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deleteStaff };
