import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Fixed width and sticky */}
      <div className="flex-shrink-0 w-72 h-screen sticky top-0 z-30">
        <Sidebar title="EduERP" />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc] p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
