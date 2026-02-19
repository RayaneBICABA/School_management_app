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
        console.log('DEBUG: Import Request Body:', req.body);
        console.log('DEBUG: Import Request Files Keys:', req.files ? Object.keys(req.files) : 'No files');

        if (!req.files || !req.files.file) {
            console.log('ERROR: File missing in request');
            return res.status(400).json({ success: false, error: 'Veuillez uploader un fichier Excel' });
        }

        let students = [];
        try {
            // express-fileupload provides .data buffer
            const workbook = xlsx.read(req.files.file.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            students = xlsx.utils.sheet_to_json(sheet);
        } catch (parseError) {
            console.error('Error parsing Excel file:', parseError);
            return res.status(400).json({ success: false, error: 'Le fichier Excel est corrompu ou illisible.' });
        }

        if (!students || students.length === 0) {
            return res.status(400).json({ success: false, error: 'Le fichier est vide ou mal formaté' });
        }

        const classeId = req.body.classeId;
        const createdUsers = [];
        const errors = [];

        // Helper to generate a random matricule if missing
        const generateMatricule = () => {
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `M${timestamp}${random}`;
        };

        // Helper to parse date from Excel serial or string
        const parseDate = (excelDate) => {
            if (!excelDate) return undefined;
            // If number (Excel serial date)
            if (typeof excelDate === 'number') {
                // Excel base date is Dec 30 1899
                // JavaScript Date is milliseconds since Jan 1 1970
                // Difference in days is 25569
                // 86400000 ms per day
                const date = new Date((excelDate - 25569) * 86400 * 1000);
                return date;
            }
            // If string, try to parse
            const date = new Date(excelDate);
            return isNaN(date.getTime()) ? undefined : date;
        };

        // Helper to find key case-insensitive and robust
        const findKey = (obj, partialKey) => {
            const keys = Object.keys(obj);
            // Normalize search terms: split by space, remove non-alphanumeric
            const searchParts = partialKey.toLowerCase().split(/\s+/).map(p => p.replace(/[^a-z0-9]/g, ''));

            return keys.find(k => {
                const keyNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                // Iterate search parts and check if they exist in key
                return searchParts.every(part => keyNorm.includes(part));
            });
        };

        for (const student of students) {
            // Updated Column Names:
            // "Matricule", "Nom et prenoms", "date de naissance", "lieu de naissance(optionel)", "classe redouble(optionel)", "Sexe(M ou F)", "statut"

            // Debugging: Log keys of the student object to verify headers
            // console.log("Student Keys:", Object.keys(student));

            // 1. Dynamic Column Detection
            let nom = "Inconnu";
            let prenom = "Inconnu";

            const keys = Object.keys(student);
            const normalizedKeys = keys.map(k => ({
                original: k,
                norm: k.toLowerCase().replace(/[^a-z0-9]/g, '')
            }));

            // Strategy A: Look for explicit combined "Nom" AND "Prenom" in the same key
            // Matches: "Nom et Prénoms", "Noms et Prenoms", "NomComple", "NomPrenom"
            let fullNameKeyObj = normalizedKeys.find(k =>
                (k.norm.includes('nom') && k.norm.includes('prenom')) ||
                k.norm.includes('nomcomplet') ||
                k.norm.includes('nometprenom')
            );

            let fullName = fullNameKeyObj ? student[fullNameKeyObj.original] : undefined;

            if (fullName) {
                // Split logic
                const parts = String(fullName).trim().split(/\s+/);
                if (parts.length > 0) {
                    nom = parts[0];
                    if (parts.length > 1) {
                        prenom = parts.slice(1).join(" ");
                    } else {
                        prenom = ""; // Empty string if only one name, better than "Inconnu" for display
                        // Or if user prefers, keep "Inconnu" but typically for "Jean", prenom is empty.
                        // User script said "Jean Dupont" -> one col.
                    }
                }
            } else {
                // Strategy B: Separate Columns (Stricter Match)
                // "Nom" should be "Nom" or "Noms" or "Last Name", but NOT inside "Prenoms"
                // "Prenom" should be "Prenom" or "First Name"

                const nomKeyObj = normalizedKeys.find(k =>
                    k.norm === 'nom' || k.norm === 'noms' || k.norm === 'lastname' || k.norm === 'nomfamille'
                );
                const prenomKeyObj = normalizedKeys.find(k =>
                    k.norm === 'prenom' || k.norm === 'prenoms' || k.norm === 'firstname' || k.norm === 'prnoms'
                );

                if (nomKeyObj) nom = student[nomKeyObj.original];
                if (prenomKeyObj) prenom = student[prenomKeyObj.original];
            }

            // Heuristic for "Inconnu" fallback if loose match needed (e.g. "Eleve" as Name?)
            // If we still have defaults, try the old loose findKey for "Nom" only as a last resort
            if (nom === "Inconnu" && prenom === "Inconnu") {
                const looseNom = findKey(student, "Nom");
                if (looseNom && !looseNom.toLowerCase().includes('prenom')) {
                    nom = student[looseNom];
                    // If this column has spaces, maybe it was the full name?
                    if (String(nom).trim().includes(' ')) {
                        const p = String(nom).trim().split(/\s+/);
                        nom = p[0];
                        prenom = p.slice(1).join(" ");
                    }
                }
            }

            if ((!nom || nom === "Inconnu") && (!prenom || prenom === "Inconnu") && !fullName) {
                errors.push(`Ligne ignorée (Nom/Prénom introuvable): ${JSON.stringify(student)}`);
                continue;
            }

            try {
                // 2. Handle Matricule
                let matriculeKey = findKey(student, "Matricule");
                let matricule = matriculeKey ? student[matriculeKey] : undefined;

                if (!matricule) {
                    matricule = generateMatricule();
                } else {
                    // Sanitize provided matricule
                    matricule = String(matricule).trim().replace(/\s+/g, '');
                    const existingMatricule = await User.findOne({ matricule: matricule });
                    if (existingMatricule) {
                        errors.push(`Matricule déjà existant: ${matricule} (${nom} ${prenom})`);
                        continue;
                    }
                }

                // 3. Handle Other Fields
                const dateKey = findKey(student, "date de naissance") || findKey(student, "naissance");
                const dateNaissance = parseDate(dateKey ? student[dateKey] : undefined);

                const lieuKey = findKey(student, "lieu de naissance") || findKey(student, "lieu");
                const lieuNaissance = lieuKey ? student[lieuKey] : undefined;

                // Redouble handling
                let isRedoublant = false;
                const redoubleKey = findKey(student, "redouble") || findKey(student, "redoublant");
                if (redoubleKey) {
                    const val = String(student[redoubleKey]).toLowerCase().trim();
                    if (['oui', 'yes', 'true', '1', 'redoublant', 'r'].includes(val)) {
                        isRedoublant = true;
                    }
                }

                // Sexe handling
                let sexe = 'M'; // Default to M if unknown, strict schema requires enum? No, let's try to parse
                const sexeKey = findKey(student, "sexe") || findKey(student, "genre");
                if (sexeKey) {
                    const s = String(student[sexeKey]).toUpperCase().trim();
                    if (s.startsWith('M') || s === 'GARÇON') sexe = 'M';
                    else if (s.startsWith('F')) sexe = 'F';
                }

                // Status handling
                // 'status' field in User model is for account access (ACTIF, INACTIF, etc.)
                // 'statutEleve' field is for the imported status (AFFECTE, NON AFFECTE, etc.)
                let accountStatus = 'ACTIF'; // Default account status
                let statutEleve = 'AFFECTE'; // Default student status

                const statusKey = findKey(student, "statut") || findKey(student, "status");
                if (statusKey) {
                    const st = String(student[statusKey]).trim();
                    statutEleve = st; // Save exact value from Excel to statutEleve

                    // Map specific values to account status if needed, otherwise default to ACTIF
                    const stUpper = st.toUpperCase();
                    if (['INACTIF', 'ARCHIVE', 'PARTI', 'NON AFFECTE'].includes(stUpper)) {
                        accountStatus = 'INACTIF';
                    } else if (['BLOQUE', 'BANNED', 'EXCLU'].includes(stUpper)) {
                        accountStatus = 'BLOQUE';
                    }
                }

                // 4. Handle Email (Generate unique if missing)
                // Sanitize matricule for email use (alphanumeric only)
                const cleanMatricule = matricule.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                let email = `${cleanMatricule}@eleve.school`;

                // Check duplicate email
                let existingUser = await User.findOne({ email: email });
                if (existingUser) {
                    email = `${cleanMatricule}.${Math.floor(Math.random() * 1000)}@eleve.school`;
                }

                // Create User
                const newUser = await User.create({
                    nom: nom || "Inconnu",
                    prenom: prenom || "Inconnu",
                    email: email,
                    matricule: matricule,
                    telephone: student[findKey(student, "Telephone")] || '',
                    role: 'ELEVE',
                    classe: classeId,
                    password: 'password123',
                    status: accountStatus,
                    statutEleve: statutEleve,
                    sexe: sexe,
                    isRedoublant: isRedoublant,
                    dateNaissance: dateNaissance,
                    lieuNaissance: lieuNaissance
                });

                createdUsers.push(newUser);

                // Auto-create bulletins for imported students
                await createBulletinsForStudent(newUser);

            } catch (err) {
                console.error(`Error importing student ${nom}:`, err);
                // Better error message for validation failures
                let errMsg = err.message;
                if (err.name === 'ValidationError') {
                    const parts = Object.values(err.errors).map(e => e.message);
                    errMsg = parts.join(', ');
                }
                errors.push(`Erreur pour ${nom} ${prenom}: ${errMsg}`);
            }
        }

        res.status(200).json({
            success: true,
            count: createdUsers.length,
            errors: errors.length > 0 ? errors : undefined,
            message: `${createdUsers.length} élèves importés avec succès.${errors.length > 0 ? ' Certaines lignes ont été ignorées.' : ''}`
        });

    } catch (err) {
        console.error('Global Import Error:', err);
        // Do not call next(err) to avoid crashing the server if possible, send a 500 response instead
        res.status(500).json({ success: false, error: 'Une erreur interne est survenue lors de l\'importation.' });
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
