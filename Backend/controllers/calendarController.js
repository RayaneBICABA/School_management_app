const { generateStudentCalendarICal, generateClassCalendarICal } = require('../utils/icalGenerator');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Exporter le calendrier d'un élève en iCal
// @route   GET /api/v1/calendar/export/student/:eleveId
// @access  Private
exports.exportStudentCalendar = asyncHandler(async (req, res, next) => {
    try {
        const { eleveId } = req.params;
        const { startDate, endDate, includeHolidays, includeWeekends } = req.query;

        // Vérifier que l'utilisateur a le droit d'exporter ce calendrier
        const canExport = await checkCalendarAccess(req.user, eleveId, 'student');
        if (!canExport) {
            return next(new ErrorResponse('Non autorisé à exporter ce calendrier', 403));
        }

        // Générer le calendrier iCal
        const icalData = await generateStudentCalendarICal(eleveId, {
            startDate,
            endDate,
            includeHolidays: includeHolidays === 'true',
            includeWeekends: includeWeekends === 'true'
        });

        // Configurer les headers pour le téléchargement
        const fileName = `calendrier-eleve-${eleveId}-${new Date().toISOString().split('T')[0]}.ics`;
        
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', Buffer.byteLength(icalData));

        res.send(icalData);
        
    } catch (error) {
        console.error('Erreur lors de l\'export du calendrier élève:', error);
        return next(new ErrorResponse('Erreur lors de l\'export du calendrier', 500));
    }
});

// @desc    Exporter le calendrier d'une classe en iCal
// @route   GET /api/v1/calendar/export/class/:classeId
// @access  Private
exports.exportClassCalendar = asyncHandler(async (req, res, next) => {
    try {
        const { classeId } = req.params;
        const { startDate, endDate, includeHolidays, includeWeekends } = req.query;

        // Vérifier que l'utilisateur a le droit d'exporter ce calendrier
        const canExport = await checkCalendarAccess(req.user, classeId, 'class');
        if (!canExport) {
            return next(new ErrorResponse('Non autorisé à exporter ce calendrier', 403));
        }

        // Générer le calendrier iCal
        const icalData = await generateClassCalendarICal(classeId, {
            startDate,
            endDate,
            includeHolidays: includeHolidays === 'true',
            includeWeekends: includeWeekends === 'true'
        });

        // Configurer les headers pour le téléchargement
        const fileName = `calendrier-classe-${classeId}-${new Date().toISOString().split('T')[0]}.ics`;
        
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', Buffer.byteLength(icalData));

        res.send(icalData);
        
    } catch (error) {
        console.error('Erreur lors de l\'export du calendrier classe:', error);
        return next(new ErrorResponse('Erreur lors de l\'export du calendrier', 500));
    }
});

// @desc    Exporter le calendrier général de l'école en iCal
// @route   GET /api/v1/calendar/export/school
// @access  Private
exports.exportSchoolCalendar = asyncHandler(async (req, res, next) => {
    try {
        const { startDate, endDate, includeHolidays, includeWeekends } = req.query;

        // Vérifier que l'utilisateur a le droit d'exporter ce calendrier
        const canExport = await checkCalendarAccess(req.user, null, 'school');
        if (!canExport) {
            return next(new ErrorResponse('Non autorisé à exporter ce calendrier', 403));
        }

        // Générer le calendrier iCal avec des événements généraux
        const icalData = await generateSchoolCalendarICal({
            startDate,
            endDate,
            includeHolidays: includeHolidays === 'true',
            includeWeekends: includeWeekends === 'true'
        });

        // Configurer les headers pour le téléchargement
        const fileName = `calendrier-ecole-${new Date().toISOString().split('T')[0]}.ics`;
        
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', Buffer.byteLength(icalData));

        res.send(icalData);
        
    } catch (error) {
        console.error('Erreur lors de l\'export du calendrier école:', error);
        return next(new ErrorResponse('Erreur lors de l\'export du calendrier', 500));
    }
});

