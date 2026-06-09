import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  PieChart as PieIcon,
  Activity,
  FileText,
  Search,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/apiClient';
import Button from '../components/common/Button';
import Table from '../components/common/Table';

const Reports = () => {
  const { currentInstitution } = useAuth();
  const { addToast } = useToast();
  
  // State Management (Step 6)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportLogs, setReportLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [summaryStats, setSummaryStats] = useState([]);

  // 1. Fetch Report Data (Step 3)
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would be specialized endpoints
      const statsData = await apiClient.get('/dashboard', { params: { institutionId: currentInstitution?.id } });
      const logsData = await apiClient.get('/merge-logs'); // Using merge logs as placeholder for activity/report logs
      
      setSummaryStats(statsData.stats || []);
      setReportLogs(logsData.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentInstitution, addToast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // UI Components (Table Columns for Reports - Step 2 requirement)
  const columns = [
    { 
      header: 'Report Name', 
      accessor: 'action',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <FileText size={14} />
          </div>
          <span className="text-sm font-bold text-slate-800">{row.action || 'System Audit'}</span>
        </div>
      )
    },
    { 
      header: 'Category', 
      accessor: 'status',
      render: (row) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
          {row.status === 'Success' ? 'Management' : 'System'}
        </span>
      )
    },
    { 
      header: 'Generation Date', 
      accessor: 'created_at',
      render: (row) => <span className="text-xs font-bold text-slate-400">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`text-[10px] font-black uppercase tracking-widest ${row.status === 'Success' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {row.status}
        </span>
      )
    }
  ];

  const filteredLogs = reportLogs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-1 text-[2.5rem]">Analytics & Reports</h1>
          <p className="text-slate-500 font-medium">Data summaries and audit logs for <span className="text-primary font-bold">{currentInstitution?.name || 'Global System'}</span>.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={fetchReportData} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
          <Button icon={Plus}>Generate Report</Button>
        </div>
      </div>

      {/* Stats Summary (Analytics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.length > 0 ? summaryStats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
              <div className={`flex items-center gap-1 mb-1 ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                <span className="text-xs font-black">{stat.change}</span>
              </div>
            </div>
          </div>
        )) : (
          Array(4).fill(0).map((_, i) => (
             <div key={i} className="h-28 bg-white/50 border border-slate-100 rounded-[40px] animate-pulse" />
          ))
        )}
      </div>

      {/* Step 2: Search / Filters & Table View */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
           <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Report Generation History
           </h2>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {error ? (
          <div className="p-12 text-center text-rose-500 font-bold bg-rose-50 border-2 border-rose-100 rounded-[40px] animate-in bounce-in">
             {error}
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={filteredLogs} 
            loading={loading}
            totalEntries={filteredLogs.length}
            entriesPerPage={5}
            onEdit={(row) => addToast('Downloading generated report...', 'info')}
            renderActions={(row) => <Button variant="outline" size="sm" icon={Download}>PDF</Button>}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <BarChart3 size={24} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Academic Trends</h2>
            </div>
          </div>
          <div className="flex-1 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-end justify-between p-10 h-64 gap-4">
            {[70, 45, 80, 55, 90, 65, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded-full hover:bg-primary transition-all duration-300 cursor-pointer" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <PieIcon size={24} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-800">Budget Allocation</h2>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {[
              { label: 'Operations', value: 65, color: 'bg-primary' },
              { label: 'Staff Payroll', value: 25, color: 'bg-emerald-500' },
              { label: 'Infrastructure', value: 10, color: 'bg-slate-300' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>{item.label}</span>
                  <span className="text-slate-800">{item.value}%</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
