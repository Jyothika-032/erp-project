import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Check, Search, Lock, RefreshCw, Filter, Users as UsersIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import roleApi from '../api/roleApi';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const Roles = () => {
  const { addToast } = useToast();
  
  // State Management (Step 6)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for New Role
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  // 1. Fetch Roles (Step 3)
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roleApi.getAll();
      setRoles(data.data);
      if (data.data.length > 0 && !selectedRole) {
        setSelectedRole(data.data[0]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, selectedRole]);

  useEffect(() => {
     fetchRoles();
  }, [fetchRoles]);

  // 2. Fetch Permissions for selected role
  useEffect(() => {
    if (selectedRole) {
      const fetchPermissions = async () => {
        try {
          const data = await roleApi.getPermissions(selectedRole.id);
          setPermissions(data.data || []);
        } catch (err) {
          addToast('Failed to load permissions.', 'error');
        }
      };
      fetchPermissions();
    }
  }, [selectedRole, addToast]);

  // 3. Handle Create Role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole.name) return addToast('Role name is required.', 'warning');
    
    try {
      await roleApi.create(newRole);
      addToast('Role created successfully!', 'success');
      setIsModalOpen(false);
      setNewRole({ name: '', description: '' });
      fetchRoles();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // UI Components
  const columns = [
    { 
      header: 'Role Name', 
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
            <ShieldCheck size={14} />
          </div>
          <span className="text-sm font-bold text-slate-800">{row.name}</span>
        </div>
      )
    },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Created At', 
      accessor: 'created_at',
      render: (row) => <span className="text-xs text-slate-400 font-medium">{new Date(row.created_at).toLocaleDateString()}</span>
    }
  ];

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">Roles & RBAC</h1>
          <p className="text-slate-500 font-medium">Manage role-based access control and system permissions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchRoles} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Reload</Button>
          <Button onClick={() => setIsModalOpen(true)} icon={Plus}>Create New Role</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Role List Selector */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input 
              type="text" 
              placeholder="Search roles..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {filteredRoles.map((role) => (
              <div 
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`
                  p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300
                  ${selectedRole?.id === role.id 
                    ? 'bg-white border-primary shadow-lg shadow-primary/10' 
                    : 'bg-slate-50 border-transparent hover:border-slate-200'}
                `}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold ${selectedRole?.id === role.id ? 'text-primary' : 'text-slate-700'}`}>{role.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Grid & Role Directory (Step 2 Requirements) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Permission Editor */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                  <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Permissions for {selectedRole?.name}</h2>
                  <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Access Control Matrix</p>
                </div>
              </div>
              <Button size="sm">Update Matrix</Button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['Dashboard', 'Students', 'Staff', 'Finance', 'Attendance', 'Settings'].map((module) => (
                  <div key={module} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                      <Lock size={14} className="text-slate-300" />
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{module}</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {['Read', 'Write', 'Delete'].map((action) => (
                        <label key={action} className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white hover:border-primary/30 transition-all group">
                          <span className="text-sm font-bold text-slate-600">{action} Permissions</span>
                          <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked={selectedRole?.name === 'Super Admin'} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Directory Table (Strict Step 2 Requirement) */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-2">
                <UsersIcon size={18} className="text-primary" />
                <h2 className="text-lg font-black text-slate-800">System Role Directory</h2>
             </div>
             <Table 
                columns={columns} 
                data={filteredRoles} 
                loading={loading}
                totalEntries={filteredRoles.length}
                entriesPerPage={5}
                actions={false}
             />
          </div>
        </div>
      </div>

      {/* Modal for Creating New Role */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New System Role"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </>
        )}
      >
        <div className="space-y-6">
          <Input 
            label="Role Name" 
            placeholder="e.g. Academic Manager" 
            icon={ShieldCheck} 
            value={newRole.name}
            onChange={(e) => setNewRole({...newRole, name: e.target.value})}
            required
          />
          <Input 
            label="Description" 
            placeholder="What permissions does this role include?" 
            value={newRole.description}
            onChange={(e) => setNewRole({...newRole, description: e.target.value})}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
