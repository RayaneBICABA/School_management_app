const fs = require('fs');
const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Waterman
content = content.replace(/\$\{[\s\S]*?bulletinData\.statut !== 'DISTRIBUE'[\s\S]*?PROVISOIRE[\s\S]*?\}[\s\n]*/, '');

// 2. Fix generateBulletinContent logic and totalCols
content = content.replace(/let maxInt = 0, maxDev = 0, maxCompo = 0;[\s\S]*?const totalCols = 7 \+ maxInt \+ maxDev \+ maxCompo;/, 'const totalCols = 7;');

// 3. Fix Student Name Row
content = content.replace(/<div class="student-name-row">[\s\S]*?Nom de l'élève: <strong>\$\{eleve\.nom \|\| ''\} \$\{eleve\.prenom \|\| ''\}<\/strong>[\s\S]*?<\/div>/,
    `<div class="student-name-row">
            <span class="info-label">Nom de l'élève:</span>
            <strong class="uppercase">\${eleve.nom || ''} \${eleve.prenom || ''}</strong>
        </div>`);

// 4. Fix Student info grid
content = content.replace(/<div class="info-eleve-row">[\s\S]*?Redoublant:<\/span>[\s\S]*?<\/div>\s*<\/div>/,
    `<div class="info-eleve-grid">
            <div class="info-item">
                <span class="info-label">Né(e) le:</span>
                <span class="info-value">\${formatDate(eleve.dateNaissance)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Matricule:</span>
                <strong class="info-value">\${eleve.matricule || 'N/A'}</strong>
            </div>
            <div class="info-item" style="justify-content: flex-end;">
                <span class="info-label">Classe:</span>
                <strong class="info-value">\${classe.niveau || ''} \${classe.section || ''}</strong>
            </div>
            <div class="info-item" style="justify-content: flex-end;">
                <span class="info-label">Redoublant:</span>
                <strong class="info-value">\${eleve.redoublant ? 'OUI' : 'NON'}</strong>
            </div>
        </div>`);

// 5. Fix Grades Table Header
content = content.replace(/<thead>[\s\S]*?Appréciations & Signatures<\/th>[\s\S]*?<\/tr>\s*<\/thead>/,
    `<thead>
                <tr>
                    <th class="text-left" style="width: 200px;">Matières</th>
                    <th style="width: 40px;">Coef</th>
                    <th style="width: 40px;">Moy</th>
                    <th style="width: 60px;">Pond.</th>
                    <th colspan="3">Appréciations & Signatures</th>
                </tr>
            </thead>`);

// 6. Fix Grades Table Rows (Removing Dev/Int/Comp columns)
content = content.replace(/\$\{notes\.map\(note => \{[\s\S]*?return `[\s\S]*?<\/tr>\s*`\}\)\.join\(''\)\}/,
    `\${notes.map(note => {
        const moy = note.moyenneMatiere || 0;
        const appr = getAppre(moy);
        return \`
                    <tr>
                        <td class="text-left bold uppercase" style="padding: 6px;">\${note.matiere?.nom || 'N/A'}</td>
                        <td>\${(note.coeff || note.matiere?.coefficient || 0).toFixed(1)}</td>
                        \${note.isDispensed ? \`<td colspan="2" class="bold italic">DISPENSÉ</td>\` : \`
                            <td>\${moy.toFixed(2)}</td>
                            <td class="bold">\${(note.notePonderee || 0).toFixed(2)}</td>
                        \`}
                        <td class="italic" style="\${note.isDispensed ? '' : getAppreciationColor(appr)}">\${note.isDispensed ? 'DISPENSÉ' : appr}</td>
                        <td class="text-xs uppercase" style="width: 80px; white-space: nowrap;">\${note.professeur ? note.professeur.nom : ''}</td>
                        <td style="width: 60px;"></td>
                    </tr>
                    \`;
    }).join('')}`);

fs.writeFileSync(filePath, content);
console.log('pdfGenerator.js successfully updated via script');
