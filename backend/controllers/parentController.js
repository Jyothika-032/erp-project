const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

const getParents = async (req, res) => {
  try {
    const { institution_id, student_id } = req.query;
    let query = `
      SELECT p.*, s.student_name 
      FROM parents p 
      LEFT JOIN students s ON p.student_id = s.student_id
    `;
    const whereClauses = [];
    const replacements = {};
    
    if (institution_id) {
      const parsedId = parseInt(institution_id, 10);
      if (!isNaN(parsedId)) {
        whereClauses.push('p.institution_id = :institution_id');
        replacements.institution_id = parsedId;
      }
    }
    
    if (student_id) {
      const parsedStudentId = parseInt(student_id, 10);
      if (!isNaN(parsedStudentId)) {
        whereClauses.push('p.student_id = :student_id');
        replacements.student_id = parsedStudentId;
      }
    }
    
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    const data = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createParent = async (req, res) => {
  try {
    const { student_id, institution_id, father_name, mother_name, guardian_name, relation, phone_number, alternate_phone, email, address, occupation, annual_income } = req.body;
    const [result] = await sequelize.query(
      `INSERT INTO parents (student_id, institution_id, father_name, mother_name, guardian_name, relation, phone_number, alternate_phone, email, address, occupation, annual_income, created_at)
       VALUES (:student_id, :institution_id, :father_name, :mother_name, :guardian_name, :relation, :phone_number, :alternate_phone, :email, :address, :occupation, :annual_income, NOW()) RETURNING *`,
      {
        replacements: {
          student_id: student_id || null,
          institution_id: institution_id || 1,
          father_name: father_name || null,
          mother_name: mother_name || null,
          guardian_name: guardian_name || null,
          relation: relation || 'Father',
          phone_number: phone_number || null,
          alternate_phone: alternate_phone || null,
          email: email || null,
          address: address || null,
          occupation: occupation || null,
          annual_income: parseInt(annual_income, 10) || null
        },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      father_name, mother_name, guardian_name, relation,
      phone_number, alternate_phone, email,
      address, occupation, annual_income
    } = req.body;

    await sequelize.query(
      `UPDATE parents SET
        father_name = :father_name,
        mother_name = :mother_name,
        guardian_name = :guardian_name,
        relation = :relation,
        phone_number = :phone_number,
        alternate_phone = :alternate_phone,
        email = :email,
        address = :address,
        occupation = :occupation,
        annual_income = :annual_income
       WHERE parent_id = :id`,
      {
        replacements: {
          father_name: father_name || null,
          mother_name: mother_name || null,
          guardian_name: guardian_name || null,
          relation: relation || 'Father',
          phone_number: phone_number || null,
          alternate_phone: alternate_phone || null,
          email: email || null,
          address: address || null,
          occupation: occupation || null,
          annual_income: parseInt(annual_income, 10) || null,
          id,
        },
        type: QueryTypes.UPDATE,
      }
    );

    const [updated] = await sequelize.query(
      `SELECT p.*, s.student_name FROM parents p LEFT JOIN students s ON p.student_id = s.student_id WHERE p.parent_id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getParents, createParent, updateParent };
