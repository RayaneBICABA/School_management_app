const puppeteer = require('puppeteer');

const BULLETIN_STYLES = `
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.0; color: #333333; background: white; -webkit-print-color-adjust: exact; }
    .bulletin-container { width: 100%; max-width: 190mm; margin: 0 auto; position: relative; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; }
    .header-left, .header-right { width: 30%; font-size: 8px; font-weight: bold; line-height: 1.0; }
    .header-left p, .header-right p { margin: 0; }
    .header-right { text-align: right; }
    .sub-motto { font-size: 8px; font-style: italic; text-transform: none; font-weight: normal; }
    .header-center { width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .logo-text { font-size: 24px; font-weight: 900; color: #1e3a8a; }
    .motto { font-size: 8px; font-weight: bold; color: #6b7280; margin-top: 0; }

    .title-section { width: 100%; text-align: center; margin: 15px 0; display: block; }
    .title-section h1 { font-size: 18px; font-weight: bold; margin: 0 auto; color: #333333; text-decoration: underline; line-height: 1; }

    .info-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 5px; }
    .student-name-row { margin-bottom: 5px; font-size: 11px; display: flex; align-items: baseline; gap: 4px; }
    
    table { width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid black; }
    th, td { border: 1px solid black; padding: 4px; }
    th { background: #e5e7eb !important; color: #000000; text-align: center; font-weight: bold; }
    td { text-align: center; }
    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .bg-gray-300 { background-color: #d1d5db !important; }
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .cat-header { font-weight: bold; text-align: center; text-transform: uppercase; padding: 5px; }

    /* Student info grid like frontend */
    .info-eleve-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; font-size: 11px; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
    .info-item { display: flex; flex-direction: row; align-items: baseline; gap: 4px; }
    .info-label { color: #6b7280; font-size: 10px; }
    .info-value { font-weight: bold; }

    .bilan-section { margin-top: 15px; }
    .bilan-table td { padding: 6px; }

    .council-section { margin-top: 15px; border: 1px solid black; page-break-inside: avoid; }
    .council-header { background: #e5e7eb !important; text-align: center; font-weight: bold; padding: 6px; border-bottom: 1px solid black; text-transform: uppercase; }
    .council-content { display: flex; min-height: 110px; }
    .council-left { width: 60%; border-right: 1px solid black; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; }
    .council-right { width: 40%; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 10px; }
    .appreciation-box { padding: 10px; text-align: center; min-width: 180px; font-size: 14px; font-weight: bold; }
    
    .footer { margin-top: 15px; font-size: 9px; color: #6b7280; display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 5px; }
    .page-break { page-break-after: always; display: block; height: 0; }
`;

const generateHeaderHTML = (schoolConfig) => {
    const config = {
        schoolName: schoolConfig.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA',
        shortName: schoolConfig.shortName || 'LWS',
        motto: schoolConfig.motto || 'DISCIPLINE-TRAVAIL-SUCCES',
        phone: schoolConfig.phone || '51 54 88 11',
        region: schoolConfig.region || 'LA FORMATION PROFESSIONNELLE ET TECHNIQUE',
        subRegion: schoolConfig.subRegion || 'RÉGION CENTRE',
        country: schoolConfig.country || 'BURKINA FASO',
        patrie: schoolConfig.patrie || 'La Patrie ou la Mort, nous Vaincrons',
        logo: schoolConfig.logo || ''
    };

    const logoHtml = config.logo ?
        `<div style="height: 64px; margin-bottom: 4px;">
            <img src="${process.env.BACKEND_URL || 'http://localhost:5000'}${config.logo}" style="max-height: 100%; max-width: 180px; object-fit: contain;" />
        </div>` :
        `<div class="logo-text">${config.shortName}</div>`;

    return `
    <div class="header">
        <div class="header-left">
            <p>${config.region}</p>
            <p>${config.subRegion}</p>
            <p>${config.schoolName}</p>
            ${config.phone ? `<p>Tél : ${config.phone}</p>` : ''}
        </div>
        <div class="header-center">
            ${logoHtml}
            <div class="motto">${config.motto}</div>
        </div>
        <div class="header-right">
            <p>${config.country}</p>
            <p class="sub-motto">${config.patrie}</p>
        </div>
    </div>
    `;
};

