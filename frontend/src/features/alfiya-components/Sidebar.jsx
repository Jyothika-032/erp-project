import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  CreditCard, 
  MessageSquare, 
  Award, 
  BarChart3, 
  Settings, 
  ShieldCheck,
  Building2,
  UserCog
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/students', icon: <GraduationCap size={20} /> },
    { name: 'Staff', path: '/staff', icon: <Users size={20} /> },
    { name: 'Courses', path: '/courses', icon: <BookOpen size={20} /> },
    { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={20} /> },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} /> },
    { name: 'Communication', path: '/communication', icon: <MessageSquare size={20} /> },
    { name: 'Certificates', path: '/certificates', icon: <Award size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
    { name: 'User Management', path: '/users', icon: <UserCog size={20} /> },
    { name: 'Roles & RBAC', path: '/roles', icon: <ShieldCheck size={20} /> },
    { name: 'Institutions', path: '/institutions', icon: <Building2 size={20} /> },
    { name: 'Merge Audit', path: '/merge-log', icon: <GitMerge size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-72 bg-sidebar text-slate-300 flex flex-col h-screen sticky top-0 shadow-xl z-30">
      <div className="p-8 flex items-center gap-3">
        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
          <GraduationCap size={28} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">Edu<span className="text-primary">ERP</span></span>
      </div>
      
      <nav className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink 
              key={item.name} 
              to={item.path} 
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'hover:bg-white/5 hover:text-white'}
              `}
            >
              <span className={`transition-transform duration-200 group-hover:scale-110`}>
                {item.icon}
              </span>
              <span className="font-medium text-[0.95rem]">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Status</p>
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online & Secure
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
