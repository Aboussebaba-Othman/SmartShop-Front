import api from './api';

/**
 * Authenticate user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data with userId, username, role, clientId
 */
export async function login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    // Persist a local marker so AppContext can decide to rehydrate session on reload
    try {
        if (response && response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
    } catch (e) {
        // ignore storage errors
    }
    return response.data;
}

/**
 * Logout current user and invalidate session
 */
export async function logout() {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    }
    // Clear any local storage if needed
    localStorage.removeItem('user');
}

/**
 * Get current authenticated user information
 * @returns {Promise<Object|null>} User data or null if not authenticated
 */
export async function getCurrentUser() {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        return null;
    }
}