const getAppre = (moy) => {
    if (moy >= 18) return 'Excellent';
    if (moy >= 16) return 'Très Bien';
    if (moy >= 14) return 'Bien';
    if (moy >= 12) return 'Assez-Bien';
    if (moy >= 10) return 'Passable';
    if (moy >= 8) return 'Faible';
    return 'Insuffisant';
};

const getAppreciationColor = (app) => {
    if (!app) return '';
    const a = app.toLowerCase();
    if (a.includes('excellent')) return 'color: #15803d;';
    if (a.includes('très bien')) return 'color: #16a34a;';
    if (a.includes('bien')) return 'color: #22c55e;';
    if (a.includes('assez-bien')) return 'color: #84cc16;';
    if (a.includes('passable')) return 'color: #f97316;';
    if (a.includes('faible')) return 'color: #dc2626;';
    if (a.includes('insuffisant')) return 'color: #991b1b;';
    return '';
};

const generateBulletinContent = (bulletinData, schoolConfig = {}) => {
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const eleve = bulletinData.eleve || {};
    const classe = bulletinData.classe || {};

    const groupedNotes = {};
    if (bulletinData.notes && Array.isArray(bulletinData.notes)) {
        bulletinData.notes.forEach(note => {
            const cat = note.categorie || 'AUTRES';
            if (!groupedNotes[cat]) groupedNotes[cat] = [];
            groupedNotes[cat].push(note);
        });
    }

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR') : '--/--/----';
    const totalCols = 7;

    return `
    <div class="bulletin-container">

        ${generateHeaderHTML(schoolConfig)}

        <div class="title-section">
            <h1>BULLETIN DE NOTES</h1>
        </div>

        <div class="info-row">
            <span>Année scolaire: <strong>${bulletinData.anneeScolaire || ''}</strong></span>
            <span><strong>${bulletinData.periode || ''}</strong></span>
            <span>Effectif: <strong>${bulletinData.effectif || 0}</strong></span>
        </div>

        <div class="student-name-row">
            <span class="info-label">Nom de l'élève:</span>
            <strong class="uppercase">${eleve.nom || ''} ${eleve.prenom || ''}</strong>
        </div>

        <div class="info-eleve-grid">
            <div class="info-item">
                <span class="info-label">Né(e) le:</span>
                <span class="info-value">${formatDate(eleve.dateNaissance)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Matricule:</span>
                <strong class="info-value">${eleve.matricule || 'N/A'}</strong>
            </div>
            <div class="info-item" style="justify-content: flex-end;">
                <span class="info-label">Classe:</span>
                <strong class="info-value">${classe.niveau || ''} ${classe.section || ''}</strong>
            </div>
            <div class="info-item" style="justify-content: flex-end;">
                <span class="info-label">Redoublant:</span>
                <strong class="info-value">${eleve.redoublant ? 'OUI' : 'NON'}</strong>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="text-left" style="width: 200px;">Matières</th>
                    <th style="width: 40px;">Coef</th>
                    <th style="width: 40px;">Moy</th>
                    <th style="width: 60px;">Pond.</th>
                    <th colspan="3">Appréciations & Signatures</th>
                </tr>
            </thead>
            <tbody>
                ${(() => {
            const isTechnique = classe.filiere === 'Technique';
            const groups = {};

            const getSmartCategory = (note) => {
                const nom = (note.matiere?.nom || '').toUpperCase();
                const baseCat = note.categorie || note.matiere?.categorie || 'ENSEIGNEMENT GÉNÉRAL';

                if (isTechnique) {
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

            (bulletinData.notes || []).forEach(note => {
                const cat = getSmartCategory(note);
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(note);
            });

            return Object.entries(groups).map(([catName, notes]) => {
                const catRows = notes.map(note => {
                    const moy = note.moyenneMatiere || 0;
                    const appr = getAppre(moy);
                    return `
                    <tr>
                        <td class="text-left bold uppercase" style="padding: 6px;">${note.matiere?.nom || 'N/A'}</td>
                        <td>${(note.coeff || note.matiere?.coefficient || 0).toFixed(1)}</td>
                        ${note.isDispensed ? `<td colspan="2" class="bold italic">DISPENSÉ</td>` : `
                            <td>${moy.toFixed(2)}</td>
                            <td class="bold">${(note.notePonderee || 0).toFixed(2)}</td>
                        `}
                        <td class="italic" style="${note.isDispensed ? '' : getAppreciationColor(appr)}">${note.isDispensed ? 'DISPENSÉ' : appr}</td>
                        <td class="text-xs" style="width: 80px; white-space: nowrap;">${note.professeur ? (note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')) + (note.professeur.prenom + ' ' + note.professeur.nom).toUpperCase() : ''}</td>
                        <td class="signature-cell" style="width: 60px;"></td>
                    </tr>
                `;
                }).join('');

                const catTotalCoeff = notes.reduce((sum, n) => sum + (n.coeff || 0), 0);
                const catTotalPoints = notes.reduce((sum, n) => sum + (n.notePonderee || 0), 0);

                return `
                <tr class="bg-gray-300">
                    <td colspan="7" class="bold text-center uppercase" style="padding: 4px;">${catName}</td>
                </tr>
                ${catRows}
                <tr class="bg-gray-100 bold">
                    <td class="text-left uppercase" style="padding: 4px; font-size: 9px;">Total ${catName}</td>
                    <td>${catTotalCoeff.toFixed(1)}</td>
                    <td></td>
                    <td>${catTotalPoints.toFixed(2)}</td>
                    <td colspan="3"></td>
                </tr>
            `;
            }).join('');
        })()}
                <!-- Global Totals -->
                <tr class="bg-gray-100 bold text-center">
                    <td class="text-left uppercase" style="padding: 6px;">TOTAL GÉNÉRAL</td>
                    <td>${(bulletinData.totalCoefficients || 0).toFixed(1)}</td>
                    <td></td>
                    <td class="bold">${(bulletinData.totalPoints || 0).toFixed(2)}</td>
                    <td colspan="3"></td>
                </tr>
            </tbody>
        </table>

        <div class="bilan-section">
            <table class="bilan-table">
                <tbody>
                    <tr class="bg-gray-300 text-center">
                        <td colspan="8" class="bold uppercase">BILAN ${classe.filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL'}</td>
                    </tr>
                    <tr>
                        <td>Moyenne de l'élève</td>
                        <td class="bold" style="font-size: 14px;">${(bulletinData.moyenneGenerale || 0).toFixed(2)}</td>
                        <td>RETRAIT DE POINTS</td>
                        <td class="bold">${(bulletinData.retraitPoints || 0).toFixed(2)}</td>
                        <td colspan="4" class="bold">ABSENCES</td>
                    </tr>
                    <tr>
                        <td>Moyenne de la classe</td>
                        <td>${(bulletinData.moyenneClasse || 0).toFixed(2)}</td>
                        <td>MOYENNE DEFINITIVE</td>
                        <td class="bold" style="font-size: 14px;">${((bulletinData.moyenneGenerale || 0) - (bulletinData.retraitPoints || 0)).toFixed(2)}</td>
                        <td>Justifiées</td>
                        <td>${bulletinData.absencesJustifiees || 0}</td>
                        <td>Non justifiées</td>
                        <td>${bulletinData.absencesNonJustifiees || 0}</td>
                    </tr>
                    <tr>
                        <td>Meilleure moyenne</td>
                        <td>${(bulletinData.meilleureMoyenneClasse || 0).toFixed(2)}</td>
                        <td>Rang du trimestre</td>
                        <td class="bold">${bulletinData.rang ? bulletinData.rang + (bulletinData.rang === 1 ? 'er' : 'e') : '-'}</td>
                        <td>Conduite</td>
                        <td colspan="3">${bulletinData.conduite || ''}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="council-section">
            <h3 class="council-header">Appréciations du conseil de classe</h3>
            <div class="council-content">
                <div class="council-left">
                    <div class="appreciation-box">
                        <div style="font-size: 14px; font-weight: bold;">${getAppre(bulletinData.moyenneGenerale)}</div>
                    </div>
                </div>
                <div class="council-right">
                    <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">Le Proviseur</div>
                    <div style="font-weight: bold; font-size: 11px; margin-top: 5px;">${schoolConfig.proviseurName || ''}</div>
                    <div style="height: 40px;"></div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div>Édité le ${currentDate}</div>
            <div>Page 1 sur 1</div>
        </div>
    </div>
    `;
};

const getMasterSheetHTML = (data, schoolConfig = {}) => {
    const subjectCount = data.matieres ? data.matieres.length : 10;

    // Dynamically choose format based on subject count
    const format = subjectCount > 12 ? 'A3' : 'A4';

    // Optimized zoom ratios for landscape
    // A4 Landscape is ~297mm, A3 Landscape is ~420mm
    let zoomRatio = 1.0;
    if (format === 'A4') {
        zoomRatio = subjectCount >= 10 ? 0.75 :
            subjectCount >= 7 ? 0.85 :
                subjectCount >= 5 ? 0.95 : 1.0;
    } else { // A3
        zoomRatio = subjectCount >= 20 ? 0.65 :
            subjectCount >= 16 ? 0.75 :
                subjectCount >= 13 ? 0.85 : 0.95;
    }

    const subjectColCounts = {};
    data.matieres.forEach(m => {
        let max = 0;
        data.matrix.forEach(r => {
            const mRow = r.matieres[m._id] || { notes: [] };
            if (mRow.notes.length > max) max = mRow.notes.length;
        });
        subjectColCounts[m._id] = max + 2;
    });

    return {
        format,
        html: `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                ${BULLETIN_STYLES}
                @page { size: ${format} landscape; margin: 5mm; }
                body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; line-height: 1.2; padding: 0; color: #333; margin: 0; zoom: ${zoomRatio}; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid black; }
                th, td { border: 1px solid black; padding: 2px; text-align: center; }
                th { background: #f3f4f6 !important; font-weight: bold; font-size: 8px; }
                .bg-blue-50 { background: #dbeafe !important; }
                .bg-yellow-50 { background: #fef9c3 !important; }
                .bg-orange-50 { background: #fff7ed !important; }
                .bg-gray-50 { background: #f9fafb !important; }
                .text-left { text-align: left; }
                .bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
            </style>
        </head>
        <body>
            ${generateHeaderHTML(schoolConfig)}
            <h1 style="text-align: center; margin: 10px 0; font-size: 20px; font-weight: bold; text-decoration: underline;">RELEVÉ DE NOTES GÉNÉRAL (MASTER SHEET)</h1>
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; border-bottom: 1px solid black; padding-bottom: 5px;">
                <span>CLASSE: ${data.classe?.niveau} ${data.classe?.section}</span>
                <span>PÉRIODE: ${data.periode}</span>
                <span>ANNÉE SCOLAIRE: ${data.anneeScolaire}</span>
            </div>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th rowspan="2" style="width: 20px;">RANG</th>
                        <th rowspan="2" style="width: 55px;">MATRICULE</th>
                        <th rowspan="2" class="text-left" style="width: 110px;">NOM ET PRÉNOMS</th>
                        ${data.matieres.map(m => `<th colspan="${subjectColCounts[m._id]}" class="bg-blue-50" style="white-space: normal; max-width: 65px; word-wrap: break-word;">${m.nom}<br>(Coef: ${m.coefficient})</th>`).join('')}
                        <th rowspan="2" class="bg-orange-50" style="width: 45px;">TOTAL DES<br>POINTS</th>
                        <th rowspan="2" style="width: 45px;">MOYENNE<br>GÉNÉRALE</th>
                    </tr>
                    <tr>
                        ${data.matieres.map(m => {
            let sub = '';
            for (let i = 1; i <= subjectColCounts[m._id] - 2; i++) sub += `<th>N${i}</th>`;
            return sub + '<th>Moy</th><th class="bg-yellow-50">Pond.</th>';
        }).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.matrix.map((row, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td style="white-space: nowrap;">${row.matricule || '-'}</td>
                        <td class="text-left bold uppercase" style="white-space: nowrap;">${row.nom} ${row.prenom}</td>
                        ${data.matieres.map(m => {
            const mRow = row.matieres[m._id] || { notes: [], moyenne: null, coeff: m.coefficient };
            let cells = '';
            const maxN = subjectColCounts[m._id] - 2;
            for (let i = 0; i < maxN; i++) {
                cells += `<td>${mRow.notes[i] != null ? mRow.notes[i].toFixed(1) : '-'}</td>`;
            }
            const pond = (mRow.moyenne != null && mRow.coeff) ? (mRow.moyenne * mRow.coeff).toFixed(2) : '-';
            return cells + `
                                <td class="bold">${mRow.moyenne != null ? mRow.moyenne.toFixed(2) : '-'}</td>
                                <td class="bg-yellow-50 font-bold">${pond}</td>
                            `;
        }).join('')}
                        <td class="bold bg-orange-50">${(() => {
                let total = 0; let hasAny = false;
                data.matieres.forEach(m => { const sm = row.matieres[m._id]; if (sm?.moyenne != null && sm?.coeff) { total += sm.moyenne * sm.coeff; hasAny = true; } });
                return hasAny ? total.toFixed(2) : '-';
            })()}</td>
                        <td class="bold bg-gray-50">${row.moyenneGenerale ? row.moyenneGenerale.toFixed(2) : '-'}</td>
                    </tr>
                    `).join('')}
                </tbody>
                <tfoot style="background: #f9fafb; font-weight: bold;">
                    <tr>
                        <td colspan="3" style="text-align: left;">MOYENNE DE CLASSE</td>
                        ${data.matieres.map(m => `
                        <td colspan="${subjectColCounts[m._id] - 2}"></td>
                        <td style="background: #dbeafe;">${data.subjectStats?.[m._id]?.avg?.toFixed(2) || '-'}</td>
                        <td class="bg-yellow-50"></td>
                        `).join('')}
                        <td class="bg-orange-50"></td>
                        <td style="background: #bfdbfe;">${data.overallStats?.classAverage?.toFixed(2) || '-'}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 30px; display: flex; justify-content: space-between; padding: 0 50px;">
                <div style="text-align: center;">
                    <p style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">Le Censeur</p>
                    <div style="height: 60px;"></div>
                </div>
                <div style="text-align: center;">
                    <p style="font-weight: bold; text-decoration: underline; text-transform: uppercase;">Le Proviseur</p>
                    <div style="font-weight: bold; font-size: 10px; margin-top: 5px;">${schoolConfig.proviseurName || ''}</div>
                    <div style="height: 50px;"></div>
                </div>
            </div>
        </body>
    </html>`
    };
};

const generateBulletinPDF = async (bulletinData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BULLETIN_STYLES}</style></head><body>${generateBulletinContent(bulletinData, schoolConfig)}</body></html>`;
        await page.setContent(html, { waitUntil: 'networkidle0' });
        return await page.pdf({ format: 'A4', printBackground: true, margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } });
    } finally { if (browser) await browser.close(); }
};

