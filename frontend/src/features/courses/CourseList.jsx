import { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { Book, Clock, Search, RefreshCw, Plus, BookOpen, CheckCircle2, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/apiClient";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
        <Icon size={20} color={color} strokeWidth={2.5} />
      </div>
      <ArrowUpRight size={16} className="text-slate-200 group-hover:text-primary transition-colors" />
    </div>
    <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
  </div>
);

import { useAuth } from "../../context/AuthContext";

export const CourseList = () => {
  const navigate = useNavigate();
  const { currentInstitution } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/courses", {
        params: { institution_id: currentInstitution?.id }
      });
      if (res.success && res.data) {
        const normalized = res.data.map(item => ({
          id: item.course_id,
          name: item.course_name,
          code: item.course_code,
          duration: `${item.duration_in_months} Months`,
          fees: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.total_fees),
          status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1)) : 'Active'
        }));
        setCourses(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  }, [currentInstitution]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const active = courses.filter(c => c.status === 'Active').length;

  const columns = [
    {
      header: "Course",
      accessor: "name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Book size={16} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{c.name}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.code}</span>
          </div>
        </div>
      )
    },
    {
      header: "Duration",
      accessor: "duration",
      render: (c) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs font-bold">{c.duration}</span>
        </div>
      )
    },
    {
      header: "Fees",
      accessor: "fees",
      render: (c) => (
        <span className="text-sm font-black text-emerald-600">{c.fees}</span>
      )
    },
    {
      header: "Status",
      accessor: "status",
      render: (c) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {c.status}
        </span>
      )
    },
  ];

  const renderActions = () => (
    <div className="flex items-center justify-end gap-1">
      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all">
        <Pencil size={18} strokeWidth={2.5} />
      </button>
      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
        <Trash2 size={18} strokeWidth={2.5} />
      </button>
    </div>
  );

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Course Directory</h1>
          <p className="text-slate-500 font-medium">Manage programs, curriculum, and academic offerings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} onClick={() => navigate("/courses/new")}>Add Course</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={BookOpen}    label="Total Courses" value={courses.length} color="#2563eb" bg="bg-blue-50" />
        <StatCard icon={CheckCircle2} label="Active"        value={active}          color="#10b981" bg="bg-emerald-50" />
        <StatCard icon={Clock}        label="Duration Avg"  value="24 Mo"           color="#f59e0b" bg="bg-amber-50" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
        <div className="flex items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Book size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-800">All Courses</h2>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or code..."
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
    </div>
  );
};