// @desc    Obtenir les événements calendaires d'un élève
// @route   GET /api/v1/calendar/student/:eleveId
// @access  Private
exports.getStudentEvents = asyncHandler(async (req, res, next) => {
    try {
        const { eleveId } = req.params;
        const { startDate, endDate, limit = 50 } = req.query;

        // Vérifier que l'utilisateur a le droit de voir ces événements
        const canView = await checkCalendarAccess(req.user, eleveId, 'student');
        if (!canView) {
            return next(new ErrorResponse('Non autorisé à voir ce calendrier', 403));
        }

        // Récupérer les événements
        const events = await getStudentCalendarEvents(eleveId, {
            startDate,
            endDate,
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des événements élève:', error);
        return next(new ErrorResponse('Erreur lors de la récupération des événements', 500));
    }
});

// @desc    Obtenir les événements calendaires d'une classe
// @route   GET /api/v1/calendar/class/:classeId
// @access  Private
exports.getClassEvents = asyncHandler(async (req, res, next) => {
    try {
        const { classeId } = req.params;
        const { startDate, endDate, limit = 50 } = req.query;

        // Vérifier que l'utilisateur a le droit de voir ces événements
        const canView = await checkCalendarAccess(req.user, classeId, 'class');
        if (!canView) {
            return next(new ErrorResponse('Non autorisé à voir ce calendrier', 403));
        }

        // Récupérer les événements
        const events = await getClassCalendarEvents(classeId, {
            startDate,
            endDate,
            limit: parseInt(limit)
        });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des événements classe:', error);
        return next(new ErrorResponse('Erreur lors de la récupération des événements', 500));
    }
});

// Fonction utilitaire pour vérifier les droits d'accès au calendrier
const checkCalendarAccess = async (user, targetId, type) => {
    // Les parents peuvent voir les calendriers de leurs enfants
    if (user.role === 'PARENT' && type === 'student') {
        // TODO: Vérifier que l'élève est bien un enfant du parent
        return true; // Pour l'instant, autoriser tous les parents
    }
    
    // Les élèves peuvent voir leur propre calendrier
    if (user.role === 'ELEVE' && type === 'student') {
        return targetId === user._id.toString();
    }
    
    // Les professeurs peuvent voir les calendriers de leurs classes
    if (user.role === 'PROFESSEUR' && type === 'class') {
        // TODO: Vérifier que le professeur enseigne dans cette classe
        return true; // Pour l'instant, autoriser tous les professeurs
    }
    
    // Le censeur, proviseur et admin peuvent voir tous les calendriers
    if (['CENSEUR', 'PROVISEUR', 'ADMIN'].includes(user.role)) {
        return true;
    }
    
    return false;
};

// Fonction pour générer le calendrier général de l'école
const generateSchoolCalendarICal = async (options = {}) => {
    const { generateCalendarICal } = require('../utils/icalGenerator');
    
    // Événements généraux de l'école
    const schoolEvents = [
        {
            titre: 'Rentrée scolaire',
            description: 'Début de l\'année scolaire 2023-2024',
            dateDebut: new Date('2023-09-01T08:00:00'),
            dateFin: new Date('2023-09-01T12:00:00'),
            lieu: 'Établissement',
            categorie: 'ÉVÉNEMENT',
            statut: 'CONFIRMÉ'
        },
        {
            titre: 'Journée portes ouvertes',
            description: 'Présentation de l\'établissement aux familles',
            dateDebut: new Date('2024-02-10T09:00:00'),
            dateFin: new Date('2024-02-10T12:00:00'),
            lieu: 'Établissement',
            categorie: 'ÉVÉNEMENT',
            statut: 'CONFIRMÉ'
        },
        {
            titre: 'Fête de l\'école',
            description: 'Célébration annuelle de l\'établissement',
            dateDebut: new Date('2024-06-15T09:00:00'),
            dateFin: new Date('2024-06-15T17:00:00'),
            lieu: 'Établissement',
            categorie: 'ÉVÉNEMENT',
            statut: 'CONFIRMÉ'
        }
    ];
    
    return await generateCalendarICal(schoolEvents);
};

// Fonction pour récupérer les événements calendaires d'un élève
const getStudentCalendarEvents = async (eleveId, options = {}) => {
    const { getStudentEvents } = require('../utils/icalGenerator');
    
    return await getStudentEvents(eleveId, options);
};

// Fonction pour récupérer les événements calendaires d'une classe
const getClassCalendarEvents = async (classeId, options = {}) => {
    const { getClassEvents } = require('../utils/icalGenerator');
    
    return await getClassEvents(classeId, options);
};
