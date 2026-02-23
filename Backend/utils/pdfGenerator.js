const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Generate PDF for a master grade sheet
 * @param {Array} sheetsData - Array of data for each class sheet
 * @param {Object} schoolConfig - School configuration (name, logo, etc.)
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
 * Generate HTML for Master Grade Sheet
 */
exports.getMasterSheetHTML = (sheetsData, schoolConfig) => {
    let tablesHtml = '';

    sheetsData.forEach((data, index) => {
        const { classe, periode, anneeScolaire, matieres, matrix, subjectStats, overallStats } = data;

        tablesHtml += `
            <div class="sheet-page" style="${index > 0 ? 'page-break-before: always;' : ''}">
                <div class="header">
                    <div class="school-info">
                        <h2>${schoolConfig.name || 'UNICA'}</h2>
                        <p>${schoolConfig.address || ''}</p>
                        <p>${schoolConfig.phone || ''}</p>
                    </div>
                    <div class="report-title">
                        <h1>RELEVÉ RÉCAPITULATIF DES NOTES</h1>
                        <h3>${classe.niveau} ${classe.section} - ${periode}</h3>
                        <p>Année Scolaire: ${anneeScolaire}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Matricule</th>
                            <th>Nom & Prénoms</th>
                            ${matieres.map(m => `<th>${m.nom}<br><small>(Coeff: ${m.coefficient})</small></th>`).join('')}
                            <th>Moyenne</th>
                            <th>Rang</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matrix.map((row, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${row.matricule}</td>
                                <td class="name-cell">${row.nom} ${row.prenom}</td>
                                ${matieres.map(m => {
            const grade = row.matieres[m._id];
            if (grade && grade.isDispensed) {
                return '<td class="grade-cell dispensed"><strong>D</strong></td>';
            }
            return `<td class="grade-cell">${grade && grade.moyenne !== null ? grade.moyenne.toFixed(2) : '-'}</td>`;
        }).join('')}
                                <td class="avg-cell">${row.moyenneGenerale.toFixed(2)}</td>
                                <td>-</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="stats-row">
                            <td colspan="3">Moyenne de la classe</td>
                            ${matieres.map(m => `<td>${(subjectStats[m._id]?.avg || 0).toFixed(2)}</td>`).join('')}
                            <td>${overallStats.classAverage.toFixed(2)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer-sig">
                    <div class="date-place">Fait à __________, le ${new Date().toLocaleDateString('fr-FR')}</div>
                    <div class="signatures">
                        <div class="signature-box">
                            <p>Le Titulaire</p>
                            <div class="sig-space"></div>
                        </div>
                        <div class="signature-box">
                            <p>Le Principal</p>
                            <div class="sig-space"></div>
                            <p class="sig-name">${schoolConfig.principalName || 'Nom du Principal'}</p>
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
                body { font-family: 'Arial', sans-serif; font-size: 10px; margin: 0; padding: 0; }
                .sheet-page { padding: 20px; }
                .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .report-title { text-align: center; flex-grow: 1; }
                .report-title h1 { margin: 0; font-size: 18px; color: #d35400; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; }
                th, td { border: 1px solid #333; padding: 4px; text-align: center; word-wrap: break-word; }
                th { background-color: #f2f2f2; font-size: 9px; }
                .name-cell { text-align: left; width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .grade-cell { width: 40px; }
                .dispensed { color: #7f8c8d; background-color: #f9f9f9; }
                .avg-cell { font-weight: bold; background-color: #f9f9f9; }
                .footer-sig { margin-top: 30px; }
                .signatures { display: flex; justify-content: space-around; margin-top: 20px; }
                .signature-box { text-align: center; width: 200px; }
                .sig-space { height: 80px; } /* Corrected space to 80px */
                .sig-name { font-weight: bold; margin-top: 5px; }
            </style>
        </head>
        <body>
            ${tablesHtml}
        </body>
        </html>
    `;
};
