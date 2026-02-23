const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Header Left/Right Font Size: 11px -> 9px, 10px -> 8px (to be consistent)
content = content.replace(/font-size: 11px; font-weight: bold; text-transform: uppercase; line-height: 1\.0;/g, 'font-size: 9px; font-weight: bold; text-transform: uppercase; line-height: 1.0;');
content = content.replace(/font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1\.0;/g, 'font-size: 8px; font-weight: bold; text-transform: uppercase; line-height: 1.0;');

// 2. Sub-motto: 9px -> 8px
content = content.replace(/font-size: 9px; font-style: italic; text-transform: none; font-weight: normal;/g, 'font-size: 8px; font-style: italic; text-transform: none; font-weight: normal;');

// 3. Title Section H1: 22px -> 18px (24px was also there)
content = content.replace(/font-size: 22px; font-style: italic; font-weight: bold;/g, 'font-size: 18px; font-style: italic; font-weight: bold;');
content = content.replace(/font-size: 24px; font-style: italic; font-weight: bold;/g, 'font-size: 18px; font-style: italic; font-weight: bold;');

// 4. Info Rows (General Info / Student Name): 12px/14px -> 11px
content = content.replace(/font-size: 12px; margin-bottom: 5px;/g, 'font-size: 11px; margin-bottom: 5px;');
content = content.replace(/font-size: 14px; margin-bottom: 5px;/g, 'font-size: 11px; margin-bottom: 5px;');
content = content.replace(/font-size: 14px; margin-bottom: 15px;/g, 'font-size: 11px; margin-bottom: 5px;');

// 5. Info Eleve Grid: 14px -> 11px
content = content.replace(/gap: 4px; font-size: 14px;/g, 'gap: 4px; font-size: 11px;');

// 6. Info Label: 12px -> 10px
content = content.replace(/color: #6b7280; font-size: 12px; margin-bottom: 2px;/g, 'color: #6b7280; font-size: 10px; margin-bottom: 2px;');

// 7. Grades Table: 11px -> 10px
content = content.replace(/table \{ width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid black; \}/g, 'table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid black; }');

// 8. generateHeaderHTML inline styles
content = content.replace(/font-size: 11px; margin-top: 2px;/g, 'font-size: 9px; margin-top: 2px;');
content = content.replace(/font-size: 9px; margin-top: 0;/g, 'font-size: 8px; margin-top: 0;');

fs.writeFileSync(filePath, content);
console.log('Successfully reduced font sizes in pdfGenerator.js');
