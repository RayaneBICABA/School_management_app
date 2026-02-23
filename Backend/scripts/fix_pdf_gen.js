const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Keep lines 1-19 (0-18)
const head = lines.slice(0, 19);
// Add closing backtick and semicolon
head[head.length - 1] = head[head.length - 1].trimEnd() + '`;';

// Keep lines from generateBulletinContent onwards
// I'll search for the index of "const generateBulletinContent"
let startIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const generateBulletinContent =')) {
        startIndex = i;
        break;
    }
}

if (startIndex !== -1) {
    const tail = lines.slice(startIndex);
    // Combine head and tail
    const newContent = head.concat(['', ''], tail).join('\n');
    fs.writeFileSync(filePath, newContent);
    console.log('pdfGenerator.js restored (corrupted block removed)');
} else {
    console.error('Could not find generateBulletinContent');
}
