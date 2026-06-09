import { useState, useEffect, useCallback } from "react";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { 
  Edit2, Trash2, Eye, UserPlus, Search, RefreshCw, Heart, User, 
  Phone, MapPin, Briefcase, Mail, DollarSign, Users, UserCheck, 
  ArrowUpRight 
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import parentApi from "../../api/parentApi";

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

export const ParentList = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { currentInstitution } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await parentApi.getAll({ institution_id: currentInstitution?.id });
      if (res.success && res.data) {
        const normalized = res.data.map(item => ({
          ...item,
          parent_name: item.father_name || item.mother_name || item.guardian_name || 'N/A'
        }));
        setParents(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch parents:", error);
      addToast("Failed to load parent directory", "error");
    } finally {
      setLoading(false);
    }
  }, [currentInstitution, addToast]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const openEdit = (p) => {
    setEditData({
      father_name: p.father_name || '',
      mother_name: p.mother_name || '',
      guardian_name: p.guardian_name || '',
      relation: p.relation || '',
      phone_number: p.phone_number || '',
      alternate_phone: p.alternate_phone || '',
      email: p.email || '',
      address: p.address || '',
      occupation: p.occupation || '',
      annual_income: p.annual_income || '',
    });
    setSelectedParent(p);
    setIsEditOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await parentApi.update(selectedParent.parent_id, editData);
      if (res.success) {
        addToast('Parent details updated successfully!', 'success');
        setIsEditOpen(false);
        fetchParents();
      } else {
        addToast(res.message || 'Update failed', 'error');
      }
    } catch (err) {
      console.error('Update error:', err);
      addToast('An error occurred while updating', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const totalIncome = parents.reduce((sum, p) => sum + (p.annual_income || 0), 0);
  const avgIncome = parents.length ? Math.round(totalIncome / parents.length) : 0;
  const avgIncomeFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(avgIncome);

  const columns = [
    { 
      header: "Father's Name", 
      accessor: "father_name", 
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {(p.father_name || "F")[0].toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{p.father_name || '—'}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.occupation || 'No Occupation'}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Mother's Name", 
      accessor: "mother_name", 
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-xs">
            {(p.mother_name || "M")[0].toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-slate-800 block">{p.mother_name || '—'}</span>
          </div>
        </div>
      )
    },
    { 
      header: "Child (Student)", 
      accessor: "student_name",
      render: (p) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
          {p.student_name || '—'}
        </span>
      )
    },
    { 
      header: "Contact Details", 
      accessor: "phone_number",
      render: (p) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-700">{p.phone_number || '—'}</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.email || 'No email'}</span>
        </div>
      )
    }
  ];

  const renderActions = (p) => (
    <div className="flex items-center justify-end gap-1">
      <button 
        onClick={() => { setSelectedParent(p); setIsViewOpen(true); }}
        title="View Details"
        className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
      >
        <Eye size={18} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => openEdit(p)}
        title="Edit Parent"
        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
      >
        <Edit2 size={18} strokeWidth={2.5} />
      </button>
      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
        <Trash2 size={18} strokeWidth={2.5} />
      </button>
    </div>
  );

  const filteredParents = parents.filter(p => 
    (p.father_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.mother_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.guardian_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.student_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.address || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Parent Directory</h1>
          <p className="text-slate-500 font-medium">Guardian information and student associations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchParents} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
          <Button icon={UserPlus} onClick={() => navigate("/parents/new")}>Add Parent</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Parents" value={parents.length} color="#2563eb" bg="bg-blue-50" />
        <StatCard icon={UserCheck} label="Linked Students" value={parents.filter(p => p.student_id).length} color="#10b981" bg="bg-emerald-50" />
        <StatCard icon={DollarSign} label="Avg Annual Income" value={avgIncomeFormatted} color="#f59e0b" bg="bg-amber-50" />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
        <div className="flex items-center justify-between p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Heart size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-800">All Parents</h2>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredParents}
          loading={loading}
          renderActions={renderActions}
          pagination={true}
          totalPages={1}
        />
      </div>

      {/* Profile Detail View Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Guardian & Parent Details"
        footer={
          <Button onClick={() => setIsViewOpen(false)}>
            Close Profile
          </Button>
        }
      >
        {selectedParent && (
          <div className="space-y-6">
            {/* Header / Student Link */}
            <div className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Linked Student</span>
                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <User size={16} className="text-primary" /> {selectedParent.student_name || 'Unlinked / None'}
                </span>
              </div>
              <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                ID: {selectedParent.student_id || 'N/A'}
              </div>
            </div>

            {/* Grid for Father and Mother */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Father card */}
              <div className="border border-slate-100 p-5 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
                  <User size={14} /> Father's Information
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="text-sm font-extrabold text-slate-700">{selectedParent.father_name || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Occupation</span>
                  <span className="text-xs font-bold text-slate-600">{selectedParent.occupation || '—'}</span>
                </div>
              </div>

              {/* Mother card */}
              <div className="border border-slate-100 p-5 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
                  <User size={14} /> Mother's Information
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <span className="text-sm font-extrabold text-slate-700">{selectedParent.mother_name || '—'}</span>
                </div>
              </div>
            </div>

            {/* Guardian Profile if exists */}
            {selectedParent.guardian_name && (
              <div className="border border-slate-100 p-5 rounded-2xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
                  <Briefcase size={14} /> Local Guardian Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guardian Name</span>
                    <span className="text-sm font-extrabold text-slate-700">{selectedParent.guardian_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Relationship</span>
                    <span className="text-xs font-bold text-slate-600">{selectedParent.relation || 'Guardian'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Details card */}
            <div className="border border-slate-100 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
                <Phone size={14} /> Contact & Communication
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Phone</span>
                  <span className="text-xs font-bold text-slate-700">{selectedParent.phone_number || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alternate Phone</span>
                  <span className="text-xs font-bold text-slate-700">{selectedParent.alternate_phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <span className="text-xs font-bold text-slate-700">{selectedParent.email || '—'}</span>
                </div>
              </div>
            </div>

            {/* Address & Financials card */}
            <div className="border border-slate-100 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider border-b border-slate-50 pb-2">
                <MapPin size={14} /> Other Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual Income</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {selectedParent.annual_income !== null && selectedParent.annual_income !== undefined && selectedParent.annual_income > 0 
                      ? `₹${selectedParent.annual_income.toLocaleString('en-IN')}` 
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Home Address</span>
                  <span className="text-xs font-medium text-slate-600 block leading-relaxed">{selectedParent.address || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Parent Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={`Edit Parent — ${selectedParent?.student_name || 'Record'}`}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button type="submit" form="edit-parent-form" disabled={editLoading}>
              {editLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {selectedParent && (
          <form id="edit-parent-form" onSubmit={handleEditSave} className="space-y-5">
            {/* Names Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Father's Name</label>
                <input name="father_name" value={editData.father_name} onChange={handleEditChange}
                  className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Father's full name" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mother's Name</label>
                <input name="mother_name" value={editData.mother_name} onChange={handleEditChange}
                  className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Mother's full name" />
              </div>
            </div>

            {/* Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Phone</label>
                <input name="phone_number" value={editData.phone_number} onChange={handleEditChange}
                  className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Primary phone number" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alternate Phone</label>
                <input name="alternate_phone" value={editData.alternate_phone} onChange={handleEditChange}
                  className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Alternate phone" />
              </div>
            </div>

            {/* Email + Occupation Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <input name="email" type="email" value={editData.email} onChange={handleEditChange}
                  className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Email address" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Occupation</label>
                <input name="occupation" value={editData.occupation} onChange={handleEditChange}
                  className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="e.g. Business" />
              </div>
            </div>

            {/* Annual Income + Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Annual Income (₹)</label>
              <input name="annual_income" type="number" value={editData.annual_income} onChange={handleEditChange}
                className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="e.g. 500000" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Address</label>
              <textarea name="address" value={editData.address} onChange={handleEditChange} rows={2}
                className="border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-medium text-slate-700 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="Full home address" />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