const generateClassBulletinsPDF = async (bulletinsData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        let fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BULLETIN_STYLES}</style></head><body>`;
        bulletinsData.forEach((b, i) => {
            fullHtml += generateBulletinContent(b, schoolConfig);
            if (i < bulletinsData.length - 1) fullHtml += '<div class="page-break"></div>';
        });
        fullHtml += '</body></html>';
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        return await page.pdf({ format: 'A4', printBackground: true, margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } });
    } finally { if (browser) await browser.close(); }
};

const generateMasterGradeSheetPDF = async (data, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const { html, format } = getMasterSheetHTML(data, schoolConfig);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        return await page.pdf({ format, landscape: true, printBackground: true, margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } });
    } finally { if (browser) await browser.close(); }
};

const generateBulkMasterGradeSheetPDF = async (sheetsData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        let fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>`;
        let finalFormat = 'A3';
        sheetsData.forEach((data, i) => {
            const { html, format } = getMasterSheetHTML(data, schoolConfig);
            if (i === 0) finalFormat = format;
            const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/);
            const styleMatch = html.match(/<style>([\s\S]*)<\/style>/);
            if (i === 0 && styleMatch) fullHtml = `<!DOCTYPE html><html><head><style>${styleMatch[1]}</style></head><body>`;
            if (bodyMatch) fullHtml += bodyMatch[1];
            if (i < sheetsData.length - 1) fullHtml += '<div class="page-break"></div>';
        });
        fullHtml += '</body></html>';
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        return await page.pdf({ format: finalFormat, landscape: true, printBackground: true, margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } });
    } finally { if (browser) await browser.close(); }
};

