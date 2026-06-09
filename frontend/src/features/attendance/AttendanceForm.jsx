import React, { useState, useEffect } from "react";
import attendanceApi from "../../api/attendanceApi";

const AttendanceForm = ({ close, refresh, editData, type = 'students' }) => {
  const [formData, setFormData] = useState({
    institution_id: "",
    course_id: "",
    batch_id: "",
    student_id: "",
    student_name: "", // We'll keep this for display in the table
    marked_by: "",
    attendance_date: new Date().toISOString().split("T")[0],
    status: "Present",
    remarks: "",
  });

  const [metadata, setMetadata] = useState({
    institutions: [],
    courses: [],
    batches: [],
    students: [],
    staff: []
  });

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [instRes, courRes, batRes, stuRes, staRes] = await Promise.all([
          attendanceApi.getInstitutions(),
          attendanceApi.getCourses(),
          attendanceApi.getBatches(),
          attendanceApi.getStudentsList(),
          attendanceApi.getStaffList()
        ]);

        const inst = instRes.data;
        const cour = courRes.data;
        const bat = batRes.data;
        const stu = stuRes.data;
        const sta = staRes.data;

        setMetadata({
          institutions: inst,
          courses: cour,
          batches: bat,
          students: stu,
          staff: sta
        });

        if (editData) {
          setFormData({
            ...editData,
            attendance_date: editData.attendance_date ? new Date(editData.attendance_date).toISOString().split("T")[0] : "",
          });
        } else {
            // Set defaults if data exists
            setFormData(prev => ({
                ...prev,
                institution_id: inst[0]?.id || "",
                course_id: cour[0]?.course_id || "",
                batch_id: bat[0]?.batch_id || "",
                marked_by: sta[0]?.staff_id || ""
            }));
        }
      } catch (err) {
        console.error("Metadata load error:", err);
      } finally {
        setInitLoading(false);
      }
    };
    loadMetadata();
  }, [editData]);

  const filteredBatches = metadata.batches.filter(b => b.course_id === formData.course_id && b.institution_id === formData.institution_id);
  const filteredStudents = metadata.students.filter(s => s.batch_id === formData.batch_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        if (type === 'students') await attendanceApi.updateStudentAttendance(editData.attendance_id || editData.id, formData);
        else await attendanceApi.updateTeacherAttendance(editData.attendance_id || editData.id, formData);
      } else {
        if (type === 'students') await attendanceApi.markStudentAttendance(formData);
        else await attendanceApi.markTeacherAttendance(formData);
      }
      refresh();
      close();
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Failed to save attendance. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) return <div className="modal-overlay"><div className="modal-content">Loading...</div></div>;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
            <h2>{editData ? "Edit Attendance" : "Mark Attendance"}</h2>
            <p>Log student attendance for the specific institution and batch.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid-form">
          
          <div className="form-group">
            <label>Institution</label>
            <select
                required
                value={formData.institution_id}
                onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
            >
                <option value="">Select Institution</option>
                {metadata.institutions.map(i => <option key={i.id} value={i.id}>{i.institution_name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Course</label>
            <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            >
                <option value="">Select Course</option>
                {metadata.courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Batch</label>
            <select
                required
                value={formData.batch_id}
                onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
            >
                <option value="">Select Batch</option>
                {filteredBatches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Student</label>
            <select
                required
                value={formData.student_id}
                onChange={(e) => {
                    const student = metadata.students.find(s => s.student_id === e.target.value);
                    setFormData({ ...formData, student_id: e.target.value, student_name: student ? student.student_name : "" });
                }}
            >
                <option value="">Select Student</option>
                {filteredStudents.map(s => <option key={s.student_id} value={s.student_id}>{s.student_name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Marked By (Staff)</label>
            <select
                required
                value={formData.marked_by}
                onChange={(e) => setFormData({ ...formData, marked_by: e.target.value })}
            >
                <option value="">Select Staff Member</option>
                {metadata.staff.map(s => <option key={s.staff_id} value={s.staff_id}>{s.staff_name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              required
              value={formData.attendance_date}
              onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label>Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Health issue / On leave / Arrived late"
              rows={1}
            />
          </div>

          <div className="form-actions full">
            <button type="button" onClick={close} className="cancel-btn">Discard</button>
            <button type="submit" disabled={loading} className="submit-btn text-white">
                {loading ? "Saving..." : (editData ? "Update Record" : "Save Attendance")}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;



