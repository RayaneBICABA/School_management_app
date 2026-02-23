const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Refine Header
content = content.replace(/\.header \{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px; \}/g,
    '.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }');

// Refine Title
content = content.replace(/\.title-section \{ text-align: center; margin: 32px 0; \}/g,
    '.title-section { text-align: center; margin: 10px 0; }');
content = content.replace(/\.title-section h1 \{ font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-style: italic; font-weight: bold; margin: 0; color: #333333; \}/g,
    '.title-section h1 { font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-style: italic; font-weight: bold; margin: 0; color: #333333; }');

// Refine Info Row (Periode/Effectif)
content = content.replace(/\.info-row \{ display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 15px; \}/g,
    '.info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; }');

// Refine Student Name Row
content = content.replace(/\.student-name-row \{ margin-bottom: 15px; font-size: 14px; text-transform: uppercase; \}/g,
    '.student-name-row { margin-bottom: 5px; font-size: 12px; text-transform: uppercase; }');

// Refine Info Eleve Grid
content = content.replace(/\.info-eleve-grid \{.*margin-bottom: 24px;.*padding-bottom: 16px;.*border-bottom: 1px solid #e5e7eb;.*\}/s, (match) => {
    return match.replace(/margin-bottom: 24px;/, 'margin-bottom: 8px;')
        .replace(/padding-bottom: 16px;/, 'padding-bottom: 4px;')
        .replace(/gap: 15px;/, 'gap: 4px;');
});

// Update standard bulletin HTML structure if mb-20 is elsewhere
content = content.replace(/margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;/g,
    'margin-bottom: 8px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;');

fs.writeFileSync(filePath, content);
console.log('Successfully refined spacing in pdfGenerator.js');
