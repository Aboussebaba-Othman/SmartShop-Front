import api from './api';


export async function login(username, password) {
    const response = await api.post('/auth/login', { username, password });
    try {
        if (response && response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
    } catch (e) {
    }
    return response.data;
}

export async function logout() {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('user');
}

export async function getCurrentUser() {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        return null;
    }
}
