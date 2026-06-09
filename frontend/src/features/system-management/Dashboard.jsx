import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Building2,
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Plus,
  Search,
  Activity,
  Clock,
  UserPlus,
  GraduationCap,
  DollarSign,
  FileText,
  Briefcase,
  BarChart2,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

// Icon mapping per stat label
const STAT_ICONS = {
  'Total Students': Users,
  'Staff Members': UserCheck,
  'Placements': TrendingUp,
  'Institutions': Building2,
};

const QUICK_ACTIONS = [
  { label: 'Add Student',    icon: UserPlus,      path: '/students/new' },
  { label: 'Add Staff',      icon: UserCheck,     path: '/staff/new' },
  { label: 'New Admission',  icon: GraduationCap, path: '/admission' },
  { label: 'New Payment',    icon: DollarSign,    path: '/finance/payments/new' },
  { label: 'Add Placement',  icon: Briefcase,     path: '/placements/new' },
  { label: 'View Reports',   icon: BarChart2,     path: '/reports' },
];

const Dashboard = () => {
  const { currentInstitution } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const intervalRef = useRef(null);
  const quickActionsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Always fetch global totals for the system dashboard
      const data = await apiClient.get('/dashboard', {
        params: { institutionId: 'all' }
      });
      
      // Map icons based on stat label for correct matching
      setStats(data.stats.map((s) => ({
        ...s,
        icon: STAT_ICONS[s.label] || Users
      })));
      
      setActivities(data.recentActivity || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
      if (!silent) addToast(err.message, 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds to reflect DB changes
    intervalRef.current = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchDashboardData]);

  // UI Components (Table Columns for Recent Activity - Step 2 requirement)
  const columns = [
    { 
      header: 'Operation', 
      accessor: 'action',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Activity size={14} />
          </div>
          <span className="text-sm font-bold text-slate-800">{row.action || 'Institution Merge'}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          row.status === 'completed' || row.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Details', 
      accessor: 'details',
      render: (row) => <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{row.details || row.merge_reason}</p>
    },
    { 
      header: 'Timestamp', 
      accessor: 'merge_date',
      render: (row) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(row.merge_date).toLocaleString()}</span>
    }
  ];

  const filteredActivities = activities.filter(act => {
    const actionStr = act.action || 'Institution Merge';
    const detailsStr = act.details || act.merge_reason || '';
    return actionStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
           detailsStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">System Dashboard</h1>
          <div className="flex items-center gap-3">
            <p className="text-slate-500 font-medium tracking-tight">Overview and system metrics for <span className="text-primary font-bold">{currentInstitution?.name || 'All Branches'}</span>.</p>
            {lastUpdated && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={10} />
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => fetchDashboardData(false)} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Refresh Stats</Button>
          {/* Quick Action Dropdown */}
          <div className="relative" ref={quickActionsRef}>
            <button
              onClick={() => setShowQuickActions((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              Quick Action
              <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${showQuickActions ? 'rotate-180' : ''}`} />
            </button>
            {showQuickActions && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => { navigate(action.path); setShowQuickActions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <action.icon size={16} className="text-primary" />
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white/50 border border-slate-100 rounded-[32px] animate-pulse" />
          ))
        ) : (
          stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <stat.icon size={22} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center gap-1 group-hover:scale-110 transition-transform ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.isUp ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                  <span className="text-xs font-black">{stat.change}</span>
                </div>
              </div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Step 2: Table View & Pagination for Recent Activity */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
               <Activity size={20} className="text-primary" />
               Recent System Activity
            </h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search activity logs..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Table 
            columns={columns} 
            data={filteredActivities} 
            loading={loading}
            totalEntries={filteredActivities.length}
            entriesPerPage={5}
            actions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
