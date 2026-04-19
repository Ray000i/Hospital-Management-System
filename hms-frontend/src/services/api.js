import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

const safe = async (fn) => {
    try { return await fn(); }
    catch (err) { return { success: false, message: err.response?.data?.message || 'Server error. Please try again.' }; }
};

export const loginUser = (creds) => safe(async () => (await api.post('/login', creds)).data);
export const registerUser = (data) => safe(async () => (await api.post('/register', data)).data);

export const getAdminStats = () => safe(async () => (await api.get('/admin/stats')).data);
export const getDoctors = () => safe(async () => (await api.get('/doctors')).data);
export const addDoctor = (data) => safe(async () => (await api.post('/admin/add-doctor', data)).data);
export const deleteDoctor = (doc_id) => safe(async () => (await api.delete(`/admin/delete-doctor/${doc_id}`)).data);

export const bookAppointment = (data) => safe(async () => (await api.post('/appointments/book', data)).data);
export const getPatientAppointments = (pid) => safe(async () => (await api.get(`/patient/appointments/${pid}`)).data);

export const getDoctorProfile = async (uid) => {
    try {
        const res = await api.get(`/doctor/profile/${uid}`);
        return res.data; // { doc_id, specialization, fees, timing }
    } catch (err) {
        console.error('getDoctorProfile error:', err);
        return null;
    }
};
export const getDoctorAppointments = (did) => safe(async () => (await api.get(`/doctor/appointments/${did}`)).data);
export const updateAppointmentStatus = (data) => safe(async () => (await api.put('/appointments/update-status', data)).data);