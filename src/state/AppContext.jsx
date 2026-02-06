import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';

export const AppContext = createContext(null);

/**
 * Global application state provider
 * Manages user authentication, loading states, and notifications
 */
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Attempt to fetch current user on mount to correctly set auth state
    // getCurrentUser returns null on error (including 401) so this is safe
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Add a notification to the queue
   * @param {Object} notification - Notification object {type, message, duration}
   */
  const pushNotification = (n) => {
    const id = Date.now();
    setNotifications(s => [...s, { ...n, id }]);

    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(s => s.filter(notif => notif.id !== id));
    }, n.duration || 3000);
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      loading,
      setLoading,
      notifications,
      pushNotification,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}
