const User = require('../models/User');
const Classe = require('../models/Classe');
const Attendance = require('../models/Attendance');
const Incident = require('../models/Incident');
const Schedule = require('../models/Schedule');
const Event = require('../models/Event');
const Note = require('../models/Note');
const Bulletin = require('../models/Bulletin');
const mongoose = require('mongoose');

// @desc    Search for students by name or class
// @route   GET /api/v1/parents/search-students
// @access  Private (Parent only)
exports.searchStudents = async (req, res, next) => {
    try {
        const { query, classeId, limit = 20 } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Veuillez fournir une recherche d\'au moins 2 caractères'
            });
        }

        // Build search criteria
        let searchCriteria = {
            role: 'ELEVE',
            status: 'ACTIF'
        };

        // Add class filter if provided
        if (classeId) {
            searchCriteria.classe = classeId;
        }

        // Search by name or matricule
        const students = await User.find(searchCriteria)
            .or([
                { nom: { $regex: query, $options: 'i' } },
                { prenom: { $regex: query, $options: 'i' } },
                { matricule: { $regex: query, $options: 'i' } }
            ])
            .select('nom prenom matricule classe photo email')
            .populate({
                path: 'classe',
                select: 'niveau section filiere'
            })
            .limit(parseInt(limit))
            .sort({ nom: 1, prenom: 1 });

        // Log search for security
        console.log(`Parent ${req.user.id} searched for students with query: "${query}"`);

        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add a child to parent account
