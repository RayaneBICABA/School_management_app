const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the watermark div injection
content = content.replace(/\$\{bulletinData\.isDraft \? '\\u003cdiv class=\\"watermark\\"\\u003ePROVISOIRE\\u003c\/div\\u003e' : ''\}/g, '');
// Handle standard quotes too just in case literal characters are different
content = content.replace(/\$\{bulletinData\.isDraft \? '<div class="watermark">PROVISOIRE<\/div>' : ''\}/g, '');

// 2. Remove .watermark CSS blocks
// Example: .watermark { position: absolute; ... }
content = content.replace(/\.watermark \{[^}]*\}/g, '');

fs.writeFileSync(filePath, content);
console.log('Watermark removed from pdfGenerator.js');
