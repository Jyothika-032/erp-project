import React, { useEffect, useState, useCallback } from "react";
import { 
  FileText, 
  MessageSquare, 
  Mail, 
  Search, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import commsApi from "../../api/commsApi";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

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

const CommunicationLogsPage = () => {
    const { addToast } = useToast();
    const { currentInstitution } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await commsApi.getLogs(currentInstitution?.id);
            if (res.success) {
                setLogs(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch comms logs:", error);
            addToast("Failed to load communication history", "error");
        } finally {
            setLoading(false);
        }
    }, [currentInstitution, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const totalLogs = logs.length;
    const smsCount = logs.filter(l => (l.type || '').toLowerCase() === 'sms').length;
    const emailCount = logs.filter(l => (l.type || '').toLowerCase() === 'email').length;
    const deliveredCount = logs.filter(l => (l.delivery_status || '').toLowerCase() === 'delivered').length;

    const columns = [
        { 
            header: "Recipient", 
            accessor: "recipient_name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {(row.recipient_name || "R")[0].toUpperCase()}
                    </div>
                    <div>
                        <span className="font-bold text-slate-800 block">{row.recipient_name || "Unknown Recipient"}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {row.student_id || "N/A"}</p>
                    </div>
                </div>
            )
        },
        { 
            header: "Type", 
            accessor: "type",
            render: (row) => {
                const type = (row.type || '').toLowerCase();
                let TypeIcon = MessageSquare;
                let iconColor = 'text-blue-500';
                if (type === 'email') {
                    TypeIcon = Mail;
                    iconColor = 'text-amber-500';
                } else if (type === 'chat') {
                    TypeIcon = MessageSquare;
                    iconColor = 'text-emerald-500';
                }
                return (
                    <div className="flex items-center gap-2">
                        <TypeIcon size={14} className={iconColor} />
                        <span className="text-xs font-bold text-slate-600 uppercase">{row.type}</span>
                    </div>
                );
            }
        },
        { 
            header: "Message & Subject", 
            accessor: "subject",
            render: (row) => (
                <div className="max-w-xs">
                    <p className="text-xs font-bold text-slate-800 truncate">{row.subject || "No Subject"}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{row.communication_message}</p>
                </div>
            )
        },
        { 
            header: "Sent At", 
            accessor: "sent_at",
            render: (row) => (
                <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <span className="text-xs font-medium">{new Date(row.sent_at).toLocaleString()}</span>
                </div>
            )
        },
        { 
            header: "Status", 
            accessor: "delivery_status",
            render: (row) => {
                const status = (row.delivery_status || '').toLowerCase();
                let badgeClass = 'bg-slate-50 text-slate-500';
                let StatusIcon = Clock;
                if (status === 'delivered') {
                    badgeClass = 'bg-emerald-50 text-emerald-600';
                    StatusIcon = CheckCircle2;
                } else if (status === 'failed') {
                    badgeClass = 'bg-rose-50 text-rose-600';
                    StatusIcon = AlertCircle;
                } else if (status === 'sent') {
                    badgeClass = 'bg-blue-50 text-blue-600';
                    StatusIcon = CheckCircle2;
                }
                return (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${badgeClass}`}>
                        <StatusIcon size={10} />
                        {row.delivery_status}
                    </div>
                );
            }
        }
    ];

    const filteredLogs = logs.filter(log => 
        (log.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.subject?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.communication_message?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Communication Logs</h1>
                    <p className="text-slate-500 font-medium">History of all SMS and Email notifications sent to students and parents.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={fetchData} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={MessageSquare} label="Total Sent" value={totalLogs} color="#2563eb" bg="bg-blue-50" />
                <StatCard icon={MessageSquare} label="SMS Sent" value={smsCount} color="#06b6d4" bg="bg-cyan-50" />
                <StatCard icon={Mail} label="Emails Sent" value={emailCount} color="#f59e0b" bg="bg-amber-50" />
                <StatCard icon={CheckCircle2} label="Delivered" value={deliveredCount} color="#10b981" bg="bg-emerald-50" />
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-2">
                <div className="flex items-center justify-between p-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <FileText size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">History Log</h2>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <Table
                    columns={columns}
                    data={filteredLogs}
                    loading={loading}
                    actions={false}
                    pagination={true}
                    totalPages={1}
                />
            </div>
        </div>
    );
};

export default CommunicationLogsPage;
