import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const SIDEBAR_W = 240;
const NAVBAR_H = 64;

export default function Layout() {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            <Sidebar />

            <div style={{ flex: 1, marginLeft: `${SIDEBAR_W}px`, minWidth: 0, position: 'relative' }}>
                <Navbar navbarH={NAVBAR_H} sidebarW={SIDEBAR_W} />

                <main style={{
                    marginTop: `${NAVBAR_H}px`,
                    padding: '32px',
                    minHeight: `calc(100vh - ${NAVBAR_H}px)`,
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
