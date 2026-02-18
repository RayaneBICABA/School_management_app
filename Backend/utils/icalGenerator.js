const icalGenerator = require('ical-generator').default;
const { DateTime } = require('luxon');

/**
 * Génère un fichier iCal pour le calendrier scolaire
 * @param {Array} events - Liste des événements calendaires
 * @returns {String} - Contenu du fichier iCal
 */
const generateCalendarICal = async (events) => {
  try {
    // Créer un nouveau calendrier
    const calendar = icalGenerator({ name: 'Calendrier Scolaire - École Wend Puiré de Saaba' });

    // Ajouter chaque événement au calendrier
    events.forEach(event => {
      try {
        const startDate = new DateTime(event.dateDebut);
        const endDate = new DateTime(event.dateFin);
        
        // Créer l'événement
        const calendarEvent = calendar.createEvent({
          start: startDate.toJSDate(),
          end: endDate.toJSDate(),
          summary: event.titre || 'Événement scolaire',
          description: event.description || '',
          location: event.lieu || 'Établissement',
          status: event.statut === 'CONFIRMÉ' ? 'CONFIRMED' : 'TENTATIVE'
        });

        // Ajouter des catégories si spécifiées
        if (event.categorie) {
          calendarEvent.categories = [event.categorie];
        }

        // Ajouter des propriétés personnalisées si nécessaire
        if (event.type) {
          calendarEvent.set('X-MICROSOFT-CDO-BUSYSTATUS', event.type === 'EXAMEN' ? 'TENTATIVE' : 'CONFIRMED');
        }
        
        if (event.professeur) {
          calendarEvent.set('X-MICROSOFT-CDO-ATTENDEES', event.professeur);
        }

        if (event.classe) {
          calendarEvent.set('X-MICROSOFT-CDO-REQUIREDATTENDEES', event.classe);
        }

      } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement:', error);
      }
    });

    // Ajouter des événements récurrents pour les cours hebdomadaires
    addRecurringEvents(calendar);

    // Générer le contenu iCal
    const icalData = calendar.toString();
    
    return icalData;
    
  } catch (error) {
    console.error('Erreur lors de la génération du calendrier iCal:', error);
    throw error;
  }
};

/**
 * Ajoute des événements récurrents (cours, vacances, etc.)
 * @param {Object} calendar - Objet calendrier iCal
 */
const addRecurringEvents = (calendar) => {
  try {
    // Ajouter les jours fériés de l'année scolaire 2023-2024
    const holidays = [
      { name: 'Vacances de la Toussaint', start: '2024-04-15', end: '2024-05-02' },
      { name: 'Vacances d\'été', start: '2024-07-01', end: '2024-08-31' },
      { name: 'Vacances de la Toussaint', start: '2024-10-21', end: '2024-11-04' },
      { name: 'Vacances de Noël', start: '2024-12-20', end: '2025-01-04' }
    ];

    holidays.forEach(holiday => {
      const holidayEvent = calendar.createEvent({
        start: new Date(holiday.start),
        end: new Date(holiday.end),
        summary: holiday.name,
        description: 'Vacances scolaires',
        status: 'CONFIRMED'
      });
      
      if (holidayEvent && holidayEvent.categories) {
        holidayEvent.categories = ['VACANCES'];
      }
    });

    // Ajouter les jours fériés fixes
    const fixedHolidays = [
      { date: '2024-01-01', name: 'Jour de l\'An' },
      { date: '2024-04-01', name: 'Lundi de Pâques' },
      { date: '2024-05-01', name: 'Fête du Travail' },
      { date: '2024-08-04', name: 'Fête de l\'Indépendance' },
      { date: '2024-08-15', name: 'Assomption' },
      { date: '2024-11-01', name: 'Toussaint' },
      { date: '2024-12-25', name: 'Noël' }
    ];

    fixedHolidays.forEach(holiday => {
      const holidayEvent = calendar.createEvent({
        start: new Date(holiday.date),
        end: new Date(holiday.date),
        summary: holiday.name,
        description: 'Jour férié',
        status: 'CONFIRMED'
      });
      
      if (holidayEvent && holidayEvent.categories) {
        holidayEvent.categories = ['JOURS FÉRIÉS'];
      }
    });

    // Ajouter les jours de semaine d'école (lundi-vendredi)
    const schoolYearStart = new Date('2023-09-01');
    const schoolYearEnd = new Date('2024-06-30');
    
    // Générer les jours d'école (du lundi au vendredi)
    let currentDate = new Date(schoolYearStart);
    
    while (currentDate <= schoolYearEnd) {
      const dayOfWeek = currentDate.getDay();
      
      // Si c'est un jour de semaine (lundi=1, vendredi=5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const schoolEvent = calendar.createEvent({
          start: new Date(currentDate),
          end: new Date(currentDate),
          summary: 'Journée d\'école',
          description: 'Cours réguliers',
          status: 'CONFIRMED'
        });
        
        if (schoolEvent && schoolEvent.categories) {
          schoolEvent.categories = ['COURS'];
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

  } catch (error) {
    console.error('Erreur lors de l\'ajout des événements récurrents:', error);
  }
};

/**
 * Génère un calendrier iCal pour un élève spécifique
 * @param {String} eleveId - ID de l'élève
 * @param {Object} options - Options de filtrage
 * @returns {String} - Contenu du fichier iCal
 */
const generateStudentCalendarICal = async (eleveId, options = {}) => {
  try {
    const { startDate, endDate, includeHolidays, includeWeekends } = options;
    
    // Récupérer les événements de l'élève depuis la base de données
    const events = await getStudentEvents(eleveId, options);
    
    // Générer le calendrier iCal
    const icalData = await generateCalendarICal(events);
    
    return icalData;
    
  } catch (error) {
    console.error('Erreur lors de la génération du calendrier élève:', error);
    throw error;
  }
};

