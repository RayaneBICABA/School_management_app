<template>
  <div class="bulletin-container p-4 bg-gray-100 min-h-screen" :class="compactClasses">
    <div ref="bulletinRef" class="bulletin max-w-[900px] mx-auto bg-white p-8 shadow-lg text-[#333] font-serif leading-tight">
      <!-- Header -->
      <div class="header flex justify-between items-start mb-2 border-b-2 border-gray-100 pb-2">
        <div class="header-left w-[30%] text-[9px] font-bold uppercase leading-[1.1]">
          <p>{{ schoolConfig.region }}</p>
          <p>{{ schoolConfig.subRegion }}</p>
          <p>{{ schoolConfig.schoolName }}</p>
          <p v-if="schoolConfig.phone">Tél : {{ schoolConfig.phone }}</p>
        </div>

        <div class="header-center w-[40%] flex flex-col items-center text-center">
          <div v-if="schoolConfig.logo" class="h-16 mb-1">
            <img :src="`${BASE_ASSET_URL}${schoolConfig.logo}`" class="h-full w-auto object-contain mx-auto" />
          </div>
          <div v-else class="text-3xl font-black tracking-tighter text-blue-900 leading-none">{{ schoolConfig.shortName }}</div>
          <div v-if="schoolConfig.motto" class="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest leading-none">{{ schoolConfig.motto }}</div>
        </div>

        <div class="header-right w-[30%] text-right text-[9px] font-bold uppercase leading-[1.1]">
          <p>{{ schoolConfig.country }}</p>
          <p class="text-[8px] italic normal-case font-normal">{{ schoolConfig.patrie }}</p>
        </div>
      </div>

      <!-- Title -->
      <div class="title text-center my-2">
        <h1 class="text-xl font-serif italic font-bold">BULLETIN DE NOTES</h1>
      </div>

      <!-- General Info -->
      <div class="info-trimestre flex justify-between text-xs mb-1">
        <span>Année scolaire: <strong>{{ bulletin.anneeScolaire }}</strong></span>
        <span><strong>{{ bulletin.periode }}</strong></span>
        <span>Effectif: <strong>{{ bulletin.effectif }}</strong></span>
      </div>

      <!-- Student Name -->
      <div class="student-name mb-1 flex items-baseline gap-1 text-[11px] font-medium leading-tight">
        <span class="text-[10px] text-gray-500">Nom de l'élève:</span>
        <strong class="uppercase">{{ eleve.nom || 'Non renseigné' }} {{ eleve.prenom || 'Non renseigné' }}</strong>
      </div>

      <!-- Info Eleve -->
      <div class="info-eleve grid grid-cols-4 gap-1 mb-2 pb-1 border-b border-gray-200">
        <div class="info-item flex items-baseline gap-1">
          <span class="text-[10px] text-gray-500 text-xs">Né(e) le:</span>
          <span class="font-bold text-[11px]">{{ formatDate(eleve.dateNaissance) || 'Non renseigné' }}</span>
        </div>
        <div class="info-item flex items-baseline gap-1">
          <span class="text-[10px] text-gray-500 text-xs">Matricule:</span>
          <strong class="text-[11px]">{{ eleve.matricule || 'Non renseigné' }}</strong>
        </div>
        <div class="info-item flex items-baseline gap-1 justify-end lg:justify-start">
          <span class="text-[10px] text-gray-500 text-xs">Classe:</span>
          <strong class="text-[11px]">{{ classe.niveau || 'N/A' }} {{ classe.section || '' }}</strong>
        </div>
        <div class="info-item flex items-baseline gap-1 justify-end">
          <span class="text-[10px] text-gray-500 text-xs">Redoublant:</span>
          <strong class="text-[11px] font-bold">{{ eleve.redoublant ? 'OUI' : 'NON' }}</strong>
        </div>
      </div>

      <!-- Grades Table -->
      <table class="w-full border-collapse border border-black text-[10px]">
        <thead>
          <tr class="bg-gray-200 text-center font-bold">
              <th class="border border-black p-2 text-left" style="width: 30%;">Matières</th>
              <th class="border border-black p-1 text-center" style="width: 8%;">Coef</th>
              <th class="border border-black p-1 text-center" style="width: 10%;">Moy</th>
              <th class="border border-black p-1 text-center" style="width: 10%;">Pondérées</th>
              <th class="border border-black p-1 text-center" colspan="3">Appréciations et signatures</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(category, catName) in groupedNotes" :key="catName">
            <tr class="bg-gray-300">
              <td :colspan="totalCols" class="border border-black p-2 font-bold text-center uppercase">{{ catName }}</td>
            </tr>
            <tr v-for="note in category" :key="note.matiere?._id" class="text-center">
              <td class="border border-black p-2 text-left font-bold uppercase">{{ note.matiere?.nom }}</td>
              <td class="border border-black p-1">{{ (note.coeff || note.matiere?.coefficient || 0).toFixed(1) }}</td>
              
              <template v-if="note.isDispensed">
                <td class="border border-black p-2 font-bold italic">-</td>
                <td class="border border-black p-1 font-bold">-</td>
              </template>
              <template v-else>
                <td class="border border-black p-1">{{ (note.moyenneMatiere || 0).toFixed(2) }}</td>
                <td class="border border-black p-1 font-bold">{{ (note.notePonderee || 0).toFixed(2) }}</td>
              </template>
              <td class="border border-black p-1 w-24 italic" :class="note.isDispensed ? '' : getAppreciationColor(getSubjectAppreciation(note.moyenneMatiere || 0))">
                {{ note.isDispensed ? '' : getSubjectAppreciation(note.moyenneMatiere || 0) }}
              </td>
              <td class="border border-black p-1 text-[9px]" style="width: 60px; white-space: nowrap;">{{ note.professeur ? (note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')) + (note.professeur.nom || '').toUpperCase() : '' }}</td>
              <td class="border border-black p-1 w-20"></td>
            </tr>
            <!-- Category Totals -->
            <tr class="bg-gray-100 font-bold">
              <td class="border border-black p-1 px-2 text-left uppercase text-[9px]">Total {{ catName }}</td>
              <td class="border border-black p-1 text-center">{{ getCategoryTotalCoeff(category) }}</td>
              <td class="border border-black p-1" colspan="1"></td>
              <td class="border border-black p-1 text-center">{{ getCategoryTotalPoints(category) }}</td>
              <td class="border border-black p-1" colspan="3"></td>
            </tr>
          </template>

          <!-- Global Totals -->
          <tr class="bg-blue-50 font-bold text-center">
            <td class="border border-black p-2 text-left uppercase">TOTAL GÉNÉRAL</td>
            <td class="border border-black p-1">{{ (bulletin.totalCoefficients || 0).toFixed(1) }}</td>
            <td class="border border-black p-1"></td>
            <td class="border border-black p-1 font-bold">{{ (bulletin.totalPoints || 0).toFixed(2) }}</td>
            <td class="border border-black p-1" colspan="3"></td>
          </tr>
        </tbody>
      </table>
 
      <!-- Global Bilan -->
      <div class="bilan mt-6">
        <table class="w-full border-collapse border border-black text-[11px]">
          <tbody>
            <tr class="bg-gray-300 font-bold text-center">
              <td colspan="8" class="border border-black p-2 uppercase">BILAN {{ classe.filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL' }}</td>
            </tr>
            <tr>
              <td class="border border-black p-2">Moyenne de l'élève</td>
              <td class="border border-black p-2 font-bold text-lg">{{ (bulletin.moyenneGenerale || 0).toFixed(2) }}</td>
              <td class="border border-black p-2 uppercase">RETRAIT DE POINTS</td>
              <td class="border border-black p-2 font-bold">{{ (bulletin.retraitPoints || 0).toFixed(2) }}</td>
              <td colspan="4" class="border border-black p-2 text-center uppercase font-bold">Nombre d'heures d'absence</td>
            </tr>
            <tr>
              <td class="border border-black p-2">Moyenne de la classe</td>
              <td class="border border-black p-2 font-bold">{{ (bulletin.moyenneClasse || 0).toFixed(2) }}</td>
              <td class="border border-black p-2 uppercase">MOYENNE DEFINITIVE</td>
              <td class="border border-black p-2 font-bold text-lg">{{ ((bulletin.moyenneGenerale || 0) - (bulletin.retraitPoints || 0)).toFixed(2) }}</td>
              <td class="border border-black p-2 text-center">Justifiées</td>
              <td class="border border-black p-2 font-bold text-center">{{ bulletin.absencesJustifiees || 0 }}</td>
              <td class="border border-black p-2 text-center">Non justifiées</td>
              <td class="border border-black p-2 font-bold text-center">{{ bulletin.absencesNonJustifiees || 0 }}</td>
            </tr>
            <tr>
              <td class="border border-black p-2">Meilleure moyenne</td>
              <td class="border border-black p-2 font-bold">{{ (bulletin.meilleureMoyenneClasse || 0).toFixed(2) }}</td>
              <td class="border border-black p-2 uppercase">Rang du trimestre</td>
              <td class="border border-black p-2 font-bold">{{ bulletin.rang || '-' }}</td>
              <td class="border border-black p-2 text-center uppercase font-bold">Conduite</td>
              <td colspan="3" class="border border-black p-2 font-bold">{{ bulletin.conduite }}</td>
            </tr>
            <tr>
              <td class="border border-black p-2">Moyenne la plus basse</td>
              <td class="border border-black p-2 font-bold">{{ (bulletin.pireMoyenneClasse || 0).toFixed(2) }}</td>
              <td colspan="2" class="border border-black p-2"></td>
              <td class="border border-black p-2 text-center uppercase font-bold">Rappel des Moyennes</td>
              <td colspan="3" class="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Appreciation & Signatures -->
      <div class="council mt-6 relative overflow-hidden">

        <h3 class="bg-gray-300 text-center font-bold p-2 border border-black uppercase text-sm">Appréciations du conseil de classe</h3>
        <div class="flex border border-black border-t-0 h-28">
          <div class="w-1/2 p-4 border-r border-black flex flex-col items-center justify-center gap-4">
               <div class="text-center min-w-[200px]">
                  <div class="font-bold text-lg">{{ getGeneralAppreciation(bulletin.moyenneGenerale) }}</div>
               </div>
          </div>
          <div class="w-1/2 p-4 flex flex-col items-center justify-center">
            <div class="font-bold text-sm uppercase">Le Proviseur</div>
            <!-- Signature space -->
            <div class="mt-2 h-24 w-full"></div>
            <div class="font-bold text-xs mt-1">{{ schoolConfig.proviseurName || '' }}</div>
            <!-- <div v-if="bulletin.signatureProviseur" class="mt-4 text-blue-700 italic border-2 border-blue-700 rounded-full px-4 py-1 rotate-[-5deg]">Signé Électroniquement</div> -->
          </div>
        </div>
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
  schoolName: 'LYCÉE WEND PUIRÉ DE SAABA',
  shortName: 'LWS',
  motto: 'DISCIPLINE-TRAVAIL-SUCCES',
  phone: '51 54 88 11',
  region: 'LA FORMATION PROFESSIONNELLE ET TECHNIQUE',
  subRegion: 'RÉGION CENTRE',
  country: 'BURKINA FASO',
  patrie: 'La Patrie ou la Mort, nous Vaincrons',
  logo: '',
  proviseurName: ''
});

onMounted(async () => {
  try {
    const res = await api.getSetting('school_config');
    if (res.data.success && res.data.data && res.data.data.value) {
      const config = res.data.data.value;
      // Ne pas écraser les par défaut si les champs sont vides
      Object.keys(config).forEach(key => {
        if (config[key] !== null && config[key] !== undefined && config[key] !== '') {
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
  if (count > 20) return 'compact-level-2';
  if (count > 14) return 'compact-level-1';
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
td, th {
  border-width: 1px !important;
  border-color: black !important;
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
    height: auto !important;
    margin: 0 auto !important;
    padding: 10mm !important; /* Proper margin for print */
    overflow: visible !important;
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
