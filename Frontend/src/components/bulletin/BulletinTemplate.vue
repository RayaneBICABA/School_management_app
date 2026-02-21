<template>
  <div class="bulletin-container p-4 bg-gray-100 min-h-screen">
    <div ref="bulletinRef" class="bulletin max-w-[900px] mx-auto bg-white p-8 shadow-lg text-[#333] font-serif leading-tight">
      <!-- Header -->
      <div class="header flex justify-between items-start mb-5 border-b-2 border-gray-100 pb-5">
        <div class="header-left w-[30%] text-[11px] font-bold uppercase space-y-1">
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

        <div class="header-right w-[30%] text-right text-[11px] font-bold uppercase space-y-1">
          <p>{{ schoolConfig.country }}</p>
          <p class="text-[9px] italic normal-case font-normal">{{ schoolConfig.patrie }}</p>
        </div>
      </div>

      <!-- Title -->
      <div class="title text-center my-8">
        <h1 class="text-2xl font-serif italic font-bold">BULLETIN DE NOTES</h1>
      </div>

      <!-- General Info -->
      <div class="info-trimestre flex justify-between text-sm mb-4">
        <span>Année scolaire: <strong>{{ bulletin.anneeScolaire }}</strong></span>
        <span><strong>{{ bulletin.periode }}</strong></span>
        <span>Effectif: <strong>{{ bulletin.effectif }}</strong></span>
      </div>

      <div class="student-name mb-4 text-sm uppercase">Nom de l'élève: <strong>{{ eleve.nom || 'Non renseigné' }} {{ eleve.prenom || 'Non renseigné' }}</strong></div>

      <div class="info-eleve grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6 pb-4 border-b border-gray-200">
        <div class="flex flex-col">
          <span class="text-gray-500 text-xs">Né(e) le:</span>
          <strong>{{ formatDate(eleve.dateNaissance) || 'Non renseigné' }}</strong>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-500 text-xs">Matricule:</span>
          <strong>{{ eleve.matricule || 'Non renseigné' }}</strong>
        </div>
        <div class="flex flex-col text-right lg:text-left">
          <span class="text-gray-500 text-xs">Classe:</span>
          <strong>{{ classe.niveau || 'N/A' }} {{ classe.section || '' }}</strong>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500 text-xs">Redoublant:</span>
          <strong>{{ eleve.redoublant ? 'OUI' : 'NON' }}</strong>
        </div>
      </div>

      <!-- Grades Table -->
      <table class="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr class="bg-gray-200 text-center font-bold">
            <th class="border border-black p-2 text-left w-1/4">Matières</th>
            <th class="border border-black p-1 w-12">Coef</th>
            <th v-for="i in maxInt" :key="'int-head-'+i" class="border border-black p-1 w-12">Int {{ i }}</th>
            <th v-for="i in maxDev" :key="'dev-head-'+i" class="border border-black p-1 w-12">Dev {{ i }}</th>
            <th v-for="i in maxCompo" :key="'comp-head-'+i" class="border border-black p-1 w-12">Comp {{ i }}</th>
            <th class="border border-black p-1 w-12">Moy</th>
            <th class="border border-black p-1 w-20">Notes pondérées</th>
            <th class="border border-black p-1" colspan="3">Appréciations et signatures</th>
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
              
              <!-- Dynamic Interros -->
              <td v-for="i in maxInt" :key="'int-'+note.matiere?._id+'-'+i" class="border border-black p-1">
                {{ getGradeAt(note, 'interro', i-1) }}
              </td>
              
              <!-- Dynamic Devoirs -->
              <td v-for="i in maxDev" :key="'dev-'+note.matiere?._id+'-'+i" class="border border-black p-1">
                {{ getGradeAt(note, 'devoir', i-1) }}
              </td>
              
              <!-- Dynamic Compos -->
              <td v-for="i in maxCompo" :key="'comp-'+note.matiere?._id+'-'+i" class="border border-black p-1">
                {{ getGradeAt(note, 'compo', i-1) }}
              </td>
              
              <td class="border border-black p-1">{{ (note.moyenneMatiere || 0).toFixed(2) }}</td>
              <td class="border border-black p-1 font-bold">{{ (note.notePonderee || 0).toFixed(2) }}</td>
              <td class="border border-black p-1 w-24 italic" :class="getAppreciationColor(getSubjectAppreciation(note.moyenneMatiere || 0))">{{ getSubjectAppreciation(note.moyenneMatiere || 0) }}</td>
              <td class="border border-black p-1 w-16"></td>
              <td class="border border-black p-1 text-[9px] uppercase">{{ note.professeur ? `${note.professeur.nom} ${note.professeur.prenom}` : '' }}</td>
            </tr>
            <!-- Category Totals -->
            <tr class="bg-gray-100 font-bold">
              <td class="border border-black p-2 text-left uppercase">Total</td>
              <td class="border border-black p-1">{{ getCategoryTotalCoeff(category) }}</td>
              <td class="border border-black p-1" :colspan="maxInt + maxDev + maxCompo + 1"></td>
              <td class="border border-black p-1">{{ getCategoryTotalPoints(category) }}</td>
              <td class="border border-black p-1" colspan="3"></td>
            </tr>
          </template>
        </tbody>
      </table>
 
      <!-- Global Bilan -->
      <div class="bilan mt-6">
        <table class="w-full border-collapse border border-black text-[11px]">
          <tbody>
            <tr class="bg-gray-300 font-bold text-center">
              <td colspan="8" class="border border-black p-2 uppercase">BILAN TRIMESTRIEL</td>
            </tr>
            <tr class="font-bold">
              <td colspan="4" class="border border-black p-2 uppercase">TOTAL COEFFICIENT : <strong>{{ (bulletin.totalCoefficients || 0).toFixed(2) }}</strong></td>
              <td colspan="4" class="border border-black p-2 uppercase text-right">TOTAL NOTES PONDEREES: <strong>{{ (bulletin.totalPoints || 0).toFixed(2) }}</strong></td>
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
        <!-- Filigrane Provisoire -->
        <div v-if="bulletin.statut !== 'VALIDE' && bulletin.statut !== 'FINALISE'" 
             class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] rotate-[-30deg]">
          <span class="text-[120px] font-black tracking-widest border-[15px] border-black p-10 uppercase">PROVISOIRE</span>
        </div>

        <h3 class="bg-gray-300 text-center font-bold p-2 border border-black uppercase text-sm">Appréciations du conseil de classe</h3>
        <div class="flex border border-black border-t-0 h-40">
          <div class="w-1/2 p-4 border-r border-black flex flex-col items-center justify-center gap-4">
               <div class="border-4 border-double border-gray-800 rounded p-4 text-center min-w-[200px]">
                  <div class="font-bold text-lg">{{ getGeneralAppreciation(bulletin.moyenneGenerale) }}</div>
               </div>
          </div>
          <div class="w-1/2 p-4 flex flex-col items-center justify-center">
            <div class="font-bold text-sm uppercase">Le Proviseur</div>
            <!-- Signature space -->
            <div class="mt-4 h-10 w-full"></div>
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
  logo: ''
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

const groupedNotes = computed(() => {
  const groups = {};
  if (props.bulletin.notes && Array.isArray(props.bulletin.notes)) {
    props.bulletin.notes.forEach(note => {
      const cat = note.categorie || 'AUTRES';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(note);
    });
  }
  return groups;
});

const maxInt = computed(() => {
  let max = 0;
  if (!props.bulletin.notes) return 0;
  props.bulletin.notes.forEach(note => {
    const n = (note.interroGrades?.length || (note.int !== undefined ? 1 : 0));
    if (n > max) max = n;
  });
  return max;
});

const maxDev = computed(() => {
  let max = 0;
  if (!props.bulletin.notes) return 0;
  props.bulletin.notes.forEach(note => {
    const n = (note.devoirGrades?.length || (note.dev !== undefined ? 1 : 0));
    if (n > max) max = n;
  });
  return max;
});

const maxCompo = computed(() => {
  let max = 0;
  if (!props.bulletin.notes) return 0;
  props.bulletin.notes.forEach(note => {
    const n = (note.compoGrades?.length || (note.compo !== undefined ? 1 : 0));
    if (n > max) max = n;
  });
  return max;
});

const totalCols = computed(() => 7 + maxInt.value + maxDev.value + maxCompo.value);

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
</style>
