const getApiUrl = (path) => {
    const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
    return `${base}${path}`;
};

const getHeaders = () => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getProfile = async () => {
    const res = await fetch(getApiUrl('/api/profile'), { headers: getHeaders() });
    return res.json();
};

export const updateProfile = async (data) => {
    const res = await fetch(getApiUrl('/api/profile'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return res.json();
};

export const changePassword = async (oldPassword, newPassword) => {
    const res = await fetch(getApiUrl('/api/profile/password'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ oldPassword, newPassword })
    });
    return res.json();
};

export const changeDeathCloudId = async (password, newDeathCloudId) => {
    const res = await fetch(getApiUrl('/api/profile/deathcloud-id'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ password, newDeathCloudId })
    });
    return res.json();
};

export const getSessions = async () => {
    const res = await fetch(getApiUrl('/api/sesiones'), { headers: getHeaders() });
    return res.json();
};

export const revokeSession = async (sessionId) => {
    const res = await fetch(getApiUrl(`/api/sesiones/${sessionId}`), {
        method: 'DELETE',
        headers: getHeaders()
    });
    return res.json();
};
