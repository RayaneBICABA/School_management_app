const fs = require('fs');
let content = fs.readFileSync('Frontend/src/views/censeur/GestionNotes.vue', 'utf8');
content = content.replace('</template>', '</div>\n</div>\n</div>\n</div>\n</template>');
fs.writeFileSync('Frontend/src/views/censeur/GestionNotes.vue', content);
