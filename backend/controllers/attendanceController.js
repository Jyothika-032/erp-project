const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Student Attendance
const getStudentsAttendance = async (req, res) => {
  const { date, institution_id, batch_id } = req.query;
  const parsedId = parseInt(institution_id, 10);
  const parsedBatchId = parseInt(batch_id, 10);
  try {
    let query = `SELECT a.*, s.student_name 
       FROM attendance a
       LEFT JOIN students s ON a.student_id = s.student_id
       WHERE a.institution_id = :instId AND a.attendance_date = :date`;
       
    const replacements = { 
      instId: isNaN(parsedId) ? 1 : parsedId, 
      date: date || new Date().toISOString().split('T')[0] 
    };

    if (!isNaN(parsedBatchId)) {
      query += ` AND a.batch_id = :batchId`;
      replacements.batchId = parsedBatchId;
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

const markStudentAttendance = async (req, res) => {
  try {
    const { student_id, institution_id, attendance_date, date, status, remarks, course_id, batch_id, marked_by } = req.body;
    const resolvedDate = attendance_date || date || new Date().toISOString().split('T')[0];
    
    const parsedStudentId = parseInt(student_id, 10);
    const parsedInstId = parseInt(institution_id, 10);
    const parsedCourseId = parseInt(course_id, 10);
    const parsedBatchId = parseInt(batch_id, 10);
    const parsedMarkedBy = parseInt(marked_by, 10);

    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    // Check if record already exists for this student on this date
    const [existing] = await sequelize.query(
      `SELECT * FROM attendance WHERE student_id = :student_id AND attendance_date = :attendance_date`,
      {
        replacements: { student_id: parsedStudentId, attendance_date: resolvedDate },
        type: QueryTypes.SELECT
      }
    );

    let result;
    if (existing) {
      // Update existing record
      const [updateResult] = await sequelize.query(
        `UPDATE attendance 
         SET status = :status, remarks = :remarks, institution_id = :institution_id, 
             course_id = :course_id, batch_id = :batch_id, marked_by = :marked_by
         WHERE attendance_id = :attendance_id RETURNING *`,
        {
          replacements: {
            attendance_id: existing.attendance_id,
            status,
            remarks: remarks || existing.remarks || null,
            institution_id: isNaN(parsedInstId) ? existing.institution_id : parsedInstId,
            course_id: isNaN(parsedCourseId) ? existing.course_id : parsedCourseId,
            batch_id: isNaN(parsedBatchId) ? existing.batch_id : parsedBatchId,
            marked_by: isNaN(parsedMarkedBy) ? existing.marked_by : parsedMarkedBy
          },
          type: QueryTypes.UPDATE
        }
      );
      result = updateResult[0];
    } else {
      // Insert new record
      const [insertResult] = await sequelize.query(
        `INSERT INTO attendance (student_id, institution_id, attendance_date, status, remarks, course_id, batch_id, marked_by)
         VALUES (:student_id, :institution_id, :attendance_date, :status, :remarks, :course_id, :batch_id, :marked_by) RETURNING *`,
        {
          replacements: { 
            student_id: parsedStudentId, 
            institution_id: isNaN(parsedInstId) ? 1 : parsedInstId, 
            attendance_date: resolvedDate, 
            status, 
            remarks: remarks || null,
            course_id: isNaN(parsedCourseId) ? null : parsedCourseId,
            batch_id: isNaN(parsedBatchId) ? null : parsedBatchId,
            marked_by: isNaN(parsedMarkedBy) ? null : parsedMarkedBy
          },
          type: QueryTypes.INSERT
        }
      );
      result = insertResult[0];
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Staff Attendance
const getStaffAttendance = async (req, res) => {
  const { date, institution_id } = req.query;
  const parsedId = parseInt(institution_id, 10);
  try {
    const data = await sequelize.query(
      `SELECT sa.*, st.staff_name 
       FROM staff_attendance sa
       LEFT JOIN staff st ON sa.staff_id = st.staff_id
       WHERE sa.institution_id = :instId AND sa.attendance_date = :date`,
      { 
        replacements: { 
          instId: isNaN(parsedId) ? 1 : parsedId, 
          date: date || new Date().toISOString().split('T')[0] 
        }, 
        type: QueryTypes.SELECT 
      }
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markStaffAttendance = async (req, res) => {
  try {
    const { staff_id, institution_id, attendance_date, date, status } = req.body;
    const resolvedDate = attendance_date || date || new Date().toISOString().split('T')[0];
    
    const parsedStaffId = parseInt(staff_id, 10);
    const parsedInstId = parseInt(institution_id, 10);

    if (isNaN(parsedStaffId)) {
      return res.status(400).json({ success: false, message: 'Invalid staff ID' });
    }

    // Check if record already exists for this staff on this date
    const [existing] = await sequelize.query(
      `SELECT * FROM staff_attendance WHERE staff_id = :staff_id AND attendance_date = :attendance_date`,
      {
        replacements: { staff_id: parsedStaffId, attendance_date: resolvedDate },
        type: QueryTypes.SELECT
      }
    );

    let result;
    if (existing) {
      // Update existing record
      const [updateResult] = await sequelize.query(
        `UPDATE staff_attendance 
         SET status = :status, institution_id = :institution_id
         WHERE attendance_id = :attendance_id RETURNING *`,
        {
          replacements: {
            attendance_id: existing.attendance_id,
            status,
            institution_id: isNaN(parsedInstId) ? existing.institution_id : parsedInstId
          },
          type: QueryTypes.UPDATE
        }
      );
      result = updateResult[0];
    } else {
      // Insert new record
      const [insertResult] = await sequelize.query(
        `INSERT INTO staff_attendance (staff_id, institution_id, attendance_date, status)
         VALUES (:staff_id, :institution_id, :attendance_date, :status) RETURNING *`,
        {
          replacements: { 
            staff_id: parsedStaffId, 
            institution_id: isNaN(parsedInstId) ? 1 : parsedInstId, 
            attendance_date: resolvedDate, 
            status 
          },
          type: QueryTypes.INSERT
        }
      );
      result = insertResult[0];
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentsAttendance,
  markStudentAttendance,
  getStaffAttendance,
  markStaffAttendance
};