const generateStudentProfilePDF = async (studentData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page { size: A4; margin: 15mm; }
                body { font-family: Arial, sans-serif; padding: 10mm; }
                .profile-title { text-align: center; border-bottom: 2px solid #1e3a8a; color: #1e3a8a; padding-bottom: 10px; margin-bottom: 30px; }
                .profile-main { display: flex; gap: 30px; }
                .profile-photo { width: 150px; height: 180px; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; background: #f9f9f9; flex-shrink: 0; }
                .profile-details { flex: 1; }
                .detail-group { margin-bottom: 20px; }
                .detail-title { border-bottom: 1px solid #1e3a8a; margin-bottom: 10px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; }
                .detail-row { display: flex; margin-bottom: 5px; }
                .detail-label { width: 140px; font-weight: bold; color: #555; }
                .detail-value { flex: 1; border-bottom: 1px dotted #ccc; }
                ${BULLETIN_STYLES}
            </style>
        </head>
        <body>
            ${generateHeaderHTML(schoolConfig)}
            <div class="profile-title"><h1>FICHE DE RENSEIGNEMENTS ÉLÈVE</h1></div>
            <div class="profile-main">
                <div class="profile-photo">PHOTO</div>
                <div class="profile-details">
                    <div class="detail-group">
                        <div class="detail-title">ÉTAT CIVIL</div>
                        <div class="detail-row"><div class="detail-label">NOM</div><div class="detail-value bold uppercase">${studentData.nom}</div></div>
                        <div class="detail-row"><div class="detail-label">PRÉNOM(S)</div><div class="detail-value bold uppercase">${studentData.prenom}</div></div>
                        <div class="detail-row"><div class="detail-label">DATE DE NAISSANCE</div><div class="detail-value">${studentData.dateNaissance ? new Date(studentData.dateNaissance).toLocaleDateString('fr-FR') : 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">LIEU DE NAISSANCE</div><div class="detail-value">${studentData.lieuNaissance || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">SEXE</div><div class="detail-value">${studentData.sexe || 'N/A'}</div></div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-title">SCOLARITÉ</div>
                        <div class="detail-row"><div class="detail-label">MATRICULE</div><div class="detail-value bold">${studentData.matricule || 'N/A'}</div></div>
                        <div class="detail-row"><div class="detail-label">CLASSE</div><div class="detail-value">${studentData.classe?.niveau || ''} ${studentData.classe?.section || ''}</div></div>
                        <div class="detail-row"><div class="detail-label">REDOUBLANT</div><div class="detail-value">${studentData.redoublant ? 'OUI' : 'NON'}</div></div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 30px;">
                <div class="detail-title">CONTACTS PARENTS</div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead><tr><th>PARENT</th><th>NOM</th><th>TÉLÉPHONE</th></tr></thead>
                    <tbody>
                        <tr><td>PÈRE</td><td>${studentData.fatherName || '-'}</td><td>${studentData.fatherPhone || '-'}</td></tr>
                        <tr><td>MÈRE</td><td>${studentData.motherName || '-'}</td><td>${studentData.motherPhone || '-'}</td></tr>
                        <tr><td>TUTEUR</td><td>${studentData.legalGuardian || '-'}</td><td>${studentData.guardianPhone || '-'}</td></tr>
                    </tbody>
                </table>
            </div>
            <div class="footer" style="margin-top: 50px;">
                <span>Émis le ${new Date().toLocaleDateString('fr-FR')}</span>
                <span>Signature du Proviseur</span>
            </div>
        </body>
        </html>`;
        await page.setContent(html, { waitUntil: 'networkidle0' });
        return await page.pdf({ format: 'A4', printBackground: true });
    } finally { if (browser) await browser.close(); }
};

module.exports = {
    generateBulletinPDF,
    generateClassBulletinsPDF,
    generateMasterGradeSheetPDF,
    generateBulkMasterGradeSheetPDF,
    generateStudentProfilePDF,
    generateBulletinHTML: (data, sc) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${BULLETIN_STYLES}</style></head><body>${generateBulletinContent(data, sc)}</body></html>`,
    generateBulletinContent
};
