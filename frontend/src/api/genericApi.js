const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

export const createApi = (resource) => {
    const url = `${BASE_URL}/${resource}`;
    return {
        getAll: async () => {
            const res = await fetch(url, { headers: getHeaders() });
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            return await res.json();
        },
        create: async (data) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`Creation failed: ${res.status}`);
            return await res.json();
        },
        update: async (id, data) => {
            const res = await fetch(`${url}/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`Update failed: ${res.status}`);
            return await res.json();
        },
        remove: async (id) => {
            const res = await fetch(`${url}/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error(`Deletion failed: ${res.status}`);
            return await res.json();
        }
    };
};

