import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

import { useToast } from '@/composables/useToast';

// Interceptor to add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { error: toastError } = useToast();
        const message = error.response?.data?.error || 'Une erreur est survenue';

        // Don't show toast for 401 (auth) as it might redirect to login
        if (error.response?.status !== 401) {
            toastError(message);
        }

        return Promise.reject(error);
    }
);

export default {
    // Auth
    login(credentials) {
        return api.post('/auth/login', credentials);
    },
    register(userData) {
        return api.post('/auth/register', userData);
    },
    getMe() {
        return api.get('/auth/me');
    },
    updateDetails(userData) {
        return api.put('/auth/updatedetails', userData);
    },
    updatePassword(passwords) {
        return api.put('/auth/updatepassword', passwords);
    },
    uploadPhoto(formData) {
        return api.put('/auth/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    getUsers(params) {
        return api.get('/users', { params });
    },
    bulkCreateStudents(data) {
        return api.post('/users/bulk-students', data);
    },
    getUser(id) {
        return api.get(`/users/${id}`);
    },
    createUser(userData) {
        return api.post('/users', userData);
    },
    updateUser(id, userData) {
        return api.put(`/users/${id}`, userData);
    },
    deleteUser(id) {
        return api.delete(`/users/${id}`);
    },
    importStudents(formData) {
        return api.post('/users/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Parents
    addChild(matricule) {
        return api.post('/parents/children', { matricule });
    },
    getChildren() {
        return api.get('/parents/children');
    },

    // Classes
    getClasses() {
        return api.get('/classes');
    },
    getClasse(id) {
        return api.get(`/classes/${id}`);
    },
    createClasse(data) {
        return api.post('/classes', data);
    },
    updateClasse(id, data) {
        return api.put(`/classes/${id}`, data);
    },
    deleteClasse(id) {
        return api.delete(`/classes/${id}`);
    },

    // Matieres
    getMatieres() {
        return api.get('/matieres');
    },
    getMatiere(id) {
        return api.get(`/matieres/${id}`);
    },
    createMatiere(data) {
        return api.post('/matieres', data);
    },
    updateMatiere(id, data) {
        return api.put(`/matieres/${id}`, data);
    },
    deleteMatiere(id) {
        return api.delete(`/matieres/${id}`);
    },

    // Classe-Matieres (Courses assigned to classes)
    getClasseMatieres(classeId) {
        return api.get(`/classes/${classeId}/matieres`);
    },
    getAllGlobalClasseMatieres() {
        return api.get('/classe-matieres/all');
    },
    getProfessorClasses() {
        return api.get('/classe-matieres/my-classes');
    },
    addMatiereToClasse(classeId, data) {
        return api.post(`/classes/${classeId}/matieres`, data);
    },
    updateClasseMatiere(classeId, id, data) {
        return api.put(`/classes/${classeId}/matieres/${id}`, data);
    },
    removeMatiereFromClasse(classeId, id) {
        return api.delete(`/classes/${classeId}/matieres/${id}`);
    },

    // Schedules (Timetable)
    getSchedules(params) {
        return api.get('/schedules', { params });
    },
    createSchedule(data) {
        return api.post('/schedules', data);
    },
    deleteSchedule(id) {
        return api.delete(`/schedules/${id}`);
    },
    // Grades
    getGrades(params) {
        return api.get('/grades', { params });
    },
    createGrade(data) {
        return api.post('/grades', data);
    },
    importGrades(formData) {
        return api.post('/grades/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Attendance
    getStudentsByClass(classeId) {
        return api.get(`/attendance/students/${classeId}`);
    },
    saveAttendance(data) {
        return api.post('/attendance', data);
    },
    getClassAttendanceStats(classeId) {
        return api.get(`/attendance/stats/${classeId}`);
    },
    validateGrades(data) {
        return api.put('/grades/validate', data);
    },
    updateGrades(data) {
        return api.put('/grades/bulk', data);
    },

    // Evaluations
    getEvaluations(params) {
        return api.get('/evaluations', { params });
    },
    createEvaluation(data) {
        return api.post('/evaluations', data);
    },
    getMyEvaluations() {
        return api.get('/evaluations/me');
    },
    getPendingEvaluations() {
        return api.get('/evaluations/pending');
    },
    validateEvaluation(id, data) {
        return api.put(`/evaluations/${id}/validate`, data);
    },
    getValidatedEvaluations() {
        return api.get('/evaluations/validated');
    },

    // Settings
    getSettings() {
        return api.get('/settings');
    },
    getSetting(key) {
        return api.get(`/settings/${key}`);
    },
    updateSetting(key, value) {
        return api.put(`/settings/${key}`, { value });
    },

    // Dashboard
    getProviseurDashboard() {
        return api.get('/dashboard/proviseur');
    },

    // Attendance
    getStudentsByClass(classeId) {
        return api.get(`/attendance/students/${classeId}`);
    },
    saveAttendance(attendanceData) {
        return api.post('/attendance', attendanceData);
    },
    getAttendanceStats(classeId) {
        return api.get(`/attendance/stats/${classeId}`);
    },
    getDetailedAttendanceList(classeId) {
        return api.get(`/attendance/list/${classeId}`);
    },

    // Examens (placeholder - backend not yet implemented)
    getExamens(params) {
        // TODO: Implement exam backend routes
        return Promise.resolve({ data: { success: true, data: [] } });
    },

    // Events
    getEvents() {
        return api.get('/events');
    },
    createEvent(eventData) {
        return api.post('/events', eventData);
    },
    updateEvent(id, eventData) {
        return api.put(`/events/${id}`, eventData);
    },
    deleteEvent(id) {
        return api.delete(`/events/${id}`);
    },

    // Incidents
    getIncidents() {
        return api.get('/incidents');
    },
    getIncident(id) {
        return api.get(`/incidents/${id}`);
    },
    createIncident(incidentData) {
        return api.post('/incidents', incidentData);
    },
    updateIncident(id, incidentData) {
        return api.put(`/incidents/${id}`, incidentData);
    },
    deleteIncident(id) {
        return api.delete(`/incidents/${id}`);
    },

    // Notifications
    getNotifications() {
        return api.get('/notifications');
    },
    getSentNotifications() {
        return api.get('/notifications/sent');
    },
    sendNotification(data) {
        return api.post('/notifications', data);
    },
    markNotificationAsRead(id) {
        return api.put(`/notifications/${id}/read`);
    },

    // Statistics
    getCPEStats(params) {
        return api.get('/stats/cpe', { params });
    },
    getCPEDashboard() {
        return api.get('/stats/dashboard');
    },
    downloadWeeklyReport(params) {
        return api.get('/stats/report', { params, responseType: 'blob' });
    },

    // Notes
    createNotes(data) {
        return api.post('/notes', data);
    },
    getNotes(params) {
        return api.get('/notes', { params });
    },
    getNote(id) {
        return api.get(`/notes/${id}`);
    },
    updateNote(id, data) {
        return api.put(`/notes/${id}`, data);
    },
    deleteNote(id) {
        return api.delete(`/notes/${id}`);
    },
    validateNote(id) {
        return api.post(`/notes/${id}/validate`);
    },
    rejectNote(id, motif) {
        return api.post(`/notes/${id}/reject`, { motif });
    },
    submitNote(id) {
        return api.post(`/notes/${id}/submit`);
    },
    getPendingNotes() {
        return api.get('/notes/pending');
    },

    // Bulletins
    generateBulletin(data) {
        return api.post('/bulletins/generate', data);
    },
    generateBulletinsClasse(data) {
        return api.post('/bulletins/generate-classe', data);
    },
    getBulletinsByClasse(classeId, params) {
        return api.get(`/bulletins/classe/${classeId}`, { params });
    },
    getBulletinsByEleve(eleveId) {
        return api.get(`/bulletins/eleve/${eleveId}`);
    },
    getBulletin(id) {
        return api.get(`/bulletins/${id}`);
    },
    updateBulletin(id, data) {
        return api.put(`/bulletins/${id}`, data);
    },
    finalizeBulletin(id) {
        return api.put(`/bulletins/${id}/finalize`);
    },
    distributeBulletins(bulletinIds) {
        return api.post('/bulletins/distribute', { bulletinIds });
    },
    deleteBulletin(id) {
        return api.delete(`/bulletins/${id}`);
    },
    getBulletinStats(params) {
        return api.get('/bulletins/stats', { params });
    },
    downloadBulletinPDF(id) {
        return api.get(`/bulletins/${id}/pdf`, { responseType: 'blob' });
    },

    // Note Columns (Dynamic Evaluations)
    createNoteColumn(data) {
        return api.post('/note-columns', data);
    },
    getNoteColumns(params) {
        return api.get('/note-columns', { params });
    },
    updateNoteColumn(id, data) {
        return api.put(`/note-columns/${id}`, data);
    },
    deleteNoteColumn(id) {
        return api.delete(`/note-columns/${id}`);
    },
    importNoteColumnExcel(id, formData) {
        return api.post(`/note-columns/${id}/import`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Notes (Grades)
    createNotes(data) {
        return api.post('/notes', data);
    },
    getNotes(params) {
        return api.get('/notes', { params });
    },
    getNote(id) {
        return api.get(`/notes/${id}`);
    },
    updateNote(id, data) {
        return api.put(`/notes/${id}`, data);
    },
    deleteNote(id) {
        return api.delete(`/notes/${id}`);
    },
    submitNote(id) {
        return api.post(`/notes/${id}/submit`);
    },
    validateNote(id) {
        return api.post(`/notes/${id}/validate`);
    },
    rejectNote(id, data) {
        return api.post(`/notes/${id}/reject`, data);
    },
    getPendingNotes(params) {
        return api.get('/notes/pending', { params });
    },

    // Unlock Requests
    createUnlockRequest(data) {
        return api.post('/unlock-requests', data);
    },
    getUnlockRequests(params) {
        return api.get('/unlock-requests', { params });
    },
    getUnlockRequest(id) {
        return api.get(`/unlock-requests/${id}`);
    },
    approveUnlockRequest(id) {
        return api.put(`/unlock-requests/${id}/approve`);
    },
    rejectUnlockRequest(id, data) {
        return api.put(`/unlock-requests/${id}/reject`, data);
    },
    deleteUnlockRequest(id) {
        return api.delete(`/unlock-requests/${id}`);
    }
};
