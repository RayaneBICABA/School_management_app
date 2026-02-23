const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Generate PDF for a single bulletin
 */
exports.generateBulletinPDF = async (bulletin, schoolConfig) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const html = exports.getBulletinHTML(bulletin, schoolConfig);
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
        });

        return pdf;
    } finally {
        await browser.close();
    }
};

/**
 * Generate PDF for multiple bulletins (Class)
 */
exports.generateClassBulletinsPDF = async (bulletins, schoolConfig) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        let fullHtml = '';

        bulletins.forEach((bulletin, index) => {
            const html = exports.getBulletinHTML(bulletin, schoolConfig);
            const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
            const content = bodyMatch ? bodyMatch[1] : html;
            fullHtml += `<div class="page-break" style="${index > 0 ? 'page-break-before: always;' : ''}">${content}</div>`;
        });

        const baseHtml = exports.getBulletinHTML(bulletins[0], schoolConfig);
        const completeHtml = baseHtml.replace(/<body>[\s\S]*<\/body>/, `<body>${fullHtml}</body>`);

        await page.setContent(completeHtml, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
        });

        return pdf;
    } finally {
        await browser.close();
    }
};

/**
 * Generate PDF for a master grade sheet
 */
exports.generateMasterGradeSheetPDF = async (sheetsData, schoolConfig) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const html = exports.getMasterSheetHTML(sheetsData, schoolConfig);
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        return pdf;
    } finally {
        await browser.close();
    }
};

/**
 * Helper: Smart Category Logic (Synced with Frontend)
 */
const getSmartCategory = (note, filiereClass) => {
    const nom = (note.matiere?.nom || '').toUpperCase();
    const baseCat = note.categorie || note.matiere?.categorie || 'ENSEIGNEMENT GÉNÉRAL';

    if (filiereClass === 'Technique') {
        if (baseCat === 'ENSEIGNEMENT TECHNIQUE') return "MATIÈRES DE L'ENSEIGNEMENT TECHNIQUE";
        return "MATIÈRES DE L'ENSEIGNEMENT GÉNÉRAL";
    }

    if (baseCat === 'ENSEIGNEMENT TECHNIQUE') return "MATIÈRES DE L'ENSEIGNEMENT TECHNIQUE";

    const isScientific = ['MATH', 'PHYS', 'SVT', 'CHIMIE', 'INFO', 'TECHNO', 'SCIENCES', 'BIO'].some(kw => nom.includes(kw)) || (nom.includes('GEO') && !nom.includes('GEOGRAPHIE'));
    if (isScientific) return "MATIÈRES SCIENTIFIQUES";

    const isLiterary = ['FRANCAIS', 'ANGLAIS', 'HISTOIRE', 'GEOGRAPHIE', 'PHILO', 'ALLEMAND', 'ESPAGNOL', 'LINGUISTIQUE', 'CIVIQUE', 'MORALE'].some(kw => nom.includes(kw));
    if (isLiterary) return "MATIÈRES LITTÉRAIRES";

    const isEPS = ['EPS', 'SPORT', 'PHYSIQUE'].some(kw => nom.includes(kw)) && !isScientific;
    if (isEPS) return "ÉDUCATION PHYSIQUE ET SPORTIVE";

    return "AUTRES";
};

/**
 * Get HTML for Bulletin
 */
