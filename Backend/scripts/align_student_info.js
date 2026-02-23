const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Change .info-item from flex-direction: column to row
content = content.replace(/\.info-item \{ display: flex; flex-direction: column; \}/g, '.info-item { display: flex; flex-direction: row; align-items: baseline; gap: 4px; }');

// Add specific styles for info-label if needed to ensure colon spacing
// Usually "Né(e) le:" already has a space or we add it in HTML.
// Let's check the HTML part to make sure it looks good.

fs.writeFileSync(filePath, content);
console.log('Student info items aligned horizontally in pdfGenerator.js');
