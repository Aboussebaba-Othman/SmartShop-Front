import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Notification from './Notification';
import { useContext } from 'react';
import { AppContext } from '../state/AppContext';

export default function Layout() {
    const { notifications } = useContext(AppContext);

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
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
