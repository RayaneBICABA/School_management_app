const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Génère un PDF pour un bulletin scolaire
 * @param {Object} bulletinData - Données du bulletin
 * @returns {Buffer} - Buffer du PDF généré
 */
const generateBulletinPDF = async (bulletinData, schoolConfig = {}) => {
    let browser;
    try {
        // Lancer le navigateur
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Générer le HTML concaténé (bulletin unique)
        let fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulletin de Notes</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.3;
            color: #333;
            background: white;
            -webkit-print-color-adjust: exact;
        }
        
        /* Styles exactly like class view */
        .bulletin-container {
            width: 210mm;
            padding: 10px;
            margin: 0 auto;
        }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header-left, .header-right { width: 30%; font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
        .header-left p, .header-right p { margin: 0 0 2px 0; }
        .header-right { text-align: right; }
        .sub-motto { font-size: 9px; font-style: italic; text-transform: none; font-weight: normal; }
        .header-center { width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .logo-text { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em; }
        .motto { font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

        /* ... common styles ... */
        .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .grades-table th, .grades-table td { border: 1px solid black; padding: 4px; text-align: center; }
        .grades-table th { background: #f3f4f6 !important; font-weight: bold; }
        .text-left { text-align: left !important; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .uppercase { text-transform: uppercase; }
        
        /* Bilan Table */
        .bilan-section { margin-top: 15px; }
        .bilan-table { width: 100%; border-collapse: collapse; }
        .bilan-table td { border: 1px solid black; padding: 6px; }

        /* Council Section */
        .council-section { margin-top: 15px; border: 1px solid black; }
        .council-header { background: #d1d5db !important; text-align: center; font-weight: bold; padding: 6px; border-bottom: 1px solid black; text-transform: uppercase; }
        .council-content { display: flex; min-height: 100px; }
        .council-left { width: 50%; border-right: 1px solid black; display: flex; justify-content: center; align-items: center; padding: 10px; }
        .council-right { width: 50%; display: flex; flex-direction: column; align-items: center; padding: 10px; }
        .appreciation-box { border: 4px double #333; padding: 10px; text-align: center; min-width: 150px; }
    </style>
</head>
<body>
    ${generateBulletinContent(bulletinData, schoolConfig)}
</body>
</html>
        `;

        // Définir le contenu HTML
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        // Générer le PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            preferCSSPageSize: true
        });

        return pdfBuffer;

    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Génère un PDF unique pour tous les bulletins d'une classe
 * @param {Array} bulletinsData - Tableau des données des bulletins
 * @returns {Buffer} - Buffer du PDF généré
 */
const generateClassBulletinsPDF = async (bulletinsData, schoolConfig = {}) => {
    let browser;
    try {
        // Lancer le navigateur
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Générer le HTML concaténé avec sauts de page
        let fullHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulletins de Classe</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
            -webkit-print-color-adjust: exact;
        }
        .page-break {
            page-break-after: always;
            display: block;
            height: 0;
        }
        
        /* Styles from generateBulletinHTML (Balanced for Readability) */
        .bulletin-container {
            width: 210mm;
            padding: 20px;
            margin: 0 auto;
            background: white;
        }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header-left, .header-right { width: 30%; font-size: 11px; font-weight: bold; text-transform: uppercase; line-height: 1.3; }
        .header-left p, .header-right p { margin: 0 0 3px 0; }
        .header-right { text-align: right; }
        .sub-motto { font-size: 10px; font-style: italic; text-transform: none; font-weight: normal; }
        .header-center { width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .logo-text { font-size: 28px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em; }
        .motto { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }

        /* Title */
        .title-section { text-align: center; margin: 16px 0; }
        .title-section h1 { font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-style: italic; font-weight: bold; margin: 0; color: #333333 !important; }

        /* General Info Rows */
        .info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 11px; }
        .student-name-row { margin-bottom: 11px; font-size: 12px; text-transform: uppercase; font-weight: bold; }
        .info-eleve-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 14px; padding-bottom: 11px; border-bottom: 1px solid #e5e7eb; }
        
        strong { font-weight: bold; }

        /* Table Commons */
        table { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 4px; }
        
        /* Grades Table */
        .grades-table th { background: #e5e7eb !important; color: #000000 !important; text-align: center; font-weight: bold; padding: 5px 4px; }
        .grades-table td { text-align: center; }
        .w-matiere { width: 25%; text-align: left; }
        .text-left { text-align: left; }
        .uppercase { text-transform: uppercase; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .text-xs { font-size: 10px; }
        .bg-gray-300 { background-color: #d1d5db !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .cat-header { font-weight: bold; text-align: center; text-transform: uppercase; padding: 5px; }

        /* Bilan Table */
        .bilan-section { margin-top: 16px; }
        .bilan-table th, .bilan-table td { border: 1px solid black; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-lg { font-size: 12px; }

        /* Council Section */
        .council-section { margin-top: 16px; border: 1px solid black; page-break-inside: avoid; }
        .council-header { background: #d1d5db !important; text-align: center; font-weight: bold; padding: 7px; border-bottom: 1px solid black; margin: 0; text-transform: uppercase; font-size: 12px; }
        .council-content { display: flex; height: 120px; }
        .council-left { width: 50%; border-right: 1px solid black; display: flex; justify-content: center; align-items: center; padding: 14px; }
        .council-right { width: 50%; display: flex; flex-direction: column; align-items: center; padding: 14px; }
        
        .appreciation-box { border: 3px double #1f2937; padding: 16px; text-align: center; min-width: 160px; border-radius: 3px; }
        .appr-grade { font-size: 14px; font-weight: bold; margin-bottom: 7px; }
        .appr-decision { color: #dc2626; font-weight: bold; text-transform: uppercase; font-size: 13px; }

        .proviseur-title { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 14px; }
        
        /* Footer */
        .footer { margin-top: 14px; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 7px; }
        .info-grid { display: flex; gap: 20px; margin-bottom: 15px; font-size: 12px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .info-item { display: flex; flex-direction: column; flex: 1; }
        .info-label { color: #6b7280; font-size: 10px; margin-bottom: 2px; }
        .info-value { font-weight: bold; }
    </style>
</head>
<body>
        `;

        bulletinsData.forEach((bulletin, index) => {
            const content = generateBulletinContent(bulletin, schoolConfig);
            fullHtml += content;
            if (index < bulletinsData.length - 1) {
                fullHtml += '<div class="page-break"></div>';
            }
        });

        fullHtml += '</body></html>';

        // Définir le contenu HTML
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        // Générer le PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            preferCSSPageSize: true
        });

        return pdfBuffer;

    } catch (error) {
        console.error('Erreur lors de la génération du PDF classe:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Génère le contenu HTML pour un bulletin scolaire (sans tags html/body)
 * @param {Object} bulletinData - Données du bulletin
 * @returns {String} - Contenu HTML du bulletin
 */
const generateHeaderHTML = (schoolConfig, secondaryText = '') => {
    const logoHtml = schoolConfig.logo ?
        `<img src="http://localhost:5000${schoolConfig.logo}" style="height: 60px; max-width: 180px; object-fit: contain; margin-bottom: 5px;" />` :
        `<div class="logo-text">${schoolConfig.shortName || 'LWS'}</div>`;

    const mottoHtml = schoolConfig.motto ?
        `<div class="motto">${schoolConfig.motto}</div>` : '';

    return `
        <div class="header">
            <div class="header-left">
                <p>${schoolConfig.region || 'LA FORMATION PROFESSIONNELLE ET TECHNIQUE'}</p>
                <p>${schoolConfig.subRegion || 'RÉGION CENTRE'}</p>
                <p>${schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
                ${secondaryText ? `<p>${secondaryText}</p>` : ''}
            </div>
            
            <div class="header-center">
                ${logoHtml}
                ${mottoHtml}
            </div>
            
            <div class="header-right">
                <p>${schoolConfig.country || 'BURKINA FASO'}</p>
                <p class="sub-motto">${schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
            </div>
        </div>
    `;
};

/**
 * Helper function to generate the HTML content for a single master grade sheet.
 * @param {Object} sheetData - Data for a single master grade sheet, including calculated subjectColspans.
 * @param {Object} schoolConfig - School configuration.
 * @returns {String} - HTML string for the master grade sheet.
 */
const generateMasterGradeSheetHTMLContent = (sheetData, schoolConfig) => {
    return `
            ${generateHeaderHTML(schoolConfig)}

            <div class="title">
                <h1>RELEVÉ DE NOTES RÉCAPITULATIF</h1>
                <p>Classe: ${sheetData.classe.niveau} ${sheetData.classe.section} | Période: ${sheetData.periode} | Année: ${sheetData.anneeScolaire}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="3">N°</th>
                        <th rowspan="3">Matricule</th>
                        <th rowspan="3">Nom et Prénoms</th>
                        ${sheetData.matieres.map(m => `<th colspan="${sheetData.subjectColspans[m._id]}">${m.nom}</th>`).join('')}
                        <th rowspan="3" style="background:#fff3cd;">Total Pond.</th>
                        <th rowspan="3">MOY. GEN</th>
                    </tr>
                    <tr>
                        ${sheetData.matieres.map(m => `<th colspan="${sheetData.subjectColspans[m._id]}">Coeff: ${m.coefficient || 1}</th>`).join('')}
                    </tr>
                    <tr>
                        ${sheetData.matieres.map(m => {
        const cols = [];
        for (let i = 1; i < sheetData.subjectColspans[m._id]; i++) {
            cols.push(`<th>Note ${i}</th>`);
        }
        cols.push(`<th class="moyenne-col">Moy</th>`);
        return cols.join('');
    }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${sheetData.matrix.map((row, idx) => `
                        <tr>
                            <td>${idx + 1}</td>
                            <td>${row.matricule}</td>
                            <td class="student-name">${row.nom} ${row.prenom}</td>
                            ${sheetData.matieres.map(m => {
        const studentMatiere = row.matieres[m._id];
        const cols = [];
        const maxEv = sheetData.subjectColspans[m._id] - 1; // -1: exclude Moy column only
        for (let i = 0; i < maxEv; i++) {
            const noteVal = studentMatiere?.notes?.[i];
            cols.push(`<td>${noteVal !== undefined && noteVal !== null ? noteVal.toFixed(2) : '-'}</td>`);
        }
        const moy = studentMatiere?.moyenne;
        cols.push(`<td class="moyenne-col">${moy != null ? moy.toFixed(2) : '-'}</td>`);
        return cols.join('');
    }).join('')}
                            <td style="background:#fff3cd;font-weight:bold;">${(() => {
            let total = 0; let hasAny = false;
            sheetData.matieres.forEach(m => {
                const sm = row.matieres[m._id];
                if (sm?.moyenne != null && sm?.coeff) { total += sm.moyenne * sm.coeff; hasAny = true; }
            });
            return hasAny ? total.toFixed(2) : '-';
        })()}</td>
                            <td class="moyenne-col" style="background: #d1d5db; font-weight:bold;">${typeof row.moyenneGenerale === 'number' ? row.moyenneGenerale.toFixed(2) : '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="stats-row">
                        <td colspan="3" style="text-align: left;">MOYENNE DE CLASSE / MATIÈRE</td>
                        ${sheetData.matieres.map(m => `<td colspan="${sheetData.subjectColspans[m._id]}">${sheetData.subjectStats?.[m._id]?.avg?.toFixed(2) || '-'}</td>`).join('')}
                        <td style="background:#fff3cd;">-</td>
                        <td>-</td>
                    </tr>
                    <tr class="stats-row">
                        <td colspan="3" style="text-align: left;">PLUS FORTE MOYENNE</td>
                        ${sheetData.matieres.map(m => `<td colspan="${sheetData.subjectColspans[m._id]}">${sheetData.subjectStats?.[m._id]?.max?.toFixed(2) || '-'}</td>`).join('')}
                        <td style="background:#fff3cd;">-</td>
                        <td>-</td>
                    </tr>
                    <tr class="stats-row">
                        <td colspan="3" style="text-align: left;">PLUS FAIBLE MOYENNE</td>
                        ${sheetData.matieres.map(m => `<td colspan="${sheetData.subjectColspans[m._id]}">${sheetData.subjectStats?.[m._id]?.min?.toFixed(2) || '-'}</td>`).join('')}
                        <td style="background:#fff3cd;">-</td>
                        <td>-</td>
                    </tr>
                    <tr class="stats-row" style="background: #e5e7eb; border-top: 2px solid black;">
                        <td colspan="3" style="text-align: left; font-size: 11px;">STATISTIQUES GÉNÉRALES DE LA CLASSE</td>
                        ${sheetData.matieres.map(m => `<td colspan="${sheetData.subjectColspans[m._id]}">-</td>`).join('')}
                        <td style="background:#fff3cd;">-</td>
                        <td style="background: #d1d5db; font-size: 11px; font-weight:bold;">${sheetData.overallStats?.classAverage != null ? sheetData.overallStats.classAverage.toFixed(2) : '-'}</td>
                    </tr>
                    <tr class="stats-row">
                        <td colspan="3" style="text-align: left;">PLUS FORTE MOYENNE GÉNÉRALE</td>
                        ${sheetData.matieres.map(m => `<td colspan="${sheetData.subjectColspans[m._id]}">-</td>`).join('')}
                        <td style="background:#fff3cd;">-</td>
                        <td style="font-weight:bold;">${sheetData.overallStats?.maxAverage != null ? sheetData.overallStats.maxAverage.toFixed(2) : '-'}</td>
                    </tr>
                    <tr class="stats-row">
                        <td colspan="3" style="text-align: left;">PLUS FAIBLE MOYENNE GÉNÉRALE</td>
                        ${sheetData.matieres.map(m => `<td colspan="${sheetData.subjectColspans[m._id]}">-</td>`).join('')}
                        <td style="background:#fff3cd;">-</td>
                        <td style="font-weight:bold;">${sheetData.overallStats?.minAverage != null ? sheetData.overallStats.minAverage.toFixed(2) : '-'}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 10px; display: flex; justify-content: space-between; font-weight: bold;">
                <div style="width: 200px; text-align: center; border-bottom: 1px solid black; padding-bottom: 30px;">Le Censeur</div>
                <div style="width: 200px; text-align: center; border-bottom: 1px solid black; padding-bottom: 30px;">Le Proviseur</div>
            </div>
    `;
};

/**
 * Génère un PDF récapitulatif des notes (Master Sheet) pour une classe
 * @param {Object} data - Données agrégées (matieres, matrix, classe, periode, anneeScolaire)
 * @param {Object} schoolConfig - Config de l'établissement
 * @returns {Buffer} - Buffer du PDF
 */
const generateMasterGradeSheetPDF = async (data, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Calculate maximum evaluations per subject to set colspans
        const subjectColspans = {};
        data.matieres.forEach(m => {
            let maxEv = 0;
            data.matrix.forEach(row => {
                const notes = row.matieres[m._id]?.notes || [];
                if (notes.length > maxEv) maxEv = notes.length;
            });
            subjectColspans[m._id] = maxEv + 1; // +1 for Moy only (Pond. is a global column at the end)
        });

        const sheetDataWithColspans = { ...data, subjectColspans };

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Récapitulatif des Notes - ${data.classe.niveau} ${data.classe.section}</title>
    <style>
        @page { size: A3 landscape; margin: 10mm; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; margin: 0; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header-left, .header-right { width: 30%; font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
        .header-left p, .header-right p { margin: 0 0 2px 0; }
        .header-right { text-align: right; }
        .sub-motto { font-size: 9px; font-style: italic; text-transform: none; font-weight: normal; }
        .header-center { width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .logo-text { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em; }
        .motto { font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
        
        .title { text-align: center; margin-bottom: 20px; }
        .title h1 { font-size: 18px; text-decoration: underline; margin-bottom: 5px; }
        .title p { font-size: 14px; font-weight: bold; }

        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 3px; text-align: center; }
        th { background: #f3f4f6; font-weight: bold; font-size: 9px; }
        .student-name { text-align: left; font-weight: bold; white-space: nowrap; }
        .moyenne-col { font-weight: bold; background: #e5e7eb; }
        .stats-row td { font-weight: bold; background: #f9fafb; font-size: 9px; line-height: 1.2; padding: 2px 3px; height: 16px; max-height: 18px; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    ${generateMasterGradeSheetHTMLContent(sheetDataWithColspans, schoolConfig)}
</body>
</html>
    `;

        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A3',
            landscape: true,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        return pdfBuffer;
    } catch (error) {
        console.error('Erreur Master Sheet PDF:', error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};

/**
 * Génère un PDF récapitulatif des notes pour plusieurs classes (Bulk Export)
 * @param {Array} allSheetsData - Tableau de données pour chaque classe
 * @param {Object} schoolConfig - Config de l'établissement
 * @returns {Buffer} - Buffer du PDF combiné
 */
const generateBulkMasterGradeSheetPDF = async (allSheetsData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        let allHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Récapitulatif des Notes - Export Groupé</title>
    <style>
        @page { size: A3 landscape; margin: 10mm; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 10px; margin: 0; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .header-left, .header-right { width: 30%; font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
        .header-left p, .header-right p { margin: 0 0 2px 0; }
        .header-right { text-align: right; }
        .sub-motto { font-size: 9px; font-style: italic; text-transform: none; font-weight: normal; }
        .header-center { width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .logo-text { font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em; }
        .motto { font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
        
        .title { text-align: center; margin-bottom: 20px; }
        .title h1 { font-size: 18px; text-decoration: underline; margin-bottom: 5px; }
        .title p { font-size: 14px; font-weight: bold; }

        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 3px; text-align: center; }
        th { background: #f3f4f6; font-weight: bold; font-size: 9px; }
        .student-name { text-align: left; font-weight: bold; white-space: nowrap; }
        .moyenne-col { font-weight: bold; background: #e5e7eb; }
        .stats-row td { font-weight: bold; background: #f9fafb; font-size: 9px; line-height: 1.2; padding: 2px 3px; height: 16px; max-height: 18px; }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
`;

        allSheetsData.forEach((data, index) => {
            // Calculate colspans for this sheet
            const subjectColspans = {};
            data.matieres.forEach(m => {
                let maxEv = 0;
                data.matrix.forEach(row => {
                    const notes = row.matieres[m._id]?.notes || [];
                    if (notes.length > maxEv) maxEv = notes.length;
                });
                subjectColspans[m._id] = maxEv + 1; // +1 for Moy only
            });

            const sheetDataWithColspans = { ...data, subjectColspans };
            allHtml += generateMasterGradeSheetHTMLContent(sheetDataWithColspans, schoolConfig);

            if (index < allSheetsData.length - 1) {
                allHtml += '<div class="page-break"></div>';
            }
        });

        allHtml += `
</body>
</html>
`;

        await page.setContent(allHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A3',
            landscape: true,
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        return pdfBuffer;
    } catch (error) {
        console.error('Erreur Bulk Master Sheet PDF:', error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};

const generateBulletinContent = (bulletinData, schoolConfig = {}) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const eleve = bulletinData.eleve || {};
    const classe = bulletinData.classe || {};

    // Group notes by category
    const groupedNotes = {};
    if (bulletinData.notes && Array.isArray(bulletinData.notes)) {
        bulletinData.notes.forEach(note => {
            const cat = note.categorie || 'AUTRES';
            if (!groupedNotes[cat]) groupedNotes[cat] = [];
            groupedNotes[cat].push(note);
        });
    }

    const formatDate = (date) => {
        if (!date) return '--/--/----';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const getCategoryTotalCoeff = (notes) => {
        return notes.reduce((sum, n) => sum + (n.coeff || 0), 0).toFixed(1);
    };

    const getCategoryTotalPoints = (notes) => {
        return notes.reduce((sum, n) => sum + (n.notePonderee || 0), 0).toFixed(2);
    };

    const getAppreciationColor = (app) => {
        if (!app) return '';
        const a = app.toLowerCase();
        if (a.includes('excellent')) return 'color: #15803d;'; // green-700
        if (a.includes('très bien')) return 'color: #16a34a;'; // green-600
        if (a.includes('bien')) return 'color: #22c55e;'; // green-500
        if (a.includes('assez-bien')) return 'color: #84cc16;'; // lime-500
        if (a.includes('passable')) return 'color: #f97316;'; // orange-500
        if (a.includes('faible')) return 'color: #dc2626;'; // red-600
        if (a.includes('insuffisant')) return 'color: #991b1b;'; // red-800
        return '';
    };

    const getGeneralAppreciation = (moy) => {
        if (moy >= 18) return 'Excellent';
        if (moy >= 16) return 'Très Bien';
        if (moy >= 14) return 'Bien';
        if (moy >= 12) return 'Assez-Bien';
        if (moy >= 10) return 'Passable';
        if (moy >= 8) return 'Faible';
        return 'Insuffisant';
    };

    const getSubjectAppreciation = (moy) => {
        if (moy >= 18) return 'Excellent';
        if (moy >= 16) return 'Très Bien';
        if (moy >= 14) return 'Bien';
        if (moy >= 12) return 'Assez-Bien';
        if (moy >= 10) return 'Passable';
        if (moy >= 8) return 'Faible';
        return 'Insuffisant';
    };

    // Calculate max columns for dynamic display
    let maxInt = 0;
    let maxDev = 0;
    let maxCompo = 0;

    bulletinData.notes.forEach(note => {
        const nInt = (note.interroGrades?.length || (note.int !== undefined ? 1 : 0));
        const nDev = (note.devoirGrades?.length || (note.dev !== undefined ? 1 : 0));
        const nCompo = (note.compoGrades?.length || (note.compo !== undefined ? 1 : 0));

        if (nInt > maxInt) maxInt = nInt;
        if (nDev > maxDev) maxDev = nDev;
        if (nCompo > maxCompo) maxCompo = nCompo;
    });

    // Column counts are strictly dynamic based on data
    const totalCols = 7 + maxInt + maxDev + maxCompo;

    return `
    <div class="bulletin-container">
        <!-- Header -->
        ${generateHeaderHTML(schoolConfig, schoolConfig.phone ? `Tél : ${schoolConfig.phone}` : '')}

        <!-- Title -->
        <div class="title-section">
            <h1>BULLETIN DE NOTES</h1>
        </div>

        <!-- Info Trimestre -->
        <div class="info-row">
            <span>Année scolaire: <strong>${bulletinData.anneeScolaire || '2025-2026'}</strong></span>
            <span><strong>${bulletinData.periode}</strong></span>
            <span>Effectif: <strong>${bulletinData.effectif || 0}</strong></span>
        </div>

        <!-- Student Name -->
        <div class="student-name-row" style="margin-bottom: 10px; font-size: 14px; text-transform: uppercase;">
            Nom de l'élève: <strong>${eleve.nom || 'Non renseigné'} ${eleve.prenom || 'Non renseigné'}</strong>
        </div>

        <!-- Info Eleve -->
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Né(e) le:</span>
                <span class="info-value">${formatDate(eleve.dateNaissance)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Matricule:</span>
                <span class="info-value">${eleve.matricule || 'Non renseigné'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Classe de:</span>
                <span class="info-value">${classe.niveau || ''} ${classe.section || ''}</span>
            </div>
            <div class="info-item" style="text-align: right;">
                <span class="info-label">Redoublant:</span>
                <span class="info-value">${eleve.redoublant ? 'OUI' : 'NON'}</span>
            </div>
        </div>

        <!-- Grades Table -->
        <table class="grades-table text-xs">
            <thead>
                <tr>
                    <th class="w-matiere" style="text-align: left;">Matières</th>
                    <th class="w-small">Coef</th>
                    ${Array.from({ length: maxInt }, (_, i) => `<th class="w-small">Int ${i + 1}</th>`).join('')}
                    ${Array.from({ length: maxDev }, (_, i) => `<th class="w-small">Dev ${i + 1}</th>`).join('')}
                    ${Array.from({ length: maxCompo }, (_, i) => `<th class="w-small">Comp ${i + 1}</th>`).join('')}
                    <th class="w-small">Moy</th>
                    <th class="w-medium">Notes pondérées</th>
                    <th class="w-appr" colspan="3">Appréciations et signatures</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(groupedNotes).map(([catName, notes]) => `
                    <tr class="bg-gray-300">
                        <td colspan="${totalCols}" class="cat-header">${catName}</td>
                    </tr>
                    ${notes.map(note => {
        const noteInts = (note.interroGrades && note.interroGrades.length > 0) ? note.interroGrades : (note.int !== undefined ? [note.int] : []);
        const noteDevs = (note.devoirGrades && note.devoirGrades.length > 0) ? note.devoirGrades : (note.dev !== undefined ? [note.dev] : []);
        const noteCompos = (note.compoGrades && note.compoGrades.length > 0) ? note.compoGrades : (note.compo !== undefined ? [note.compo] : []);

        return `
                        <tr>
                            <td class="text-left bold uppercase" style="padding: 8px;">${note.matiere?.nom || 'N/A'}</td>
                            <td>${(note.coeff || note.matiere?.coefficient || 0).toFixed(1)}</td>
                            ${Array.from({ length: maxInt }, (_, i) => `<td>${noteInts[i] !== undefined ? noteInts[i].toFixed(2) : ''}</td>`).join('')}
                            ${Array.from({ length: maxDev }, (_, i) => `<td>${noteDevs[i] !== undefined ? noteDevs[i].toFixed(2) : ''}</td>`).join('')}
                            ${Array.from({ length: maxCompo }, (_, i) => `<td>${noteCompos[i] !== undefined ? noteCompos[i].toFixed(2) : ''}</td>`).join('')}
                            <td>${(note.moyenneMatiere || 0).toFixed(2)}</td>
                            <td class="bold">${(note.notePonderee || 0).toFixed(2)}</td>
                            <td class="italic" style="${getAppreciationColor(getSubjectAppreciation(note.moyenneMatiere || 0))}">${getSubjectAppreciation(note.moyenneMatiere || 0)}</td>
                            <td class="signature-cell" style="width: 60px; border: 1px solid black;"></td>
                            <td class="text-xs uppercase">${note.professeur ? `${note.professeur.prenom} ${note.professeur.nom}` : ''}</td>
                        </tr>
                    `}).join('')}
                    <!-- Category Totals -->
                    <tr class="bg-gray-100 bold">
                        <td class="text-left uppercase" style="padding: 8px;">Total</td>
                        <td>${getCategoryTotalCoeff(notes)}</td>
                        <td colspan="${maxInt + maxDev + maxCompo + 1}"></td>
                        <td>${getCategoryTotalPoints(notes)}</td>
                        <td colspan="3"></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Bilan Table -->
        <div class="bilan-section">
            <table class="bilan-table text-xs">
                <tbody>
                    <tr class="bg-gray-300">
                        <td colspan="8" class="text-center bold uppercase p-2">BILAN TRIMESTRIEL</td>
                    </tr>
                    <tr class="bold">
                        <td colspan="4" class="p-2 uppercase">TOTAL COEFFICIENT : <strong>${(bulletinData.totalCoefficients || 0).toFixed(2)}</strong></td>
                        <td colspan="4" class="p-2 uppercase text-right">TOTAL NOTES PONDEREES: <strong>${(bulletinData.totalPoints || 0).toFixed(2)}</strong></td>
                    </tr>
                    <tr>
                        <td class="p-2">Moyenne de l'élève</td>
                        <td class="p-2 bold text-lg">${(bulletinData.moyenneGenerale || 0).toFixed(2)}</td>
                        <td class="p-2 uppercase">RETRAIT DE POINTS</td>
                        <td class="p-2 bold">${(bulletinData.retraitPoints || 0).toFixed(2)}</td>
                        <td colspan="4" class="p-2 text-center uppercase bold">Nombre d'heures d'absence</td>
                    </tr>
                    <tr>
                        <td class="p-2">Moyenne de la classe</td>
                        <td class="p-2 bold">${(bulletinData.moyenneClasse || 0).toFixed(2)}</td>
                        <td class="p-2 uppercase">MOYENNE DEFINITIVE</td>
                        <td class="p-2 bold text-lg">${((bulletinData.moyenneGenerale || 0) - (bulletinData.retraitPoints || 0)).toFixed(2)}</td>
                        <td class="p-2 text-center">Justifiées</td>
                        <td class="p-2 bold text-center">${bulletinData.absencesJustifiees || 0}</td>
                        <td class="p-2 text-center">Non justifiées</td>
                        <td class="p-2 bold text-center">${bulletinData.absencesNonJustifiees || 0}</td>
                    </tr>
                    <tr>
                        <td class="p-2">Meilleure moyenne</td>
                        <td class="p-2 bold">${(bulletinData.meilleureMoyenneClasse || 0).toFixed(2)}</td>
                        <td class="p-2 uppercase">Rang du trimestre</td>
                        <td class="p-2 bold">${bulletinData.rang ? bulletinData.rang + (bulletinData.rang === 1 ? 'er' : 'e') : '-'}</td>
                        <td class="p-2 text-center uppercase bold">Conduite</td>
                        <td colspan="3" class="p-2 bold">${bulletinData.conduite || ''}</td>
                    </tr>
                    <tr>
                        <td class="p-2">Moyenne la plus basse</td>
                        <td class="p-2 bold">${(bulletinData.pireMoyenneClasse || 0).toFixed(2)}</td>
                        <td colspan="2" class="p-2"></td>
                        <td class="p-2 text-center uppercase bold">Rappel des Moyennes</td>
                        <td colspan="3" class="p-2"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Appreciation & Signature -->
        <div class="council-section">
            <h3 class="council-header">Appréciations du conseil de classe</h3>
            <div class="council-content">
                <div class="council-left">
                    <div class="appreciation-box">
                        <div class="appr-grade">${getGeneralAppreciation(bulletinData.moyenneGenerale)}</div>
                    </div>
                </div>
                <div class="council-right">
                    <div class="proviseur-title">Le Proviseur</div>
                    <!-- Signature Logic: Manual signature space only -->
                    <div style="height: 40px;"></div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div>Édité le ${currentDate} - Document officiel à conserver.</div>
            <div>Page 1 sur 1</div>
        </div>
    </div>
    `;
};

/**
 * Génère le HTML pour un bulletin scolaire
 * @param {Object} bulletinData - Données du bulletin
 * @returns {String} - HTML du bulletin
 */
const generateBulletinHTML = (bulletinData) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bulletin Scolaire - ${bulletinData.eleve?.prenom} ${bulletinData.eleve?.nom}</title>
    <style>
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; }
        body { 
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px; margin: 0; background: white; -webkit-print-color-adjust: exact; 
            color: #333333; line-height: 1.4;
        }
        
        .bulletin-container {
            width: 210mm;
            padding: 20px; 
            margin: 0 auto;
        }

        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 14px; }
        .header-left, .header-right { font-size: 11px; font-weight: bold; text-transform: uppercase; line-height: 1.3; }
        .header-left p { margin-bottom: 3px; margin-top: 0; }
        .header-right { text-align: right; }
        .header-right p { margin-bottom: 3px; margin-top: 0; }
        .sub-motto { font-size: 10px; font-style: italic; text-transform: none; font-weight: normal; }
        .header-center { display: flex; flex-direction: column; align-items: center; }
        .logo-text { font-size: 28px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em; margin-bottom: 4px; }
        .motto { font-size: 10px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; }

        /* Title */
        .title-section { text-align: center; margin: 16px 0; }
        .title-section h1 { font-family: Arial, Helvetica, sans-serif; font-size: 22px; font-style: italic; font-weight: bold; margin: 0; color: #333333 !important; }

        /* General Info Rows */
        .info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 11px; }
        .student-name-row { margin-bottom: 11px; font-size: 12px; text-transform: uppercase; font-weight: bold; }
        .info-eleve-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 14px; padding-bottom: 11px; border-bottom: 1px solid #e5e7eb; }
        
        strong { font-weight: bold; }

        /* Table Commons */
        table { width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid black; }
        th, td { border: 1px solid black; padding: 4px; }
        
        /* Grades Table */
        .grades-table th { background: #e5e7eb !important; color: #000000 !important; text-align: center; font-weight: bold; padding: 5px 4px; }
        .grades-table td { text-align: center; }
        .w-matiere { width: 25%; text-align: left; }
        .text-left { text-align: left; }
        .uppercase { text-transform: uppercase; }
        .bold { font-weight: bold; }
        .italic { font-style: italic; }
        .text-xs { font-size: 10px; }
        
        .bg-gray-300 { background-color: #d1d5db !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        
        .cat-header { font-weight: bold; text-align: center; text-transform: uppercase; padding: 5px; }

        /* Bilan Table */
        .bilan-section { margin-top: 16px; }
        .bilan-table th, .bilan-table td { border: 1px solid black; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-lg { font-size: 12px; }

        /* Council Section */
        .council-section { margin-top: 16px; border: 1px solid black; page-break-inside: avoid; }
        .council-header { background: #d1d5db !important; text-align: center; font-weight: bold; padding: 7px; border-bottom: 1px solid black; margin: 0; text-transform: uppercase; font-size: 12px; }
        .council-content { display: flex; height: 120px; }
        .council-left { width: 50%; border-right: 1px solid black; display: flex; justify-content: center; align-items: center; padding: 14px; }
        .council-right { width: 50%; display: flex; flex-direction: column; align-items: center; padding: 14px; }
        
        .appreciation-box { border: 3px double #1f2937; padding: 16px; text-align: center; min-width: 160px; border-radius: 3px; }
        .appr-grade { font-size: 14px; font-weight: bold; margin-bottom: 7px; }
        
        .appr-decision { color: #dc2626; font-weight: bold; text-transform: uppercase; font-size: 13px; }

        .proviseur-title { font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 14px; }
        
        /* Footer */
        .footer { margin-top: 14px; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 7px; }

    </style>
</head>
<body>
    ${generateBulletinContent(bulletinData, schoolConfig)}
</body>
</html>
    `;
};

/**
 * Génère un PDF pour la fiche d'un élève
 * @param {Object} studentData - Données de l'élève
 * @param {Object} schoolConfig - Configuration de l'école
 * @returns {Buffer} - Buffer du PDF généré
 */
const generateStudentProfilePDF = async (studentData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Fiche Élève - ${studentData.prenom} ${studentData.nom}</title>
    <style>
        @page { size: A4; margin: 10mm; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11px; line-height: 1.5; color: #1e293b; background: white;
            -webkit-print-color-adjust: exact;
        }
        .container { padding: 20px; max-width: 210mm; margin: 0 auto; }
        
        /* Header */
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #334155; padding-bottom: 15px; }
        .header-left, .header-right { width: 33%; font-size: 9px; font-weight: bold; text-transform: uppercase; line-height: 1.3; }
        .header-right { text-align: right; }
        .header-center { width: 33%; display: flex; flex-direction: column; align-items: center; text-align: center; }
        .logo-text { font-size: 24px; font-weight: 900; color: #1e3a8a; }
        .motto { font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-top: 4px; }
        
        /* Profile Header */
        .profile-header { 
            display: flex; gap: 25px; align-items: center; 
            background: #f8fafc; border: 1px solid #e2e8f0; 
            padding: 20px; border-radius: 12px; margin-bottom: 25px;
        }
        .avatar-container {
            width: 100px; height: 100px; border-radius: 10px;
            border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            overflow: hidden; background: #e2e8f0;
            display: flex; align-items: center; justify-content: center;
        }
        .avatar { width: 100%; height: 100%; object-fit: cover; }
        .student-info h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .badge { 
            display: inline-block; padding: 2px 8px; border-radius: 9999px; 
            font-size: 9px; font-weight: 700; text-transform: uppercase;
            background: #dcfce7; color: #15803d; margin-left: 10px; vertical-align: middle;
        }
        .student-meta { font-size: 12px; color: #64748b; font-weight: 500; }
        
        /* Sections */
        .section { margin-bottom: 25px; }
        .section-title { 
            font-size: 13px; font-weight: 700; color: #0f172a; 
            border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px;
            display: flex; align-items: center; gap: 8px;
        }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
        .info-card { 
            background: white; border: 1px solid #f1f5f9; padding: 10px 12px; border-radius: 8px;
        }
        .label { font-size: 9px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
        .value { font-size: 11px; font-weight: 600; color: #334155; }
        
        /* Table for Parent Info */
        .info-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
        .info-table th { text-align: left; font-size: 10px; color: #64748b; padding: 8px; border-bottom: 1px solid #f1f5f9; }
        .info-table td { font-size: 11px; padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: 500; }
        
        .footer { 
            margin-top: 40px; text-align: center; font-size: 9px; color: #94a3b8;
            border-top: 1px solid #f1f5f9; padding-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header copied from bulletins but styled slightly for profile -->
        <div class="header">
            <div class="header-left">
                <p>${schoolConfig.region || 'LA FORMATION PROFESSIONNELLE ET TECHNIQUE'}</p>
                <p>${schoolConfig.subRegion || 'RÉGION CENTRE'}</p>
                <p>${schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
            </div>
            <div class="header-center">
                ${schoolConfig.logo ? `<img src="http://localhost:5000${schoolConfig.logo}" style="height: 45px; margin-bottom: 5px;" />` : `<div class="logo-text">${schoolConfig.shortName || 'LWS'}</div>`}
                <div class="motto">${schoolConfig.motto || 'DISCIPLINE - TRAVAIL - SUCCÈS'}</div>
            </div>
            <div class="header-right">
                <p>${schoolConfig.country || 'BURKINA FASO'}</p>
                <p class="sub-motto">${schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
            </div>
        </div>

        <!-- Profile Header -->
        <div class="profile-header">
            <div class="avatar-container">
                ${studentData.photo && studentData.photo !== 'no-photo.jpg' && !studentData.photo.includes('ui-avatars.com')
                ? `<img src="http://localhost:5000/uploads/${studentData.photo}" class="avatar" />`
                : `<div style="font-size: 40px; color: #cbd5e1;">👤</div>`}
            </div>
            <div class="student-info">
                <h1>${studentData.prenom} ${studentData.nom} <span class="badge">${studentData.status || 'ACTIF'}</span></h1>
                <p class="student-meta">
                    ${studentData.classe?.niveau || ''} ${studentData.classe?.section || ''} | Matricule: ${studentData.matricule || 'N/A'}
                </p>
                <p style="font-size: 10px; color: #64748b;">Né le ${new Date(studentData.dateNaissance).toLocaleDateString('fr-FR')} (${calculateAge(studentData.dateNaissance)} ans)</p>
            </div>
        </div>

        <div class="grid" style="grid-template-columns: 1fr 1fr;">
            <!-- General Info -->
            <div class="section">
                <h3 class="section-title">Informations Générales</h3>
                <div class="grid" style="grid-template-columns: 1fr;">
                    <div class="info-card">
                        <div class="label">Lieu de naissance</div>
                        <div class="value">${studentData.lieuNaissance || 'Non renseigné'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Adresse</div>
                        <div class="value">${studentData.adresse || 'Non renseignée'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Téléphone</div>
                        <div class="value">${studentData.telephone || 'Non renseigné'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Email</div>
                        <div class="value">${studentData.email || 'Non renseigné'}</div>
                    </div>
                </div>
            </div>

            <!-- Health & Misc -->
            <div class="section">
                <h3 class="section-title">Santé & Langue</h3>
                <div class="grid" style="grid-template-columns: 1fr;">
                    <div class="info-card">
                        <div class="label">Groupe Sanguin</div>
                        <div class="value">${studentData.bloodGroup || 'Non renseigné'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Langue Maternelle</div>
                        <div class="value">${studentData.nativeLanguage || 'Non renseignée'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Allergies</div>
                        <div class="value">${studentData.allergens || 'Aucune'}</div>
                    </div>
                    <div class="info-card">
                        <div class="label">Médicaments</div>
                        <div class="value">${studentData.medicaments || 'Aucun'}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Parent Info -->
        <div class="section">
            <h3 class="section-title">Informations Parentales</h3>
            <table class="info-table">
                <thead>
                    <tr>
                        <th>Parent</th>
                        <th>Nom Complet</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>PÈRE</strong></td>
                        <td>${studentData.fatherName || 'N/A'}</td>
                        <td>${studentData.fatherPhone || 'N/A'}</td>
                        <td>${studentData.fatherEmail || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>MÈRE</strong></td>
                        <td>${studentData.motherName || 'N/A'}</td>
                        <td>${studentData.motherPhone || 'N/A'}</td>
                        <td>${studentData.motherEmail || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>TUTEUR</strong></td>
                        <td>${studentData.legalGuardian || 'N/A'}</td>
                        <td>${studentData.guardianPhone || 'N/A'}</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="footer">
            Fiche émise le ${new Date().toLocaleDateString('fr-FR')} par le système de gestion scolaire Lebian.
        </div>
    </div>
</body>
</html>
        `;

        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        return pdfBuffer;
    } catch (error) {
        console.error('Erreur generateStudentProfilePDF:', error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
};

/**
 * Helper to calculate age from birthDate
 */
const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

module.exports = {
    generateBulletinPDF,
    generateClassBulletinsPDF,
    generateBulletinHTML,
    generateMasterGradeSheetPDF,
    generateBulkMasterGradeSheetPDF,
    generateStudentProfilePDF
};
