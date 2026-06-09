const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BASE_URL = `${API_ROOT}/attendance`;

const getHeaders = () => ({
    'Content-Type': 'application/json'
});

export const getAttendance = async (type = 'students') => {
    const res = await fetch(`${BASE_URL}/${type}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    const data = await res.json();
    return { data };
};

export const createAttendance = async (attendanceData, type = 'students') => {
    const res = await fetch(`${BASE_URL}/${type}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attendanceData),
    });
    if (!res.ok) throw new Error('Failed to create attendance');
    return await res.json();
};

export const updateAttendance = async (id, attendanceData, type = 'students') => {
    const res = await fetch(`${BASE_URL}/${type}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(attendanceData),
    });
    if (!res.ok) throw new Error('Failed to update attendance');
    return await res.json();
};

export const deleteAttendance = async (id, type = 'students') => {
    const res = await fetch(`${BASE_URL}/${type}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete attendance');
    return await res.json();
};

// Metadata helpers
export const getStudents = () => fetch(`${API_ROOT}/students`).then(res => res.json());
export const getStaff = () => fetch(`${API_ROOT}/staff`).then(res => res.json());
export const getBatches = () => fetch(`${API_ROOT}/batches`).then(res => res.json());
export const getCourses = () => fetch(`${API_ROOT}/courses`).then(res => res.json());
export const getInstitutions = () => fetch(`${API_ROOT}/institutions`).then(res => res.json());



