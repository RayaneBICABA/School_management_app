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
            format: 'A3',
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
        body { font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; font-size: 10px; padding: 10mm; background: white; line-height: 1.1; }
        .bulletin-card { width: 100%; }
        
        /* High-Fidelity Header */
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 15px; }
        .h-col { width: 33.33%; font-weight: bold; font-size: 8.5px; line-height: 1.2; text-transform: uppercase; }
        .h-center { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40% !important; }
        .h-col-side { width: 30% !important; }
        .h-right { text-align: right; }
        
        .logo-text { font-size: 26px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; line-height: 1; }
        .motto { font-size: 8px; color: #6b7280; letter-spacing: 0.5px; margin-top: 3px; font-weight: bold; }
        
        .title { text-align: center; margin: 12px 0; }
        .title h1 { font-size: 22px; font-style: italic; font-weight: bold; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 5px 0; }
        
        .info-bar { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 11px; }
        .student-name { margin-bottom: 8px; font-size: 12px; font-weight: bold; padding-top: 5px; }
        
        .grid-info { display: flex; justify-content: space-between; padding-bottom: 8px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
        .grid-item { font-size: 10px; display: flex; align-items: baseline; gap: 4px; }
        .grid-item span { color: #64748b; font-size: 9px; }
        
        /* Table Styles */
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; }
        th, td { border: 1px solid #000; padding: 4px; text-align: center; font-size: 9.5px; }
        th { background: #e5e7eb; font-weight: bold; text-transform: uppercase; font-size: 9px; }
        .cat-header { background: #d1d5db; font-weight: bold; text-transform: uppercase; font-size: 9px; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .italic { font-style: italic; }
        
        /* Bilan Styles */
        .bilan-header { background: #d1d5db; font-weight: bold; text-align: center; padding: 6px; border: 1px solid #000; border-bottom: 0; text-transform: uppercase; font-size: 10px; }
        .bilan-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .bilan-table td { border: 1px solid #000; padding: 8px 6px; font-size: 10px; }
        .lg-val { font-size: 16px; font-weight: bold; }
        
        /* Council Styles */
        .council-header { background: #d1d5db; text-align: center; font-weight: bold; padding: 6px; border: 1px solid #000; border-bottom: 0; text-transform: uppercase; font-size: 10px; }
        .council-box { display: flex; border: 1px solid #000; height: 110px; }
        .app-box { width: 50%; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; }
        .sig-box { width: 50%; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; }
        
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <div class="bulletin-card">
        <div class="header">
            <div class="h-col h-col-side">
                <p>${schoolConfig.region || 'FORMATION PROFESSIONNELLE ET TECHNIQUE'}</p>
                <p>${schoolConfig.subRegion || 'RÉGION CENTRE'}</p>
                <p>${schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
                <p>${schoolConfig.phone ? `TÉL : ${schoolConfig.phone}` : 'TÉL : 51 54 88 11'}</p>
            </div>
            <div class="h-col h-center">
                <div class="logo-text">${schoolConfig.shortName || 'LWS'}</div>
                <div class="motto">${schoolConfig.motto || 'DISCIPLINE-TRAVAIL-SUCCES'}</div>
            </div>
            <div class="h-col h-col-side h-right">
                <p>${schoolConfig.country || 'BURKINA FASO'}</p>
                <p class="italic" style="font-weight: normal; text-transform: none; font-size: 7.5px;">${schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
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
            <span style="color: #64748b; font-weight: normal; font-size: 10px;">Nom de l'élève:</span>
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
                    <th class="text-left" style="width: 25%;">Matières</th>
                    <th style="width: 7%;">Coef</th>
                    <th style="width: 9%;">Moy</th>
                    <th style="width: 9%;">Pondérées</th>
                    <th colspan="3">Appréciations et signatures</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(groupedNotes).map(([catName, notes]) => `
                    <tr class="cat-header">
                        <td colspan="7" style="text-align: center;">${catName}</td>
                    </tr>
                    ${notes.map(note => {
        const prof = note.professeur ? `${note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')}${note.professeur.nom || ''}`.toUpperCase().trim() : '';
        const app = note.isDispensed ? '' : getGeneralAppreciation(note.moyenneMatiere || 0);
        return `
                            <tr>
                                <td class="text-left font-bold uppercase" style="font-size: 9px;">${note.matiere?.nom || ''}</td>
                                <td>${(note.coeff || 1).toFixed(1)}</td>
                                ${note.isDispensed ?
                `<td class="italic font-bold">-</td><td class="italic font-bold">-</td>` :
                `<td>${(note.moyenneMatiere || 0).toFixed(2)}</td><td class="font-bold">${(note.notePonderee || 0).toFixed(2)}</td>`
            }
                                <td class="italic" style="width: 75px; font-size: 8.5px;">${app}</td>
                                <td style="font-size: 8.5px; width: 110px; white-space: nowrap;">${prof}</td>
                                <td style="width: 35px;"></td>
                            </tr>
                        `;
    }).join('')}
                    <tr class="font-bold bg-gray-100" style="font-size: 9px; background-color: #f8fafc;">
                        <td class="text-left uppercase">Total ${catName}</td>
                        <td>${notes.reduce((sum, n) => sum + (n.coeff || 0), 0).toFixed(1)}</td>
                        <td></td>
                        <td>${notes.reduce((sum, n) => sum + (n.notePonderee || 0), 0).toFixed(2)}</td>
                        <td colspan="3"></td>
                    </tr>
                `).join('')}
                <tr class="font-bold" style="background: #f1f5f9; border-top: 2px solid #000;">
                    <td class="text-left font-bold uppercase" style="padding: 6px;">TOTAL GÉNÉRAL</td>
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
                <td style="width: 25%; text-transform: uppercase;">MOYENNE DEFINITIVE</td>
                <td class="lg-val">${((bulletin.moyenneGenerale || 0) - (bulletin.retraitPoints || 0)).toFixed(2)}</td>
                <td style="width: 10%;">Justifiées</td>
                <td class="font-bold" style="width: 5%;">${bulletin.absencesJustifiees || 0}</td>
                <td style="width: 15%;">Non justifiées</td>
                <td class="font-bold" style="width: 5%;">${bulletin.absencesNonJustifiees || 0}</td>
            </tr>
            <tr>
                <td>Meilleure moyenne</td>
                <td class="font-bold">${(bulletin.meilleureMoyenneClasse || 0).toFixed(2)}</td>
                <td style="width: 25%; text-transform: uppercase;">Rang du trimestre</td>
                <td class="font-bold text-lg">${bulletin.rang || '-'}</td>
                <td class="font-bold uppercase" style="width: 10%;">Conduite</td>
                <td colspan="3" class="font-bold">${bulletin.conduite || ''}</td>
            </tr>
            <tr>
                <td>Moyenne la plus basse</td>
                <td class="font-bold">${(bulletin.pireMoyenneClasse || 0).toFixed(2)}</td>
                <td colspan="2"></td>
                <td class="font-bold uppercase">Rappel des Moyennes</td>
                <td colspan="3"></td>
            </tr>
        </table>

        <div class="council-header">Appréciations du conseil de classe</div>
        <div class="council-box">
            <div class="app-box">${getGeneralAppreciation(bulletin.moyenneGenerale || 0)}</div>
            <div class="sig-box">
                <div class="font-bold uppercase" style="font-size: 11px;">Le Proviseur</div>
                <div style="height: 60px;"></div>
                <div class="font-bold" style="font-size: 10px;">${schoolConfig.proviseurName || ''}</div>
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

    const sheets = Array.isArray(sheetsData) ? sheetsData : [sheetsData];

    sheets.forEach((sheet, index) => {
        const { classe, matieres, matrix, subjectStats, overallStats, periode, anneeScolaire } = sheet;

        // Helper to get max notes for a subject
        const getMaxNotes = (matiereId) => {
            let max = 0;
            matrix.forEach(row => {
                const n = row.matieres[matiereId]?.notes?.length || 0;
                if (n > max) max = n;
            });
            return max;
        };

        const getColSpan = (matiereId) => getMaxNotes(matiereId) + 2;

        const headerHtml = `
            <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                <div style="width: 30%; font-[8.5px] font-weight: bold; text-transform: uppercase; line-height: 1.2;">
                    <p style="margin: 0;">${schoolConfig.region || 'FORMATION PROFESSIONNELLE ET TECHNIQUE'}</p>
                    <p style="margin: 0;">${schoolConfig.subRegion || 'RÉGION CENTRE'}</p>
                    <p style="margin: 0;">${schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
                    <p style="margin: 0;">TÉL : ${schoolConfig.phone || '51 54 88 11'}</p>
                </div>
                <div style="width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center;">
                    <div style="font-size: 28px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; line-height: 1;">${schoolConfig.shortName || 'LWS'}</div>
                    <div style="font-size: 8px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; font-weight: bold;">${schoolConfig.motto || 'DISCIPLINE-TRAVAIL-SUCCES'}</div>
                </div>
                <div style="width: 30%; text-align: right; font-size: 8.5px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">
                    <p style="margin: 0;">${schoolConfig.country || 'BURKINA FASO'}</p>
                    <p style="margin: 0; font-size: 7.5px; font-style: italic; text-transform: none; font-weight: normal;">${schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
                </div>
            </div>
        `;

        tablesHtml += `
            <div class="sheet-page" style="${index > 0 ? 'page-break-before: always;' : ''}">
                ${headerHtml}
                
                <div style="text-align: center; margin-bottom: 15px;">
                    <h1 style="font-size: 20px; color: #1e3a8a; margin-bottom: 3px; font-weight: 800;">RÉCAPITULATIF DES NOTES (MASTER SHEET)</h1>
                    <h2 style="font-size: 16px; color: #d35400; margin-bottom: 3px; font-weight: 700;">${classe.niveau} ${classe.section} - ${periode}</h2>
                    <p style="font-size: 11px; color: #666;">Année Scolaire: ${anneeScolaire}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th rowspan="2" style="width: 30px;">N°</th>
                            <th rowspan="2" style="width: 80px;">Matricule</th>
                            <th rowspan="2" class="name-col" style="width: 200px;">Élève</th>
                            ${matieres.map(m => `
                                <th colspan="${getColSpan(m._id)}" class="matiere-group-header">
                                    ${m.nom}<br>
                                    <span style="font-size: 8px; font-weight: normal; text-transform: lowercase;">(Coef: ${m.coefficient || 1})</span>
                                </th>
                            `).join('')}
                            <th rowspan="2" class="total-pts-header" style="width: 80px;">TOTAL DES<br>POINTS</th>
                            <th rowspan="2" class="moy-gen-header" style="width: 80px;">MOYENNE<br>GÉNÉRALE</th>
                        </tr>
                        <tr>
                            ${matieres.map(m => {
            let subHeaders = '';
            const maxN = getMaxNotes(m._id);
            for (let i = 1; i <= maxN; i++) {
                subHeaders += `<th class="sub-header-n">N${i}</th>`;
            }
            subHeaders += `<th class="sub-header-moy">Moy</th>`;
            subHeaders += `<th class="sub-header-pond">Pond.</th>`;
            return subHeaders;
        }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${matrix.map((row, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td style="font-size: 8px; white-space: nowrap;">${row.matricule || '-'}</td>
                                <td class="name-col font-bold">${row.nom} ${row.prenom}</td>
                                ${matieres.map(m => {
            const grade = row.matieres[m._id];
            if (grade && grade.isDispensed) {
                return `<td colspan="${getColSpan(m._id)}" class="dispensed">D</td>`;
            }
            let cells = '';
            const maxN = getMaxNotes(m._id);
            for (let j = 0; j < maxN; j++) {
                const noteVal = grade?.notes?.[j];
                cells += `<td>${noteVal != null ? noteVal.toFixed(1) : '-'}</td>`;
            }
            cells += `<td class="font-bold">${grade?.moyenne != null ? grade.moyenne.toFixed(2) : '-'}</td>`;
            const pond = (grade?.moyenne != null && grade?.coeff) ? (grade.moyenne * grade.coeff).toFixed(2) : '-';
            cells += `<td class="pond-cell">${pond}</td>`;
            return cells;
        }).join('')}
                                <td class="font-bold total-pts-cell">
                                    ${(() => {
                let total = 0; let hasAny = false;
                matieres.forEach(m => { const sm = row.matieres[m._id]; if (sm?.moyenne != null && sm?.coeff) { total += sm.moyenne * sm.coeff; hasAny = true; } });
                return hasAny ? total.toFixed(2) : '-';
            })()}
                                </td>
                                <td class="font-black moy-gen-cell ${row.moyenneGenerale >= 10 ? 'text-green' : (row.moyenneGenerale >= 7 ? 'text-orange' : 'text-red')}">
                                    ${row.moyenneGenerale ? row.moyenneGenerale.toFixed(2) : '-'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="footer-avg">
                            <td colspan="3" class="text-left" style="padding-left: 10px;">MOYENNE DE CLASSE</td>
                            ${matieres.map(m => {
                const maxN = getMaxNotes(m._id);
                return `
                                    ${maxN > 0 ? `<td colspan="${maxN}"></td>` : ''}
                                    <td class="bg-blue-100">${subjectStats[m._id]?.avg?.toFixed(2) || '-'}</td>
                                    <td class="bg-yellow-50"></td>
                                `;
            }).join('')}
                            <td class="bg-orange-50"></td>
                            <td class="bg-blue-200">${overallStats?.classAverage?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr class="footer-max">
                            <td colspan="3" class="text-left" style="padding-left: 10px;">Plus forte moyenne</td>
                            ${matieres.map(m => {
                const maxN = getMaxNotes(m._id);
                return `
                                    ${maxN > 0 ? `<td colspan="${maxN}"></td>` : ''}
                                    <td class="bg-green-50">${subjectStats[m._id]?.max?.toFixed(2) || '-'}</td>
                                    <td class="bg-yellow-50"></td>
                                `;
            }).join('')}
                            <td class="bg-orange-50"></td>
                            <td class="bg-green-100">${overallStats?.maxAverage?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr class="footer-min">
                            <td colspan="3" class="text-left" style="padding-left: 10px;">Plus faible moyenne</td>
                            ${matieres.map(m => {
                const maxN = getMaxNotes(m._id);
                return `
                                    ${maxN > 0 ? `<td colspan="${maxN}"></td>` : ''}
                                    <td class="bg-red-50">${subjectStats[m._id]?.min?.toFixed(2) || '-'}</td>
                                    <td class="bg-yellow-50"></td>
                                `;
            }).join('')}
                            <td class="bg-orange-50"></td>
                            <td class="bg-red-100">${overallStats?.minAverage?.toFixed(2) || '-'}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer-sig">
                    <div class="sig-section">
                        <div class="sig-box">
                            <p class="font-bold underline">LE CENSEUR</p>
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
        @page { size: A3 landscape; margin: 5mm; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 6px; color: #333; }
        
        .sheet-page { width: 100%; padding: 5mm; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 5px; table-layout: fixed; border: 1px solid #333; }
        th, td { border: 1px solid #333; padding: 1px 0.5px; text-align: center; vertical-align: middle; font-size: 5.5px; overflow: hidden; white-space: nowrap; text-overflow: clip; }
        
        thead th { background-color: #f9fafb; font-weight: bold; font-size: 6px; }
        .matiere-group-header { background-color: #eff6ff !important; color: #1e3a8a; text-transform: uppercase; font-size: 5.5px; white-space: normal; line-height: 1; }
        
        .sub-header-n { font-weight: normal; color: #6b7280; width: 18px; }
        .sub-header-moy { background-color: #f9fafb; width: 24px; font-weight: bold; }
        .sub-header-pond { background-color: #fefce8; color: #854d0e; width: 28px; font-weight: bold; }
        
        .name-col { text-align: left; padding-left: 2px; width: 120px; text-overflow: ellipsis; white-space: nowrap; }
        .total-pts-header { background-color: #fff7ed; color: #9a3412; width: 35px; }
        .moy-gen-header { background-color: #f3f4f6; width: 35px; }
        
        .pond-cell { background-color: #fefce8; color: #854d0e; font-weight: 600; }
        .total-pts-cell { background-color: #fff7ed; color: #9a3412; font-weight: bold; }
        .moy-gen-cell { background-color: #f9fafb; font-weight: 900; }
        
        .dispensed { font-weight: bold; color: #e11d48; font-style: italic; }
        .font-bold { font-weight: bold; }
        .font-black { font-weight: 900; }
        .text-left { text-align: left; }
        .underline { text-decoration: underline; }
        
        .text-green { color: #16a34a !important; }
        .text-orange { color: #ea580c !important; }
        .text-red { color: #dc2626 !important; }
        
        tfoot tr td { font-weight: bold; padding: 1px 0.5px; font-size: 6px; }
        .footer-avg { background-color: #f9fafb; border-top: 1.5px solid #94a3b8; }
        .footer-max, .footer-min { font-size: 5.5px; color: #4b5563; }
        
        .bg-blue-100 { background-color: #dbeafe !important; color: #1e3a8a; }
        .bg-blue-200 { background-color: #bfdbfe !important; color: #1e3a8a; font-size: 7px; }
        .bg-yellow-50 { background-color: #fefce8 !important; }
        .bg-orange-50 { background-color: #fff7ed !important; }
        
        .bg-green-50 { background-color: #f0fdf4 !important; color: #16a34a; }
        .bg-green-100 { background-color: #dcfce7 !important; color: #14532d; }
        
        .bg-red-50 { background-color: #fef2f2 !important; color: #dc2626; }
        .bg-red-100 { background-color: #fee2e2 !important; color: #7f1d1d; }
        
        .footer-sig { margin-top: 15px; }
        .sig-section { display: flex; justify-content: space-between; padding: 0 50px; }
        .sig-box { text-align: center; width: 150px; font-size: 7px; }
        .sig-space { height: 40px; }
    </style>
</head>
<body>
    ${tablesHtml}
</body>
</html>
    `;
};
