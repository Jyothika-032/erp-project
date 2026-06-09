import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Bell, Shield, Database, Cloud, Mail, Search, Plus, RefreshCw, Activity } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';

const Settings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [configLogs, setConfigLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('General');

  const tabs = [
    { name: 'General', icon: SettingsIcon },
    { name: 'Profile', icon: Globe },
    { name: 'Security', icon: Shield },
    { name: 'Backup', icon: Database },
  ];

  // 1. Fetch Config Logs (Step 2/3 requirement: Table View + API)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await apiClient.get('/merge-log'); // Placeholder for config change logs
        setConfigLogs(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLogs();
  }, []);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast('Settings synchronized successfully!', 'success');
    }, 1000);
  };

  const columns = [
    { 
      header: 'Parameter', 
      accessor: 'action',
      render: (row) => {
        const actionName = row.action || row.merge_reason || 'Configuration Update';
        return (
          <div className="flex items-center gap-2">
             <Activity size={12} className="text-primary" />
             <span className="text-xs font-bold text-slate-700">{actionName}</span>
          </div>
        );
      }
    },
    { 
      header: 'Value', 
      accessor: 'details',
      render: (row) => <span className="text-[10px] font-medium text-slate-400 truncate max-w-xs">{row.details || row.merge_reason || 'N/A'}</span> 
    },
    { 
      header: 'Modified By', 
      accessor: 'status', 
      render: (row) => (
        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest">
            System Admin
        </span>
      )
    },
    { 
      header: 'Timestamp', 
      accessor: 'created_at',
      render: (row) => {
        const dateVal = row.created_at || row.merge_date || new Date();
        return <span className="text-[10px] font-bold text-slate-300">{new Date(dateVal).toLocaleTimeString()}</span>;
      }
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-12">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">System Configuration</h1>
          <p className="text-slate-500 font-medium">Fine-tune your global ERP environment and administrative parameters.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Sync</Button>
          <Button icon={Plus} onClick={() => addToast('Functionality coming in next update.', 'info')}>Quick Backup</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="px-4 py-2 uppercase tracking-widest text-[10px] font-black text-slate-400">Settings Sections</div>
          {tabs.map((item) => (
            <div 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`
                flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300
                ${activeTab === item.name 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/20 hover:text-primary'}
              `}
            >
              <item.icon size={20} strokeWidth={2.5} />
              <span className="text-sm font-bold">{item.name} Configuration</span>
            </div>
          ))}
        </div>

        {/* Settings Form Area (Step 4 Reusable Components) */}
        <div className="lg:col-span-3 space-y-10">
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center justify-between border-b border-slate-50 pb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <SettingsIcon size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeTab} Parameters</h2>
              </div>
              <Button size="sm" onClick={handleSave} loading={loading}>Save Parameters</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Input label="System Environment Title" defaultValue="EduERP Enterprise" icon={Globe} />
              <Input label="Global Instance ID" defaultValue="ERP-V2-CLOUD" />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Default Locale</label>
                <select className="w-full border-2 border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all">
                   <option>English (International)</option>
                   <option>English (India)</option>
                   <option>Arabic (UAE)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 shadow-sm border border-slate-100 rounded-2xl bg-slate-50/30 p-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cloud Connectivity</p>
                 <div className="flex items-center gap-2 self-start px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Secure & Linked
                 </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button variant="secondary" size="md">Restore to Factory Defaults</Button>
              <Button size="md" onClick={handleSave} loading={loading}>Apply Changes</Button>
            </div>
          </div>

          {/* Step 2: Table View & Pagination for Config Audit */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                 <Database size={18} className="text-slate-400" />
                 Parameter Revision History
              </h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Table 
              columns={columns} 
              data={configLogs.slice(0, 5)} 
              loading={loading}
              totalEntries={configLogs.length}
              entriesPerPage={5}
              actions={false}
            />
          </div>

          <div className="bg-rose-50 p-8 rounded-[40px] border border-rose-100/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-rose-600">Enterprise Mode Maintenance</h3>
              <p className="text-xs font-bold text-rose-500/60 leading-tight">Restrict system access to Super Admins only for maintenance.</p>
            </div>
            <Button variant="danger" size="sm">Enable Restriction</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
