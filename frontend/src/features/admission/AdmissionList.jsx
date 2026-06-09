import { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { 
  GraduationCap, Search, RefreshCw, UserCheck, CheckCircle2, Clock, 
  Eye, Calendar, FileText, AlertCircle, Sparkles, Filter
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import admissionApi from "../../api/admissionApi";
import apiClient from "../../api/apiClient";

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

export const AdmissionList = () => {
  const navigate = useNavigate();
  const { currentInstitution } = useAuth();
  const [admissions, setAdmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await admissionApi.getAll(currentInstitution?.id);
      if (res.success) {
        setAdmissions(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch admissions:", err);
      toast.error("Failed to load admissions directory");
    } finally {
      setLoading(false);
    }
  }, [currentInstitution]);

  const fetchFilters = useCallback(async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        apiClient.get('/courses'),
        apiClient.get('/batches')
      ]);
      setCourses(cRes.data || []);
      setBatches(bRes.data || []);
    } catch (error) {
      console.error("Failed to fetch filters metadata:", error);
    }
  }, []);

  useEffect(() => {
    fetchAdmissions();
    fetchFilters();
  }, [fetchAdmissions, fetchFilters]);

  // Calculate Stat Counts
  const totalApplications = admissions.length;
  const confirmedCount = admissions.filter(
    (a) => (a.admission_status || "").toLowerCase() === "confirmed"
  ).length;
  const pendingCount = admissions.filter(
    (a) => (a.admission_status || "").toLowerCase().includes("pending")
  ).length;

  const columns = [
    {
      header: "Admission Info",
      accessor: "admission_number",
      render: (a) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">
            #{a.admission_number || "N/A"}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
            <Calendar size={10} />
            {a.admission_date ? new Date(a.admission_date).toLocaleDateString() : "—"}
          </span>
        </div>
      )
    },
    {
      header: "Student",
      accessor: "student_name",
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            {(a.student_name || "S")[0].toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">
              {a.student_name || "Unknown"}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ID: {a.student_id}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Course & Batch",
      accessor: "course_name",
      render: (a) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-600">
            {a.course_name || "—"}
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
            {a.batch_name || "—"}
          </span>
        </div>
      )
    },
    {
      header: "Handled By",
      accessor: "handled_by_name",
      render: (a) => (
        <span className="text-xs font-bold text-slate-600">
          {a.handled_by_name || "—"}
        </span>
      )
    },
    {
      header: "Submitted Documents",
      accessor: "documents_submitted",
      render: (a) => {
        if (!a.documents_submitted) return <span className="text-xs text-slate-400 font-medium">None</span>;
        const docs = a.documents_submitted.split(",").map(d => d.trim()).filter(Boolean);
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {docs.map((doc, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100 text-[10px] font-bold">
                {doc}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      header: "Status",
      accessor: "admission_status",
      render: (a) => {
        const status = (a.admission_status || "Pending Verification").toLowerCase();
        let classes = "bg-amber-50 text-amber-600";
        if (status === "confirmed") {
          classes = "bg-emerald-50 text-emerald-600";
        } else if (status.includes("provisional")) {
          classes = "bg-blue-50 text-blue-600";
        }
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${classes}`}>
            {a.admission_status || "Pending Verification"}
          </span>
        );
      }
    }
  ];

  const renderActions = (a) => (
    <div className="flex items-center justify-end gap-1">
      {a.student_id && (
        <button
          onClick={() => navigate(`/students/${a.student_id}`)}
          title="View Student Profile"
          className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
        >
          <Eye size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );

  // Apply filters
  const filtered = admissions.filter((a) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (a.student_name || "").toLowerCase().includes(query) ||
      (a.admission_number || "").toString().includes(query);

    // 2. Status Filter
    const matchesStatus =
      statusFilter === "All" ||
      (a.admission_status || "").toLowerCase() === statusFilter.toLowerCase() ||
      (statusFilter === "Pending Verification" && (a.admission_status || "").toLowerCase().includes("pending"));

    // 3. Course Filter
    const matchesCourse =
      courseFilter === "All" ||
      (a.course_id || "").toString() === courseFilter;

    // 4. Batch Filter
    const matchesBatch =
      batchFilter === "All" ||
      (a.batch_id || "").toString() === batchFilter;

    return matchesSearch && matchesStatus && matchesCourse && matchesBatch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">
            Admissions Directory
          </h1>
          <p className="text-slate-500 font-medium">
            Manage student registrations, verify documents, and track application pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={fetchAdmissions} 
            icon={RefreshCw} 
            className={loading ? "animate-spin" : ""}
          >
            Sync
          </Button>
          <Button 
            icon={GraduationCap} 
            onClick={() => navigate("/admission")}
          >
            New Admission
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={FileText} 
          label="Total Applications" 
          value={totalApplications} 
          color="#2563eb" 
          bg="bg-blue-50" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Confirmed" 
          value={confirmedCount} 
          color="#10b981" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          icon={Clock} 
          label="Pending Verification" 
          value={pendingCount} 
          color="#f59e0b" 
          bg="bg-amber-50" 
        />
      </div>

      {/* Advanced Filters & Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
        <div className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <Sparkles size={24} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Applications</h2>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search student or admission #..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Inline filters */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mr-2">
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            {/* Status Selector */}
            <select
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Provisional">Provisional</option>
            </select>

            {/* Course Selector */}
            <select
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-primary/20"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
              ))}
            </select>

            {/* Batch Selector */}
            <select
              className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-2 ring-primary/20"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="All">All Batches</option>
              {batches.map(b => (
                <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>
              ))}
            </select>

            {/* Reset Filters */}
            {(statusFilter !== "All" || courseFilter !== "All" || batchFilter !== "All" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setStatusFilter("All");
                  setCourseFilter("All");
                  setBatchFilter("All");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-primary hover:underline ml-2"
              >
                Clear all filters
              </button>
            )}
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

export default AdmissionList;
