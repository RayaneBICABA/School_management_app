const Grade = require('../models/Grade');
const User = require('../models/User');
const ExcelJS = require('exceljs');

// @desc    Get all grades
// @route   GET /api/v1/grades
// @access  Private
exports.getGrades = async (req, res) => {
    try {
        let query = {};
        if (req.query.eleve) query.eleve = req.query.eleve;
        if (req.query.matiere) query.matiere = req.query.matiere;
        if (req.query.classe) query.classe = req.query.classe;
        if (req.query.periode) query.periode = req.query.periode;

        const grades = await Grade.find(query)
            .populate('eleve', 'nom prenom')
            .populate('matiere', 'nom')
            .populate('classe', 'section niveau');

        res.status(200).json({
            success: true,
            count: grades.length,
            data: grades
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Add a grade
// @route   POST /api/v1/grades
// @access  Private/Admin/Teacher
exports.createGrade = async (req, res) => {
    try {
        const grade = await Grade.create(req.body);
        res.status(201).json({
            success: true,
            data: grade
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Import grades from Excel
// @route   POST /api/v1/grades/import
// @access  Private/Professor
exports.importGrades = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Veuillez uploader un fichier Excel' });
        }

        const { classeId, matiereId, periode, type } = req.body;

        if (!classeId || !matiereId || !periode || !type) {
            return res.status(400).json({ success: false, error: 'Classe, Matière, Période et Type sont requis' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
        const worksheet = workbook.getWorksheet(1);

        const rows = [];
        const headers = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber] = cell.value;
        });

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber];
                if (header) {
                    rowData[header] = cell.value;
                }
            });
            rows.push(rowData);
        });

        if (!rows || rows.length === 0) {
            return res.status(400).json({ success: false, error: 'Fichier vide' });
        }

        const results = {
            createdStudents: 0,
            updatedGrades: 0,
            errors: []
        };

        for (const row of rows) {
            // Expected columns: matricule, firstName, lastName, grade
            if (!row.matricule) {
                results.errors.push(`Row skipped (missing matricule): ${JSON.stringify(row)}`);
                continue;
            }

            try {
                let student = await User.findOne({ matricule: row.matricule });

                // Create student if not exists
                if (!student) {
                    // Generate email from matricule or name if missing (Mock logic)
                    const email = `${row.matricule}@lebeian.edu`.toLowerCase();

                    student = await User.create({
                        nom: row.lastName || 'Inconnu',
                        prenom: row.firstName || 'Inconnu',
                        email: email,
                        matricule: row.matricule,
                        password: 'password123',
                        role: 'ELEVE',
                        classe: classeId,
                        status: 'ACTIF'
                    });
                    results.createdStudents++;
                } else {
                    // Start: Ensure student is in the class
                    if (student.classe.toString() !== classeId) {
                        student.classe = classeId;
                        await student.save();
                    }
                }

                // Create/Update Grade
                // Check if grade already exists for this student/matiere/type/periode
                let existingGrade = await Grade.findOne({
                    eleve: student._id,
                    matiere: matiereId,
                    type: type,
                    periode: periode
                });

                if (existingGrade) {
                    existingGrade.valeur = row.grade;
                    await existingGrade.save();
                } else {
                    await Grade.create({
                        eleve: student._id,
                        matiere: matiereId,
                        classe: classeId,
                        valeur: row.grade,
                        type: type,
                        periode: periode
                    });
                }
                results.updatedGrades++;

            } catch (err) {
                results.errors.push(`Error processing ${row.matricule}: ${err.message}`);
            }
        }

        res.status(200).json({
            success: true,
            data: results
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Bulk update grades
// @route   PUT /api/v1/grades/bulk
// @access  Private/Professor
exports.updateGrades = async (req, res) => {
    try {
        const { grades, classeId, matiereId, periode } = req.body;

        if (!grades || !Array.isArray(grades) || grades.length === 0) {
            return res.status(400).json({ success: false, error: 'Aucune note à sauvegarder' });
        }

        let updateCount = 0;

        for (const g of grades) {
            await Grade.findOneAndUpdate(
                {
                    eleve: g.eleveId,
                    matiere: matiereId,
                    type: g.type,
                    periode: periode,
                    classe: classeId
                },
                {
                    valeur: parseFloat(g.valeur),
                    statut: 'BROUILLON' // Enregistrer keeps it as Draft
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            updateCount++;
        }

        res.status(200).json({
            success: true,
            message: `${updateCount} notes enregistrées avec succès.`
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Validate grades (Submit to Censeur)
// @route   PUT /api/v1/grades/validate
// @access  Private/Professor
exports.validateGrades = async (req, res) => {
    try {
        const { classeId, matiereId, periode } = req.body;

        if (!classeId || !matiereId || !periode) {
            return res.status(400).json({ success: false, error: 'Classe, Matière et Période requis' });
        }

        // Check ownership (Optional but good practice)
        // const isAssigned = await ClasseMatiere.exists({ classe: classeId, matiere: matiereId, professeur: req.user.id });
        // if (!isAssigned && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Non autorisé' });

        const result = await Grade.updateMany(
            {
                classe: classeId,
                matiere: matiereId,
                periode: periode
                // Only update draft grades? Or all? Usually validation locks everything.
            },
            {
                $set: { statut: 'SOUMIS' }
            }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notes soumises pour validation.`,
            data: result
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
