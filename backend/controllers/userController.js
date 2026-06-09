const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getUsers = async (req, res) => {
  try {
    const { institution_id } = req.query;
    const parsedId = parseInt(institution_id, 10);
    let query = `
      SELECT u.user_id, u.user_name, u.email, u.status, u.institution_id, u.role_id, u.created_at, u.date_of_birth, u.gender,
             r.role_name, i.institution_name,
             a.designation, a.department, a.admin_id
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.role_id 
      LEFT JOIN institution i ON u.institution_id = i.institution_id
      LEFT JOIN admins a ON u.user_id = a.user_id
    `;
    const replacements = {};
    if (!isNaN(parsedId)) {
      query += " WHERE u.institution_id = :institution_id";
      replacements.institution_id = parsedId;
    }
    query += " ORDER BY u.user_id DESC";
    
    const data = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, user_name, email, password, user_password, role_id, institution_id, status, gender, date_of_birth, designation, department } = req.body;
    
    const resolvedName = user_name || name;
    const resolvedPassword = user_password || password || 'pass123';
    const resolvedRoleId = parseInt(role_id, 10) || 3;
    const resolvedInstId = parseInt(institution_id, 10) || 1;

    const [result] = await sequelize.query(
      `INSERT INTO users (user_name, user_password, email, date_of_birth, gender, role_id, institution_id, status)
       VALUES (:user_name, :user_password, :email, :date_of_birth, :gender, :role_id, :institution_id, :status) RETURNING *`,
      {
        replacements: {
          user_name: resolvedName,
          user_password: resolvedPassword,
          email,
          date_of_birth: date_of_birth || null,
          gender: gender || null,
          role_id: resolvedRoleId,
          institution_id: resolvedInstId,
          status: status || 'active'
        },
        type: QueryTypes.INSERT,
        transaction
      }
    );

    const newUser = result[0];

    // If the role is Admin (1) or Manager (2), also insert into admins table
    if (resolvedRoleId === 1 || resolvedRoleId === 2) {
      await sequelize.query(
        `INSERT INTO admins (user_id, institution_id, designation, department)
         VALUES (:user_id, :institution_id, :designation, :department)`,
        {
          replacements: {
            user_id: newUser.user_id,
            institution_id: resolvedInstId,
            designation: designation || null,
            department: department || null
          },
          type: QueryTypes.INSERT,
          transaction
        }
      );
    }
    
    await transaction.commit();
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };

  const allowedFields = [
    'user_name', 'email', 'user_password', 'role_id', 'institution_id', 'status', 'gender', 'date_of_birth'
  ];

  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    let targetKey = key;
    if (key === 'name') targetKey = 'user_name';
    if (key === 'password') targetKey = 'user_password';
    
    if (allowedFields.includes(targetKey)) {
      filteredUpdates[targetKey] = updates[key];
    }
  });

  try {
    const fields = Object.keys(filteredUpdates).map(key => `${key} = :${key}`).join(', ');
    if (!fields) return res.status(400).json({ success: false, message: 'No valid fields provided for update' });

    await sequelize.query(
      `UPDATE users SET ${fields} WHERE user_id = :id`,
      { replacements: { ...filteredUpdates, id }, type: QueryTypes.UPDATE }
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const transaction = await sequelize.transaction();
  try {
    // Remove admin profile first if exists
    await sequelize.query(
      'DELETE FROM admins WHERE user_id = :id',
      { replacements: { id }, type: QueryTypes.DELETE, transaction }
    );
    await sequelize.query(
      'DELETE FROM users WHERE user_id = :id',
      { replacements: { id }, type: QueryTypes.DELETE, transaction }
    );
    await transaction.commit();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
