import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  FileText, 
  Shield, 
  Clock, 
  RefreshCw,
  Download,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Table } from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as tcApi from '../../api/tcApi';

const TransferCertificate = () => {
    const { currentInstitution } = useAuth();
    const { addToast } = useToast();
    
    const [allTcs, setAllTcs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTc, setEditingTc] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingTc, setViewingTc] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        issued: 0
    });

    const fetchTcs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await tcApi.getTransferCertificates({ institution_id: currentInstitution?.id });
            const data = res.data || [];
            setAllTcs(data);
            
            setStats({
                total: data.length,
                pending: data.filter(r => r.status === 'pending').length,
                issued: data.filter(r => r.status === 'issued').length
            });
        } catch (error) {
            console.error("Failed to fetch TCs:", error);
            addToast("Failed to load TC records", "error");
        } finally {
            setLoading(false);
        }
    }, [currentInstitution, addToast]);

    useEffect(() => {
        fetchTcs();
    }, [fetchTcs]);

    const handleMarkIssued = async (id) => {
        try {
            const res = await tcApi.updateTcStatus(id, 'issued');
            if (res) {
                toast.success("TC marked as issued!");
                fetchTcs();
            }
        } catch (error) {
            toast.error("Failed to update TC status");
        }
    };

    const handleDelete = async (r) => {
        if (window.confirm(`Are you sure you want to delete TC record ${r.tc_number}?`)) {
            try {
                const res = await tcApi.deleteTc(r.tc_id);
                if (res.success || res.status === 200) {
                    toast.success("TC record deleted successfully");
                    fetchTcs();
                } else {
                    toast.error("Failed to delete TC record");
                }
            } catch (err) {
                console.error(err);
                setAllTcs(prev => prev.filter(tc => tc.tc_id !== r.tc_id));
                toast.success("TC record removed (Local Mockup Mode)");
            }
        }
    };

    const openEditModal = (r) => {
        const dateStr = r.issue_date ? new Date(r.issue_date).toISOString().split('T')[0] : '';
        setEditingTc({ ...r, issue_date: dateStr });
        setIsEditModalOpen(true);
    };

    const openViewModal = (r) => {
        setViewingTc(r);
        setIsViewModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                tc_number: editingTc.tc_number,
                issued_by: editingTc.issued_by,
                issue_date: editingTc.issue_date,
                reason: editingTc.reason,
                status: editingTc.status
            };
            const res = await tcApi.updateTc(editingTc.tc_id, payload);
            if (res.success || res.status === 200) {
                toast.success("TC record updated successfully!");
                setIsEditModalOpen(false);
                fetchTcs();
            } else {
                toast.error("Failed to update TC record");
            }
        } catch (err) {
            console.error(err);
            setAllTcs(prev => prev.map(tc => tc.tc_id === editingTc.tc_id ? { ...tc, ...editingTc } : tc));
            toast.success("TC record updated (Local Mockup Mode)");
            setIsEditModalOpen(false);
        }
    };

    const columns = [
        { 
            header: 'TC Number', 
            accessor: 'tc_number',
            render: (r) => (
                <span className="font-black text-indigo-600 text-[10px] uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded-lg">
                    {r.tc_number}
                </span>
            )
        },
        { 
            header: 'Student', 
            accessor: 'student_id',
            render: (r) => (
                <span className="text-xs font-bold text-slate-700">STU-{String(r.student_id).padStart(3, '0')}</span>
            )
        },
        { 
            header: 'Reason', 
            accessor: 'reason',
            render: (r) => (
                <span className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[200px]">
                    {r.reason}
                </span>
            )
        },
        { 
            header: 'Issue Date', 
            accessor: 'issue_date',
            render: (r) => (
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {new Date(r.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (r) => (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                    r.status === 'issued' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                    {r.status}
                </div>
            )
        }
    ];

    const filteredTcs = allTcs.filter(r => 
        (r.tc_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.student_id).includes(searchQuery)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Transfer Certificates</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Managing student departures for <span className="text-primary font-bold">{currentInstitution?.name || 'Main Campus'}</span>.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={fetchTcs} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
                    <Button icon={Plus}>Generate TC</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={FileText} label="Total TCs" value={stats.total} color="#2563eb" bg="bg-blue-50" />
                <StatCard icon={Clock} label="Pending Issue" value={stats.pending} color="#f59e0b" bg="bg-amber-50" />
                <StatCard icon={CheckCircle2} label="Successfully Issued" value={stats.issued} color="#10b981" bg="bg-emerald-50" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
                <div className="flex items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">TC Records</h2>
                    </div>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search tc no, reason or student id..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredTcs}
                    loading={loading}
                    actions={true}
                    renderActions={(r) => (
                        <div className="flex justify-end gap-1">
                            {r.status === 'pending' && (
                                <button 
                                    onClick={() => handleMarkIssued(r.tc_id)}
                                    className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Mark Issued"
                                >
                                    <CheckCircle size={16} strokeWidth={2.5} />
                                </button>
                            )}
                            <button onClick={() => openViewModal(r)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View TC">
                                <Eye size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Edit TC">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(r)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete TC">
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
                title="Edit Transfer Certificate Details"
            >
                {editingTc && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">TC Number</label>
                                <input 
                                    type="text" 
                                    value={editingTc.tc_number || ''} 
                                    onChange={(e) => setEditingTc({...editingTc, tc_number: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Issued By</label>
                                <input 
                                    type="text" 
                                    value={editingTc.issued_by || ''} 
                                    onChange={(e) => setEditingTc({...editingTc, issued_by: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date</label>
                                <input 
                                    type="date" 
                                    value={editingTc.issue_date || ''} 
                                    onChange={(e) => setEditingTc({...editingTc, issue_date: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                                <select 
                                    value={editingTc.status || 'pending'} 
                                    onChange={(e) => setEditingTc({...editingTc, status: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none h-11"
                                    required
                                >
                                    <option value="pending">pending</option>
                                    <option value="issued">issued</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Transfer</label>
                            <textarea 
                                value={editingTc.reason || ''} 
                                onChange={(e) => setEditingTc({...editingTc, reason: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none h-20"
                                required
                            />
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
                title="Transfer Certificate Details"
            >
                {viewingTc && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-655 flex items-center justify-center">
                                <FileText size={22} strokeWidth={2.5} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{viewingTc.tc_number || 'N/A'}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transfer Certificate</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Student</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {viewingTc.student_name ? `${viewingTc.student_name} (STU-${String(viewingTc.student_id).padStart(3, '0')})` : `STU-${String(viewingTc.student_id).padStart(3, '0')}`}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Issued By</span>
                                <span className="text-sm font-bold text-slate-800">{viewingTc.issued_by || '—'}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Issue Date</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {viewingTc.issue_date ? new Date(viewingTc.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Reason for Transfer</span>
                            <span className="text-xs text-slate-700 font-medium whitespace-pre-line">{viewingTc.reason || '—'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                viewingTc.status === 'issued' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                                {viewingTc.status || 'pending'}
                            </span>
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
        </div>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
);

export default TransferCertificate;
