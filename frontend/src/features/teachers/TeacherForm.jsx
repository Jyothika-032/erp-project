import React, { useState, useEffect } from "react";
import staffApi from "../../api/staffApi";

const TeacherForm = ({ close, refresh, editData }) => {
  const [formData, setFormData] = useState({
    staff_name: "",
    email: "",
    staff_id: "",
    department: "Computer Science",
    phone: "",
    designation: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) await staffApi.update(editData._id, formData);
      else await staffApi.create(formData);
      refresh();
      close();
    } catch (e) {
      console.error(e);
      alert(`Save failed! Error: ${e.message}.`);
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2 style={{ color: '#10b981' }}>{editData ? "Edit Staff" : "Register Staff"}</h2>
          <p>Enter staff credentials and department info.</p>
        </div>
        <form onSubmit={handleSubmit} className="grid-form">
          <div className="form-group full">
            <label>Name</label>
            <input required value={formData.staff_name} onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Staff ID</label>
            <input required value={formData.staff_id} onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })} placeholder="S101" />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
              <option>Computer Science</option><option>Business Admin</option><option>Physics</option>
            </select>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Designation</label>
            <input value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Trainer" />
          </div>
          <div className="form-actions full">
            <button type="button" onClick={close} className="cancel-btn">Discard</button>
            <button type="submit" disabled={loading} className="submit-btn" style={{ background: '#10b981' }}>{loading ? "Saving..." : "Save Staff Info"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
