import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Globe, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageMeta = {
    '/dashboard': { title: 'Dashboard', sub: 'System overview and performance metrics' },
    '/students': { title: 'Students', sub: 'Manage student records and admissions' },
    '/parents': { title: 'Parent Directory', sub: 'Guardian information and student associations' },
    '/parents/new': { title: 'Parent Registration', sub: 'Register parent details and link them to a student' },
    '/attendance/student': { title: 'Student Attendance', sub: 'Daily attendance tracking' },
    '/finance/payments': { title: 'Payments', sub: 'Track all financial transactions' },
    '/finance/fees': { title: 'Fee Structure', sub: 'Course-wise fee configurations' },
    '/finance/certificates': { title: 'Certificates', sub: 'Generate and manage student certificates' },
    '/finance/tc': { title: 'Transfer Certificate', sub: 'Manage student TCs' },
    '/settings/institution': { title: 'Institutions', sub: 'Campus and branch management' },
    '/settings/users': { title: 'Users', sub: 'Manage system users and access' },
    '/settings/roles': { title: 'Roles', sub: 'Role-based access control' },
    '/settings/profile': { title: 'Profile Settings', sub: 'Manage your personal account' },
    '/advanced/merge-log': { title: 'Merge Logs', sub: 'Institution data merge history' },
    '/reports': { title: 'Reports', sub: 'System-wide analytics and exports' },
};

export default function Navbar() {
    const { pathname } = useLocation();
    const { user, currentInstitution, institutions, switchInstitution } = useAuth();
    const meta = pageMeta[pathname] || { title: 'EduERP', sub: 'Unified Education Management' };

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header
            style={{
                position: 'fixed', top: 0, left: '240px', right: 0, height: '64px', zIndex: 30,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 32px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
        >
            <div className="animate-in slide-in-from-left duration-300">
                <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{meta.title}</h1>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{meta.sub}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', display: 'none' }} className="md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        style={{ padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', width: '220px', outline: 'none' }}
                    />
                </div>

                {/* Institution context */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <div 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px', background: '#f1f5f9', cursor: 'pointer', userSelect: 'none' }}
                    >
                        <Globe size={14} className="text-blue-600" />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{currentInstitution?.name || 'All Branches'}</span>
                        <ChevronDown size={12} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '240px',
                            background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            padding: '6px', zIndex: 40, display: 'flex', flexDirection: 'column', gap: '2px'
                        }}>
                            <div style={{ padding: '6px 8px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Switch Campus
                            </div>
                            {institutions.map((inst) => {
                                const isSelected = inst.id === currentInstitution?.id;
                                return (
                                    <button
                                        key={inst.id}
                                        onClick={() => {
                                            switchInstitution(inst.id);
                                            setDropdownOpen(false);
                                        }}
                                        style={{
                                            width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
                                            background: isSelected ? '#eff6ff' : 'none',
                                            textAlign: 'left', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                                            color: isSelected ? '#2563eb' : '#475569', display: 'flex', alignItems: 'center',
                                            justifyContent: 'space-between', transition: 'all 0.15s'
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected) e.currentTarget.style.background = 'none';
                                        }}
                                    >
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {inst.name}
                                        </span>
                                        {isSelected && <Check size={14} className="text-blue-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Notification */}
                <button
                    style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    <Bell size={20} strokeWidth={2} />
                    <span style={{
                        position: 'absolute', top: '8px', right: '8px', width: '9px', height: '9px',
                        background: '#ef4444', borderRadius: '50%', border: '2px solid white',
                    }} />
                </button>

                {/* Divider */}
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }} />

                {/* User Profile */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px', borderRadius: '12px' }} className="hover:bg-slate-50 transition-colors">
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '14px', color: 'white',
                        boxShadow: '0 4px 10px rgba(37,99,235,0.2)',
                    }}>
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div style={{ display: 'none' }} className="lg:block">
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{user?.name || 'Administrator'}</p>
                        <p style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', marginTop: '3px', textTransform: 'uppercase' }}>{user?.role || 'Super Admin'}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
