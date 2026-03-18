<template>
  <div class="bulletin-container p-4 bg-gray-100 min-h-screen" :class="compactClasses">
    <div ref="bulletinRef" class="bulletin max-w-[900px] mx-auto bg-white p-8 shadow-lg text-[#333] font-serif leading-tight flex flex-col min-h-[297mm]">
      <!-- Header -->
      <div class="header flex justify-between items-start mb-2 border-b-2 border-gray-100 pb-2 flex-shrink-0">
        <div class="header-left w-[30%] text-[10px] font-bold uppercase leading-[1.2]">
          <p>{{ schoolConfig.ministryName }}</p>
          <p>{{ schoolConfig.region }}</p>
          <p>{{ schoolConfig.city }}</p>
          <p>{{ schoolConfig.schoolName }}</p>
          <p v-if="schoolConfig.phone">Tél : {{ schoolConfig.phone }}</p>
        </div>

        <div class="header-center w-[40%] flex flex-col items-center text-center">
          <div v-if="schoolConfig.logo" class="h-16 mb-1">
            <img :src="schoolConfig.logo.startsWith('data:image/') ? schoolConfig.logo : `${BASE_ASSET_URL}${schoolConfig.logo}`" class="h-full w-auto object-contain mx-auto" />
          </div>
          <div v-else class="text-3xl font-black tracking-tighter text-blue-900 leading-none">{{ schoolConfig.shortName }}</div>
          <div v-if="schoolConfig.motto" class="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">{{ schoolConfig.motto }}</div>
        </div>

        <div class="header-right w-[30%] text-right text-[10px] font-bold uppercase leading-[1.2]">
          <p>{{ schoolConfig.country }}</p>
          <p class="text-[9px] italic normal-case font-normal">{{ schoolConfig.patrie }}</p>
        </div>
      </div>

      <!-- Title -->
      <div class="title text-center my-1.5 flex-shrink-0">
        <h1 class="text-xl font-serif italic font-bold">BULLETIN DE NOTES</h1>
      </div>

      <!-- General Info -->
      <div class="info-trimestre flex justify-between text-sm mb-1 flex-shrink-0">
        <span>Année scolaire: <strong>{{ bulletin.anneeScolaire }}</strong></span>
        <span><strong>{{ bulletin.periode }}</strong></span>
        <span>Effectif: <strong>{{ bulletin.effectif }}</strong></span>
      </div>

      <!-- Student Name -->
      <div class="student-name mb-1 flex items-baseline gap-1 text-[13px] font-bold leading-tight flex-shrink-0">
        <span class="text-[11px] text-gray-500 font-medium">Nom de l'élève:</span>
        <strong class="uppercase text-blue-900">{{ eleve.nom || 'Non renseigné' }} {{ eleve.prenom || 'Non renseigné' }}</strong>
      </div>

      <!-- Info Eleve -->
      <div class="info-eleve grid grid-cols-4 gap-1 mb-2 pb-1 border-b border-gray-200 flex-shrink-0">
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
                <th class="border border-black p-2 text-left" style="width: 30%;">Matières</th>
                <th class="border border-black p-1 text-center" style="width: 10%;">Coef</th>
                <th class="border border-black p-1 text-center" style="width: 10%;">Moy</th>
                <th class="border border-black p-1 text-center" style="width: 10%;">Pondérées</th>
                <th class="border border-black p-1 text-center" colspan="3">Appréciations et signatures</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(category, catName) in groupedNotes" :key="catName">
              <tr class="cat-header-row">
                <td :colspan="totalCols" class="font-bold text-center uppercase text-[11px]">{{ catName }}</td>
              </tr>
              <tr v-for="note in category" :key="note.matiere?._id" class="data-row text-center">
                <td class="border border-black p-2 text-left font-bold uppercase">{{ note.matiere?.nom }}</td>
                <td class="border border-black p-1">{{ (note.coeff || note.matiere?.coefficient || 0).toFixed(1) }}</td>
                
                <template v-if="note.isDispensed">
                  <td class="border border-black p-1 font-bold italic text-rose-600">D</td>
                  <td class="border border-black p-1 font-bold italic text-rose-600">D</td>
                </template>
                <template v-else>
                  <td class="border border-black p-1">{{ (note.moyenneMatiere || 0).toFixed(2) }}</td>
                  <td class="border border-black p-1 font-bold">{{ (note.notePonderee || 0).toFixed(2) }}</td>
                </template>
                <td class="border border-black p-1 w-20 italic text-[11px]" :class="note.isDispensed ? '' : getAppreciationColor(getSubjectAppreciation(note.moyenneMatiere || 0))">
                  {{ note.isDispensed ? '' : getSubjectAppreciation(note.moyenneMatiere || 0) }}
                </td>
                <td class="border border-black p-1 text-[10px] leading-tight" style="width: 80px; white-space: nowrap;">{{ note.professeur ? (note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')) + (note.professeur.nom || '').toUpperCase() : '' }}</td>
                <td class="border border-black p-1 w-20"></td>
              </tr>
              <!-- Category Totals -->
              <tr class="bg-gray-100 font-bold text-[10px]">
                <td class="border border-black p-1 px-2 text-left uppercase">Total {{ catName }}</td>
                <td class="border border-black p-1 text-center">{{ getCategoryTotalCoeff(category) }}</td>
                <td class="border border-black p-1" colspan="1"></td>
                <td class="border border-black p-1 text-center">{{ getCategoryTotalPoints(category) }}</td>
                <td class="border border-black p-1" colspan="3"></td>
              </tr>
            </template>

            <!-- Global Totals -->
            <tr class="bg-blue-50 font-bold text-center border-t-2 border-black">
              <td class="border border-black p-2 text-left uppercase">TOTAL GÉNÉRAL</td>
              <td class="border border-black p-1">{{ (bulletin.totalCoefficients || 0).toFixed(1) }}</td>
              <td class="border border-black p-1"></td>
              <td class="border border-black p-1 font-bold">{{ (bulletin.totalPoints || 0).toFixed(2) }}</td>
              <td class="border border-black p-1" colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- Bilan -->
      <div class="bilan flex-shrink-0 mt-2">
        <table class="bilan-table w-full border-separate border-spacing-0 text-[12px]">
          <tbody>
            <tr class="cat-header-row font-bold text-center">
              <td colspan="8" class="uppercase text-[11px]">BILAN {{ classe.filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL' }}</td>
            </tr>
            <tr class="data-row text-center">
              <td class="text-left font-semibold">Moyenne de l'élève</td>
              <td class="font-bold text-xl">{{ (bulletin.moyenneGenerale || 0).toFixed(2) }}</td>
              <td class="uppercase">RETRAIT DE POINTS</td>
              <td class="font-bold">{{ (bulletin.retraitPoints || 0).toFixed(2) }}</td>
              <td colspan="4" class="text-center uppercase font-bold bg-gray-100 text-[10px]">Nombre d'heures d'absence</td>
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
              <td class="uppercase">Rang du trimestre</td>
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
          <div class="cat-header-row p-1 text-center font-bold uppercase text-[11px] border-b border-black flex items-center justify-center">
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
  if (count > 16) return 'compact-2';
  if (count > 12) return 'compact-1';
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
    const element = bulletinRef.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Bulletin_${props.eleve.nom}_${props.eleve.prenom}_${props.bulletin.periode.replace(' ', '_')}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Une erreur est survenue lors de la génération du PDF.');
  } finally {
    isExporting.value = false;
  }
};
</script>

<style scoped>
.bulletin {
  display: flex !important;
  flex-direction: column !important;
  min-height: 297mm;
  padding: 10mm !important;
  background: white !important;
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
  padding: 8px 5px !important;
  text-align: center;
}

th {
  height: 40px;
  background-color: #f3f4f6;
  font-weight: bold;
}

.cat-header-row {
  height: 30px;
  background-color: #e5e7eb;
}

/* Compact Modes */
.compact-1 .bulletin {
  padding: 8mm !important;
  font-size: 10px;
}
.compact-1 .data-row, 
.compact-1 .cat-header-row {
  height: 28px;
}
.compact-1 th {
  height: 35px;
}
.compact-1 .bilan-table td {
  height: 32px;
}

.compact-2 .bulletin {
  padding: 6mm !important;
  font-size: 9.5px;
}
.compact-2 .data-row, 
.compact-2 .cat-header-row {
  height: 24px;
}
.compact-2 th {
  height: 28px;
}
.compact-2 .bilan-table td {
  height: 28px;
}
.compact-2 .council-box {
  min-height: 80px;
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

/* Dynamic Compact Styling */
.compact-level-1 .bulletin {
  padding: 1.5rem !important;
}
.compact-level-1 .header { margin-bottom: 0.25rem !important; pb: 0.25rem !important; }
.compact-level-1 .title { margin-top: 0.25rem !important; margin-bottom: 0.25rem !important; }
.compact-level-1 .title h1 { font-size: 1.125rem !important; }
.compact-level-1 .info-eleve { margin-bottom: 0.5rem !important; pb: 0.25rem !important; font-size: 0.75rem !important; }
.compact-level-1 table { font-size: 9px !important; }
.compact-level-1 th, .compact-level-1 td { padding: 2px !important; }
.compact-level-1 .bilan { mt: 0.5rem !important; }
.compact-level-1 .council { mt: 0.5rem !important; }
.compact-level-1 .council-content { height: 80px !important; }

.compact-level-2 .bulletin {
  padding: 1rem !important;
}
.compact-level-2 .header { margin-bottom: 0 !important; pb: 0 !important; font-size: 8px !important; }
.compact-level-2 .header-left, .compact-level-2 .header-right { font-size: 8px !important; }
.compact-level-2 .title { margin-top: 0 !important; margin-bottom: 0 !important; }
.compact-level-2 .title h1 { font-size: 1rem !important; }
.compact-level-2 .info-trimestre, .compact-level-2 .student-name { font-size: 10px !important; margin-bottom: 2px !important; }
.compact-level-2 .info-eleve { margin-bottom: 0.25rem !important; pb: 0.125rem !important; font-size: 9px !important; gap: 4px !important; }
.compact-level-2 table { font-size: 8px !important; }
.compact-level-2 th, .compact-level-2 td { padding: 1px 2px !important; }
.compact-level-2 .bilan { mt: 0.25rem !important; }
.compact-level-2 .bilan table { font-size: 9px !important; }
.compact-level-2 .council { mt: 0.25rem !important; }
.compact-level-2 .council-content { height: 60px !important; }
</style>