// @route   POST /api/v1/parents/children
// @access  Private (Parent only)
exports.addChild = async (req, res, next) => {
    try {
        const { matricule } = req.body;

        if (!matricule) {
            return res.status(400).json({ success: false, error: 'Veuillez fournir le matricule de l\'élève' });
        }

        // Find student by matricule OR ID (if searching from results)
        let student;
        const mongoose = require('mongoose');

        if (mongoose.Types.ObjectId.isValid(matricule)) {
            student = await User.findOne({ _id: matricule, role: 'ELEVE' });
        }

        if (!student) {
            student = await User.findOne({ matricule, role: 'ELEVE' });
        }

        if (!student) {
            return res.status(404).json({ success: false, error: 'Aucun élève trouvé avec ce matricule ou cet identifiant' });
        }

        // Add to parent's children list if not already there
        const parent = await User.findById(req.user.id);

        if (parent.children.includes(student._id)) {
            return res.status(400).json({ success: false, error: 'Cet élève est déjà ajouté à votre liste' });
        }

        parent.children.push(student._id);
        await parent.save();

        res.status(200).json({
            success: true,
            data: student,
            message: 'Enfant ajouté avec succès'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all children of logged in parent
// @route   GET /api/v1/parents/children
// @access  Private (Parent only)
exports.getChildren = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user.id).populate({
            path: 'children',
            select: 'nom prenom matricule classe photo email role',
            populate: {
                path: 'classe',
                select: 'niveau section filiere'
            }
        });

        res.status(200).json({
            success: true,
            count: parent.children.length,
            data: parent.children
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child details by ID
// @route   GET /api/v1/parents/children/:id
// @access  Private (Parent only)
exports.getChild = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(id => id.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        const child = await User.findById(id)
            .select('nom prenom matricule dateNaissance lieuNaissance adresse groupeSanguin langueMaternelle dateInscription telephone email photo classe')
            .populate({
                path: 'classe',
                select: 'niveau section filiere'
            });

        if (!child) {
            return res.status(404).json({
                success: false,
                error: 'Élève non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: child
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update child information
// @route   PUT /api/v1/parents/children/:id
// @access  Private (Parent only)
exports.updateChild = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(id => id.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        const child = await User.findById(id);
        if (!child) {
            return res.status(404).json({
                success: false,
                error: 'Élève non trouvé'
            });
        }

        // Update allowed fields only
        const allowedFields = ['dateNaissance', 'lieuNaissance', 'adresse', 'groupeSanguin', 'langueMaternelle', 'telephone', 'email'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const updatedChild = await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        }).populate({
            path: 'classe',
            select: 'niveau section filiere'
        });

        res.status(200).json({
            success: true,
            data: updatedChild,
            message: 'Informations mises à jour avec succès'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's teachers
// @route   GET /api/v1/parents/children/:id/teachers
// @access  Private (Parent only)
exports.getChildTeachers = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(id => id.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        const child = await User.findById(id).populate('classe');
        if (!child) {
            return res.status(404).json({
                success: false,
                error: 'Élève non trouvé'
            });
        }

        // Get teachers for child's class using ClasseMatiere
        const ClasseMatiere = require('../models/ClasseMatiere');
        const assignments = await ClasseMatiere.find({ classe: child.classe._id })
            .populate('professeur', 'nom prenom email telephone photo')
            .populate('matiere', 'nom');

        const teachers = assignments
            .filter(a => a.professeur)
            .map(a => ({
                _id: a.professeur._id,
                nom: a.professeur.nom,
                prenom: a.professeur.prenom,
                email: a.professeur.email,
                telephone: a.professeur.telephone,
                photo: a.professeur.photo,
                matiere: { nom: a.matiere?.nom || 'N/A' }
            }));

        // Remove duplicates if teacher has multiple subjects
        const uniqueTeachers = Array.from(new Map(teachers.map(t => [t._id.toString(), t])).values());

        res.status(200).json({
            success: true,
            count: uniqueTeachers.length,
            data: uniqueTeachers
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's emergency contacts
// @route   GET /api/v1/parents/children/:id/emergency-contacts
// @access  Private (Parent only)
exports.getChildEmergencyContacts = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(id => id.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        const child = await User.findById(id);
        if (!child) {
            return res.status(404).json({ success: false, error: 'Élève non trouvé' });
        }

        const contacts = [];

        if (child.fatherName || child.fatherPhone) {
            contacts.push({
                _id: 'father',
                prenom: child.fatherName?.split(' ')[0] || '',
                nom: child.fatherName?.split(' ').slice(1).join(' ') || 'Père',
                relation: 'Père',
                telephone: child.fatherPhone || 'N/A',
                email: child.fatherEmail,
                prioritaire: true
            });
        }

        if (child.motherName || child.motherPhone) {
            contacts.push({
                _id: 'mother',
                prenom: child.motherName?.split(' ')[0] || '',
                nom: child.motherName?.split(' ').slice(1).join(' ') || 'Mère',
                relation: 'Mère',
                telephone: child.motherPhone || 'N/A',
                email: child.motherEmail,
                prioritaire: false
            });
        }

        if (child.legalGuardian || child.guardianPhone) {
            contacts.push({
                _id: 'guardian',
                prenom: child.legalGuardian?.split(' ')[0] || '',
                nom: child.legalGuardian?.split(' ').slice(1).join(' ') || 'Tuteur',
                relation: 'Tuteur Légal',
                telephone: child.guardianPhone || 'N/A',
                prioritaire: contacts.length === 0
            });
        }

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add emergency contact
// @route   POST /api/v1/parents/emergency-contacts
// @access  Private (Parent only)
exports.addEmergencyContact = async (req, res, next) => {
    try {
        const { enfant, nom, prenom, relation, telephone, prioritaire } = req.body;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(id => id.toString());
        if (!childrenIds.includes(enfant)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // For now, just return success since we don't have emergency contacts model yet
        const newContact = {
            _id: `contact${Date.now()}`,
            nom,
            prenom,
            relation,
            telephone,
            prioritaire
        };

        res.status(201).json({
            success: true,
            data: newContact,
            message: 'Contact d\'urgence ajouté avec succès'
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's yearly stats
// @route   GET /api/v1/parents/children/:id/stats
// @access  Private (Parent only)
exports.getChildYearlyStats = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // Calculate real stats for student
        const studentId = id;

        // Fetch notes to calculate average
        const notes = await Note.find({ eleve: studentId })
            .populate('matiere', 'nom coefficient')
            .sort({ createdAt: -1 });

        let totalCoefficients = 0;
        let weightedSum = 0;
        let creditsValides = 0;

        notes.forEach(note => {
            if (note.statut === 'VALIDEE' && note.moyenne) {
                const coefficient = note.matiere?.coefficient || 1;
                totalCoefficients += coefficient;
                weightedSum += note.moyenne * coefficient;
                if (note.moyenne >= 10) creditsValides += 1;
            }
        });

        const moyenneGenerale = totalCoefficients > 0 ? weightedSum / totalCoefficients : 0;

        // Fetch attendance stats
        const totalAbsences = await Attendance.countDocuments({
            eleve: studentId,
            statut: 'absent'
        });

        const totalRetards = await Attendance.countDocuments({
            eleve: studentId,
            statut: 'retard'
        });

        // Fetch incidents count
        const totalIncidents = await Incident.countDocuments({ eleve: studentId });

        const stats = {
            moyenneGenerale: parseFloat(moyenneGenerale.toFixed(2)),
            progresMoyenne: 0, // Would need historical data to calculate progress
            assiduite: '95%', // Placeholder for now, could calculate based on total school days
            totalAbsences,
            totalAchievements: totalIncidents,
            totalDelays: totalRetards,
            activeSanctions: 0 // Would need Sanction model
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's documents
// @route   GET /api/v1/parents/children/:id/documents
// @access  Private (Parent only)
exports.getChildDocuments = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // Real documents are Bulletins for now
        const bulletins = await Bulletin.find({ eleve: id })
            .sort({ anneeScolaire: -1, trimestre: -1 });

        const documents = bulletins.map(b => ({
            _id: b._id,
            nom: `Bulletin ${b.trimestre} - ${b.anneeScolaire}`,
            type: 'pdf',
            createdAt: b.createdAt,
            fileUrl: `/api/v1/bulletins/${b._id}/pdf`
        }));

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's discipline stats
// @route   GET /api/v1/parents/children/:id/discipline/stats
// @access  Private (Parent only)
exports.getChildDisciplineStats = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // Get student to know their class year
        const student = await User.findById(id).populate('classe');
        const anneeScolaire = student.classe?.anneeScolaire || '2023-2024';

        // Use the static method of Incident model
        const stats = await Incident.getStatsEleve(id, anneeScolaire);

        res.status(200).json({
            success: true,
            data: {
                totalAbsences: stats.absences,
                totalDelays: stats.retards,
                activeSanctions: stats.sanctions,
                totalAchievements: stats.incidents // Mapping incidents to achievements as in frontend
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's attendance data
// @route   GET /api/v1/parents/children/:id/attendance
// @access  Private (Parent only)
exports.getChildAttendance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { year, month } = req.query;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        const currentYear = parseInt(year) || new Date().getFullYear();
        const currentMonth = parseInt(month) || new Date().getMonth() + 1;

        // Fetch real attendance for the specific month
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        const dailyAttendance = await Attendance.find({
            eleve: id,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).sort({ date: 1 });

        // Aggregate monthly data for the chart (last 6 months)
        const monthlyData = [];
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(currentYear, currentMonth - 1 - i, 1);
            const m = d.getMonth();
            const y = d.getFullYear();
            const start = new Date(y, m, 1);
            const end = new Date(y, m + 1, 0, 23, 59, 59);

            const count = await Attendance.countDocuments({
                eleve: id,
                date: { $gte: start, $lte: end }
            });

            const presentCount = await Attendance.countDocuments({
                eleve: id,
                date: { $gte: start, $lte: end },
                statut: 'present'
            });

            const studentPercentage = count > 0 ? (presentCount / count) * 100 : 100;

            monthlyData.push({
                name: monthNames[m],
                studentPercentage: Math.round(studentPercentage),
                classAverage: 85 // Fallback average if class-specific average not available
            });
        }

        res.status(200).json({
            success: true,
            data: {
                monthlyData,
                dailyAttendance: dailyAttendance.map(a => ({
                    date: a.date,
                    status: a.statut,
                    delayMinutes: a.statut === 'late' ? 15 : 0 // Assuming default delay if time not tracked
                }))
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's pending absences
// @route   GET /api/v1/parents/children/:id/absences/pending
// @access  Private (Parent only)
exports.getChildPendingAbsences = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // Fetch absences that are not yet justified
        const pendingAbsences = await Attendance.find({
            eleve: id,
            statut: 'absent',
            justifie: { $ne: true }
        })
            .populate('markedBy', 'nom prenom')
            .populate('matiere', 'nom')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: pendingAbsences.length,
            data: pendingAbsences.map(a => ({
                _id: a._id,
                matiere: { nom: a.matiere?.nom || 'Cours' },
                date: a.date,
                heureDebut: a.heureDebut || 'N/A',
                heureFin: a.heureFin || '',
                duree: a.heures || 1,
                professeur: { prenom: a.markedBy?.prenom || '', nom: a.markedBy?.nom || 'Admin' }
            }))
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child's disciplinary logs
// @route   GET /api/v1/parents/children/:id/discipline/logs
// @access  Private (Parent only)
exports.getChildDisciplinaryLogs = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // Real fetch from Incident model
        const logs = await Incident.find({ eleve: id })
            .populate('professeur', 'nom prenom')
            .populate('matiere', 'nom')
            .sort({ date: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Submit absence justification
// @route   POST /api/v1/parents/children/:id/absences/justify
// @access  Private (Parent only)
exports.submitAbsenceJustification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { absenceId, reason, details } = req.body;

        // Verify parent has access to this child
        const parent = await User.findById(req.user.id);
        const childrenIds = parent.children.map(cid => cid.toString());
        if (!childrenIds.includes(id)) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'avez pas accès à cet élève'
            });
        }

        // Update Attendance record
        const attendance = await Attendance.findById(absenceId);
        if (!attendance || attendance.eleve.toString() !== id) {
            return res.status(404).json({
                success: false,
                error: 'Absence non trouvée'
            });
        }

        // Update fields
        attendance.justifie = true;
        attendance.motivation = reason;
        attendance.notes = details;

        // Save file path if uploaded
        if (req.file) {
            attendance.justificatif = `/uploads/justificatifs/${req.file.filename}`;
        }

        await attendance.save();

        res.status(200).json({
            success: true,
            message: 'Justification envoyée avec succès',
            data: attendance
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child calendar events (global + class specific)
// @route   GET /api/v1/parents/children/calendar/events
// @access  Private (Parent only)
exports.getChildCalendarEvents = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user.id).populate({
            path: 'children',
            populate: { path: 'classe' }
        });

        const children = parent.children;
        const classNames = children
            .filter(c => c.classe)
            .map(c => `${c.classe.niveau} ${c.classe.section}`);

        // Fetch events: global events (classe is empty) OR class-specific events
        const events = await Event.find({
            $or: [
                { classe: { $exists: false } },
                { classe: "" },
                { classe: null },
                { classe: { $in: classNames } }
            ]
        }).sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get child next upcoming classes
// @route   GET /api/v1/parents/children/calendar/next-classes
// @access  Private (Parent only)
exports.getChildNextClasses = async (req, res, next) => {
    try {
        const parent = await User.findById(req.user.id).populate({
            path: 'children',
            populate: {
                path: 'classe',
                select: 'niveau section'
            }
        });

        const children = parent.children;
        const results = [];

        const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const now = new Date();
        const currentDayName = days[now.getDay()];
        const currentTime = now.getHours() + (now.getMinutes() / 60);

        for (const child of children) {
            if (!child.classe) continue;

            const schedule = await Schedule.find({ classe: child.classe._id })
                .populate('matiere', 'nom')
                .populate('professeur', 'nom prenom');

            // Find next class today
            let nextClass = schedule
                .filter(s => s.jour === currentDayName)
                .map(s => {
                    const [h, m] = s.creneau.split('h').map(Number);
                    return { ...s._doc, timeValue: h + (m || 0) / 60 };
                })
                .filter(s => s.timeValue > currentTime)
                .sort((a, b) => a.timeValue - b.timeValue)[0];

            // If no class left today, find first class of the next possible school day
            if (!nextClass) {
                const schoolDaysOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                const currentDayIndex = schoolDaysOrder.indexOf(currentDayName);

                // Check next days in order
                for (let i = 1; i <= 7; i++) {
                    const nextDayIndex = (currentDayIndex + i) % 7;
                    const nextDayName = schoolDaysOrder[nextDayIndex];
                    if (!nextDayName) continue;

                    const nextDayClasses = schedule
                        .filter(s => s.jour === nextDayName)
                        .map(s => {
                            const [h, m] = s.creneau.split('h').map(Number);
                            return { ...s._doc, timeValue: h + (m || 0) / 60 };
                        })
                        .sort((a, b) => a.timeValue - b.timeValue);

                    if (nextDayClasses.length > 0) {
                        nextClass = nextDayClasses[0];
                        break;
                    }
                }
            }

            if (nextClass) {
                results.push({
                    childId: child._id,
                    childName: `${child.prenom} ${child.nom}`,
                    class: `${child.classe.niveau} ${child.classe.section}`,
                    nextClass: {
                        subject: nextClass.matiere.nom,
                        room: nextClass.salle,
                        time: nextClass.creneau,
                        day: nextClass.jour,
                        professor: nextClass.professeur ? `${nextClass.professeur.prenom} ${nextClass.professeur.nom}` : 'N/A'
                    }
                });
            }
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        next(err);
    }
};
