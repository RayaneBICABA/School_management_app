import axios from 'axios';

// API instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Base Asset URL (for images, uploads, etc.)
export const BASE_ASSET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');

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

        // Handle 401 (Unauthorized) - redirect to login
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Redirect to login page
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // Show toast for other errors
        toastError(message);
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
    clearConnectionHistory() {
        return api.delete('/auth/history');
    },
    uploadPhoto(formData) {
        // Convert FormData to base64 to avoid multer issues
        return new Promise((resolve, reject) => {
            const file = formData.get('photo');
            if (!file) {
                reject(new Error('No file found'));
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Data = reader.result;
                    const token = localStorage.getItem('token');

                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/photo-manual`, {
                        method: 'POST',
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            image: base64Data,
                            filename: file.name,
                            size: file.size,
                            type: file.type
                        })
                    });

                    const data = await response.json();
                    if (data.success) {
                        resolve({
                            data: data.data
                        });
                    } else {
                        reject(new Error(data.error || 'Upload failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsDataURL(file);
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
                'Content-Type': undefined
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
    searchStudents(params) {
        return api.get('/parents/search-students', { params });
    },
    getChild(childId) {
        return api.get(`/parents/children/${childId}`);
    },
    updateChild(childId, data) {
        return api.put(`/parents/children/${childId}`, data);
    },
    getChildTeachers(childId) {
        return api.get(`/parents/children/${childId}/teachers`);
    },
    getChildEmergencyContacts(childId) {
        return api.get(`/parents/children/${childId}/emergency-contacts`);
    },
    addEmergencyContact(contactData) {
        return api.post('/parents/emergency-contacts', contactData);
    },
    getChildYearlyStats(childId) {
        return api.get(`/parents/children/${childId}/stats`);
    },
    getChildDocuments(childId) {
        return api.get(`/parents/children/${childId}/documents`);
    },
    getChildDisciplineStats(childId) {
        return api.get(`/parents/children/${childId}/discipline/stats`);
    },
    getChildAttendance(childId, params) {
        return api.get(`/parents/children/${childId}/attendance`, { params });
    },
    getChildPendingAbsences(childId) {
        return api.get(`/parents/children/${childId}/absences/pending`);
    },
    getChildDisciplinaryLogs(childId) {
        return api.get(`/parents/children/${childId}/discipline/logs`);
    },
    submitAbsenceJustification(childId, data) {
        return api.post(`/parents/children/${childId}/absences/justify`, data);
    },

    // Sessions
    createSession(data) {
        return api.post('/sessions', data);
    },
    getSessions() {
        return api.get('/sessions');
    },
    updateSession(id, data) {
        return api.put(`/sessions/${id}`, data);
    },
    deleteSession(id) {
        return api.delete(`/sessions/${id}`);
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
    renameNiveau(data) {
        return api.put('/classes/niveaux', data);
    },
    deleteNiveau(name) {
        return api.delete(`/classes/niveaux/${encodeURIComponent(name)}`);
    },
    renameSpecialite(data) {
        return api.put('/classes/specialites', data);
    },
    deleteSpecialite(name) {
        return api.delete(`/classes/specialites/${encodeURIComponent(name)}`);
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
    getProfesseurAffectations(professeurId) {
        return api.get('/classe-matieres/all', { params: { professeur: professeurId } });
    },
    getMyClasses() {
        return api.get('/classe-matieres/my-classes');
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
    importClasseMatieres(classeId, data) {
        return api.post(`/classes/${classeId}/matieres/import`, data);
    },

    // Schedules (Timetable)
    getSchedules(params) {
        return api.get('/schedules', { params });
    },
    getStudentEvents(id) {
        return api.get(`/eleves/${id}/events`);
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
                'Content-Type': undefined
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
    getAttendanceStats(classeId) {
        return this.getClassAttendanceStats(classeId);
    },
    saveGroupedAbsences(data) {
        return api.post('/attendance/grouped', data);
    },
    getManageableAbsences(params) {
        return api.get('/attendance/manageable', { params });
    },
    justifyAbsence(id, data) {
        return api.put(`/attendance/${id}/justify`, data);
    },
    validateJustification(id) {
        return api.put(`/attendance/${id}/validate`);
    },
    rejectJustification(id) {
        return api.put(`/attendance/${id}/reject`);
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
    getParentDashboard() {
        return api.get('/dashboard/parent');
    },

    // Examens
    getExamens(params) {
        return api.get('/examens', { params });
    },
    getExamen(id) {
        return api.get(`/examens/${id}`);
    },
    createExamen(examData) {
        return api.post('/examens', examData);
    },
    updateExamen(id, examData) {
        return api.put(`/examens/${id}`, examData);
    },
    deleteExamen(id) {
        return api.delete(`/examens/${id}`);
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
    rejectNote(id, data) {
        return api.post(`/notes/${id}/reject`, data);
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
    downloadBulletinPDF(id, params) {
        return api.get(`/bulletins/${id}/pdf`, { params, responseType: 'blob' });
    },
    downloadClassBulletins(classeId, params) {
        return api.get(`/bulletins/classe/${classeId}/pdf`, {
            params,
            responseType: 'blob'
        });
    },

    // Messages
    sendMessage(messageData) {
        return api.post(`/messages/${id}/repondre`, { contenu });
    },
    marquerCommeLu(id) {
        return api.put(`/messages/${id}/lire`);
    },
    supprimerMessage(id) {
        return api.delete(`/messages/${id}`);
    },
    getMessagesNonLus() {
        return api.get('/messages/non-lus');
    },
    getMessageStats() {
        return api.get('/messages/stats');
    },
    uploadPieceJointe(file) {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/messages/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Calendar
    exportStudentCalendar(eleveId, params) {
        return api.get(`/calendar/export/student/${eleveId}`, {
            params,
            responseType: 'blob'
        });
    },
    exportClassCalendar(classeId, params) {
        return api.get(`/calendar/export/class/${classeId}`, {
            params,
            responseType: 'blob'
        });
    },
    exportSchoolCalendar(params) {
        return api.get('/calendar/export/school', {
            params,
            responseType: 'blob'
        });
    },
    getParentCalendarEvents() {
        return api.get('/parents/children/calendar/events');
    },
    getParentNextClasses() {
        return api.get('/parents/children/calendar/next-classes');
    },

    // Absences du jour
    getTodayAbsences() {
        return api.get('/absences-jour');
    },
    updateAbsence(id, data) {
        return api.put(`/attendance/${id}`, data);
    },

    // Note columns
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
            headers: { 'Content-Type': undefined }
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
    unblockNotes(data) {
        return api.post('/notes/unblock', data);
    },
    getMasterSheetData(classeId, params) {
        return api.get(`/notes/master-sheet/${classeId}`, { params });
    },
    downloadMasterSheetPDF(classeId, params) {
        return api.get(`/notes/master-sheet/${classeId}/pdf`, { params, responseType: 'blob' });
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
    },

    // Student API methods
    getStudentStats(studentId) {
        return api.get(`/eleves/${studentId}/stats`);
    },
    getTodaySchedule(studentId) {
        return api.get(`/eleves/${studentId}/schedule/today`);
    },
    getWeeklySchedule(studentId) {
        return api.get(`/eleves/${studentId}/schedule/week`);
    },
    getMonthlySchedule(studentId, params) {
        return api.get(`/eleves/${studentId}/schedule/month`, { params });
    },
    getStudentNotes(studentId, params) {
        return api.get(`/eleves/${studentId}/notes`, { params });
    },
    getBulletins(studentId) {
        return api.get(`/eleves/${studentId}/bulletins`);
    },
    getDiscipline(studentId) {
        return api.get(`/eleves/${studentId}/discipline`);
    },
    getStudentNotifications(studentId) {
        return api.get(`/eleves/${studentId}/notifications`);
    },
    markNotificationAsRead(notificationId) {
        return api.put(`/notifications/${notificationId}/read`);
    },
    clearNotificationHistory() {
        return api.delete('/notifications/history');
    },
    getAttendance(studentId, params) {
        return api.get(`/eleves/${studentId}/attendance`, { params });
    },

    // Student Stats (for StudentProfile component)
    getStudentStats(studentId) {
        return api.get(`/eleves/${studentId}/stats`);
    },

    // Student Discipline (for StudentProfile component)
    getStudentDiscipline(studentId) {
        return api.get(`/eleves/${studentId}/discipline`);
    },


    // Student Profile (for students accessing their own profile)
    getStudentProfile(studentId) {
        return api.get(`/student-profile/profile/${studentId}`);
    },

    // Update Student Profile (for students updating their own profile)
    updateStudentProfile(id, studentData) {
        return api.put(`/student-profile/profile/${id}`, studentData);
    },
    exportStudentProfile(id) {
        return api.get(`/student-profile/profile/${id}/export`, {
            responseType: 'blob'
        });
    },

    // Student-specific routes (for students accessing their own data)
    getStudentTeachers(studentId) {
        return api.get(`/eleves/${studentId}/teachers`);
    },

    getStudentEmergencyContacts(studentId) {
        return api.get(`/eleves/${studentId}/emergency-contacts`);
    },

    getStudentStats(studentId) {
        return api.get(`/eleves/${studentId}/stats`);
    },

    // Secretary Dashboard
    getSecretaireDashboardStats() {
        return api.get('/dashboard/secretaire');
    },

    // Suivi Activité
    getSuiviActiviteStats(params) {
        return api.get('/dashboard/suivi-activite', { params });
    },
    getSuiviAvancement(params) {
        return api.get('/dashboard/suivi-avancement-censeur', { params });
    },

    // Validation Bulletins
    getValidationPageStats() {
        return api.get('/bulletins/validation-stats');
    },
    validateClassBulletins(classeId) {
        return api.put(`/bulletins/validate-classe/${classeId}`, {});
    },
    uploadLogo(data) {
        return api.post('/settings/upload-logo', data);
    },
    getSchoolConfig() {
        return api.get('/settings/school_config');
    },

    // Dispensations
    getDispensations(params) {
        return api.get('/dispensations', { params });
    },
    createDispensation(data) {
        return api.post('/dispensations', data);
    },
    deleteDispensation(id) {
        return api.delete(`/dispensations/${id}`);
    }
};
