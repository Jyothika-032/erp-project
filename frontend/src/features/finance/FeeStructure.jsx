import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  BookOpen, 
  RefreshCw,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { Table } from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as feeStructureApi from '../../api/feeStructureApi';

const FeeStructure = () => {
    const { currentInstitution } = useAuth();
    const { addToast } = useToast();
    
    const [allFeeStructures, setAllFeeStructures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFee, setEditingFee] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingFee, setViewingFee] = useState(null);
    const [stats, setStats] = useState({
        totalEntries: 0,
        totalFees: 0,
        coursesCovered: 0,
        acadYear: '—'
    });

    const fetchFeeStructures = useCallback(async () => {
        setLoading(true);
        try {
            // Using institution_id=1 as default if auth not ready
            const instId = currentInstitution?.id || 1;
            const res = await feeStructureApi.getFeeStructures({ institution_id: instId });
            const data = res.data || [];
            setAllFeeStructures(data);
            
            // Calculate stats
            const totalFees = data.reduce((s, r) => s + Number(r.total_amount), 0);
            const courses = [...new Set(data.map(r => r.course_id))].length;
            
            setStats({
                totalEntries: data.length,
                totalFees,
                coursesCovered: courses,
                acadYear: 'Standard'
            });
        } catch (error) {
            console.error("Failed to fetch fee structures:", error);
            addToast("Failed to load fee configuration", "error");
        } finally {
            setLoading(false);
        }
    }, [currentInstitution, addToast]);

    useEffect(() => {
        fetchFeeStructures();
    }, [fetchFeeStructures]);

    const columns = [
        { 
            header: 'Course', 
            accessor: 'course_name',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{r.course_name || 'N/A'}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID: #{r.course_id}</span>
                </div>
            )
        },
        { 
            header: 'Tuition Fee', 
            accessor: 'tuition_fee',
            render: (r) => (
                <span className="text-xs font-bold text-slate-500">₹{Number(r.tuition_fee).toLocaleString()}</span>
            )
        },
        { 
            header: 'Exam Fee', 
            accessor: 'exam_fee',
            render: (r) => (
                <span className="text-xs font-bold text-slate-500">₹{Number(r.exam_fee).toLocaleString()}</span>
            )
        },
        { 
            header: 'Admission', 
            accessor: 'admission_fee',
            render: (r) => (
                <span className="text-xs font-bold text-slate-500">₹{Number(r.admission_fee).toLocaleString()}</span>
            )
        },
        { 
            header: 'Total Amount', 
            accessor: 'total_amount',
            render: (r) => (
                <span className="text-sm font-black text-emerald-600">
                    ₹{Number(r.total_amount).toLocaleString('en-IN')}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (r) => (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                    r.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {r.status || 'Active'}
                </span>
            )
        }
    ];

    const handleDelete = async (r) => {
        if (window.confirm(`Are you sure you want to delete the fee configuration for ${r.course_name}?`)) {
            try {
                const res = await feeStructureApi.deleteFeeStructure(r.fee_id);
                if (res.success) {
                    toast.success("Configuration deleted from database");
                    fetchFeeStructures();
                }
            } catch (err) {
                toast.error("Failed to delete configuration");
            }
        }
    };

    const openEditModal = (r) => {
        setEditingFee({ ...r });
        setIsEditModalOpen(true);
    };

    const openViewModal = (r) => {
        setViewingFee(r);
        setIsViewModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            // Recalculate total
            const total = Number(editingFee.tuition_fee || 0) + Number(editingFee.admission_fee || 0) + Number(editingFee.exam_fee || 0) + Number(editingFee.other_fee || 0);
            const payload = {
                ...editingFee,
                total_amount: total
            };
            
            const res = await feeStructureApi.updateFeeStructure(editingFee.fee_id, payload);
            if (res.success) {
                toast.success("Fee structure updated successfully!");
                setIsEditModalOpen(false);
                fetchFeeStructures();
            }
        } catch (err) {
            toast.error("Failed to update fee structure");
        }
    };

    const filteredFees = allFeeStructures.filter(r => 
        (r.course_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.course_id || "").toString().includes(searchQuery)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Fee Structure</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Standardized fee configurations for <span className="text-primary font-bold">{currentInstitution?.name || 'Main Campus'}</span>.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={fetchFeeStructures} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
                    <Button icon={Plus}>Add Configuration</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={BookOpen} label="Total Entries" value={stats.totalEntries} color="#2563eb" bg="bg-blue-50" />
                <StatCard icon={TrendingUp} label="Fees Defined" value={`₹${(stats.totalFees / 1000).toFixed(0)}k`} color="#10b981" bg="bg-emerald-50" />
                <StatCard icon={Layers} label="Courses" value={stats.coursesCovered} color="#7c3aed" bg="bg-purple-50" />
                <StatCard icon={Calendar} label="Acad. Year" value={stats.acadYear} color="#f59e0b" bg="bg-amber-50" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
                <div className="flex items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                            <BookOpen size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Configuration Matrix</h2>
                    </div>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search course or year..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredFees}
                    loading={loading}
                    renderActions={(r) => (
                        <div className="flex justify-end gap-1">
                            <button onClick={() => openViewModal(r)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View Fee Structure">
                                <BookOpen size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Edit Fee Structure">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button 
                                onClick={() => handleDelete(r)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Fee Structure"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    )}
                    pagination={true}
                    totalPages={1}
                />
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Fee Structure"
            >
                {editingFee && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Course Name</label>
                            <input 
                                type="text" 
                                value={editingFee.course_name || ''} 
                                disabled
                                className="w-full px-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm font-semibold text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Tuition Fee</label>
                                <input 
                                    type="number" 
                                    value={editingFee.tuition_fee || 0} 
                                    onChange={(e) => setEditingFee({...editingFee, tuition_fee: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Admission Fee</label>
                                <input 
                                    type="number" 
                                    value={editingFee.admission_fee || 0} 
                                    onChange={(e) => setEditingFee({...editingFee, admission_fee: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Fee</label>
                                <input 
                                    type="number" 
                                    value={editingFee.exam_fee || 0} 
                                    onChange={(e) => setEditingFee({...editingFee, exam_fee: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Other Fee</label>
                                <input 
                                    type="number" 
                                    value={editingFee.other_fee || 0} 
                                    onChange={(e) => setEditingFee({...editingFee, other_fee: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                />
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
                title="Fee Structure Details"
            >
                {viewingFee && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <BookOpen size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{viewingFee.course_name || 'N/A'}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course ID: #{viewingFee.course_id}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Tuition Fee</span>
                                <span className="text-sm font-bold text-slate-800">₹{Number(viewingFee.tuition_fee || 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Admission Fee</span>
                                <span className="text-sm font-bold text-slate-800">₹{Number(viewingFee.admission_fee || 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Exam Fee</span>
                                <span className="text-sm font-bold text-slate-800">₹{Number(viewingFee.exam_fee || 0).toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Other Fee</span>
                                <span className="text-sm font-bold text-slate-800">₹{Number(viewingFee.other_fee || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50 p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Total Amount</span>
                                <span className="text-xl font-black text-emerald-700">₹{Number(viewingFee.total_amount || 0).toLocaleString()}</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${
                                viewingFee.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}>
                                {viewingFee.status || 'Active'}
                            </span>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button onClick={() => setIsViewModalOpen(false)}>Close View</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group`}>
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

export default FeeStructure;
