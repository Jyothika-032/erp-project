import { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { Layers, Calendar, Plus, Search, RefreshCw, Users, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import batchApi from "../../api/batchApi";
import { Modal } from "../../components/common/Modal";

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

const MOCK_BATCHES = [
  { batch_id: "B2023-01", batch_name: "BCA 2023-26 A", course_name: "BCA", capacity: 45, filled: 42, academic_year: "2023-2026", status: "Active" },
  { batch_id: "B2024-01", batch_name: "MCA 2024-26 A", course_name: "MCA", capacity: 30, filled: 28, academic_year: "2024-2026", status: "Active" },
  { batch_id: "B2022-01", batch_name: "B.Tech 2022-26 A", course_name: "B.Tech", capacity: 60, filled: 58, academic_year: "2022-2026", status: "Active" },
  { batch_id: "B2023-02", batch_name: "BCA 2023-26 B", course_name: "BCA", capacity: 45, filled: 40, academic_year: "2023-2026", status: "Active" },
  { batch_id: "B2024-02", batch_name: "DM 2024 Short-term", course_name: "Digital Marketing", capacity: 20, filled: 15, academic_year: "2024-2024", status: "Ongoing" },
];

export const BatchList = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState(MOCK_BATCHES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBatch, setViewingBatch] = useState(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await batchApi.getBatches();
      if (res.success && res.data && res.data.length > 0) {
        setBatches(res.data);
      } else {
        setBatches(MOCK_BATCHES);
      }
    } catch (err) {
      console.warn("Failed to fetch batches from API, using mock data:", err);
      setBatches(MOCK_BATCHES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const activeCount = batches.filter(b => (b.status || '').toLowerCase() === 'active').length;
  const totalStudents = batches.reduce((sum, b) => sum + (b.filled || 0), 0);

  const columns = [
    {
      header: "Batch Name",
      accessor: "batch_name",
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{b.batch_name || b.name}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.batch_id || b.id}</span>
          </div>
        </div>
      )
    },
    {
      header: "Course",
      accessor: "course_name",
      render: (b) => (
        <span className="text-xs font-bold text-slate-600">{b.course_name || b.course || '—'}</span>
      )
    },
    {
      header: "Academic Year",
      accessor: "academic_year",
      render: (b) => (
        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
          <Calendar size={14} className="text-slate-400" />
          {b.academic_year || b.academicYear || '—'}
        </div>
      )
    },
    {
      header: "Enrolled / Capacity",
      accessor: "capacity",
      render: (b) => {
        const filled = b.filled !== undefined ? b.filled : 0;
        const capacity = b.capacity || 0;
        const pct = capacity > 0 ? Math.min(Math.round((filled / capacity) * 100), 100) : 0;
        return (
          <div className="space-y-1.5 w-36">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>{filled} / {capacity}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  pct > 90 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: "Status",
      accessor: "status",
      render: (b) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          (b.status || '').toLowerCase() === 'active'
            ? 'bg-emerald-50 text-emerald-600'
            : (b.status || '').toLowerCase() === 'ongoing'
            ? 'bg-blue-50 text-blue-600'
            : 'bg-slate-100 text-slate-500'
        }`}>
          {b.status || 'unknown'}
        </span>
      )
    },
  ];

  const handleDelete = async (b) => {
    const batchId = b.batch_id || b.id;
    if (window.confirm(`Are you sure you want to delete the batch "${b.batch_name || b.name}"?`)) {
      try {
        const res = await batchApi.deleteBatch(batchId);
        if (res.success) {
          toast.success("Batch deleted successfully");
          fetchBatches();
        } else {
          toast.error(res.message || "Failed to delete batch");
        }
      } catch (err) {
        console.error("Delete failed:", err);
        // Fallback for mock data deletion if API fails
        setBatches(prev => prev.filter(item => (item.batch_id || item.id) !== batchId));
        toast.success("Batch removed (Mock Local Mode)");
      }
    }
  };

  const openEditModal = (b) => {
    setEditingBatch({ ...b });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const batchId = editingBatch.batch_id || editingBatch.id;
    try {
      const payload = {
        batch_name: editingBatch.batch_name || editingBatch.name,
        max_students: parseInt(editingBatch.capacity || editingBatch.max_students || 0, 10),
        status: editingBatch.status
      };
      const res = await batchApi.updateBatch(batchId, payload);
      if (res.success) {
        toast.success("Batch updated successfully!");
        setIsEditModalOpen(false);
        fetchBatches();
      } else {
        toast.error(res.message || "Failed to update batch");
      }
    } catch (err) {
      console.error("Update failed:", err);
      // Fallback for mock data update
      setBatches(prev => prev.map(item => {
        if ((item.batch_id || item.id) === batchId) {
          return {
            ...item,
            batch_name: editingBatch.batch_name,
            capacity: parseInt(editingBatch.capacity || 0, 10),
            status: editingBatch.status
          };
        }
        return item;
      }));
      toast.success("Batch updated (Mock Local Mode)");
      setIsEditModalOpen(false);
    }
  };

  const openViewModal = (b) => {
    setViewingBatch(b);
    setIsViewModalOpen(true);
  };

  const renderActions = (b) => (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => openViewModal(b)}
        title="View Details"
        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
      >
        <Layers size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => openEditModal(b)}
        title="Edit Batch"
        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
      </button>
      <button
        onClick={() => handleDelete(b)}
        title="Delete Batch"
        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      </button>
    </div>
  );

  const filteredBatches = batches.filter(b => {
    const name = b.batch_name || b.name || "";
    const course = b.course_name || b.course || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           course.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Batch Management</h1>
          <p className="text-slate-500 font-medium">Monitor and manage academic cohorts, capacities, and timeline schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchBatches} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
          <Button icon={Plus} onClick={() => navigate("/batches/new")}>Add Batch</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Layers}      label="Total Cohorts" value={batches.length} color="#7c3aed" bg="bg-purple-50" />
        <StatCard icon={CheckCircle} label="Active Cohorts" value={activeCount} color="#10b981" bg="bg-emerald-50" />
        <StatCard icon={Users}       label="Total Enrolled" value={totalStudents} color="#2563eb" bg="bg-blue-50" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
        <div className="flex items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Layers size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-800">All Academic Batches</h2>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search by name or course..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={filteredBatches}
          loading={loading}
          renderActions={renderActions}
          pagination={true}
          totalPages={1}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Batch Details"
      >
        {editingBatch && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Batch Name</label>
              <input 
                type="text" 
                value={editingBatch.batch_name || editingBatch.name || ""} 
                onChange={(e) => setEditingBatch({ ...editingBatch, batch_name: e.target.value, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Student Capacity</label>
                <input 
                  type="number" 
                  value={editingBatch.capacity !== undefined ? editingBatch.capacity : (editingBatch.max_students || 0)} 
                  onChange={(e) => setEditingBatch({ ...editingBatch, capacity: e.target.value, max_students: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select 
                  value={editingBatch.status || "Active"} 
                  onChange={(e) => setEditingBatch({ ...editingBatch, status: e.target.value })}
                  className="w-full px-4 py-2.2 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none h-11"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Batch Details"
      >
        {viewingBatch && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Layers size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">{viewingBatch.batch_name || viewingBatch.name || 'N/A'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {viewingBatch.batch_id || viewingBatch.id}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Course</span>
                <span className="text-sm font-bold text-slate-800">{viewingBatch.course_name || viewingBatch.course || '—'}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Academic Year</span>
                <span className="text-sm font-bold text-slate-800">{viewingBatch.academic_year || viewingBatch.academicYear || '—'}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Start Date</span>
                <span className="text-sm font-bold text-slate-800">
                  {viewingBatch.start_date ? new Date(viewingBatch.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">End Date</span>
                <span className="text-sm font-bold text-slate-800">
                  {viewingBatch.end_date ? new Date(viewingBatch.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Class Timings</span>
                <span className="text-sm font-bold text-slate-800">{viewingBatch.class_timing || '—'}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block mb-2">Student Capacity & Enrollment</span>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{viewingBatch.filled || 0} enrolled</span>
                <span>/ {viewingBatch.capacity || viewingBatch.max_students || 0} capacity</span>
              </div>
              <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ 
                    width: `${
                      (viewingBatch.capacity || viewingBatch.max_students) > 0 
                        ? Math.min(Math.round(((viewingBatch.filled || 0) / (viewingBatch.capacity || viewingBatch.max_students || 1)) * 100), 100) 
                        : 0
                    }%` 
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                (viewingBatch.status || '').toLowerCase() === 'active'
                  ? 'bg-emerald-500 text-white'
                  : (viewingBatch.status || '').toLowerCase() === 'ongoing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-400 text-white'
              }`}>
                {viewingBatch.status || 'Active'}
              </span>
              <Button onClick={() => setIsViewModalOpen(false)}>Close View</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
