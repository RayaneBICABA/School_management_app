const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const resolvedLines = [];
let inConflict = false;
let currentBlock = []; // 0: Upstream, 1: Stashed

const UPDATED_UPSTREAM = '<<<<<<< Updated upstream';
const SEPARATOR = '=======';
const STASHED_CHANGES = '>>>>>>> Stashed changes';

let section = -1; // -1: none, 0: upstream, 1: stashed

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith(UPDATED_UPSTREAM)) {
        inConflict = true;
        section = 0;
        currentBlock = [[], []];
    } else if (line.startsWith(SEPARATOR)) {
        section = 1;
    } else if (line.startsWith(STASHED_CHANGES)) {
        // Resolve conflict: Pick STASHED section (1)
        resolvedLines.push(...currentBlock[1]);
        inConflict = false;
        section = -1;
    } else {
        if (inConflict) {
            currentBlock[section].push(lines[i]);
        } else {
            resolvedLines.push(lines[i]);
        }
    }
}

fs.writeFileSync(filePath, resolvedLines.join('\n'));
console.log('Conflicts resolved in pdfGenerator.js (favored Stashed changes)');
