const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Final pass for font sizes
content = content.replace(/font-size: 12px;/g, 'font-size: 11px;');
// Except for body which should maybe stay 12px or also be reduced? 
// User said "reduit egalement les ecritures", usually implies everywhere.
// Let's reduce body to 11px and specific sections to 10px/9px.
content = content.replace(/body \{ font-family: Arial, Helvetica, sans-serif; font-size: 12px;/g, 'body { font-family: Arial, Helvetica, sans-serif; font-size: 11px;');

fs.writeFileSync(filePath, content);
console.log('Final font size refinement complete.');
