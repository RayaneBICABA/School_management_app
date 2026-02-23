const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Reduce height of .council-content from 160px to 110px
content = content.replace(/height:\s*160px;/g, 'height: 110px;');

fs.writeFileSync(filePath, content);
console.log('Appreciation section height reduced in pdfGenerator.js');
