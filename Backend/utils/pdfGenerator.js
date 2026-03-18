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

    const getSmartCategory = (note, filiereClass) => {
        const nom = (note.matiere?.nom || '').toUpperCase();
        const baseCat = note.categorie || note.matiere?.categorie || 'ENSEIGNEMENT GÉNÉRAL';

        if (filiereClass === 'Technique') {
            if (baseCat === 'ENSEIGNEMENT TECHNIQUE') return "MATIÈRES DE L'ENSEIGNEMENT TECHNIQUE";
            return "MATIÈRES DE L'ENSEIGNEMENT GÉNÉRAL";
        }

        if (baseCat === 'ENSEIGNEMENT TECHNIQUE') return "MATIÈRES DE L'ENSEIGNEMENT TECHNIQUE";

        const isScientific = ['MATH', 'PHYS', 'SVT', 'CHIMIE', 'INFO', 'TECHNO', 'SCIENCES', 'BIO'].some(kw => nom.includes(kw));
        if (isScientific) return "MATIÈRES SCIENTIFIQUES";

        const isLiterary = ['FRANCAIS', 'ANGLAIS', 'HISTOIRE', 'GEOGRAPHIE', 'PHILO', 'ALLEMAND', 'ESPAGNOL', 'LINGUISTIQUE', 'CIVIQUE', 'MORALE'].some(kw => nom.includes(kw));
        if (isLiterary) return "MATIÈRES LITTÉRAIRES";

        const isEPS = ['EPS', 'SPORT', 'PHYSIQUE'].some(kw => nom.includes(kw)) && !isScientific;
        if (isEPS) return "ÉDUCATION PHYSIQUE ET SPORTIVE";

        return "AUTRES";
    };

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

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'Non renseigné';

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
        @page { size: A4; margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 210mm;
            height: 297mm;
            padding: 12mm;
            display: flex;
            flex-direction: column;
            background: white;
            color: #1a1a1a;
            line-height: 1.3;
        }

        .page-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }

        .top-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            flex-shrink: 0;
        }
        .header-left, .header-right {
            width: 30%;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1.4;
        }
        .header-right { text-align: right; }
        .header-center {
            width: 35%;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .school-logo { height: 75px; max-width: 180px; object-fit: contain; margin-bottom: 5px; }
        .motto { font-size: 9.5px; font-weight: 700; color: #4b5563; margin-top: 4px; border-top: 1px solid #e5e7eb; padding-top: 2px; }

        .main-title {
            text-align: center;
            margin-bottom: 15px;
            flex-shrink: 0;
        }
        .main-title h1 {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: 2px;
            padding: 5px 0;
            border-top: 3px solid #111;
            border-bottom: 3px solid #111;
            display: inline-block;
            min-width: 70%;
        }

        .student-info-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 25px;
            flex-shrink: 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
        }
        .info-label { color: #6b7280; font-weight: 400; margin-right: 5px; }
        .info-value { font-weight: 800; text-transform: uppercase; }

        .grades-container {
            flex-grow: 1; 
            display: flex;
            flex-direction: column;
            margin-bottom: 15px;
            min-height: 0;
        }
        .grades-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #111;
            table-layout: fixed;
            height: 100%; 
        }
        .grades-table th, .grades-table td {
            border: 1.5px solid #111;
            padding: 10px 12px;
            text-align: center;
            vertical-align: middle;
            font-size: 13px;
        }
        .grades-table th {
            background-color: #f3f4f6;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 12px;
        }
        .cat-row { background-color: #e5e7eb; font-weight: 800; text-transform: uppercase; font-size: 12px; }
        .subject-name { text-align: left; font-weight: 700; width: 35%; }
        .total-row { background-color: #f9fafb; font-weight: 800; font-size: 12px; }
        .grand-total-row { background-color: #111; color: white; font-weight: 800; }
        .grand-total-row td { border-color: white; font-size: 15px; padding: 12px; }

        .bilan-section {
            margin-bottom: 15px;
            flex-shrink: 0;
        }
        .bilan-title {
            background-color: #111;
            color: white;
            text-align: center;
            font-weight: 800;
            padding: 8px;
            font-size: 14px;
            text-transform: uppercase;
        }
        .bilan-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #111;
        }
        .bilan-table td {
            border: 1.5px solid #111;
            padding: 12px;
            font-size: 13px;
            vertical-align: middle;
        }
        .moyenne-val { font-size: 28px; font-weight: 900; }

        .council-section {
            display: flex;
            flex-direction: column;
            border: 2px solid #111;
            flex-shrink: 0;
        }
        .council-header {
            background-color: #f3f4f6;
            border-bottom: 2px solid #111;
            padding: 8px;
            text-align: center;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 13px;
        }
        .council-body {
            display: flex;
            min-height: 110px;
        }
        .appreciation-box {
            flex: 1;
            border-right: 2px solid #111;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: 900;
            text-transform: uppercase;
        }
        .signature-box {
            width: 40%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px;
            text-align: center;
        }
        .proviseur-name { font-weight: 800; font-size: 13px; margin-top: 15px; }
        .proviseur-title { font-size: 10px; font-style: italic; color: #4b5563; }

        .footer-date {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-style: italic;
            color: #6b7280;
            flex-shrink: 0;
        }
        .page-break { page-break-after: always; height: 100vh; display: flex; flex-direction: column; }
    </style>
</head>
<body>
    <div class="page-container">
        <!-- Header -->
        <div class="top-header">
            <div class="header-left">
                <p>${schoolConfig.ministryName || 'MINISTÈRE DE L\'ENSEIGNEMENT'}</p>
                <p>${schoolConfig.region || 'REGION DU CENTRE'}</p>
                <p>${schoolConfig.city || 'OUAGADOUGOU'}</p>
                <p>${schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
                <p>TÉL : ${schoolConfig.phone || '51 54 88 11'}</p>
            </div>
            <div class="header-center">
                ${schoolConfig.logo ? 
                    `<img src="${schoolConfig.logo.startsWith('data:image/') ? schoolConfig.logo : (schoolConfig.baseUrl || '') + schoolConfig.logo}" class="school-logo" />` : 
                    `<div style="font-size: 36px; font-weight: 900; color: #1e3a8a; line-height: 1;">${schoolConfig.shortName || 'LWS'}</div>`
                }
                <div class="motto">${schoolConfig.motto || 'DISCIPLINE - TRAVAIL - SUCCÈS'}</div>
            </div>
            <div class="header-right">
                <p>${schoolConfig.country || 'BURKINA FASO'}</p>
                <p style="font-weight: normal; text-transform: none; font-size: 8px; font-style: italic;">${schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
            </div>
        </div>

        <div class="main-title">
            <h1>BULLETIN DE NOTES</h1>
        </div>

        <div class="student-info-section">
            <div class="info-row">
                <div><span class="info-label">Année scolaire :</span><span class="info-value">${bulletin.anneeScolaire}</span></div>
                <div><span class="info-value">${bulletin.periode}</span></div>
                <div><span class="info-label">Effectif :</span><span class="info-value">${bulletin.effectif || ''}</span></div>
            </div>
            <div class="info-row">
                <div style="font-size: 18px;"><span class="info-label">Nom de l'élève :</span><span class="info-value">${eleve.nom || ''} ${eleve.prenom || ''}</span></div>
            </div>
            <div class="info-row">
                <div><span class="info-label">Né(e) le :</span><span class="info-value">${formatDate(eleve.dateNaissance)}</span></div>
                <div><span class="info-label">Matricule :</span><span class="info-value">${eleve.matricule || ''}</span></div>
                <div><span class="info-label">Classe :</span><span class="info-value">${classe.niveau || ''} ${classe.section || ''}</span></div>
                <div><span class="info-label">Redoublant :</span><span class="info-value">${eleve.redoublant ? 'OUI' : 'NON'}</span></div>
            </div>
        </div>

        <div class="grades-container">
            <table class="grades-table">
                <thead>
                    <tr>
                        <th style="width: 32%;">Matières</th>
                        <th style="width: 8%;">Coef</th>
                        <th style="width: 10%;">Moy</th>
                        <th style="width: 10%;">Pond.</th>
                        <th style="width: 15%;">Appréciation</th>
                        <th style="width: 25%;">Professeur & Signature</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(groupedNotes).map(([catName, notes]) => `
                        <tr class="cat-row">
                            <td colspan="6">${catName}</td>
                        </tr>
                        ${notes.map(note => {
                            const prof = note.professeur ? `${note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')}${note.professeur.nom || ''}`.toUpperCase().trim() : '';
                            const app = note.isDispensed ? 'DISPENSÉ' : getGeneralAppreciation(note.moyenneMatiere || 0);
                            return `
                                <tr>
                                    <td class="subject-name">${note.matiere?.nom || ''}</td>
                                    <td>${(note.coeff || 1).toFixed(1)}</td>
                                    ${note.isDispensed ? 
                                        `<td>-</td><td>-</td>` : 
                                        `<td>${(note.moyenneMatiere || 0).toFixed(2)}</td><td style="font-weight: 800;">${(note.notePonderee || 0).toFixed(2)}</td>`
                                    }
                                    <td style="font-style: italic; font-size: 11px;">${app}</td>
                                    <td>
                                        <div style="font-size: 10px; font-weight: 700;">${prof}</div>
                                        <div style="height: 18px;"></div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                        <tr class="total-row">
                            <td style="text-align: left;">Sous-total ${catName}</td>
                            <td>${notes.reduce((sum, n) => sum + (n.coeff || 0), 0).toFixed(1)}</td>
                            <td></td>
                            <td>${notes.reduce((sum, n) => sum + (n.notePonderee || 0), 0).toFixed(2)}</td>
                            <td colspan="2"></td>
                        </tr>
                    `).join('')}
                    <tr class="grand-total-row">
                        <td style="text-align: left;">TOTAL GÉNÉRAL</td>
                        <td>${(bulletin.totalCoefficients || 0).toFixed(1)}</td>
                        <td></td>
                        <td>${(bulletin.totalPoints || 0).toFixed(2)}</td>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bilan-section">
            <div class="bilan-title">BILAN ${filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL'}</div>
            <table class="bilan-table">
                <tr>
                    <td style="width: 25%;">Moyenne de l'élève</td>
                    <td class="moyenne-val" style="width: 15%;">${(bulletin.moyenneGenerale || 0).toFixed(2)}</td>
                    <td style="width: 25%;">Retrait de points</td>
                    <td style="font-weight: 800; font-size: 18px;">${(bulletin.retraitPoints || 0).toFixed(2)}</td>
                    <td colspan="2" style="background-color: #f3f4f6; text-align: center; font-weight: 800; font-size: 11px;">ABSENCES</td>
                </tr>
                <tr>
                    <td>Moyenne de la classe</td>
                    <td style="font-weight: 800;">${(bulletin.moyenneClasse || 0).toFixed(2)}</td>
                    <td>Moyenne Définitive</td>
                    <td class="moyenne-val" style="color: #1e3a8a;">${((bulletin.moyenneGenerale || 0) - (bulletin.retraitPoints || 0)).toFixed(2)}</td>
                    <td>Justifiées: <strong>${bulletin.absencesJustifiees || 0}</strong></td>
                    <td>Non Justifiées: <strong>${bulletin.absencesNonJustifiees || 0}</strong></td>
                </tr>
                <tr>
                    <td>Meilleure / Pire Moyenne</td>
                    <td style="font-size: 12px;">${(bulletin.meilleureMoyenneClasse || 0).toFixed(2)} / ${(bulletin.pireMoyenneClasse || 0).toFixed(2)}</td>
                    <td>Rang de l'élève</td>
                    <td style="font-size: 20px; font-weight: 800;">${bulletin.rang || '-'}<sup>${bulletin.rang === 1 ? 'er' : 'ème'}</sup> / ${bulletin.effectif || ''}</td>
                    <td>Conduite</td>
                    <td style="font-weight: 700;">${bulletin.conduite || 'Satisfaisante'}</td>
                </tr>
            </table>
        </div>

        <div class="council-section">
            <div class="council-header">Appréciations du conseil de classe</div>
            <div class="council-body">
                <div class="appreciation-box">${getGeneralAppreciation(bulletin.moyenneGenerale || 0)}</div>
                <div class="signature-box">
                    <div style="font-weight: 800; font-size: 12px; text-transform: uppercase;">Le Proviseur</div>
                    <div style="height: 60px;"></div>
                    <div class="proviseur-name">${schoolConfig.proviseurName || ''}</div>
                    <div class="proviseur-title">${schoolConfig.proviseurTitle || 'Chevalier de l\'Ordre des Palmes Académiques'}</div>
                </div>
            </div>
        </div>

        <div class="footer-date">
            <div>Fait à ${schoolConfig.city || 'Ouagadougou'}, le ${formatDate(new Date())}</div>
            <div>Généré par Unica - Logiciel de gestion scolaire</div>
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
                    <p style="margin: 0;">${schoolConfig.ministryName || 'MINISTÈRE DE L\'ENSEIGNEMENT'}</p>
                    <p style="margin: 0;">${schoolConfig.region || 'FORMATION PROFESSIONNELLE ET TECHNIQUE'}</p>
                    <p style="margin: 0;">${schoolConfig.city || 'OUAGADOUGOU'}</p>
                    <p style="margin: 0;">${schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
                    <p style="margin: 0;">TÉL : ${schoolConfig.phone || '51 54 88 11'}</p>
                </div>
                <div style="width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center;">
                    ${schoolConfig.logo ? 
                        `<img src="${schoolConfig.logo.startsWith('data:image/') ? schoolConfig.logo : (schoolConfig.baseUrl || '') + schoolConfig.logo}" style="height: 60px; max-width: 150px; object-fit: contain; margin-bottom: 5px;" />` : 
                        `<div style="font-size: 28px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; line-height: 1;">${schoolConfig.shortName || 'LWS'}</div>`
                    }
                    ${schoolConfig.motto !== undefined ?
                        (schoolConfig.motto ? `<div style="font-size: 8px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; font-weight: bold;">${schoolConfig.motto}</div>` : '')
                        : `<div style="font-size: 8px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 3px; font-weight: bold;">DISCIPLINE-TRAVAIL-SUCCES</div>`
                    }
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
                            <p class="font-normal italic" style="font-size: 5px; margin-top: 1px;">${schoolConfig.proviseurTitle || 'Chevalier de l\'Ordre des Palmes Académiques'}</p>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; font-size: 6px; color: #6b7280; border-top: 1px solid #e2e8f0; padding-top: 5px; font-family: 'Arial', sans-serif;">
                    <div>Le : ${new Date().toLocaleDateString('fr-FR')}</div>
                    <div style="font-weight: bold; font-style: italic;">Généré par Unica</div>
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

/**
 * Generate HTML for Student Profile (Fiche Élève)
 */
exports.getStudentProfileHTML = (student, schoolConfig) => {
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : 'Non renseigné';
    const val = (v) => v || 'Non renseigné';

    const classe = student.classe
        ? `${student.classe.niveau || ''} ${student.classe.section || ''}`.trim()
        : 'Non affecté';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; font-size: 11px; padding: 12mm; background: white; line-height: 1.4; }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 16px; }
        .h-left, .h-right { width: 30%; font-size: 8.5px; font-weight: bold; text-transform: uppercase; line-height: 1.4; }
        .h-right { text-align: right; }
        .h-center { width: 40%; text-align: center; }
        .logo-text { font-size: 30px; font-weight: 900; color: #1e3a8a; letter-spacing: -1px; }
        .motto { font-size: 8px; color: #6b7280; font-weight: bold; letter-spacing: 0.5px; margin-top: 3px; }

        /* Title */
        .doc-title { text-align: center; margin: 10px 0 16px; }
        .doc-title h1 { font-size: 18px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1; padding: 6px 20px; display: inline-block; letter-spacing: 1px; }

        /* Photo + Name block */
        .id-block { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
        .photo-box { width: 90px; height: 110px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #94a3b8; text-align: center; flex-shrink: 0; border-radius: 4px; }
        .name-block { flex: 1; }
        .student-name { font-size: 18px; font-weight: bold; text-transform: uppercase; color: #1e3a8a; margin-bottom: 4px; }
        .student-meta { font-size: 10px; color: #64748b; margin-bottom: 2px; }
        .status-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 9px; font-weight: bold; background: #dcfce7; color: #166534; margin-top: 4px; }

        /* Sections */
        .section { margin-bottom: 14px; }
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1e3a8a; border-left: 3px solid #1e3a8a; padding-left: 6px; margin-bottom: 8px; letter-spacing: 0.5px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px 12px; }
        .field { display: flex; flex-direction: column; }
        .field-label { font-size: 8.5px; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
        .field-value { font-size: 10.5px; font-weight: 600; color: #1e293b; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px; }

        /* Footer */
        .footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8px; color: #94a3b8; }
        .sig-block { text-align: center; width: 180px; }
        .sig-line { border-top: 1px solid #64748b; margin-top: 40px; font-size: 9px; font-weight: bold; color: #374151; }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="h-left">
            <p>${val(schoolConfig.ministryName)}</p>
            <p>${val(schoolConfig.region)}</p>
            <p>${val(schoolConfig.city)}</p>
            <p>${val(schoolConfig.schoolName)}</p>
            <p>${schoolConfig.phone ? 'TÉL : ' + schoolConfig.phone : ''}</p>
        </div>
        <div class="h-center">
            ${schoolConfig.logo ? 
                `<img src="${schoolConfig.logo.startsWith('data:image/') ? schoolConfig.logo : (schoolConfig.baseUrl || '') + schoolConfig.logo}" style="height: 60px; max-width: 150px; object-fit: contain;" />` : 
                `<div class="logo-text">${schoolConfig.shortName || 'LWS'}</div>`
            }
            <div class="motto">${schoolConfig.motto || 'DISCIPLINE - TRAVAIL - SUCCÈS'}</div>
        </div>
        <div class="h-right">
            <p>${schoolConfig.country || 'BURKINA FASO'}</p>
            <p style="font-size: 7.5px; font-style: italic; text-transform: none; font-weight: normal;">${schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
        </div>
    </div>

    <!-- Document Title -->
    <div class="doc-title"><h1>Fiche Élève</h1></div>

    <!-- ID Block -->
    <div class="id-block">
        <div class="photo-box">
            ${student.photo ? 
                `<img src="${schoolConfig.baseUrl || ''}${student.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />` : 
                `Photo<br>d'identité`
            }
        </div>
        <div class="name-block">
            <div class="student-name">${val(student.nom)} ${val(student.prenom)}</div>
            <div class="student-meta">Matricule : <strong>${val(student.matricule)}</strong></div>
            <div class="student-meta">Classe : <strong>${classe}</strong></div>
            <div class="student-meta">Filière : <strong>${val(student.filiere)}</strong></div>
            <span class="status-badge">${student.statutEleve || 'AFFECTÉ'}</span>
        </div>
    </div>

    <!-- Section 1: Informations Personnelles -->
    <div class="section">
        <div class="section-title">Informations Personnelles</div>
        <div class="grid-3">
            <div class="field"><span class="field-label">Date de Naissance</span><span class="field-value">${formatDate(student.dateNaissance)}</span></div>
            <div class="field"><span class="field-label">Lieu de Naissance</span><span class="field-value">${val(student.lieuNaissance)}</span></div>
            <div class="field"><span class="field-label">Sexe</span><span class="field-value">${student.sexe === 'M' ? 'Masculin' : student.sexe === 'F' ? 'Féminin' : 'Non renseigné'}</span></div>
            <div class="field"><span class="field-label">Adresse</span><span class="field-value">${val(student.adresse)}</span></div>
            <div class="field"><span class="field-label">Téléphone</span><span class="field-value">${val(student.telephone)}</span></div>
            <div class="field"><span class="field-label">Email</span><span class="field-value">${val(student.email)}</span></div>
            <div class="field"><span class="field-label">Redoublant</span><span class="field-value">${student.isRedoublant ? 'Oui' : 'Non'}</span></div>
        </div>
    </div>

    <!-- Section 2: Informations Parentales -->
    <div class="section">
        <div class="section-title">Informations Parentales</div>
        <div class="grid-3">
            <div class="field"><span class="field-label">Nom du Père</span><span class="field-value">${val(student.fatherName)}</span></div>
            <div class="field"><span class="field-label">Tél. Père</span><span class="field-value">${val(student.fatherPhone)}</span></div>
            <div class="field"><span class="field-label">Email Père</span><span class="field-value">${val(student.fatherEmail)}</span></div>
            <div class="field"><span class="field-label">Nom de la Mère</span><span class="field-value">${val(student.motherName)}</span></div>
            <div class="field"><span class="field-label">Tél. Mère</span><span class="field-value">${val(student.motherPhone)}</span></div>
            <div class="field"><span class="field-label">Email Mère</span><span class="field-value">${val(student.motherEmail)}</span></div>
            <div class="field"><span class="field-label">Tuteur Légal</span><span class="field-value">${val(student.legalGuardian)}</span></div>
            <div class="field"><span class="field-label">Tél. Tuteur</span><span class="field-value">${val(student.guardianPhone)}</span></div>
        </div>
    </div>

    <!-- Section 3: Informations Médicales -->
    <div class="section">
        <div class="section-title">Informations Médicales</div>
        <div class="grid-3">
            <div class="field"><span class="field-label">Groupe Sanguin</span><span class="field-value">${val(student.bloodGroup)}</span></div>
            <div class="field"><span class="field-label">Langue Maternelle</span><span class="field-value">${val(student.nativeLanguage)}</span></div>
            <div class="field"><span class="field-label">Allergènes</span><span class="field-value">${val(student.allergens)}</span></div>
            <div class="field"><span class="field-label">Médicaments</span><span class="field-value">${val(student.medicaments)}</span></div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <div>Généré le : ${new Date().toLocaleDateString('fr-FR')}</div>
        <div class="sig-block">
            <div class="sig-line">Le Proviseur<br><span style="font-size: 8px; font-weight: normal; font-style: italic;">${schoolConfig.proviseurName || ''}</span></div>
        </div>
        <div style="font-style: italic; font-weight: bold;">Généré par Unica</div>
    </div>
</body>
</html>
    `;
};

/**
 * Generate PDF for a student profile (Fiche Élève)
 */
exports.generateStudentProfilePDF = async (student, schoolConfig) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const html = exports.getStudentProfileHTML(student, schoolConfig);
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

