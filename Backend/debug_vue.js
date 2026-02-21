const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

async function debugVueLogic() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_management');
    const User = require('./models/User');
    const admin = await User.findOne({ email: 'admin@edumanager.com' });
    const token = admin.getSignedJwtToken();

    const headers = { Authorization: 'Bearer ' + token };
    const classesRes = await axios.get('http://localhost:5000/api/v1/classes', { headers });
    const gradesRes = await axios.get('http://localhost:5000/api/v1/notes', { headers });
    const assignmentsRes = await axios.get('http://localhost:5000/api/v1/classe-matieres/all', { headers });

    const allClasses = classesRes.data.data;
    const grades = gradesRes.data.data;
    const assignments = assignmentsRes.data.data;

    const testClasse = allClasses.find(c => c.niveau === '1ère' && c.section === 'TEST');
    if (!testClasse) return console.log('Classe 1ère TEST non trouvée');

    const selectedClassId = testClasse._id.toString();
    const selectedPeriod = 'Trimestre 1';

    console.log(`Analyzing for Class: ${selectedClassId}, Period: ${selectedPeriod}`);

    const classAssignments = assignments.filter(a => {
        const assignClass = a.classe?._id?.toString() || a.classe?.toString();
        return assignClass === selectedClassId;
    });
    console.log(`Found ${classAssignments.length} assignments for this class.`);

    const r = classAssignments.map(assignment => {
        const assignClasseId = assignment.classe?._id?.toString() || assignment.classe?.toString();
        const assignMatiereId = assignment.matiere?._id?.toString() || assignment.matiere?.toString();

        let foundGradesCount = 0;

        const subjectGrades = grades.filter(g => {
            const gradeClasseId = g.classe?._id?.toString() || g.classe?.toString();
            const gradeMatiereId = g.matiere?._id?.toString() || g.matiere?.toString();

            const isMatch = (gradeClasseId === assignClasseId) && (gradeMatiereId === assignMatiereId) && (g.periode === selectedPeriod);
            if (isMatch) foundGradesCount++;
            return isMatch;
        });

        console.log(`-> Assignment ${assignment.matiere?.nom || assignMatiereId}, found ${foundGradesCount} grades matching exactly.`);

        const distinctTypes = new Set();
        subjectGrades.forEach(g => {
            if (g.notes && Array.isArray(g.notes)) {
                g.notes.forEach(note => distinctTypes.add(note.type));
            }
        });
        const evalCount = distinctTypes.size;

        return {
            matiere: assignment.matiere?.nom || assignMatiereId,
            evalCount: evalCount,
            totalStudentsWithGrades: subjectGrades.length,
            isValidated: subjectGrades.some(g => g.statut === 'VALIDEE')
        };
    });

    console.log(r);
    process.exit(0);
}

debugVueLogic().catch(console.error);
