import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Filter, Mail, User as UserIcon, Shield, Activity, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userApi from '../../api/userApi';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';

const Users = () => {
  const { currentInstitution } = useAuth();
  const { addToast } = useToast();
  
  // State Management (Step 6)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role_id: 3, // Default to Staff/Teacher
    institution_id: currentInstitution?.id || '',
    designation: '',
    department: ''
  });

  // 1. Fetch Users (Step 3)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userApi.getAll(currentInstitution?.id);
      setUsers(data.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentInstitution, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. Handle CRUD - Create (Step 6)
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return addToast('Please fill in all required fields.', 'warning');
    }

    try {
      await userApi.create(formData);
      addToast('User created successfully!', 'success');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', role_id: 3, institution_id: currentInstitution?.id || '', designation: '', department: '' });
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // 3. Handle CRUD - Delete
  const handleDeleteUser = async (user) => {
    const name = user.user_name || user.name || 'User';
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await userApi.delete(user.user_id || user.id);
        addToast('User deleted successfully.', 'success');
        fetchUsers();
      } catch (err) {
        addToast(err.message, 'error');
      }
    }
  };

  const columns = [
    { 
      header: 'User', 
      accessor: 'name',
      render: (row) => {
        const name = row.user_name || row.name || 'User';
        const email = row.email || '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
              {name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{name}</p>
              <p className="text-xs text-slate-400 font-medium">{email}</p>
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Role', 
      accessor: 'role_name',
      render: (row) => (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          row.role_name === 'Admin' || row.role_name === 'Super Admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
        }`}>
          {row.role_name || 'Staff'}
        </span>
      )
    },
    { 
      header: 'Designation', 
      accessor: 'designation',
      render: (row) => (
        <div>
          <p className="text-sm font-bold text-slate-700">{row.designation || <span className="text-slate-300 text-xs">—</span>}</p>
          {row.department && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{row.department}</p>}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' || row.status === 'active' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-300'}`} />
          <span className={`text-sm font-bold ${row.status === 'Active' || row.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}>{row.status}</span>
        </div>
      )
    },
  ];

  const filteredUsers = (users || []).filter(u => {
    const name = u.user_name || u.name || '';
    const email = u.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Step 2: Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">User Management</h1>
          <p className="text-slate-500 font-medium">Manage administrative and staff access for your institution.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={fetchUsers} icon={RefreshCw} className={loading ? 'animate-spin' : ''}>Reload</Button>
          <Button onClick={() => setIsModalOpen(true)} icon={UserPlus}>Add New User</Button>
        </div>
      </div>

      {/* Step 2: Search / Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="secondary" size="sm" icon={Filter} className="flex-1 md:flex-none">Filter</Button>
        </div>
      </div>

      {/* Step 2: Table View & Pagination (Step 6 Loading/Error States) */}
      {error ? (
        <div className="p-12 bg-white rounded-[40px] border-2 border-dashed border-rose-100 text-center space-y-4">
           <p className="text-rose-500 font-bold">{error}</p>
           <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      ) : (
        <Table 
          columns={columns} 
          data={filteredUsers} 
          loading={loading}
          totalEntries={filteredUsers.length}
          onDelete={handleDeleteUser}
          onEdit={(row) => {
            setFormData({ 
              ...row, 
              name: row.user_name || row.name || '', 
              id: row.user_id || row.id 
            });
            setIsModalOpen(true);
          }}
        />
      )}

      {/* Step 4: Reusable Modal for Adding/Editing */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="User Details"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Save User</Button>
          </>
        )}
      >
        <div className="space-y-6">
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe" 
            icon={UserIcon} 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="Email Address" 
            placeholder="john@example.com" 
            icon={Mail} 
            type="email" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Role</label>
            <select 
              value={formData.role_id}
              onChange={(e) => setFormData({...formData, role_id: e.target.value, designation: '', department: ''})}
              className="w-full border-2 border-slate-100 rounded-2xl py-3.5 px-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
            >
              <option value="1">Admin</option>
              <option value="2">Manager</option>
              <option value="3">Teacher / Staff</option>
              <option value="4">Accountant</option>
              <option value="5">Student</option>
            </select>
          </div>
          {/* Show designation/department only for Admin or Manager roles */}
          {(String(formData.role_id) === '1' || String(formData.role_id) === '2') && (
            <>
              <Input 
                label="Designation" 
                placeholder="e.g. Principal, Director, Vice Principal" 
                icon={Shield} 
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              />
              <Input 
                label="Department" 
                placeholder="e.g. Management, Academics" 
                icon={Activity} 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Users;
