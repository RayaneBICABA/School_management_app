<template>
  <div class="bulletin-wrapper p-4 md:p-8 bg-slate-200 min-h-screen no-print flex justify-center items-start">
    <div ref="bulletinRef" class="bulletin-a4 bg-white shadow-2xl overflow-hidden print:shadow-none print:m-0">
      <div class="page-container p-[12mm] h-full flex flex-col font-sans leading-tight text-gray-900 border-black">
        
        <!-- Header Section -->
        <div class="top-header flex justify-between items-start mb-5 flex-shrink-0">
          <div class="header-left w-[30%] text-[10px] font-bold uppercase leading-normal">
            <p>{{ schoolConfig.ministryName }}</p>
            <p>{{ schoolConfig.region }}</p>
            <p>{{ schoolConfig.city }}</p>
            <p>{{ schoolConfig.schoolName }}</p>
            <p v-if="schoolConfig.phone">TÉL : {{ schoolConfig.phone }}</p>
          </div>
          
          <div class="header-center w-[35%] flex flex-col items-center text-center">
            <div v-if="schoolConfig.logo" class="h-[75px] mb-1">
              <img :src="schoolConfig.logo.startsWith('data:image/') ? schoolConfig.logo : `${BASE_ASSET_URL}${schoolConfig.logo}`" class="h-full w-auto object-contain mx-auto" />
            </div>
            <div v-else class="text-4xl font-black text-blue-900 leading-none">{{ schoolConfig.shortName }}</div>
            <div class="motto mt-1 pt-1 border-t border-gray-200 w-full text-[9.5px] font-bold text-gray-600 uppercase">{{ schoolConfig.motto }}</div>
          </div>

          <div class="header-right w-[30%] text-right text-[10px] font-bold uppercase leading-normal">
            <p>{{ schoolConfig.country }}</p>
            <p class="text-[8px] italic font-normal normal-case opacity-70">{{ schoolConfig.patrie }}</p>
          </div>
        </div>

        <!-- Title Section -->
        <div class="main-title text-center mb-4 flex-shrink-0">
          <h1 class="text-2xl font-black tracking-widest border-y-4 border-black inline-block px-12 py-1">BULLETIN DE NOTES</h1>
        </div>

        <!-- Student Info Bar -->
        <div class="student-info-section flex flex-col gap-3 mb-6 flex-shrink-0">
          <div class="info-row flex justify-between text-[13px]">
            <div><span class="text-gray-500 mr-2">Année scolaire :</span><span class="font-extrabold uppercase">{{ bulletin.anneeScolaire }}</span></div>
            <div class="font-black text-blue-900">{{ bulletin.periode }}</div>
            <div><span class="text-gray-500 mr-2">Effectif :</span><span class="font-extrabold uppercase">{{ bulletin.effectif }}</span></div>
          </div>
          
          <div class="info-row text-lg">
            <span class="text-gray-500 mr-2">Nom de l'élève :</span>
            <span class="font-black uppercase tracking-tight">{{ eleve.nom }} {{ eleve.prenom }}</span>
          </div>

          <div class="info-row flex justify-between text-[13px]">
            <div><span class="text-gray-500 mr-2">Né(e) le :</span><span class="font-extrabold uppercase">{{ formatDate(eleve.dateNaissance) }}</span></div>
            <div><span class="text-gray-500 mr-2">Matricule :</span><span class="font-extrabold uppercase">{{ eleve.matricule }}</span></div>
            <div><span class="text-gray-500 mr-2">Classe :</span><span class="font-extrabold uppercase">{{ classe.niveau }} {{ classe.section }}</span></div>
            <div><span class="text-gray-500 mr-2">Redoublant :</span><span class="font-extrabold uppercase">{{ eleve.redoublant ? 'OUI' : 'NON' }}</span></div>
          </div>
        </div>

        <!-- Grades Table Section -->
        <div class="grades-container flex-grow flex flex-col mb-4 overflow-hidden">
          <table class="grades-table w-full border-collapse border-2 border-black h-full table-fixed">
            <thead>
              <tr class="bg-gray-100 text-[12px] font-black uppercase border-b-2 border-black">
                <th class="border border-black p-2.5 text-left w-[32%]">Matières</th>
                <th class="border border-black p-2.5 w-[8%]">Coef</th>
                <th class="border border-black p-2.5 w-[10%]">Moy</th>
                <th class="border border-black p-2.5 w-[10%]">Pond.</th>
                <th class="border border-black p-2.5 w-[15%]">Appréciation</th>
                <th class="border border-black p-2.5 w-[25%]">Professeur & Sig.</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(notes, catName) in groupedNotes" :key="catName">
                <tr class="bg-gray-200 text-[12px] font-black uppercase text-center border-b border-black">
                  <td colspan="6" class="border border-black p-2">{{ catName }}</td>
                </tr>
                <tr v-for="note in notes" :key="note.matiere?._id" class="text-center text-[13px]">
                  <td class="border border-black p-2.5 text-left font-bold uppercase">{{ note.matiere?.nom }}</td>
                  <td class="border border-black p-2.5">{{ (note.coeff || 1).toFixed(1) }}</td>
                  <template v-if="note.isDispensed">
                    <td class="border border-black p-2.5 text-rose-600 italic font-black">D</td>
                    <td class="border border-black p-2.5 text-rose-600 italic font-black">D</td>
                  </template>
                  <template v-else>
                    <td class="border border-black p-2.5 font-medium">{{ (note.moyenneMatiere || 0).toFixed(2) }}</td>
                    <td class="border border-black p-2.5 font-black">{{ (note.notePonderee || 0).toFixed(2) }}</td>
                  </template>
                  <td class="border border-black p-2.5 italic text-[11px]" :class="getAppreciationColor(getSubjectAppreciation(note.moyenneMatiere || 0))">
                    {{ note.isDispensed ? 'DISPENSÉ' : getSubjectAppreciation(note.moyenneMatiere || 0) }}
                  </td>
                  <td class="border border-black p-2.5">
                    <div class="text-[10px] font-black leading-none mb-1">{{ note.professeur ? (note.professeur.civilite === 'Mr' ? 'M ' : (note.professeur.civilite ? note.professeur.civilite + ' ' : '')) + (note.professeur.nom || '').toUpperCase() : '' }}</div>
                    <div class="h-4"></div>
                  </td>
                </tr>
                <tr class="bg-gray-50 font-black text-[12px] border-b border-black">
                  <td class="border border-black p-2 text-left uppercase">TOTAL {{ catName }}</td>
                  <td class="border border-black p-2">{{ getCategoryTotalCoeff(notes) }}</td>
                  <td class="border border-black p-2"></td>
                  <td class="border border-black p-2">{{ getCategoryTotalPoints(notes) }}</td>
                  <td colspan="2" class="border border-black p-2 text-center text-[10px] italic">Sous-total pondéré</td>
                </tr>
              </template>
              
              <!-- Grand Total -->
              <tr class="bg-black text-white font-black text-[15px] h-12">
                <td class="border border-white/20 p-3 text-left uppercase">TOTAL GÉNÉRAL</td>
                <td class="border border-white/20 p-3">{{ (bulletin.totalCoefficients || 0).toFixed(1) }}</td>
                <td class="border border-white/20 p-3"></td>
                <td class="border border-white/20 p-3 text-lg">{{ (bulletin.totalPoints || 0).toFixed(2) }}</td>
                <td colspan="2" class="border border-white/20 p-3 text-center text-xs opacity-80 italic">Points cumulés</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Bilan Section -->
        <div class="bilan-section mb-4 flex-shrink-0">
          <div class="bg-black text-white text-center font-black py-2 text-sm uppercase tracking-widest mb-0.5">
            BILAN {{ classe.filiere === 'Technique' ? 'SEMESTRIEL' : 'TRIMESTRIEL' }}
          </div>
          <table class="w-full border-collapse border-2 border-black text-[13px] table-fixed">
            <tbody>
              <tr>
                <td class="border border-black p-3 w-1/4">Moyenne de l'élève</td>
                <td class="border border-black p-3 w-[15%] text-3xl font-black text-center">{{ (bulletin.moyenneGenerale || 0).toFixed(2) }}</td>
                <td class="border border-black p-3 w-1/4 uppercase">Retrait de points</td>
                <td class="border border-black p-3 w-[12%] text-lg font-black text-center text-rose-600">{{ (bulletin.retraitPoints || 0).toFixed(2) }}</td>
                <td colspan="2" class="border border-black bg-gray-100 text-[11px] font-black text-center uppercase tracking-tighter">Heures d'absence</td>
              </tr>
              <tr class="text-center">
                <td class="border border-black p-3 text-left">Moyenne de la classe</td>
                <td class="border border-black p-3 font-black">{{ (bulletin.moyenneClasse || 0).toFixed(2) }}</td>
                <td class="border border-black p-3 uppercase">Moyenne Définitive</td>
                <td class="border border-black p-3 text-3xl font-black text-blue-900">{{ ((bulletin.moyenneGenerale || 0) - (bulletin.retraitPoints || 0)).toFixed(2) }}</td>
                <td class="border border-black p-3 w-[12%]">Justifiées: <strong class="text-blue-700">{{ bulletin.absencesJustifiees || 0 }}</strong></td>
                <td class="border border-black p-3 w-[12%]">Non just.: <strong class="text-rose-700">{{ bulletin.absencesNonJustifiees || 0 }}</strong></td>
              </tr>
              <tr class="text-center">
                <td class="border border-black p-3 text-left">Meilleure / Pire</td>
                <td class="border border-black p-3 font-bold text-xs">
                  {{ (bulletin.meilleureMoyenneClasse || 0).toFixed(2) }} / {{ (bulletin.pireMoyenneClasse || 0).toFixed(2) }}
                </td>
                <td class="border border-black p-3 uppercase">Rang de l'élève</td>
                <td class="border border-black p-3 text-2xl font-black italic">
                  {{ bulletin.rang }}<sup class="text-sm">{{ bulletin.rang === 1 ? 'er' : 'ème' }}</sup>
                  <span class="text-xs font-normal opacity-50 block">sur {{ bulletin.effectif }}</span>
                </td>
                <td class="border border-black p-3 uppercase font-black bg-gray-50 text-[11px]">Conduite</td>
                <td class="border border-black p-3 font-black text-center uppercase">{{ bulletin.conduite || 'Satis.' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Council & Signature -->
        <div class="council-section border-2 border-black flex-shrink-0 flex flex-col">
          <div class="bg-gray-100 border-b-2 border-black text-center font-black py-2 uppercase text-[13px] tracking-wider">
            Appréciations du conseil de classe
          </div>
          <div class="flex h-[110px]">
            <div class="w-[60%] border-r-2 border-black flex items-center justify-center p-4">
              <span class="text-4xl font-black uppercase text-center tracking-tighter">
                {{ getGeneralAppreciation(bulletin.moyenneGenerale) }}
              </span>
            </div>
            <div class="w-[40%] flex flex-col items-center justify-center p-4 text-center">
              <div class="font-black text-[13px] uppercase mb-1">Le Proviseur</div>
              <div class="h-10"></div>
              <div class="font-black text-[13px] tracking-tight leading-none">{{ schoolConfig.proviseurName }}</div>
              <div class="italic text-[10px] text-gray-500 font-medium leading-tight mt-1">{{ schoolConfig.proviseurTitle }}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer-area flex justify-between items-end mt-4 text-[11px] font-medium text-gray-500 flex-shrink-0">
          <div class="italic">Fait à {{ schoolConfig.city }}, le {{ new Date().toLocaleDateString('fr-FR') }}</div>
          <div class="font-black text-blue-900 border-b border-blue-900/20">Généré par UNICA</div>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls fixed bottom-6 right-6 flex flex-col gap-3 no-print z-50">
      <button @click="$emit('close')" class="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 shadow-xl border border-gray-200 rounded-full font-black hover:bg-gray-50 transition-all active:scale-95">
        <span class="material-symbols-outlined">close</span> Fermer
      </button>
      
      <div v-if="bulletin.statut !== 'VALIDE' && bulletin.statut !== 'FINALISE'" class="px-6 py-3 bg-amber-500 text-white shadow-xl rounded-full font-black flex items-center gap-2">
         <span class="material-symbols-outlined">warning</span> Validation requise
      </div>
      
      <button v-else @click="downloadPDF" :disabled="isExporting" class="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white shadow-2xl rounded-full font-black hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
        <span class="material-symbols-outlined animate-bounce" v-if="!isExporting">download</span>
        <span class="material-symbols-outlined animate-spin" v-else>sync</span>
        {{ isExporting ? 'Génération...' : 'Télécharger PDF' }}
      </button>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');

.bulletin-wrapper {
  font-family: 'Inter', sans-serif;
}

.bulletin-a4 {
  width: 210mm;
  height: 297mm;
  min-width: 210mm;
  min-height: 297mm;
  position: relative;
  box-sizing: border-box;
}

.page-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

table {
  border-spacing: 0;
}

th, td {
  border-color: black !important;
  vertical-align: middle !important;
  height: 1px; /* Stretch hack */
}

.grades-table th {
  letter-spacing: 0.05em;
}

.main-title h1 {
  letter-spacing: 0.2rem;
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }
  
  .bulletin-wrapper {
    background: transparent !important;
    padding: 0 !important;
    display: block !important;
  }
  
  .bulletin-a4 {
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }

  .no-print {
    display: none !important;
  }
}

/* Scrollbar styling for better feel */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
