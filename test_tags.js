const fs = require('fs');
const content = fs.readFileSync('Frontend/src/views/censeur/GestionNotes.vue', 'utf8');
const template = content.split('<template>')[1].split('</template>')[0];
let depth = 0;
const lines = template.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const opens = (line.match(/<div/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  depth += opens - closes;
  console.log(`Line ${i + 2}: opens=${opens} closes=${closes} depth=${depth}`);
  if (depth < 0) {
    console.log('ERROR: Negative depth at line ' + (i + 2));
    break;
  }
}
console.log('Final depth:', depth);
