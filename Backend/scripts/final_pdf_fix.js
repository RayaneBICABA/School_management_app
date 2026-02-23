const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the template nesting syntax error around line 177
// We look for the specific corrupted pattern:
//                     `;
//     }).join('')}
//                 `).join('')}
const corruptedPattern = /`;\s*}\)\.join\(''\)}\s*`\)\.join\(''\)}/g;
// It should probably be:
//                 `).join('')}
content = content.replace(/                    `;\r?\n    }\)\.join\(''\)}\r?\n                `\)\.join\(''\)}/g, "                `).join('')}");

// 2. Synchronize "Nom de l'élève" and other student info items
// Target the student name row
content = content.replace(/<div class="student-name-row" style="margin-bottom: 10px; font-size: 14px; ">[^]*?Nom de l'élève: <strong>\$\{eleve\.nom \|\| 'Non renseigné'\} \$\{eleve\.prenom \|\| 'Non renseigné'\}<\/strong>[^]*?<\/div>/g,
    `<div class="student-name-row" style="margin-bottom: 1px; font-size: 11px; display: flex; align-items: baseline; gap: 4px;">
            <span class="info-label">Nom de l'élève:</span>
            <strong class="uppercase">\${eleve.nom || 'Non renseigné'} \${eleve.prenom || 'Non renseigné'}</strong>
        </div>`);

// Target the other info items to ensure they use .info-item class
content = content.replace(/<div style="display: flex; flex-direction: column;">\s*<span style="color: #666; font-size: 10px;">Matricule:<\/span>\s*<strong>\$\{eleve\.matricule \|\| 'N\/A'\}<\/strong>\s*<\/div>/g,
    `<div class="info-item">
                <span class="info-label">Matricule:</span>
                <strong class="info-value">\${eleve.matricule || 'N/A'}</strong>
            </div>`);

content = content.replace(/<div style="display: flex; flex-direction: column; text-align: right;">\s*<span style="color: #666; font-size: 10px;">Classe:<\/span>\s*<strong>\$\{classe\.niveau \|\| ''\} \$\{classe\.section \|\| ''\}<\/strong>\s*<\/div>/g,
    `<div class="info-item" style="justify-content: flex-end;">
                <span class="info-label">Classe:</span>
                <strong class="info-value">\${classe.niveau || ''} \${classe.section || ''}</strong>
            </div>`);

content = content.replace(/<div style="display: flex; flex-direction: column; text-align: right;">\s*<span style="color: #666; font-size: 10px;">Redoublant:<\/span>\s*<strong>\$\{eleve\.redoublant \? 'OUI' : 'NON'\}<\/strong>\s*<\/div>/g,
    `<div class="info-item" style="justify-content: flex-end;">
                <span class="info-label">Redoublant:</span>
                <strong class="info-value">\${eleve.redoublant ? 'OUI' : 'NON'}</strong>
            </div>`);

fs.writeFileSync(filePath, content);
console.log('Final fixes applied to pdfGenerator.js');
