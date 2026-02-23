const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure consistent font-size for header info rows
// .info-row and .student-name-row should match.
// They both usually have 11px. Let's make sure they are set explicitly to the same value in all style blocks.

// Search for font-size in these classes and unify them to 11px
content = content.replace(/\.info-row \{ ([^}]*) font-size: [^;]+; ([^}]*) \}/g, '.info-row { $1 font-size: 11px; $2 }');
content = content.replace(/\.student-name-row \{ ([^}]*) font-size: [^;]+; ([^}]*) \}/g, '.student-name-row { $1 font-size: 11px; $2 }');

fs.writeFileSync(filePath, content);
console.log('Header font sizes synchronized in pdfGenerator.js');
