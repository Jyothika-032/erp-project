import React, { useState, useEffect, useCallback } from 'react';
import { GitMerge, ArrowRight, History, Search, Plus, RefreshCw, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import mergeLogApi from '../../api/mergeLogApi';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const InstitutionMergeLog = () => {
  const { addToast } = useToast();
  
  // State Management (Step 6)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Execution
  const [mergeForm, setMergeForm] = useState({
    source_id: '',
    target_id: '',
    remarks: ''
  });

  // 1. Fetch Logs (Step 3)
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mergeLogApi.getAll();
      setLogs(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 2. Handle Execute Merge Action (Step 6)
  const handleExecuteMerge = async (e) => {
    e.preventDefault();
    if (!mergeForm.source_id || !mergeForm.target_id) {
      return addToast('Both source and target IDs are required.', 'warning');
    }

    try {
      setLoading(true);
      await mergeLogApi.create(mergeForm);
      addToast('Institution merge operation initiated.', 'success');
      setIsModalOpen(false);
      setMergeForm({ source_id: '', target_id: '', remarks: '' });
      fetchLogs();
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: 'Operation', 
      accessor: 'action',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <GitMerge size={16} />
          </div>
          <span className="text-sm font-bold text-slate-800">{row.action || 'Institution Merge'}</span>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'completed' || row.status === 'Success' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-rose-500" />}
          <span className={`text-[10px] font-black uppercase tracking-widest ${row.status === 'completed' || row.status === 'Success' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {row.status}
          </span>
        </div>
      )
    },
    { 
      header: 'Details', 
      accessor: 'details',
      render: (row) => <p className="text-xs font-medium text-slate-500 max-w-xs truncate">{row.details || row.merge_reason}</p>
    },
    { 
      header: 'Timestamp', 
      accessor: 'merge_date',
      render: (row) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(row.merge_date).toLocaleString()}</span>
    }
  ];

  const filteredLogs = logs.filter(log => {
    const actionStr = log.action || 'Institution Merge';
    const detailsStr = log.details || log.merge_reason || '';
    return actionStr.toLowerCase().includes(searchQuery.toLowerCase()) || 
           detailsStr.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Institution Merge Audit</h1>
          <p className="text-slate-500 font-medium tracking-tight font-['Inter']">Audit trail of database consolidation and branch merging operations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchLogs} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync logs</Button>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Execute Merge</Button>
        </div>
      </div>

      {/* Step 2: Search / Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search merge history..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-xs font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
           Current Audit Log entries: <span className="text-primary font-black ml-1">{logs.length}</span>
        </div>
      </div>

      {/* Step 2: Table View & Pagination (Step 6 Loading/Error States) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
           <History size={18} className="text-primary" />
           <h2 className="text-lg font-black text-slate-800">Operational Log Trail</h2>
        </div>
        {error ? (
          <div className="p-12 text-center text-rose-500 font-black bg-rose-50 border border-rose-100 rounded-[40px]">
             {error}
          </div>
        ) : (
          <Table 
            columns={columns} 
            data={filteredLogs} 
            loading={loading}
            totalEntries={filteredLogs.length}
            entriesPerPage={5}
            actions={false}
          />
        )}
      </div>

      {/* Step 4: Reusable Modal for Execution Action */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Execute Database Merge"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleExecuteMerge} loading={loading}>Initiate Sync</Button>
          </>
        )}
      >
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
             <AlertCircle className="text-amber-500 mt-0.5" size={20} />
             <p className="text-xs font-bold text-amber-700 leading-relaxed italic">
                Warning: Merging institutions will consolidate all child records into the target branch and remove the source institution permanently.
             </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Input 
                label="Source Institution ID" 
                placeholder="ID to be merged" 
                value={mergeForm.source_id}
                onChange={(e) => setMergeForm({...mergeForm, source_id: e.target.value})}
                required
             />
             <div className="flex items-center justify-center pt-6">
                <ArrowRight size={24} className="text-slate-300" />
             </div>
             <Input 
                label="Target Institution ID" 
                placeholder="New primary branch ID" 
                value={mergeForm.target_id}
                onChange={(e) => setMergeForm({...mergeForm, target_id: e.target.value})}
                required
             />
          </div>
          <Input 
             label="Execution Remarks" 
             placeholder="Mandatory audit trail reason..." 
             value={mergeForm.remarks}
             onChange={(e) => setMergeForm({...mergeForm, remarks: e.target.value})}
             required
          />
        </div>
      </Modal>
    </div>
  );
};

export default InstitutionMergeLog;
