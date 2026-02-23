const puppeteer = require('puppeteer');

const BULLETIN_STYLES = `
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', Times, serif; font-size: 11px; line-height: 1.3; color: #333333; background: white; -webkit-print-color-adjust: exact; }
    .bulletin-container { width: 100%; max-width: 190mm; margin: 0 auto; position: relative; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; }
    .header-left, .header-right { width: 33%; font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
    .header-left p, .header-right p { margin: 0 0 4px 0; }
    .header-right { text-align: right; }
    .sub-motto { font-size: 8px; font-style: italic; text-transform: none; font-weight: normal; }
    .header-center { width: 34%; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .logo-text { font-size: 32px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em; line-height: 1; }
    .motto { font-size: 9px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; line-height: 1; }

    .title-section { width: 100%; text-align: center; margin: 25px 0; display: block; }
    .title-section h1 { font-size: 24px; font-style: italic; font-weight: bold; margin: 0 auto; color: #333333; display: inline-block; border-bottom: 1px solid #333; line-height: 1; }

    .info-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px; }
    .student-name-row { margin-bottom: 10px; font-size: 13px; text-transform: uppercase; font-weight: bold; }
    .info-eleve-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    
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

    .bilan-section { margin-top: 15px; }
    .bilan-table td { padding: 6px; }

    .council-section { margin-top: 15px; border: 1px solid black; page-break-inside: avoid; }
    .council-header { background: #d1d5db !important; text-align: center; font-weight: bold; padding: 6px; border-bottom: 1px solid black; text-transform: uppercase; }
    .council-content { display: flex; height: 140px; }
    .council-left { width: 50%; border-right: 1px solid black; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; }
    .council-right { width: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; }
    .appreciation-box { border: 4px double #333; padding: 10px; text-align: center; min-width: 180px; }
    
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

    let maxInt = 0, maxDev = 0, maxCompo = 0;
    if (bulletinData.notes) {
        bulletinData.notes.forEach(note => {
            maxInt = Math.max(maxInt, note.interroGrades?.length || (note.int !== undefined ? 1 : 0));
            maxDev = Math.max(maxDev, note.devoirGrades?.length || (note.dev !== undefined ? 1 : 0));
            maxCompo = Math.max(maxCompo, note.compoGrades?.length || (note.compo !== undefined ? 1 : 0));
        });
    }

    const totalCols = 7 + maxInt + maxDev + maxCompo;

    return `
    <div class="bulletin-container">
        ${(bulletinData.statut !== 'DISTRIBUE' && bulletinData.statut !== 'FINALISE') ? `
        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; opacity: 0.1; transform: rotate(-30deg); z-index: 0;">
            <span style="font-size: 80px; font-weight: 900; letter-spacing: 0.2rem; border: 10px solid black; padding: 20px 40px; text-transform: uppercase;">PROVISOIRE</span>
        </div>
        ` : ''}

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
            Nom de l'élève: <strong>${eleve.nom || ''} ${eleve.prenom || ''}</strong>
        </div>

        <div class="info-eleve-row">
            <div style="display: flex; flex-direction: column;">
                <span style="color: #666; font-size: 10px;">Né(e) le:</span>
                <strong>${formatDate(eleve.dateNaissance)}</strong>
            </div>
            <div style="display: flex; flex-direction: column;">
                <span style="color: #666; font-size: 10px;">Matricule:</span>
                <strong>${eleve.matricule || 'N/A'}</strong>
            </div>
            <div style="display: flex; flex-direction: column; text-align: right;">
                <span style="color: #666; font-size: 10px;">Classe:</span>
                <strong>${classe.niveau || ''} ${classe.section || ''}</strong>
            </div>
            <div style="display: flex; flex-direction: column; text-align: right;">
                <span style="color: #666; font-size: 10px;">Redoublant:</span>
                <strong>${eleve.redoublant ? 'OUI' : 'NON'}</strong>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th class="text-left">Matières</th>
                    <th>Coef</th>
                    ${Array.from({ length: maxInt }, (_, i) => `<th>Int ${i + 1}</th>`).join('')}
                    ${Array.from({ length: maxDev }, (_, i) => `<th>Dev ${i + 1}</th>`).join('')}
                    ${Array.from({ length: maxCompo }, (_, i) => `<th>Comp ${i + 1}</th>`).join('')}
                    <th>Moy</th>
                    <th>Pond.</th>
                    <th colspan="3">Appréciations & Signatures</th>
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
        const moy = note.moyenneMatiere || 0;
        const appr = getAppre(moy);
        return `
                    <tr>
                        <td class="text-left bold uppercase">${note.matiere?.nom || 'N/A'}</td>
                        <td>${(note.coeff || note.matiere?.coefficient || 0).toFixed(1)}</td>
                        ${note.isDispensed ? `<td colspan="${maxInt + maxDev + maxCompo + 1}" class="bold italic">DISPENSÉ</td>` : `
                            ${Array.from({ length: maxInt }, (_, i) => `<td>${noteInts[i] != null ? noteInts[i].toFixed(2) : ''}</td>`).join('')}
                            ${Array.from({ length: maxDev }, (_, i) => `<td>${noteDevs[i] != null ? noteDevs[i].toFixed(2) : ''}</td>`).join('')}
                            ${Array.from({ length: maxCompo }, (_, i) => `<td>${noteCompos[i] != null ? noteCompos[i].toFixed(2) : ''}</td>`).join('')}
                            <td>${moy.toFixed(2)}</td>
                        `}
                        <td class="bold">${note.isDispensed ? '-' : (note.notePonderee || 0).toFixed(2)}</td>
                        <td class="italic" style="${note.isDispensed ? '' : getAppreciationColor(appr)}">${note.isDispensed ? 'DISPENSÉ' : appr}</td>
                        <td style="width: 50px;"></td>
                        <td class="text-xs uppercase">${note.professeur ? `${note.professeur.nom}` : ''}</td>
                    </tr>
                    `;
    }).join('')}
                `).join('')}
            </tbody>
        </table>

        <div class="bilan-section">
            <table>
                <tbody>
                    <tr class="bg-gray-300">
                        <td colspan="8" class="text-center bold uppercase">BILAN TRIMESTRIEL</td>
                    </tr>
                    <tr class="bold">
                        <td colspan="4">TOTAL COEFFICIENT : <strong>${(bulletinData.totalCoefficients || 0).toFixed(2)}</strong></td>
                        <td colspan="4" class="text-right">TOTAL NOTES PONDEREES: <strong>${(bulletinData.totalPoints || 0).toFixed(2)}</strong></td>
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

const getMasterSheetHTML = (data, schoolConfig) => {
    const subjectColCounts = {};
    data.matieres.forEach(m => {
        let max = 0;
        data.matrix.forEach(r => {
            const mRow = r.matieres[m._id] || { notes: [] };
            if (mRow.notes.length > max) max = mRow.notes.length;
        });
        subjectColCounts[m._id] = max + 2; // notes + moyenne + pondération
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page { size: A3 landscape; margin: 8mm; }
            body { font-family: Georgia, serif; font-size: 8px; line-height: 1.2; padding: 5mm; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid black; }
            th, td { border: 1px solid black; padding: 2px; text-align: center; }
            th { background: #f3f4f6 !important; font-weight: bold; font-size: 8px; }
            .bg-blue-50 { background: #dbeafe !important; }
            .bg-yellow-50 { background: #fef9c3 !important; }
            .bg-orange-50 { background: #fff7ed !important; }
            .bg-gray-50 { background: #f9fafb !important; }
            .text-left { text-align: left; }
            .bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            ${BULLETIN_STYLES}
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
        <!-- Wrap table to ensure it takes its natural width and doesn't get cut by page boundaries before scaling -->
        <div style="width: max-content; padding-right: 20px;">
        <table>
            <thead>
                <tr>
                    <th rowspan="2" style="width: 25px;">RANG</th>
                    <th rowspan="2" style="width: 70px;">MATRICULE</th>
                    <th rowspan="2" class="text-left" style="width: 130px;">NOM ET PRÉNOMS</th>
                    ${data.matieres.map(m => `<th colspan="${subjectColCounts[m._id]}" class="bg-blue-50" style="white-space: normal; max-width: 80px; word-wrap: break-word;">${m.nom}<br>(Coef: ${m.coefficient})</th>`).join('')}
                    <th rowspan="2" class="bg-orange-50" style="width: 50px;">TOTAL DES<br>POINTS</th>
                    <th rowspan="2" style="width: 50px;">MOYENNE<br>GÉNÉRALE</th>
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
                <tr style="font-size: 7px; color: #666;">
                    <td colspan="3" style="text-align: left;">Plus forte moyenne</td>
                    ${data.matieres.map(m => `
                        <td colspan="${subjectColCounts[m._id] - 2}"></td>
                        <td style="background: #f0fdf4;">${data.subjectStats?.[m._id]?.max?.toFixed(2) || '-'}</td>
                        <td class="bg-yellow-50"></td>
                    `).join('')}
                    <td class="bg-orange-50"></td>
                    <td style="background: #dcfce7;">${data.overallStats?.maxAverage?.toFixed(2) || '-'}</td>
                </tr>
                <tr style="font-size: 7px; color: #666;">
                    <td colspan="3" style="text-align: left;">Plus faible moyenne</td>
                    ${data.matieres.map(m => `
                        <td colspan="${subjectColCounts[m._id] - 2}"></td>
                        <td style="background: #fef2f2;">${data.subjectStats?.[m._id]?.min?.toFixed(2) || '-'}</td>
                        <td class="bg-yellow-50"></td>
                    `).join('')}
                    <td class="bg-orange-50"></td>
                    <td style="background: #fee2e2;">${data.overallStats?.minAverage?.toFixed(2) || '-'}</td>
                </tr>
            </tfoot>
        </table>
        </div>

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
    </html>`;
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
        const html = getMasterSheetHTML(data, schoolConfig);
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Calculate dynamic scale based on number of subjects
        const subjectCount = data.matieres ? data.matieres.length : 10;
        const scale = subjectCount > 10 ? 0.60 : (subjectCount > 7 ? 0.70 : 0.85);

        return await page.pdf({
            format: 'A3',
            landscape: true,
            printBackground: true,
            scale: scale,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
        });
    } finally { if (browser) await browser.close(); }
};

const generateBulkMasterGradeSheetPDF = async (sheetsData, schoolConfig = {}) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        let fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>`;
        sheetsData.forEach((data, i) => {
            // Extract body content from getMasterSheetHTML
            const sheetHtml = getMasterSheetHTML(data, schoolConfig);
            const bodyContent = sheetHtml.match(/<body>([\s\S]*)<\/body>/)[1];
            const styleMatch = sheetHtml.match(/<style>([\s\S]*)<\/style>/);
            if (i === 0 && styleMatch) fullHtml = `<!DOCTYPE html><html><head><style>${styleMatch[1]}</style></head><body>`;
            fullHtml += bodyContent;
            if (i < sheetsData.length - 1) fullHtml += '<div class="page-break"></div>';
        });
        fullHtml += '</body></html>';
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        // Calculate average subjects config for bulk
        let maxSubjects = 0;
        sheetsData.forEach(d => { if (d.matieres && d.matieres.length > maxSubjects) maxSubjects = d.matieres.length; });
        const scale = maxSubjects > 10 ? 0.60 : (maxSubjects > 7 ? 0.70 : 0.85);

        return await page.pdf({
            format: 'A3',
            landscape: true,
            printBackground: true,
            scale: scale,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
        });
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