/**
 * Génère un calendrier iCal pour une classe spécifique
 * @param {String} classeId - ID de la classe
 * @param {Object} options - Options de filtrage
 * @returns {String} - Contenu du fichier iCal
 */
const generateClassCalendarICal = async (classeId, options = {}) => {
  try {
    const { startDate, endDate, includeHolidays, includeWeekends } = options;
    
    // Récupérer les événements de la classe depuis la base de données
    const events = await getClassEvents(classeId, options);
    
    // Générer le calendrier iCal
    const icalData = await generateCalendarICal(events);
    
    return icalData;
    
  } catch (error) {
    console.error('Erreur lors de la génération du calendrier classe:', error);
    throw error;
  }
};

/**
 * Récupère les événements d'un élève (simulation pour l'instant)
 * @param {String} eleveId - ID de l'élève
 * @param {Object} options - Options de filtrage
 * @returns {Array} - Liste des événements
 */
const getStudentEvents = async (eleveId, options = {}) => {
  // Pour l'instant, nous allons simuler des événements
  // En production, cela viendrait de la base de données
  
  const mockEvents = [
    {
      id: '1',
      titre: 'Examen de Mathématiques',
      description: 'Évaluation sommative du trimestre',
      dateDebut: new Date('2024-01-15T09:00:00'),
      dateFin: new Date('2024-01-15T11:00:00'),
      lieu: 'Salle A101',
      categorie: 'EXAMEN',
      type: 'EXAMEN',
      statut: 'CONFIRMÉ',
      professeur: 'M. Martin',
      classe: '3ème A',
      eleveId: eleveId
    },
    {
      id: '2',
      titre: 'Réunion Parents-Professeurs',
      description: 'Réunion trimestrielle',
      dateDebut: new Date('2024-01-20T15:00:00'),
      dateFin: new Date('2024-01-20T17:00:00'),
      lieu: 'Salle des professeurs',
      categorie: 'RÉUNION',
      statut: 'CONFIRMÉ',
      classe: '3ème A',
      eleveId: eleveId
    },
    {
      id: '3',
      titre: 'Sortie pédagogique',
      description: 'Visite au musée national',
      dateDebut: new Date('2024-02-10T08:00:00'),
      dateFin: new Date('2024-02-10T17:00:00'),
      lieu: 'Musée National',
      categorie: 'SORTIE',
      statut: 'CONFIRMÉ',
      classe: '3ème A',
      eleveId: eleveId
    },
    {
      id: '4',
      titre: 'Journée sportive',
      description: 'Compétitions inter-classes',
      dateDebut: new Date('2024-03-15T09:00:00'),
      dateFin: new Date('2024-03-15T17:00:00'),
      lieu: 'Terrain de sport',
      categorie: 'SPORT',
      statut: 'CONFIRMÉ',
      classe: '3ème A',
      eleveId: eleveId
    }
  ];
  
  // Filtrer par date si spécifié
  if (options.startDate || options.endDate) {
    return mockEvents.filter(event => {
      const eventDate = new Date(event.dateDebut);
      const start = options.startDate ? new Date(options.startDate) : null;
      const end = options.endDate ? new Date(options.endDate) : null;
      
      return (!start || eventDate >= start) && (!end || eventDate <= end);
    });
  }
  
  return mockEvents;
};

/**
 * Récupère les événements d'une classe (simulation pour l'instant)
 * @param {String} classeId - ID de la classe
 * @param {Object} options - Options de filtrage
 * @returns {Array} - Liste des événements
 */
const getClassEvents = async (classeId, options = {}) => {
  // Pour l'instant, nous allons simuler des événements de classe
  // En production, cela viendrait de la base de données
  
  const mockEvents = [
    {
      id: '1',
      titre: 'Examen de Français',
      description: 'Évaluation sommative du trimestre',
      dateDebut: new Date('2024-01-15T09:00:00'),
      dateFin: new Date('2024-01-15T11:00:00'),
      lieu: 'Salle A101',
      categorie: 'EXAMEN',
      type: 'EXAMEN',
      statut: 'CONFIRMÉ',
      professeur: 'Mme. Bernard',
      classeId: classeId
    },
    {
      id: '2',
      titre: 'Conseil de classe',
      description: 'Réunion trimestrielle',
      dateDebut: new Date('2024-01-20T15:00:00'),
      dateFin: new Date('2024-01-20T17:00:00'),
      lieu: 'Salle des professeurs',
      categorie: 'RÉUNION',
      statut: 'CONFIRMÉ',
      classeId: classeId
    },
    {
      id: '3',
      titre: 'Journée portes ouvertes',
      description: 'Présentation de l\'établissement',
      dateDebut: new Date('2024-02-10T09:00:00'),
      dateFin: new Date('2024-02-10T12:00:00'),
      lieu: 'Salle de réunion',
      categorie: 'ÉVÉNEMENT',
      statut: 'CONFIRMÉ',
      classeId: classeId
    }
  ];
  
  // Filtrer par date si spécifié
  if (options.startDate || options.endDate) {
    return mockEvents.filter(event => {
      const eventDate = new Date(event.dateDebut);
      const start = options.startDate ? new Date(options.startDate) : null;
      const end = options.endDate ? new Date(options.endDate) : null;
      
      return (!start || eventDate >= start) && (!end || eventDate <= end);
    });
  }
  
  return mockEvents;
};

module.exports = {
  generateCalendarICal,
  generateStudentCalendarICal,
  generateClassCalendarICal,
  getStudentEvents,
  getClassEvents
};
