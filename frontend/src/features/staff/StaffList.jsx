import React, { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import { Button } from "../../components/common/Button";
import { Edit2, Trash2, Eye, UserPlus, Search, RefreshCw, Briefcase, GraduationCap } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import staffApi from "../../api/staffApi";

export const StaffList = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffApi.getAll();
      if (res.success) {
        setStaff(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      addToast("Failed to load staff directory", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const res = await staffApi.delete(id);
      if (res.success) {
        addToast("Staff member deleted successfully", "success");
        fetchStaff();
      } else {
        addToast(res.message || "Failed to delete staff member", "error");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      addToast(error.response?.data?.message || "Failed to delete staff member", "error");
    }
  };

  const columns = [
    { 
      header: "Staff Member", 
      accessor: "staff_name", 
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {s.staff_name ? s.staff_name[0] : 'S'}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{s.staff_name}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.designation}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Department", 
      accessor: "qualification",
      render: (s) => (
        <div className="flex items-center gap-2">
            <GraduationCap size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{s.qualification}</span>
        </div>
      )
    },
    { 
      header: "Experience", 
      accessor: "experience_years",
      render: (s) => (
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{s.experience_years} Years</span>
      )
    },
    { 
      header: "Institution", 
      accessor: "institution_name",
      render: (s) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
            {s.institution_name || "Main Campus"}
        </span>
      )
    },
    { 
      header: "Status", 
      accessor: "status", 
      render: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          s.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {s.status}
        </span>
      )
    },
  ];

  const actions = (s) => (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={() => navigate(`/staff/${s.staff_id}`)}
        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
      >
        <Eye size={18} strokeWidth={2.5} />
      </button>
      <button 
        onClick={() => navigate(`/staff/edit/${s.staff_id}`)}
        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
      >
        <Edit2 size={18} strokeWidth={2.5} />
      </button>
      <button 
        onClick={() => handleDelete(s.staff_id)}
        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
      >
        <Trash2 size={18} strokeWidth={2.5} />
      </button>
    </div>
  );

  const filteredStaff = staff.filter(s => 
    s.staff_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-1">Staff Directory</h1>
          <p className="text-slate-500 font-medium tracking-tight">Management of academic and administrative personnel across all branches.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchStaff} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
          <Button icon={UserPlus} onClick={() => navigate("/staff/new")}>Add Staff Member</Button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
        <div className="flex items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <Briefcase size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Active Personnel</h2>
            </div>
            <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Search staff by name or role..." 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <Table
          columns={columns}
          data={filteredStaff}
          loading={loading}
          actions={true}
          renderActions={actions}
          pagination={true}
          totalPages={1}
        />
      </div>
    </div>
  );
};
