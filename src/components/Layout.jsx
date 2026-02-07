import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Notification from './Notification';
import { useContext } from 'react';
import { AppContext } from '../state/AppContext';

import ScrollToTop from './ScrollToTop';

export default function Layout() {
    const { notifications } = useContext(AppContext);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <ScrollToTop />
            <Sidebar />
            <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
                <Outlet />
            </main>
            {notifications.map((notif, idx) => (
                <Notification key={idx} {...notif} />
            ))}
        </div>
    );
}
