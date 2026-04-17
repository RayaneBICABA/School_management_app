<template>
  <div class="bulletin-container p-4 bg-gray-100 min-h-screen" :class="compactClasses">
    <div ref="bulletinRef" class="bulletin max-w-[900px] mx-auto bg-white p-8 shadow-lg text-[#333] font-serif leading-tight flex flex-col min-h-[297mm]">
      <!-- Header -->
      <div class="header flex justify-between items-start flex-shrink-0">
        <div class="header-left w-[34%] text-[7px] font-bold uppercase leading-[0.9]">
          <p>{{ schoolConfig.ministryName }}</p>
          <p class="text-center">*******</p>
          <p>{{ schoolConfig.region }}</p>
          <p class="text-center">*******</p>
          <p>{{ schoolConfig.directionRegionale }}</p>
          <p class="text-center">*******</p>
          <p>{{ schoolConfig.circonscription }}</p>
          <p class="text-center">*******</p>
          <p>{{ schoolConfig.schoolName }}</p>
          <p v-if="schoolConfig.phone" class="mt-1">Tél : {{ schoolConfig.phone }}</p>
        </div>

        <div class="header-center w-[40%] flex flex-col items-center text-center">
          <div v-if="schoolConfig.logo" class="h-16 mb-0.5">
            <img :src="schoolConfig.logo" class="h-full w-auto object-contain mx-auto" @load="onImageLoad" />
          </div>
          <div v-else class="text-3xl font-black tracking-tighter text-blue-900 leading-none">{{ schoolConfig.shortName }}</div>
          <div v-if="schoolConfig.motto" class="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest leading-none">{{ schoolConfig.motto }}</div>
        </div>

        <div class="header-right w-[30%] text-right text-[10px] font-bold uppercase leading-none">
          <p>{{ schoolConfig.country }}</p>
          <p class="text-[9px] italic normal-case font-normal">{{ schoolConfig.patrie }}</p>
        </div>
      </div>
 
      <div class="title text-center mb-1 flex-shrink-0">
        <h1 class="text-[18px] italic font-bold border-y border-black py-0.5">BULLETIN DE NOTES</h1>
      </div>
 
      <div class="info-bar flex justify-between mb-0.5 text-[10px] flex-shrink-0">
        <span>Année scolaire: <strong>{{ bulletin.anneeScolaire }}</strong></span>
        <span><strong>{{ bulletin.periode }}</strong></span>
        <span>Effectif: <strong>{{ bulletin.effectif }}</strong></span>
      </div>
 
      <div class="student-name mb-0.5 text-[11px] font-bold pt-0.5 flex-shrink-0">
        <span class="text-gray-500 font-normal text-[10px]">Nom de l'élève:</span>
        <span class="uppercase ml-2">{{ eleve.nom }} {{ eleve.prenom }}</span>
      </div>
 
      <div class="grid-info flex justify-between pb-0.5 mb-1 border-b border-gray-400 flex-shrink-0">
        <div class="info-item flex items-baseline gap-1">
          <span class="text-[11px] text-gray-500">Né(e) le:</span>
          <span class="font-bold text-[12px]">{{ formatDate(eleve.dateNaissance) || 'Non renseigné' }}</span>
        </div>
        <div class="info-item flex items-baseline gap-1">
          <span class="text-[11px] text-gray-500">Matricule:</span>
          <strong class="text-[12px]">{{ eleve.matricule || 'Non renseigné' }}</strong>
        </div>
        <div class="info-item flex items-baseline gap-1 justify-end lg:justify-start">
          <span class="text-[11px] text-gray-500">Classe:</span>
          <strong class="text-[12px]">{{ classe.niveau || 'N/A' }} {{ classe.section || '' }}</strong>
        </div>
        <div class="info-item flex items-baseline gap-1 justify-end">
          <span class="text-[11px] text-gray-500">Redoublant:</span>
          <strong class="text-[12px] font-bold">{{ eleve.redoublant ? 'OUI' : 'NON' }}</strong>
        </div>
      </div>

      <!-- Grades Table -->
      <div class="table-area flex-grow min-h-0 mb-4 flex flex-col">
        <table class="main-table w-full border-separate border-spacing-0 text-[12px]">
          <thead>
            <tr class="bg-gray-200 text-center font-bold">
                <th class="border border-black p-2 text-left bg-[#ddd]" style="width: 35%;">Matières</th>
                <th class="border border-black p-1 text-center bg-[#ddd]" style="width: 5%;">Coef</th>
                <th class="border border-black p-1 text-center bg-[#ddd]" style="width: 8%;">Moy</th>
                <th class="border border-black p-1 text-center bg-[#ddd]" style="width: 12%;">Pondérées</th>
                <th colspan="3" class="border border-black p-1 text-center bg-[#ddd]" style="width: 40%;">Appréciations et signatures</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(category, catName) in groupedNotes" :key="catName">
              <tr class="cat-header-row bg-[#eee]">
                <td :colspan="totalCols" class="font-bold text-center uppercase text-[11px] border border-black p-1">{{ catName }}</td>
              </tr>
              <tr v-for="note in category" :key="note.matiere?._id" class="data-row text-center">
                <td class="border border-black p-2 text-left font-bold uppercase">{{ note.matiere?.nom }}</td>
                <td class="border border-black p-1">{{ (note.coeff || note.matiere?.coefficient || 0).toFixed(1) }}</td>
                
                <template v-if="note.isDispensed">
                  <td class="border border-black p-1 font-bold italic">D</td>
                  <td class="border border-black p-1 font-bold italic">D</td>
                </template>
                <template v-else>
                  <td class="border border-black p-1">{{ (note.moyenneMatiere || 0).toFixed(2) }}</td>
                  <td class="border border-black p-1 font-bold">{{ (note.notePonderee || 0).toFixed(2) }}</td>
                </template>
                <td class="border border-black p-1 italic text-[10px] text-center" style="width: 15%;">
                  <div>
                    {{ note.isDispensed ? '' : getSubjectAppreciation(note.moyenneMatiere || 0) }}
                  </div>
                </td>
                <td class="border border-black p-1 text-[8px] text-gray-500 text-center" style="width: 15%;">
                  {{ note.professeur ? (note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')) + (note.professeur.nom || '').toUpperCase() : '' }}
                </td>
                <td class="border border-black p-1" style="width: 10%;"></td>
              </tr>
              <!-- Category Totals -->
              <tr class="bg-[#eee] font-bold text-[10px] cat-total-row">
                <td class="border border-black p-1 px-2 text-left uppercase align-middle">Total {{ catName }}</td>
                <td class="border border-black p-1 text-center align-middle">{{ getCategoryTotalCoeff(category) }}</td>
                <td class="border border-black p-1 align-middle"></td>
                <td class="border border-black p-1 text-center align-middle">{{ getCategoryTotalPoints(category) }}</td>
                <td colspan="3" class="border border-black p-1 align-middle"></td>
              </tr>
            </template>

            <!-- Global Totals -->
            <tr class="bg-[#ddd] font-bold text-center border-t-2 border-black total-general-row">
              <td class="border border-black p-2 text-left uppercase align-middle">TOTAL GÉNÉRAL</td>
              <td class="border border-black p-1 align-middle text-center">{{ (bulletin.totalCoefficients || 0).toFixed(1) }}</td>
              <td class="border border-black p-1 align-middle"></td>
              <td class="border border-black p-1 font-bold align-middle">{{ (bulletin.totalPoints || 0).toFixed(2) }}</td>
              <td colspan="3" class="border border-black p-1 align-middle"></td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- Bilan -->
      <div class="bilan flex-shrink-0 mt-2">
        <table class="bilan-table w-full border-separate border-spacing-0 text-[12px]">
          <tbody>
            <tr class="cat-header-row font-bold text-center bg-[#eee]">
              <td colspan="8" class="uppercase text-[11px] border border-black p-1">BILAN {{ classe.filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL' }}</td>
            </tr>
            <tr class="data-row text-center">
              <td class="text-left font-semibold">Moyenne de l'élève</td>
              <td class="font-bold text-xl">{{ (bulletin.moyenneGenerale || 0).toFixed(2) }}</td>
              <td class="uppercase">RETRAIT DE POINTS</td>
              <td class="font-bold border border-black p-1">{{ (bulletin.retraitPoints || 0).toFixed(2) }}</td>
              <td colspan="4" class="text-center uppercase font-bold bg-[#eee] text-[10px] border border-black p-1">Nombre d'heures d'absence</td>
            </tr>
            <tr class="data-row text-center">
              <td class="text-left font-semibold">Moyenne de la classe</td>
              <td>{{ (bulletin.moyenneClasse || 0).toFixed(2) }}</td>
              <td class="uppercase">MOYENNE DEFINITIVE</td>
              <td class="font-bold text-xl">{{ ((bulletin.moyenneGenerale || 0) - (bulletin.retraitPoints || 0)).toFixed(2) }}</td>
              <td>Justifiées</td>
              <td class="font-bold">{{ bulletin.absencesJustifiees || 0 }}</td>
              <td>Non justifiées</td>
              <td class="font-bold">{{ bulletin.absencesNonJustifiees || 0 }}</td>
            </tr>
            <tr class="data-row text-center">
              <td class="text-left font-semibold">Meilleure moyenne</td>
              <td>{{ (bulletin.meilleureMoyenneClasse || 0).toFixed(2) }}</td>
              <td class="uppercase">{{ classe.filiere === 'Technique' ? 'Rang du semestre' : 'Rang du trimestre' }}</td>
              <td class="font-bold text-lg">{{ bulletin.rang || '-' }}</td>
              <td class="uppercase font-bold">Conduite</td>
              <td colspan="3" class="font-bold">{{ bulletin.conduite }}</td>
            </tr>
            <tr class="data-row text-center">
              <td class="text-left font-semibold">Moyenne la plus basse</td>
              <td>{{ (bulletin.pireMoyenneClasse || 0).toFixed(2) }}</td>
              <td colspan="2"></td>
              <td class="font-bold uppercase">Rappel des Moyennes</td>
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Flexible Spacer -->
      <div class="flex-grow min-h-[10px]"></div>

      <!-- Appreciation & Signatures -->
      <div class="council-section flex-shrink-0 mt-4">
        <div class="border border-black p-0 bg-white">
          <div class="cat-header-row p-1 text-center font-bold uppercase text-[11px] border-b border-black flex items-center justify-center bg-[#eee]">
            Appréciations du conseil de classe
          </div>
          <div class="flex min-h-[110px]">
            <div class="flex-1 border-r border-black p-4 flex items-center justify-center text-center font-bold text-2xl">
              {{ isDispensedAll ? 'DISPENSÉ' : getGeneralAppreciation(bulletin.moyenneGenerale) }}
            </div>
            <div class="flex-1 p-4 flex flex-col items-center justify-center text-center">
              <div class="font-bold uppercase text-[11px]">Le Proviseur</div>
              <div class="flex-grow min-h-[50px]"></div>
              <div class="font-bold text-[10px]">{{ schoolConfig.proviseurName || '' }}</div>
              <div class="text-[8px] italic leading-tight mt-1">{{ schoolConfig.proviseurTitle || 'Chevalier de l\'Ordre des Palmes Académiques' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="flex justify-between items-center mt-4 text-[9px] text-gray-500 font-sans flex-shrink-0">
        <div>Le : {{ new Date().toLocaleDateString('fr-FR') }}</div>
        <div class="font-bold italic">Généré par Unica</div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls max-w-[900px] mx-auto mt-6 flex justify-end gap-3 no-print">
      <button @click="$emit('close')" class="px-6 py-2 bg-gray-500 text-white rounded font-bold hover:bg-gray-600">Fermer</button>
      <div v-if="bulletin.statut !== 'VALIDE' && bulletin.statut !== 'FINALISE'" class="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded border border-amber-200 text-sm font-medium">
         <span class="material-symbols-outlined text-base">warning</span>
         {{ isStudentView ? 'Téléchargement' : 'Impression' }} désactivé (En attente de validation)
      </div>
      <template v-else>
        <button @click="downloadPDF" :disabled="isExporting" class="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined" v-if="!isExporting">download</span>
          <span class="animate-spin" v-else>
            <span class="material-symbols-outlined">sync</span>
          </span>
          {{ isExporting ? 'Génération...' : 'Télécharger en PDF' }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api, { BASE_ASSET_URL } from '@/services/api';

const props = defineProps({
  bulletin: { type: Object, required: true },
  eleve: { type: Object, required: true },
  classe: { type: Object, required: true },
  isStudentView: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'download']);

const bulletinRef = ref(null);
const isExporting = ref(false);

const schoolConfig = ref({
  ministryName: 'MINISTÈRE DE L\'ENSEIGNEMENT...',
  schoolName: 'LYCÉE WEND PUIRÉ DE SAABA',
  shortName: 'LWS',
  motto: 'DISCIPLINE-TRAVAIL-SUCCES',
  phone: '51 54 88 11',
  city: 'OUAGADOUGOU',
  region: 'LA FORMATION PROFESSIONNELLE ET TECHNIQUE',
  directionRegionale: '',
  circonscription: '',
  subRegion: 'RÉGION CENTRE',
  country: 'BURKINA FASO',
  patrie: 'La Patrie ou la Mort, nous Vaincrons',
  logo: '',
  proviseurName: '',
  proviseurTitle: 'Chevalier de l\'Ordre des Palmes Académiques'
});

onMounted(async () => {
  try {
    const res = await api.getSetting('school_config');
    if (res.data.success && res.data.data && res.data.data.value) {
      const config = res.data.data.value;
      // Ne pas écraser les par défaut si les champs ne sont pas définis du tout, 
      // mais on accepte les chaines vides (notamment pour motto et logo)
      Object.keys(config).forEach(key => {
        if (config[key] !== undefined && config[key] !== null) {
          schoolConfig.value[key] = config[key];
        }
      });
    }
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error('Erreur chargement school config:', error);
    }
  }
});

const getSmartCategory = (note, filiereClass) => {
  const nom = (note.matiere?.nom || '').toUpperCase();
  const baseCat = note.categorie || note.matiere?.categorie || 'ENSEIGNEMENT GÉNÉRAL';
  
  if (filiereClass === 'Technique') {
    if (baseCat === 'ENSEIGNEMENT TECHNIQUE') return "MATIÈRES DE L'ENSEIGNEMENT TECHNIQUE";
    return "MATIÈRES DE L'ENSEIGNEMENT GÉNÉRAL";
  }
  
  // Logic for "Générale" stream - dynamic sub-categorization
  if (baseCat === 'ENSEIGNEMENT TECHNIQUE') return "MATIÈRES DE L'ENSEIGNEMENT TECHNIQUE";
  
  // Keyword matching for General stream
  const isScientific = ['MATH', 'PHYS', 'SVT', 'CHIMIE', 'INFO', 'TECHNO', 'SCIENCES', 'BIO'].some(kw => nom.includes(kw)) || (nom.includes('GEO') && !nom.includes('GEOGRAPHIE'));
  if (isScientific) return "MATIÈRES SCIENTIFIQUES";
  
  const isLiterary = ['FRANCAIS', 'ANGLAIS', 'HISTOIRE', 'GEOGRAPHIE', 'PHILO', 'ALLEMAND', 'ESPAGNOL', 'LINGUISTIQUE', 'CIVIQUE', 'MORALE'].some(kw => nom.includes(kw));
  if (isLiterary) return "MATIÈRES LITTÉRAIRES";
  
  const isEPS = ['EPS', 'SPORT', 'PHYSIQUE'].some(kw => nom.includes(kw)) && !isScientific;
  if (isEPS) return "ÉDUCATION PHYSIQUE ET SPORTIVE";
  
  return "AUTRES";
};

const groupedNotes = computed(() => {
  const groups = {};
  const filiere = props.classe.filiere || 'Générale';
  
  if (props.bulletin.notes && Array.isArray(props.bulletin.notes)) {
    props.bulletin.notes.forEach(note => {
      const cat = getSmartCategory(note, filiere);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(note);
    });
  }
  return groups;
});
 
const isDispensedAll = computed(() => {
  if (!props.bulletin.notes || props.bulletin.notes.length === 0) return false;
  return props.bulletin.notes.every(note => note.isDispensed);
});

const maxInt = computed(() => 0);
const maxDev = computed(() => 0);

const maxCompo = computed(() => {
  let max = 0;
  if (!props.bulletin.notes) return 0;
  props.bulletin.notes.forEach(note => {
    const n = (note.compoGrades?.length || (note.compo !== undefined ? 1 : 0));
    if (n > max) max = n;
  });
  return max;
});

const totalCols = computed(() => 7);
const compactClasses = computed(() => {
  const count = props.bulletin.notes?.length || 0;
  if (count > 20) return 'compact-2';
  if (count > 15) return 'compact-1';
  return '';
});

const getGradeAt = (note, type, index) => {
  let grades = [];
  if (type === 'interro') {
    grades = (note.interroGrades && note.interroGrades.length > 0) ? note.interroGrades : (note.int !== undefined ? [note.int] : []);
  } else if (type === 'devoir') {
    grades = (note.devoirGrades && note.devoirGrades.length > 0) ? note.devoirGrades : (note.dev !== undefined ? [note.dev] : []);
  } else if (type === 'compo') {
    grades = (note.compoGrades && note.compoGrades.length > 0) ? note.compoGrades : (note.compo !== undefined ? [note.compo] : []);
  }
  
  const val = grades[index];
  return val !== undefined ? val.toFixed(2) : '';
};

const formatDate = (date) => {
  if (!date) return '';
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
  if (a.includes('excellent')) return 'text-green-700';
  if (a.includes('très bien')) return 'text-green-600';
  if (a.includes('bien')) return 'text-green-500';
  if (a.includes('assez-bien')) return 'text-lime-500';
  if (a.includes('passable')) return 'text-orange-500';
  if (a.includes('faible')) return 'text-red-600';
  if (a.includes('insuffisant')) return 'text-red-800';
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

const downloadPDF = async () => {
  if (isExporting.value) return;
  isExporting.value = true;
  
  try {
    const response = await api.downloadBulletinPDF(props.bulletin._id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bulletin_${props.eleve.nom}_${props.eleve.prenom}_${props.bulletin.periode.replace(' ', '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    emit('download');
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error);
    alert('Une erreur est survenue lors du téléchargement du PDF.');
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
.bulletin {
  display: flex !important;
  flex-direction: column !important;
  min-height: 290mm;
  padding: 8mm !important;
  background: white !important;
  font-family: Arial, Helvetica, sans-serif !important;
  line-height: 1 !important;
}

.header-left p {
  margin: 0 !important;
}

/* Fix ghost lines through text (Puppeteer/Browser scaling issue) */
/* border-collapse: separate + border-spacing: 0 is the robust fix */
table {
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  border-top: 1px solid black;
  border-left: 1px solid black;
}

table.main-table {
  flex-grow: 0; /* Let it take its natural height */
}

td, th {
  border-right: 1px solid black !important;
  border-bottom: 1px solid black !important;
  vertical-align: middle !important;
  padding: 0 4px !important;
  text-align: center;
  line-height: 1 !important;
}

th {
  height: 32px;
  background-color: #f3f4f6;
  font-weight: bold;
  font-size: 9px;
}

.data-row td, .cat-header-row td {
  height: 28px;
}

/* Compact Modes */
.compact-1 .bulletin {
  padding: 6mm !important;
  font-size: 9.5px;
}

.compact-1 th {
  height: 28px;
  font-size: 9px;
}

.compact-1 .data-row td, 
.compact-1 .cat-header-row td {
  height: 24px;
}

.compact-2 .bulletin {
  padding: 4mm !important;
  font-size: 9px;
}

.compact-2 th {
  height: 25px;
  font-size: 8.5px;
}

.compact-2 .data-row td, 
.compact-2 .cat-header-row td {
  height: 21px;
}

.cat-total-row td {
  height: 30px;
}

.total-general-row td {
  height: 34px;
}

.compact-1 .bilan-table td {
  height: 28px;
}

.compact-2 .bilan-table td {
  padding: 4px 4px !important;
}

.compact-2 .council-box {
  min-height: 70px;
}

@media print {
  @page {
    margin: 0;
    size: A4 portrait;
  }
  
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: white !important;
  }

  .no-print { 
    display: none !important; 
  }
  
  .bulletin-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    min-height: auto !important;
  }

  .bulletin {
    box-shadow: none !important;
    max-width: none !important;
    width: 210mm !important; /* A4 width */
    min-height: 297mm !important;
    margin: 0 auto !important;
    padding: 10mm !important; /* Proper margin for print */
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
    font-family: Arial, Helvetica, sans-serif !important;
  }
  
  /* Ensure backgrounds render */
  tr.bg-gray-200 { background-color: #e5e7eb !important; }
  tr.bg-gray-300 { background-color: #d1d5db !important; }
  tr.bg-gray-100 { background-color: #f3f4f6 !important; }
  .bg-gray-300 { background-color: #d1d5db !important; }
  
  /* ensure text colors */
  .text-red-600 { color: #dc2626 !important; }
  .text-green-700 { color: #15803d !important; }
  .text-blue-900 { color: #1e3a8a !important; }
}

</style>
