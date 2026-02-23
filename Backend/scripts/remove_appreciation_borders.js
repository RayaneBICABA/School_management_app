const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remove border from .appreciation-box
// Looking for: .appreciation-box { ... border: 4px double #1f2937; ... }
content = content.replace(/(border:\s*4px\s+double\s+#1f2937;?\s*)/g, '');
content = content.replace(/(border:\s*4px\s+double\s+#333;?\s*)/g, '');

fs.writeFileSync(filePath, content);
console.log('Appreciation borders removed from pdfGenerator.js');
