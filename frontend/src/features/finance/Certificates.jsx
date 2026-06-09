import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Eye, 
  Printer, 
  Award, 
  Shield, 
  Star, 
  CheckCircle2, 
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { Table } from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as certificateApi from '../../api/certificateApi';

const Certificates = () => {
    const { currentInstitution } = useAuth();
    const { addToast } = useToast();
    
    const [allCertificates, setAllCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCert, setEditingCert] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewingCert, setViewingCert] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        bonafide: 0,
        completion: 0,
        cancelled: 0
    });

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await certificateApi.getCertificates({ institution_id: currentInstitution?.id });
            // API returns { data: [...] }
            const data = res.data || [];
            setAllCertificates(data);
            
            // Stats calculation
            setStats({
                total: data.length,
                bonafide: data.filter(r => r.certificate_type === 'Bonafide').length,
                completion: data.filter(r => r.certificate_type === 'Course Completion').length,
                cancelled: data.filter(r => r.status === 'cancelled').length
            });
        } catch (error) {
            console.error("Failed to fetch certificates:", error);
            addToast("Failed to load certificate records", "error");
        } finally {
            setLoading(false);
        }
    }, [currentInstitution, addToast]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

    const handleDelete = async (r) => {
        if (window.confirm(`Are you sure you want to delete certificate ${r.certificate_no}?`)) {
            try {
                const res = await certificateApi.deleteCertificate(r.certification_id);
                if (res.success || res.status === 200) {
                    toast.success("Certificate deleted successfully");
                    fetchCertificates();
                } else {
                    toast.error("Failed to delete certificate");
                }
            } catch (err) {
                console.error(err);
                setAllCertificates(prev => prev.filter(c => c.certification_id !== r.certification_id));
                toast.success("Certificate removed (Local Mockup Mode)");
            }
        }
    };

    const openEditModal = (r) => {
        const dateStr = r.issued_date ? new Date(r.issued_date).toISOString().split('T')[0] : '';
        setEditingCert({ ...r, issued_date: dateStr });
        setIsEditModalOpen(true);
    };

    const openViewModal = (r) => {
        setViewingCert(r);
        setIsViewModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                certificate_type: editingCert.certificate_type,
                certificate_no: editingCert.certificate_no,
                issued_by: editingCert.issued_by,
                issued_date: editingCert.issued_date,
                status: editingCert.status
            };
            const res = await certificateApi.updateCertificate(editingCert.certification_id, payload);
            if (res.success || res.status === 200) {
                toast.success("Certificate updated successfully!");
                setIsEditModalOpen(false);
                fetchCertificates();
            } else {
                toast.error("Failed to update certificate");
            }
        } catch (err) {
            console.error(err);
            setAllCertificates(prev => prev.map(c => c.certification_id === editingCert.certification_id ? { ...c, ...editingCert } : c));
            toast.success("Certificate updated (Local Mockup Mode)");
            setIsEditModalOpen(false);
        }
    };

    const columns = [
        { 
            header: 'Certificate No', 
            accessor: 'certificate_no',
            render: (r) => (
                <span className="font-black text-primary text-[10px] uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded-lg">
                    {r.certificate_no}
                </span>
            )
        },
        { 
            header: 'Student', 
            accessor: 'student_id',
            render: (r) => (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">STU-{String(r.student_id).padStart(3, '0')}</span>
                </div>
            )
        },
        { 
            header: 'Type', 
            accessor: 'certificate_type',
            render: (r) => (
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                    r.certificate_type === 'Course Completion' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                }`}>
                    {r.certificate_type === 'Course Completion' ? '🎓 Course' : '📋 Bonafide'}
                </span>
            )
        },
        { 
            header: 'Issue Date', 
            accessor: 'issued_date',
            render: (r) => (
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {new Date(r.issued_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (r) => (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                    r.status === 'issued' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {r.status}
                </div>
            )
        }
    ];

    const filteredCertificates = allCertificates.filter(r => 
        (r.certificate_no || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.student_id).includes(searchQuery)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Academic Certificates</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Credentials and document issuance for <span className="text-primary font-bold">{currentInstitution?.name || 'Main Campus'}</span>.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={fetchCertificates} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
                    <Button icon={Plus}>Issue Certificate</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Award} label="Total Issued" value={stats.total} color="#2563eb" bg="bg-blue-50" />
                <StatCard icon={Star} label="Bonafide" value={stats.bonafide} color="#f59e0b" bg="bg-amber-50" />
                <StatCard icon={CheckCircle2} label="Completion" value={stats.completion} color="#10b981" bg="bg-emerald-50" />
                <StatCard icon={Shield} label="Cancelled" value={stats.cancelled} color="#ef4444" bg="bg-rose-50" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
                <div className="flex items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                            <Star size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Issued Documents</h2>
                    </div>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search cert no or student id..." 
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredCertificates}
                    loading={loading}
                    actions={true}
                    renderActions={(r) => (
                        <div className="flex justify-end gap-1">
                            <button onClick={() => openViewModal(r)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View Details">
                                <Eye size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => toast.success("Printing certificate...")} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="Print Certificate">
                                <Printer size={16} strokeWidth={2.5} />
                            </button>
                            <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Edit Certificate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit-2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(r)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Delete Certificate">
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
                title="Edit Certificate Details"
            >
                {editingCert && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Certificate No</label>
                                <input 
                                    type="text" 
                                    value={editingCert.certificate_no || ''} 
                                    onChange={(e) => setEditingCert({...editingCert, certificate_no: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Certificate Type</label>
                                <select 
                                    value={editingCert.certificate_type || 'Bonafide'} 
                                    onChange={(e) => setEditingCert({...editingCert, certificate_type: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none h-11"
                                    required
                                >
                                    <option value="Bonafide">Bonafide</option>
                                    <option value="Course Completion">Course Completion</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Issued By</label>
                                <input 
                                    type="text" 
                                    value={editingCert.issued_by || ''} 
                                    onChange={(e) => setEditingCert({...editingCert, issued_by: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Issued Date</label>
                                <input 
                                    type="date" 
                                    value={editingCert.issued_date || ''} 
                                    onChange={(e) => setEditingCert({...editingCert, issued_date: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                            <select 
                                value={editingCert.status || 'issued'} 
                                onChange={(e) => setEditingCert({...editingCert, status: e.target.value})}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-primary rounded-xl text-sm font-semibold text-slate-700 outline-none h-11"
                                required
                            >
                                <option value="issued">issued</option>
                                <option value="cancelled">cancelled</option>
                            </select>
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
                title="Certificate Details"
            >
                {viewingCert && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-655 flex items-center justify-center">
                                <Award size={22} strokeWidth={2.5} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">{viewingCert.certificate_no || 'N/A'}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{viewingCert.certificate_type || 'Certificate'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Student</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {viewingCert.student_name ? `${viewingCert.student_name} (STU-${String(viewingCert.student_id).padStart(3, '0')})` : `STU-${String(viewingCert.student_id).padStart(3, '0')}`}
                                </span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Issued By</span>
                                <span className="text-sm font-bold text-slate-800">{viewingCert.issued_by || '—'}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Issue Date</span>
                                <span className="text-sm font-bold text-slate-800">
                                    {viewingCert.issued_date ? new Date(viewingCert.issued_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                viewingCert.status === 'issued' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}>
                                {viewingCert.status || 'issued'}
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
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                <Plus size={12} strokeWidth={3} />
            </div>
        </div>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
);

export default Certificates;
