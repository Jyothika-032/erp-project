import { NavLink, useNavigate } from 'react-router-dom';
import { 
  CreditCard, FileText, Award, BookOpen, LogOut, GraduationCap, 
  LayoutDashboard, Users, UserCheck, Calendar, Book, 
  Layers, Briefcase, Building2, Settings, Shield, Activity, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuGroups = [
  {
    title: 'Core',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Academic',
    items: [
      { label: 'Students', path: '/students', icon: Users },
      { label: 'Admissions', path: '/admissions', icon: GraduationCap },
      { label: 'Parents', path: '/parents', icon: Users },
      { label: 'Attendance', path: '/attendance/student', icon: UserCheck },
      { label: 'Staff', path: '/staff', icon: Users },
      { label: 'Courses', path: '/courses', icon: Book },
      { label: 'Batches', path: '/batches', icon: Layers },
      { label: 'Communications', path: '/communications', icon: FileText },
    ]
  },
  {
    title: 'Finance',
    items: [
      { label: 'Payments', path: '/finance/payments', icon: CreditCard },
      { label: 'Fee Structure', path: '/finance/fees', icon: BookOpen },
      { label: 'Certificates', path: '/finance/certificates', icon: Award },
      { label: 'TC', path: '/finance/tc', icon: FileText },
    ]
  },
  {
    title: 'Placement',
    items: [
      { label: 'Placements', path: '/placements', icon: Briefcase },
    ]
  },
  {
    title: 'System Management',
    items: [
      { label: 'Institutions', path: '/settings/institution', icon: Building2 },
      { label: 'Users', path: '/settings/users', icon: Users },
      { label: 'Roles', path: '/settings/roles', icon: Shield },
      { label: 'Merge Logs', path: '/advanced/merge-log', icon: Activity },
    ]
  },
  {
    title: 'Other',
    items: [
      { label: 'Reports', path: '/reports', icon: BarChart3 },
      { label: 'Profile', path: '/settings/profile', icon: Settings },
    ]
  }
];

export default function Sidebar() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            style={{
                position: 'fixed', top: 0, left: 0, height: '100vh', width: '240px', zIndex: 40,
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
                color: '#94a3b8'
            }}
        >
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    }}>
                        <GraduationCap size={22} color="white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, color: 'white', fontSize: '18px', lineHeight: 1, letterSpacing: '-0.02em' }}>Edu<span style={{ color: '#3b82f6' }}>ERP</span></p>
                        <p style={{ color: '#64748b', fontSize: '10px', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unified Platform</p>
                    </div>
                </div>
            </div>

            {/* Nav sections */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }} className="custom-scrollbar">
                {menuGroups.map((group) => (
                    <div key={group.title}>
                        <p style={{ padding: '0 12px 8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>
                            {group.title}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {group.items.map(({ label, path, icon: Icon }) => (
                                <NavLink key={path} to={path}>
  {({ isActive }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? 'white' : '#94a3b8',
        background: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </div>
  )}
</NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User / Logout */}
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '12px', marginBottom: '8px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', color: 'white', flexShrink: 0 }}>
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ color: 'white', fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Administrator'}</p>
                        <p style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>{user?.role || 'Super Admin'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                        padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: 'transparent', color: '#ef4444', fontSize: '13px', fontWeight: 700,
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <LogOut size={16} strokeWidth={2.5} />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
