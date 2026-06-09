import { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { Edit2, Trash2, Eye, UserPlus, Search, RefreshCw, Users, UserCheck, Clock, Send } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import studentApi from "../../api/studentApi";
import { SendAlertModal } from "../communication/SendAlertModal";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
        <Icon size={20} color={color} strokeWidth={2.5} />
      </div>
    </div>
    <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

export const StudentList = () => {
  const navigate = useNavigate();
  const { currentInstitution } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertStudent, setAlertStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.getStudents(currentInstitution?.id);
      if (res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error("Failed to load student directory");
    } finally {
      setLoading(false);
    }
  }, [currentInstitution]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const active = students.filter(s => (s.status || '').toLowerCase() === 'active').length;
  const inactive = students.length - active;

  const columns = [
    {
      header: "Student",
      accessor: "student_name",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(s.student_name || "S")[0].toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{s.student_name}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.email || 'No email'}</span>
          </div>
        </div>
      )
    },
    { header: "Course", accessor: "course_name", render: (s) => (
      <span className="text-xs font-bold text-slate-600">{s.course_name || '—'}</span>
    )},
    { header: "Batch", accessor: "batch_name", render: (s) => (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
        {s.batch_name || '—'}
      </span>
    )},
    {
      header: "Status",
      accessor: "status",
      render: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          (s.status || '').toLowerCase() === 'active'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-amber-50 text-amber-600'
        }`}>
          {s.status || 'unknown'}
        </span>
      )
    },
  ];

  const renderActions = (s) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => setAlertStudent(s)}
        title="Send Alert"
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
      >
        <Send size={18} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => navigate(`/students/${s.student_id}`)}
        title="View Profile"
        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
      >
        <Eye size={18} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => navigate(`/students/edit/${s.student_id}`)}
        title="Edit Student"
        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
      >
        <Edit2 size={18} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => handleDelete(s)}
        title="Delete Student"
        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
      >
        <Trash2 size={18} strokeWidth={2.5} />
      </button>
    </div>
  );

  const handleDelete = async (s) => {
    if (window.confirm(`Are you sure you want to delete ${s.student_name}? This action cannot be undone.`)) {
      try {
        const res = await studentApi.deleteStudent(s.student_id);
        if (res.success) {
          toast.success("Student record deleted successfully");
          fetchStudents();
        }
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error("Failed to delete student record");
      }
    }
  };

  const filtered = students.filter(s =>
    (s.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Student Directory</h1>
          <p className="text-slate-500 font-medium">Manage and track student records across all batches and programs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchStudents} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
          <Button icon={UserPlus} onClick={() => navigate("/students/new")}>Add Student</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users}     label="Total Students" value={students.length} color="#2563eb" bg="bg-blue-50" />
        <StatCard icon={UserCheck} label="Active"         value={active}          color="#10b981" bg="bg-emerald-50" />
        <StatCard icon={Clock}     label="Inactive"       value={inactive}        color="#f59e0b" bg="bg-amber-50" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
        <div className="flex items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Users size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-800">All Students</h2>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          renderActions={renderActions}
          pagination={true}
          totalPages={1}
        />
      </div>

      <SendAlertModal 
        isOpen={!!alertStudent} 
        onClose={() => setAlertStudent(null)} 
        student={alertStudent} 
        onSent={fetchStudents} 
      />
    </div>
  );
};
