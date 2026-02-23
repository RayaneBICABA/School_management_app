const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\azili\\OneDrive\\Desktop\\Projet_Lebian_Iso\\sms\\School_management_app\\Backend\\utils\\pdfGenerator.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replacement 1: line-height 1.3 -> 1.0
content = content.replace(/line-height: 1\.3;/g, 'line-height: 1.0;');

// Replacement 2: line-height 1.2 -> 1.0
content = content.replace(/line-height: 1\.2;/g, 'line-height: 1.0;');

// Replacement 3: margin: 0 0 3px 0 -> margin: 0
content = content.replace(/margin: 0 0 3px 0;/g, 'margin: 0;');

// Replacement 4: margin: 0 0 2px 0 -> margin: 0
content = content.replace(/margin: 0 0 2px 0;/g, 'margin: 0;');

// Replacement 5: some specific margins in generateHeaderHTML (if not already handled)
// Already handled in previous step (1593) but checking just in case
// margin-top: 4px -> 2px
// margin-top: 2px -> 0
// These are more sensitive, I'll use more context
content = content.replace(/margin-top: 4px;/g, 'margin-top: 2px;');
content = content.replace(/margin-top: 2px;/g, 'margin-top: 0;');

fs.writeFileSync(filePath, content);
console.log('Successfully updated pdfGenerator.js');