exports.getBulletinHTML = (bulletin, schoolConfig) => {
    const eleve = bulletin.eleve || {};
    const classe = bulletin.classe || {};
    const filiere = classe.filiere || 'Générale';

    // Group notes by category using frontend logic
    const groupedNotes = {};
    bulletin.notes.forEach(note => {
        const cat = getSmartCategory(note, filiere);
        if (!groupedNotes[cat]) groupedNotes[cat] = [];
        groupedNotes[cat].push(note);
    });

    const getGeneralAppreciation = (moy) => {
        if (moy >= 18) return 'Excellent';
        if (moy >= 16) return 'Très Bien';
        if (moy >= 14) return 'Bien';
        if (moy >= 12) return 'Assez-Bien';
        if (moy >= 10) return 'Passable';
        if (moy >= 8) return 'Faible';
        return 'Insuffisant';
    };

    let tableRows = '';
    Object.entries(groupedNotes).forEach(([catName, notes]) => {
        tableRows += `<tr class="cat-header"><td colspan="7">${catName}</td></tr>`;

        notes.forEach(note => {
            const prof = note.professeur ? `${note.professeur.civilite || ''} ${note.professeur.nom || ''}`.trim() : '';
            const app = note.isDispensed ? '' : getGeneralAppreciation(note.moyenneMatiere || 0);

            tableRows += `
                <tr>
                    <td class="text-left font-bold uppercase">${note.matiere?.nom || ''}</td>
                    <td>${(note.coeff || 1).toFixed(1)}</td>
                    ${note.isDispensed ?
                    `<td>-</td><td>-</td>` :
                    `<td>${(note.moyenneMatiere || 0).toFixed(2)}</td><td>${(note.notePonderee || 0).toFixed(2)}</td>`
                }
                    <td class="italic" style="width: 80px;">${app}</td>
                    <td style="font-size: 8px; width: 60px;">${prof}</td>
                    <td></td>
                </tr>
            `;

            // Category Totals Logic (Optional: replicate frontend category footer if needed)
        });
    });

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné';

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; font-size: 10px; padding: 10mm; background: white; }
        .bulletin-card { width: 100%; }
        
        /* Header Logic */
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 5px; margin-bottom: 10px; }
        .h-col { width: 33.33%; font-weight: bold; font-size: 9px; line-height: 1.1; text-transform: uppercase; }
        .h-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
        .h-right { text-align: right; }
        .logo-text { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; }
        .motto { font-size: 8px; color: #6b7280; letter-spacing: 1px; margin-top: 2px; }
        
        .title { text-align: center; margin: 10px 0; }
        .title h1 { font-size: 20px; font-style: italic; font-weight: bold; }
        
        .info-bar { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 11px; }
        .student-name { margin-bottom: 5px; font-size: 11px; font-weight: bold; padding-top: 5px; }
        
        .grid-info { display: flex; justify-content: space-between; padding-bottom: 5px; margin-bottom: 10px; }
        .grid-item { font-size: 10px; }
        .grid-item span { color: #6b7280; font-size: 9px; margin-right: 4px; }
        .grid-item strong { display: inline; font-size: 10px; }
        
        /* Table Styles */
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; }
        th, td { border: 1px solid #000; padding: 4px; text-align: center; font-size: 9px; }
        th { background: #e5e7eb; font-weight: bold; text-transform: uppercase; }
        .cat-header { background: #d1d5db; font-weight: bold; text-transform: uppercase; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .dispensed { color: #dc2626; font-weight: bold; font-style: italic; }
        
        /* Bilan Styles */
        .bilan-header { background: #d1d5db; font-weight: bold; text-align: center; padding: 6px; border: 1px solid #000; border-bottom: 0; text-transform: uppercase; }
        .bilan-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .bilan-table td { border: 1px solid #000; padding: 6px; font-size: 10px; }
        .lg-val { font-size: 14px; font-weight: bold; }
        
        /* Council Styles */
        .council-header { background: #d1d5db; text-align: center; font-weight: bold; padding: 6px; border: 1px solid #000; border-bottom: 0; text-transform: uppercase; }
        .council-box { display: flex; border: 1px solid #000; height: 100px; }
        .app-box { width: 50%; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; }
        .sig-box { width: 50%; padding: 5px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
        
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="bulletin-card">
        <div class="header">
            <div class="h-col">
                <p>${schoolConfig.region || 'REGION'}</p>
                <p>${schoolConfig.subRegion || ''}</p>
                <p>${schoolConfig.schoolName || ''}</p>
                <p>Tél : ${schoolConfig.phone || ''}</p>
            </div>
            <div class="h-col h-center">
                <div class="logo-text">${schoolConfig.shortName || 'LWS'}</div>
                <div class="motto">${schoolConfig.motto || ''}</div>
            </div>
            <div class="h-col h-right">
                <p>${schoolConfig.country || 'BURKINA FASO'}</p>
                <p style="font-style: italic; font-weight: normal; text-transform: none;">${schoolConfig.patrie || ''}</p>
            </div>
        </div>

        <div class="title">
            <h1>BULLETIN DE NOTES</h1>
        </div>

        <div class="info-bar">
            <span>Année scolaire: <strong>${bulletin.anneeScolaire}</strong></span>
            <span><strong>${bulletin.periode}</strong></span>
            <span>Effectif: <strong>${bulletin.effectif || ''}</strong></span>
        </div>

        <div class="student-name">
            <span style="color: #6b7280; font-weight: normal;">Nom de l'élève:</span>
            <span class="uppercase">${eleve.nom || ''} ${eleve.prenom || ''}</span>
        </div>

        <div class="grid-info">
            <div class="grid-item"><span>Né(e) le:</span><strong>${formatDate(eleve.dateNaissance)}</strong></div>
            <div class="grid-item"><span>Matricule:</span><strong>${eleve.matricule || ''}</strong></div>
            <div class="grid-item"><span>Classe:</span><strong>${classe.niveau || ''} ${classe.section || ''}</strong></div>
            <div class="grid-item" style="text-align: right;"><span>Redoublant:</span><strong>${eleve.redoublant ? 'OUI' : 'NON'}</strong></div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="text-left" style="width: 30%;">Matières</th>
                    <th style="width: 8%;">Coef</th>
                    <th style="width: 10%;">Moy</th>
                    <th style="width: 10%;">Pondérées</th>
                    <th colspan="3">Appréciations et signatures</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
                <tr class="font-bold" style="background: #f1f5f9;">
                    <td class="text-left font-bold uppercase">TOTAL GÉNÉRAL</td>
                    <td>${(bulletin.totalCoefficients || 0).toFixed(1)}</td>
                    <td></td>
                    <td class="font-bold">${(bulletin.totalPoints || 0).toFixed(2)}</td>
                    <td colspan="3"></td>
                </tr>
            </tbody>
        </table>

        <div class="bilan-header">BILAN ${filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL'}</div>
        <table class="bilan-table">
            <tr>
                <td style="width: 20%;">Moyenne de l'élève</td>
                <td class="lg-val" style="width: 10%;">${(bulletin.moyenneGenerale || 0).toFixed(2)}</td>
                <td style="width: 25%; text-transform: uppercase;">RETRAIT DE POINTS</td>
                <td class="font-bold" style="width: 10%;">${(bulletin.retraitPoints || 0).toFixed(2)}</td>
                <td colspan="4" class="font-bold text-center" style="background: #eee;">NOMBRE D'HEURES D'ABSENCE</td>
            </tr>
            <tr>
                <td>Moyenne de la classe</td>
                <td class="font-bold">${(bulletin.moyenneClasse || 0).toFixed(2)}</td>
                <td style="text-transform: uppercase;">MOYENNE DEFINITIVE</td>
                <td class="lg-val">${((bulletin.moyenneGenerale || 0) - (bulletin.retraitPoints || 0)).toFixed(2)}</td>
                <td style="width: 10%;">Justifiées</td>
                <td class="font-bold" style="width: 5%;">${bulletin.absencesJustifiees || 0}</td>
                <td style="width: 15%;">Non justifiées</td>
                <td class="font-bold" style="width: 5%;">${bulletin.absencesNonJustifiees || 0}</td>
            </tr>
            <tr>
                <td>Meilleure moyenne</td>
                <td class="font-bold">${(bulletin.meilleureMoyenneClasse || 0).toFixed(2)}</td>
                <td style="text-transform: uppercase;">Rang du trimestre</td>
                <td class="font-bold">${bulletin.rang || '-'}</td>
                <td class="font-bold">Conduite</td>
                <td colspan="3">${bulletin.conduite || ''}</td>
            </tr>
            <tr>
                <td>Moyenne la plus basse</td>
                <td class="font-bold">${(bulletin.pireMoyenneClasse || 0).toFixed(2)}</td>
                <td colspan="2"></td>
                <td class="font-bold">Rappel des Moyennes</td>
                <td colspan="3"></td>
            </tr>
        </table>

        <div class="council-header">Appréciations du conseil de classe</div>
        <div class="council-box">
            <div class="app-box">${getGeneralAppreciation(bulletin.moyenneGenerale || 0)}</div>
            <div class="sig-box">
                <div class="font-bold uppercase">Le Proviseur</div>
                <div style="height: 60px;"></div>
                <div class="font-bold">${schoolConfig.proviseurName || ''}</div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Get HTML for Master Grade Sheet
 */
exports.getMasterSheetHTML = (sheetsData, schoolConfig) => {
    let tablesHtml = '';

    sheetsData.forEach((data, index) => {
        const { classe, periode, anneeScolaire, matieres, matrix, subjectStats, overallStats } = data;

        tablesHtml += `
            <div class="sheet-page" style="${index > 0 ? 'page-break-before: always;' : ''}">
                <div class="header">
                    <div style="width: 30%; font-size: 9px; text-transform: uppercase;">
                        <p>${schoolConfig.region || ''}</p>
                        <p>${schoolConfig.schoolName || ''}</p>
                    </div>
                    <div style="text-align: center; flex-grow: 1;">
                        <h1>RELEVÉ RÉCAPITULATIF DES NOTES</h1>
                        <h3 style="color: #d35400;">${classe.niveau} ${classe.section} - ${periode}</h3>
                        <p>Année Scolaire: ${anneeScolaire}</p>
                    </div>
                    <div style="width: 30%; text-align: right; font-size: 9px;">
                        <p>${schoolConfig.country || 'BURKINA FASO'}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Matricule</th>
                            <th class="name-col">Nom & Prénoms</th>
                            ${matieres.map(m => `<th>${m.nom}<br><small>(Coef: ${m.coefficient})</small></th>`).join('')}
                            <th class="stats-col">Moyenne</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matrix.map((row, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td style="font-size: 8px;">${row.matricule || '-'}</td>
                                <td class="name-col">${row.nom} ${row.prenom}</td>
                                ${matieres.map(m => {
            const grade = row.matieres[m._id];
            if (grade && grade.isDispensed) {
                return '<td class="dispensed">D</td>';
            }
            return `<td>${grade && grade.moyenne !== null ? grade.moyenne.toFixed(2) : '-'}</td>`;
        }).join('')}
                                <td class="font-bold stats-col">${(row.moyenneGenerale || 0).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot class="stats-footer">
                        <tr>
                            <td colspan="3">Moyenne de la classe</td>
                            ${matieres.map(m => `<td>${(subjectStats[m._id]?.avg || 0).toFixed(2)}</td>`).join('')}
                            <td>${(overallStats.classAverage || 0).toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer-sig">
                    <div class="sig-section">
                        <div class="sig-box">
                            <p class="font-bold underline">LE TITULAIRE</p>
                            <div class="sig-space"></div>
                        </div>
                        <div class="sig-box">
                            <p class="font-bold underline">LE PROVISEUR</p>
                            <div class="sig-space"></div>
                            <p class="font-bold">${schoolConfig.proviseurName || ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 8px; margin: 0; padding: 0; }
        .sheet-page { padding: 15mm; }
        .header { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; align-items: flex-start; }
        h1 { font-size: 16px; margin: 0; color: #1e3a8a; }
        h3 { font-size: 14px; margin: 2px 0; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
        th, td { border: 1px solid #333; padding: 3px; text-align: center; word-wrap: break-word; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .name-col { text-align: left; width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .stats-col { width: 60px; background: #fef9c3; }
        .stats-footer { background-color: #e5e7eb; font-weight: bold; }
        
        .dispensed { font-weight: bold; color: #dc2626; font-style: italic; }
        .font-bold { font-weight: bold; }
        .underline { text-decoration: underline; }
        
        .footer-sig { margin-top: 30px; }
        .sig-section { display: flex; justify-content: space-around; }
        .sig-box { text-align: center; width: 200px; }
        .sig-space { height: 60px; }
    </style>
</head>
<body>
    ${tablesHtml}
</body>
</html>
    `;
};
