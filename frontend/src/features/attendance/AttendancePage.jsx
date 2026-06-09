import React, { useEffect, useState, useCallback } from "react";
import { 
  UserCheck, 
  Users, 
  Calendar, 
  Search, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import attendanceApi from "../../api/attendanceApi";
import { Table } from "../../components/common/Table";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const AttendancePage = () => {
    const { addToast } = useToast();
    const { currentInstitution } = useAuth();
    
    // UI State
    const [type, setType] = useState('students'); // 'students' or 'staff'
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Data State
    const [logs, setLogs] = useState([]);
    const [metadata, setMetadata] = useState({
        students: [],
        batches: [],
        courses: [],
        staff: []
    });

    // Filters
    const [filters, setFilters] = useState({
        course_id: "",
        batch_id: "",
        date: new Date().toISOString().split("T")[0]
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [attRes, stuRes, batRes, courRes, staRes] = await Promise.all([
                type === 'students' 
                    ? attendanceApi.getStudents(filters.batch_id, filters.date)
                    : attendanceApi.getTeachers(filters.date),
                attendanceApi.getStudentsList(),
                attendanceApi.getBatches(),
                attendanceApi.getCourses(),
                attendanceApi.getStaffList()
            ]);

            setLogs(attRes.data || []);
            setMetadata({ 
                students: stuRes.data || [], 
                batches: batRes.data || [], 
                courses: courRes.data || [], 
                staff: staRes.data || [] 
            });
        } catch (error) {
            console.error("Failed to fetch attendance data:", error);
            addToast("Failed to load records", "error");
        } finally {
            setLoading(false);
        }
    }, [type, filters.batch_id, filters.date, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleMarkStatus = async (item, status) => {
        const idField = type === 'students' ? 'student_id' : 'staff_id';
        const itemId = item[idField];
        
        const existingLog = logs.find(l => l[idField] === itemId);

        const payload = {
            [idField]: itemId,
            institution_id: currentInstitution?.id || 1,
            attendance_date: filters.date,
            status: status,
            marked_by: 1, // Placeholder for logged in user ID
            remarks: "Quick Mark"
        };

        if (type === 'students') {
            payload.course_id = item.course_id;
            payload.batch_id = item.batch_id;
        }

        try {
            // Since we don't have Update implemented in the new controller yet, 
            // we'll just treat everything as a new mark for now, or just implement POST.
            // For simplicity in this session, we only use the POST mark endpoint.
            if (type === 'students') await attendanceApi.markStudentAttendance(payload);
            else await attendanceApi.markTeacherAttendance(payload);
            
            addToast(`Marked ${item.student_name || item.staff_name} as ${status}`, "success");
            fetchData();
        } catch (err) {
            addToast("Failed to mark attendance", "error");
        }
    };

    const columns = [
        { 
            header: type === 'students' ? "Student" : "Staff Member", 
            accessor: type === 'students' ? "student_name" : "staff_name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        type === 'students' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                        {(row.student_name || row.staff_name || "U")[0]}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">{row.student_name || row.staff_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {type === 'students' ? `Batch: ${row.batch_name || "N/A"}` : row.designation}
                        </p>
                    </div>
                </div>
            )
        },
        { 
            header: "Quick Mark", 
            accessor: "status",
            render: (row) => {
                const idField = type === 'students' ? 'student_id' : 'staff_id';
                const log = logs.find(l => l[idField] === row[idField]);
                const status = log?.status;

                return (
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleMarkStatus(row, 'Present')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === 'Present' 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                            }`}
                        >
                            Present
                        </button>
                        <button 
                            onClick={() => handleMarkStatus(row, 'Absent')}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                status === 'Absent' 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'
                            }`}
                        >
                            Absent
                        </button>
                    </div>
                );
            }
        },
        { 
            header: "Status", 
            accessor: "status",
            render: (row) => {
                const idField = type === 'students' ? 'student_id' : 'staff_id';
                const log = logs.find(l => l[idField] === row[idField]);
                
                if (!log) return <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Not Marked</span>;

                return (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit ${
                        log.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                        {log.status === 'Present' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {log.status}
                    </div>
                );
            }
        },
        { 
            header: "Marked By", 
            accessor: "marked_by",
            render: (row) => {
                const idField = type === 'students' ? 'student_id' : 'staff_id';
                const log = logs.find(l => l[idField] === row[idField]);
                return <span className="text-xs font-bold text-slate-400">{log ? 'Admin' : '-'}</span>;
            }
        }
    ];

    const displayList = (type === 'students' ? metadata.students : metadata.staff).filter(item => {
        const matchesName = (item.student_name || item.staff_name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBatch = type === 'students' && filters.batch_id ? item.batch_id === parseInt(filters.batch_id) : true;
        return matchesName && matchesBatch;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-[24px] ${type === 'students' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {type === 'students' ? <Users size={32} /> : <UserCheck size={32} />}
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">
                            {type === 'students' ? 'Student Attendance' : 'Staff Attendance'}
                        </h1>
                        <p className="text-slate-500 font-medium">Daily tracking and logging for <span className="text-primary font-bold">{currentInstitution?.name || 'Main Campus'}</span>.</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setType('students')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Students
                    </button>
                    <button 
                        onClick={() => setType('staff')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'staff' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Staff
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input 
                                    type="text" 
                                    placeholder={`Search ${type}...`} 
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            {type === 'students' && (
                                <select 
                                    className="px-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-primary/20"
                                    value={filters.batch_id}
                                    onChange={(e) => setFilters({...filters, batch_id: e.target.value})}
                                >
                                    <option value="">Select Batch</option>
                                    {metadata.batches.map(b => <option key={b.batch_id} value={b.batch_id}>{b.batch_name}</option>)}
                                </select>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                <Calendar size={14} className="text-primary" />
                                <input 
                                    type="date" 
                                    className="bg-transparent border-none text-xs font-black text-slate-700 outline-none uppercase"
                                    value={filters.date}
                                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                                />
                            </div>
                            <Button variant="secondary" size="sm" onClick={fetchData} icon={RefreshCw} className={loading ? 'animate-spin' : ''} />
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={displayList}
                        loading={loading}
                        actions={false}
                        pagination={true}
                        totalPages={1}
                    />
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Activity size={80} />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Summary Metrics</h3>
                        <div className="space-y-6">
                            <div>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">{displayList.length}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Enrolled</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-100/50">
                                    <p className="text-xl font-black text-emerald-600">{logs.filter(l => l.status === 'Present').length}</p>
                                    <p className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest">Present</p>
                                </div>
                                <div className="p-4 bg-rose-50 rounded-3xl border border-rose-100/50">
                                    <p className="text-xl font-black text-rose-600">{logs.filter(l => l.status === 'Absent').length}</p>
                                    <p className="text-[9px] font-black text-rose-500/70 uppercase tracking-widest">Absent</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Rate</span>
                                    <span className="text-xs font-black text-primary">
                                        {displayList.length > 0 ? Math.round((logs.filter(l => l.status === 'Present').length / displayList.length) * 100) : 0}%
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary rounded-full transition-all duration-1000" 
                                        style={{ width: `${displayList.length > 0 ? (logs.filter(l => l.status === 'Present').length / displayList.length) * 100 : 0}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary p-8 rounded-[40px] text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <Clock size={120} />
                        </div>
                        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Quick Tip</h3>
                        <p className="text-sm font-bold leading-relaxed mb-6">
                            Marking attendance daily helps in generating accurate performance and behavioral reports for students.
                        </p>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white hover:text-primary transition-all">View History</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Activity = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

export default AttendancePage;
