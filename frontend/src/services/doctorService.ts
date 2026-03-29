import api from './api';

// --- INSIGHTS ---
export const createInsight = async (title: string, content: string, imageUrl?: string) => {
    const res = await api.post('/doctor-features/insights', { title, content, imageUrl });
    return res.data;
};

export const getMyInsights = async () => {
    const res = await api.get('/doctor-features/insights/me');
    return res.data;
};

export const deleteInsight = async (id: string | number) => {
    const res = await api.delete(`/doctor-features/insights/${id}`);
    return res.data;
};

export const getAllInsightsPublic = async () => {
    const res = await api.get('/doctor-features/insights/all');
    return res.data;
};

// --- APPOINTMENTS ---
export const checkAppointmentAvailability = async (doctorId: number, appointmentDate: string) => {
    const res = await api.post('/doctor-features/appointments/check', { doctorId, appointmentDate });
    return res.data;
};

export const bookAppointment = async (doctorId: number, appointmentDate: string, reason: string) => {
    const res = await api.post('/doctor-features/appointments', { doctorId, appointmentDate, reason });
    return res.data;
};

export const getAppointmentsAsDoctor = async () => {
    const res = await api.get('/doctor-features/appointments/doctor');
    return res.data;
};

export const getAppointmentsAsPatient = async () => {
    const res = await api.get('/doctor-features/appointments/me');
    return res.data;
};

export const updateAppointmentStatus = async (appointmentId: number | string, status: string) => {
    const res = await api.put(`/doctor-features/appointments/${appointmentId}/status`, { status });
    return res.data;
};

// --- PATIENT RECORDS ---
export const createPatientRecord = async (
    patientId: number,
    diagnosis: string,
    prescription?: string,
    notes?: string,
    documentUrl?: string
) => {
    const res = await api.post('/doctor-features/records', { patientId, diagnosis, prescription, notes, documentUrl });
    return res.data;
};

export const getMyRecordsAsPatient = async () => {
    const res = await api.get('/doctor-features/records/me');
    return res.data;
};

export const getPatientRecordsAsDoctor = async (patientId: number) => {
    const res = await api.get(`/doctor-features/records/patient/${patientId}`);
    return res.data;
};
