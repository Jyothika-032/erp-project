import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  LayoutDashboard,
  RefreshCw,
  Plus,
  Search,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/apiClient';
import Button from '../components/common/Button';
import Table from '../components/common/Table';

const Dashboard = () => {
  const { currentInstitution } = useAuth();
  const { addToast } = useToast();
  
  // State Management (Step 6)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Dashboard Data (Step 3)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/dashboard', {
        params: { institutionId: currentInstitution?.id }
      });
      
      // Map icons to stats
      const icons = [Users, UserCheck, DollarSign, TrendingUp];
      setStats(data.stats.map((s, i) => ({
        ...s,
        icon: icons[i % icons.length]
      })));
      
      setActivities(data.recentActivity || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentInstitution, addToast]);

  useEffect(() => {
    fetchDashboardData();
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
          <span className="text-sm font-bold text-slate-800">{row.action}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          row.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Details', 
      accessor: 'details',
      render: (row) => <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{row.details}</p>
    },
    { 
      header: 'Timestamp', 
      accessor: 'created_at',
      render: (row) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(row.created_at).toLocaleString()}</span>
    }
  ];

  const filteredActivities = activities.filter(act => 
    act.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    act.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">System Dashboard</h1>
          <p className="text-slate-500 font-medium tracking-tight">Overview and system metrics for <span className="text-primary font-bold">{currentInstitution?.name || 'All Branches'}</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchDashboardData} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Refresh Stats</Button>
          <Button icon={Plus}>Quick Action</Button>
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
