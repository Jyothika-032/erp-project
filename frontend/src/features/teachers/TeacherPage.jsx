import React, { useEffect, useState } from "react";
import TeacherForm from "./TeacherForm";
import staffApi from "../../api/staffApi";

const TeacherPage = () => {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    const fetchData = async () => {
        try {
            const res = await staffApi.getAll();
            setData(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Remove teacher?")) {
            await staffApi.delete(id);
            fetchData();
        }
    };

    // Stats calculation
    const total = data.length;
    const departments = [...new Set(data.map(i => i.department))].length;
    const specializations = [...new Set(data.map(i => i.specialization))].length;

    return (
        <div className="dashboard-layout">
            <div className="main-content">
                <header className="page-header">
                    <div className="header-text">
                        <h1>Staff Management</h1>
                        <p>View and manage all organization staff members</p>
                    </div>

                    <button className="add-btn" style={{ background: '#10b981' }} onClick={() => { setEditData(null); setOpen(true); }}>
                        + Register Staff
                    </button>
                </header>

                <div className="attendance-container">
                    <div className="table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Designation</th>
                                    <th>Exp (Yrs)</th>
                                    <th>Qualification</th>
                                    <th>Email</th>
                                    <th className="actions-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr><td colSpan="6" className="empty-state">No staff members found.</td></tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item._id}>
                                            <td className="student-cell">
                                                <div className="avatar" style={{ background: '#10b981' }}>{(item.staff_name || "S").charAt(0)}</div>
                                                <span>{item.staff_name}</span>
                                            </td>
                                            <td>{item.designation}</td>
                                            <td>{item.experience_years}</td>
                                            <td>{item.qualification}</td>
                                            <td>{item.email}</td>
                                            <td className="actions-cell">
                                                <button className="edit-btn" onClick={() => { setEditData(item); setOpen(true); }}>✎</button>
                                                <button className="delete-btn" onClick={() => handleDelete(item._id)}>✖</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <aside className="sidebar-right">
                <div className="stats-card">
                    <h3 style={{ color: '#10b981' }}>Staff Summary</h3>
                    <div className="stat-item">
                        <label>Total Staff Members</label>
                        <div className="value">{total}</div>
                    </div>
                    <div className="stat-item">
                        <label>Departments</label>
                        <div className="value success">{departments}</div>
                    </div>
                    <div className="stat-item">
                        <label>Specializations</label>
                        <div className="value warning">{specializations}</div>
                    </div>

                    <div className="stat-chart">
                        <div className="circular-progress" style={{ '--percent': '100%', '--primary': '#10b981' }}>
                            <div className="inner-circle">
                                <span className="rate-value">{total}</span>
                                <span className="rate-label">Staff Count</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {open && (
                <TeacherForm
                    close={() => setOpen(false)}
                    refresh={fetchData}
                    editData={editData}
                />
            )}
        </div>
    );
};



export default TeacherPage;
