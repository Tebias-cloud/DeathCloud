const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const getGameLeaderboard = async (gameId) => {
    const res = await fetch(`${API_URL}/api/game/${gameId}/leaderboard`, { headers: getHeaders() });
    return res.json();
};

export const getGameNews = async (gameId) => {
    const res = await fetch(`${API_URL}/api/game/${gameId}/news`, { headers: getHeaders() });
    return res.json();
};

export const reactToNews = async (newsId) => {
    const res = await fetch(`${API_URL}/api/game/news/${newsId}/react`, { 
        method: 'POST',
        headers: getHeaders() 
    });
    return res.json();
};

export const rateNews = async (newsId, rating) => {
    const res = await fetch(`${API_URL}/api/game/news/${newsId}/rate`, { 
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ rating })
    });
    return res.json();
};

export const getNewsComments = async (newsId) => {
    const res = await fetch(`${API_URL}/api/game/news/${newsId}/comments`, { headers: getHeaders() });
    return res.json();
};

export const addNewsComment = async (newsId, content) => {
    const res = await fetch(`${API_URL}/api/game/news/${newsId}/comments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content })
    });
    return res.json();
};
