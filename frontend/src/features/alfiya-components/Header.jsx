import { Bell, Search, User, LogOut, Building2, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, currentInstitution, switchInstitution, institutions } = useAuth();

  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Global Search */}
      <div className="relative group w-96">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
          <Search size={18} strokeWidth={2.5} />
        </div>
        <input 
          type="text" 
          placeholder="Search ERP records..." 
          className="block w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-[10px] font-bold text-slate-400 border border-slate-300 rounded px-1.5 py-0.5 bg-white shadow-sm">⌘K</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Institution Selector */}
        <div className="relative group">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl hover:border-primary transition-all cursor-pointer shadow-sm">
            <Building2 size={18} className="text-primary" strokeWidth={2.5} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Institution</span>
              <select 
                className="bg-transparent font-bold text-slate-700 text-sm outline-none cursor-pointer pr-6 appearance-none leading-none"
                value={currentInstitution?.id}
                onChange={(e) => switchInstitution(e.target.value)}
              >
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
            <Bell size={20} strokeWidth={2.2} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <div className="flex items-center gap-4 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 leading-tight">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.role || 'Super Admin'}</p>
            </div>
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                <User size={26} strokeWidth={2.5} />
              </div>
              
              {/* Dropdown Menu (Simplified) */}
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
                <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <User size={16} /> Profile
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <Settings size={16} /> Account
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
