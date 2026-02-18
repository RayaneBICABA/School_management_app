const User = require('../models/User');
const xlsx = require('xlsx');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        let query = {};
        if (req.query.role) query.role = req.query.role;
        if (req.query.classe) query.classe = req.query.classe;

        const users = await User.find(query).populate('classe');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create user (Admin)
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
    try {
        // Nettoyer le matricule : convertir chaîne vide en undefined
        if (req.body.matricule === '' || req.body.matricule === null) {
            delete req.body.matricule;
        }

        // Si aucun mot de passe n'est fourni, générer un mot de passe par défaut
        if (!req.body.password) {
            // Générer un mot de passe par défaut basé sur le matricule ou email
            const defaultPassword = req.body.matricule || req.body.email?.split('@')[0] || 'Password123';
            req.body.password = defaultPassword;
        }

        const user = await User.create(req.body);

        // Auto-create bulletins for students
        if (user.role === 'ELEVE' && user.classe) {
            await createBulletinsForStudent(user);
        }

        // Retourner le mot de passe généré dans la réponse (seulement à la création)
        const response = {
            success: true,
            data: user
        };

        // Si un mot de passe par défaut a été généré, l'inclure dans la réponse
        if (!req.body.passwordProvided) {
            response.generatedPassword = req.body.password;
            response.message = `Utilisateur créé avec le mot de passe par défaut: ${req.body.password}. L'utilisateur devra le changer à la première connexion.`;
        }

        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Import students from Excel
// @route   POST /api/v1/users/import
// @access  Private/Admin/Censeur
exports.importStudents = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Veuillez uploader un fichier Excel' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const students = xlsx.utils.sheet_to_json(sheet);

        if (!students || students.length === 0) {
            return res.status(400).json({ success: false, error: 'Le fichier est vide ou mal formaté' });
        }

        const classeId = req.body.classeId;
        const createdUsers = [];
        const errors = [];

        for (const student of students) {
            // Basic validation
            if (!student.Nom || !student.Prenom || !student.Email) {
                errors.push(`Ligne ignorée (Données manquantes): ${JSON.stringify(student)}`);
                continue;
            }

            try {
                // Check duplicate email
                const existingUser = await User.findOne({ email: student.Email });
                if (existingUser) {
                    errors.push(`Email déjà utilisé: ${student.Email}`);
                    continue;
                }

                // Create User
                const newUser = await User.create({
                    nom: student.Nom,
                    prenom: student.Prenom,
                    email: student.Email,
                    telephone: student.Telephone || '',
                    role: 'ELEVE',
                    classe: classeId,
                    password: 'password123', // Default password
                    status: 'ACTIF'
                });

                createdUsers.push(newUser);

                // Auto-create bulletins for imported students
                await createBulletinsForStudent(newUser);
            } catch (err) {
                errors.push(`Erreur pour ${student.Email}: ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            count: createdUsers.length,
            errors: errors.length > 0 ? errors : undefined,
            message: `${createdUsers.length} élèves importés avec succès.`
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Bulk create students from Excel import (Proviseur)
// @route   POST /api/v1/users/bulk-students
// @access  Private/Proviseur
exports.bulkCreateStudents = async (req, res, next) => {
    try {
        const { students, classeId } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Aucun élève fourni'
            });
        }

        if (!classeId) {
            return res.status(400).json({
                success: false,
                error: 'Classe non spécifiée'
            });
        }

        const createdStudents = [];
        const errors = [];

        for (let i = 0; i < students.length; i++) {
            const studentData = students[i];

            // Validate required fields (Matricule, Nom, Prénom)
            if (!studentData.Matricule || !studentData.Nom || !studentData.Prenom) {
                errors.push({
                    row: i + 2, // +2 because Excel row 1 is header, and array is 0-indexed
                    error: 'Matricule, Nom et Prénom sont requis',
                    data: studentData
                });
                continue;
            }

            try {
                // Check if student with this matricule already exists
                const existingStudent = await User.findOne({ matricule: studentData.Matricule });

                if (existingStudent) {
                    // Update their class if they exist
                    existingStudent.classe = classeId;
                    await existingStudent.save();
                    createdStudents.push(existingStudent);
                } else {
                    // Create new student
                    const newStudent = await User.create({
                        matricule: studentData.Matricule,
                        nom: studentData.Nom,
                        prenom: studentData.Prenom,
                        email: `${studentData.Matricule}@eleve.school`,
                        password: studentData.Matricule, // Default password = matricule
                        role: 'ELEVE',
                        classe: classeId,
                        status: 'ACTIF'
                    });
                    await createBulletinsForStudent(newStudent);
                    createdStudents.push(newStudent);
                }
            } catch (error) {
                errors.push({
                    row: i + 2,
                    error: error.message,
                    data: studentData
                });
            }
        }

        res.status(201).json({
            success: true,
            count: createdStudents.length,
            data: createdStudents,
            errors: errors.length > 0 ? errors : undefined,
            message: `${createdStudents.length} élève(s) importé(s) avec succès${errors.length > 0 ? `, ${errors.length} erreur(s)` : ''}.`
        });
    } catch (err) {
        next(err);
    }
};

// Helper function to create empty bulletins for a student
const createBulletinsForStudent = async (student) => {
    try {
        const Bulletin = require('../models/Bulletin');
        const Classe = require('../models/Classe');
        const classe = await Classe.findById(student.classe);

        if (!classe) return;

        const periodes = classe.filiere === 'Technique'
            ? ['Semestre 1', 'Semestre 2']
            : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

        const bulletins = periodes.map(periode => ({
            eleve: student._id,
            classe: student.classe,
            periode: periode,
            anneeScolaire: classe.anneeScolaire || '2025-2026',
            notes: [],
            statut: 'BROUILLON'
        }));

        await Bulletin.insertMany(bulletins);
    } catch (error) {
        console.error(`Erreur création bulletins auto pour ${student._id}:`, error);
    }
};
