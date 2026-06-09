import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Eye, 
  Pencil, 
  Trash2, 
  TrendingUp, 
  Clock, 
  XCircle, 
  RefreshCw,
  DollarSign,
  Download,
  Filter,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';
import { Table } from '../../components/common/Table';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import * as paymentsApi from '../../api/paymentsApi';

const Payments = () => {
    const navigate = useNavigate();
    const { currentInstitution } = useAuth();
    const { addToast } = useToast();
    
    const [allPayments, setAllPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        count: 0,
        pending: 0,
        failed: 0
    });

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch without strict institution filter to show all 5 records as requested
            const res = await paymentsApi.getPayments(); 
            if (res.success) {
                const data = res.data || [];
                setAllPayments(data);
                
                // Calculate basic stats
                const total = data.filter(r => r.status === 'success').reduce((s, r) => s + Number(r.amount), 0);
                const pending = data.filter(r => r.status === 'pending').length;
                const failed = data.filter(r => r.status === 'failed').length;
                
                setStats({
                    total,
                    count: data.length,
                    pending,
                    failed
                });
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error);
            addToast("Failed to load financial records", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const handleExport = () => {
        if (!allPayments.length) return toast.error("No data to export");
        
        // CSV headers with BOM for Excel compatibility
        const headers = ["Receipt No", "Student Name", "Amount (INR)", "Method", "Reference ID", "Date", "Status", "Processed By"];
        const rows = allPayments.map(p => [
            `PAY-${p.payment_id}`,
            p.student_name || 'N/A',
            p.amount,
            p.payment_method,
            p.transaction_id || 'N/A',
            p.payment_date,
            p.status,
            p.received_by_name || `Staff #${p.received_by}`
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `EduERP_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Transaction log downloaded to your system");
    };

    const handleDelete = async (r) => {
        if (window.confirm(`Are you sure you want to delete receipt #PAY-${String(r.payment_id).padStart(4, '0')}? This action is permanent.`)) {
            try {
                const res = await paymentsApi.deletePayment(r.payment_id);
                if (res.success) {
                    toast.success("Payment record deleted from DB");
                    fetchPayments();
                }
            } catch (err) {
                console.error("Delete failed:", err);
                toast.error("Failed to delete record from DB");
            }
        }
    };

    const columns = [
        { 
            header: 'Receipt No', 
            accessor: 'payment_id',
            render: (r) => (
                <span className="font-black text-primary text-xs uppercase tracking-tighter">
                    #PAY-{String(r.payment_id).padStart(4, '0')}
                </span>
            )
        },
        { 
            header: 'Student', 
            accessor: 'student_name',
            render: (r) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                        {(r.student_name || "S")[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{r.student_name || 'Unknown Student'}</span>
                </div>
            )
        },
        { 
            header: 'Amount', 
            accessor: 'amount',
            render: (r) => (
                <span className="text-sm font-black text-emerald-600">
                    ₹{Number(r.amount).toLocaleString('en-IN')}
                </span>
            )
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (r) => (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                    r.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                    r.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {r.status}
                </div>
            )
        }
    ];

    const filteredPayments = allPayments.filter(r => 
        String(r.student_id).includes(searchQuery) || 
        (r.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Financial Transactions</h1>
                    <p className="text-slate-500 font-medium">Fee collection and revenue tracking for <span className="text-primary font-bold">{currentInstitution?.name || 'Main Campus'}</span>.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={fetchPayments} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
                    <Button onClick={() => navigate("/finance/payments/new")} icon={Plus}>Record Payment</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={CreditCard} label="Total Revenue" value={`₹${(stats.total / 1000).toFixed(1)}k`} color="#2563eb" bg="bg-blue-50" />
                <StatCard icon={TrendingUp} label="Total Count" value={stats.count} color="#10b981" bg="bg-emerald-50" />
                <StatCard icon={Clock} label="Pending Clear" value={stats.pending} color="#f59e0b" bg="bg-amber-50" />
                <StatCard icon={XCircle} label="Failed / Void" value={stats.failed} color="#ef4444" bg="bg-rose-50" />
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
                <div className="flex items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <DollarSign size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Transaction Log</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                                type="text" 
                                placeholder="Search student or txn..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleExport} variant="secondary" size="sm" icon={Download}>Export</Button>
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredPayments}
                    loading={loading}
                    renderActions={(r) => (
                        <div className="flex items-center justify-end gap-1">
                            <button 
                                onClick={() => navigate(`/finance/payments/${r.payment_id}`)}
                                title="View Receipt" 
                                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                            >
                                <Eye size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                                onClick={() => navigate(`/finance/payments/edit/${r.payment_id}`)}
                                title="Edit Transaction" 
                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            >
                                <Pencil size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                                onClick={() => handleDelete(r)}
                                title="Delete Record" 
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <Trash2 size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                    pagination={true}
                    totalPages={1}
                />
            </div>
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

export default Payments;
