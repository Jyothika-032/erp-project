import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Search, MapPin, Phone, Mail, CheckCircle2, RefreshCw, Filter, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import institutionApi from '../api/institutionApi';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const Institutions = () => {
  const { currentInstitution, switchInstitution } = useAuth();
  const { addToast } = useToast();
  
  // State Management (Step 6)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    email: '',
    phone: '',
    status: 'Active'
  });

  // 1. Fetch Institutions (Step 3)
  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await institutionApi.getAll();
      setInstitutions(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // 2. Handle CRUD - Create/Update (Step 6)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      return addToast('Institution ID and Name are required.', 'warning');
    }

    try {
      await institutionApi.create(formData);
      addToast('Institution registered successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ id: '', name: '', address: '', email: '', phone: '', status: 'Active' });
      fetchInstitutions();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const columns = [
    { 
      header: 'Institution', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{row.name}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.id}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Contact Info', 
      accessor: 'email',
      render: (row) => (
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Mail size={12} className="text-slate-400" /> {row.email}
          </p>
          <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
            <Phone size={12} /> {row.phone || 'N/A'}
          </p>
        </div>
      )
    },
    { 
      header: 'Address', 
      accessor: 'address',
      render: (row) => (
        <p className="text-xs font-medium text-slate-500 max-w-xs truncate">{row.address}</p>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className={`text-[10px] font-black tracking-widest uppercase ${row.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}`}>
            {row.status}
          </span>
        </div>
      )
    },
  ];

  const filteredData = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inst.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Institution Management</h1>
          <p className="text-slate-500 font-medium">Manage and switch between your educational branches.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchInstitutions} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Reload</Button>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Add Institution</Button>
        </div>
      </div>

      {/* Step 2: Search / Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID or name..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto text-xs font-black text-slate-400 uppercase tracking-widest">
           Total Records: <span className="text-primary">{institutions.length}</span>
        </div>
      </div>

      {/* Step 2: Table View & Pagination (Step 6 Loading/Error States) */}
      {error ? (
        <div className="p-12 bg-white rounded-[40px] border-2 border-dashed border-rose-100 text-center space-y-4">
           <p className="text-rose-500 font-bold">{error}</p>
           <Button onClick={fetchInstitutions}>Try Again</Button>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredData} 
          loading={loading}
          totalEntries={filteredData.length}
          onEdit={(row) => {
            setFormData({ ...row });
            setIsModalOpen(true);
          }}
          onDelete={(row) => addToast('Delete is disabled for initial branches.', 'warning')}
          renderActions={(row) => (
             <Button 
                variant="secondary" 
                size="sm" 
                className={`rounded-xl px-4 ${currentInstitution?.id === row.id ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}`}
                onClick={() => switchInstitution(row.id)}
             >
                {currentInstitution?.id === row.id ? 'Active' : 'Switch'}
             </Button>
          )}
        />
      )}

      {/* Step 4: Reusable Modal for Adding */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Institution Registration"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Register Branch</Button>
          </>
        )}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Institution ID (Unique)" 
              placeholder="e.g. KOCHI-01" 
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              required
            />
            <Input 
              label="Branch Name" 
              placeholder="e.g. ABC Academy Kochi" 
              icon={Building2} 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Email" 
              placeholder="admin@branch.com" 
              icon={Mail} 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Phone" 
              placeholder="+91 000 000 0000" 
              icon={Phone} 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <Input 
            label="Address" 
            placeholder="Complete physical address" 
            icon={MapPin}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Institutions;
