<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Récapitulatif des Notes (Master Sheet)</h1>
        <p class="text-gray-600">Vue d'ensemble de toutes les notes par classe</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="printSheet"
          :disabled="!matrix.length && !allClassesData.length"
          class="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-lg">print</span>
          Imprimer
        </button>
        <button
          @click="exportPDF"
          :disabled="(!matrix.length && !allClassesData.length) || exporting"
          class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <span v-if="exporting" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          <span v-else class="material-symbols-outlined text-lg">picture_as_pdf</span>
          {{ exporting ? 'Génération...' : 'Exporter en PDF' }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Classe</label>
          <select v-model="filters.classe" class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Sélectionner une classe</option>
            <option value="all">Toutes les classes</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.niveau }} {{ c.section }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Période</label>
          <select v-model="filters.periode" class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
            <option v-for="p in availablePeriodes" :key="p" :value="p">{{ p }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Année Scolaire</label>
          <select v-model="filters.anneeScolaire" class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="loadData"
            :disabled="!filters.classe || loading"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <span v-if="loading" class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            <span v-else class="material-symbols-outlined text-lg">search</span>
            {{ loading ? 'Chargement...' : 'Afficher' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <span class="material-symbols-outlined text-5xl text-blue-400 animate-spin">progress_activity</span>
      <p class="text-gray-500 font-medium">Chargement des données...</p>
    </div>

    <!-- All Classes View -->
    <div v-else-if="allClassesData.length" id="master-sheet-print-area" class="space-y-8">
      <div v-for="sheet in allClassesData" :key="sheet.classe._id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Class Header -->
        <div class="flex items-center justify-between px-5 py-3 bg-blue-600 text-white">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined">groups</span>
            <h2 class="font-bold text-lg">{{ sheet.classe.niveau }} {{ sheet.classe.section }}</h2>
          </div>
          <span class="text-blue-100 text-sm">{{ sheet.matrix.length }} élève(s)</span>
        </div>
        <div class="overflow-x-auto max-h-[60vh]">
          <ClassTable :sheet="sheet" />
        </div>
      </div>
    </div>

    <!-- Single Class Table -->
    <div v-else-if="matrix.length" id="master-sheet-print-area" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto max-h-[70vh]">
        <table class="w-full border-collapse text-xs">
          <thead class="sticky top-0 z-20 bg-gray-50">
            <tr>
              <th rowspan="2" class="sticky left-0 z-30 bg-gray-50 border-r border-b p-2 w-10">N°</th>
              <th rowspan="2" class="sticky left-10 z-30 bg-gray-50 border-r border-b p-2 min-w-[200px] text-left">Élève</th>
              <th v-for="m in matieres" :key="'h1-'+m._id" :colspan="getColSpan(m._id)" class="border-r border-b p-2 text-center uppercase font-bold bg-blue-50 text-blue-900">
                {{ m.nom }}
              </th>
              <th rowspan="2" class="border-r border-b p-2 bg-orange-50 text-orange-800 font-bold min-w-[65px]">Total Pond.</th>
              <th rowspan="2" class="border-b p-2 bg-gray-100 font-bold min-w-[60px]">MOY. GEN</th>
            </tr>
            <tr>
              <template v-for="m in matieres" :key="'h2-'+m._id">
                <th v-for="i in getMaxNotes(m._id)" :key="'n-'+m._id+'-'+i" class="border-r border-b p-1 text-[9px] font-normal text-gray-500 text-center w-8">
                  N{{ i }}
                </th>
                <th class="border-r border-b p-1 font-bold text-center bg-gray-50 w-10">Moy</th>
                <th class="border-r border-b p-1 font-bold text-center bg-yellow-50 text-yellow-800 w-12">Pond.</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in matrix" :key="row.eleveId" class="hover:bg-gray-50 transition-colors">
              <td class="sticky left-0 z-10 bg-white border-r border-b p-2 text-center">{{ idx + 1 }}</td>
              <td class="sticky left-10 z-10 bg-white border-r border-b p-2 font-bold whitespace-nowrap">
                {{ row.nom }} {{ row.prenom }}
              </td>
              <template v-for="m in matieres" :key="'r-'+row.eleveId+'-'+m._id">
                <td v-for="i in getMaxNotes(m._id)" :key="'rv-'+row.eleveId+'-'+m._id+'-'+i" class="border-r border-b p-1 text-center">
                  {{ row.matieres[m._id]?.notes[i-1] != null ? row.matieres[m._id].notes[i-1].toFixed(1) : '-' }}
                </td>
                <td class="border-r border-b p-1 text-center font-bold" :class="getMoyenneClass(row.matieres[m._id]?.moyenne)">
                  {{ row.matieres[m._id]?.moyenne != null ? row.matieres[m._id].moyenne.toFixed(2) : '-' }}
                </td>
                <td class="border-r border-b p-1 text-center bg-yellow-50 text-yellow-900 font-semibold">
                  {{ (row.matieres[m._id]?.moyenne != null && row.matieres[m._id]?.coeff) ? (row.matieres[m._id].moyenne * row.matieres[m._id].coeff).toFixed(2) : '-' }}
                </td>
              </template>
              <td class="border-r border-b p-2 text-center font-bold bg-orange-50 text-orange-900">
                {{ getTotalPond(row) }}
              </td>
              <td class="border-b p-2 text-center font-black bg-gray-50" :class="getMoyenneClass(row.moyenneGenerale)">
                {{ row.moyenneGenerale ? row.moyenneGenerale.toFixed(2) : '-' }}
              </td>
            </tr>
          </tbody>
          <tfoot class="sticky bottom-0 z-20 bg-gray-50 font-bold border-t-2 border-gray-300">
            <tr>
              <td colspan="2" class="sticky left-0 z-30 bg-gray-50 border-r p-2">MOYENNE DE CLASSE</td>
              <template v-for="m in matieres" :key="'f1-'+m._id">
                <td :colspan="getMaxNotes(m._id)" class="border-r"></td>
                <td class="border-r p-2 text-center bg-blue-100 text-blue-900">
                  {{ subjectStats[m._id]?.avg?.toFixed(2) || '-' }}
                </td>
                <td class="border-r p-2 text-center bg-yellow-50"></td>
              </template>
              <td class="border-r p-2 bg-orange-50"></td>
              <td class="p-2 text-center bg-blue-200 text-blue-950 text-sm">
                {{ overallStats?.classAverage?.toFixed(2) || '-' }}
              </td>
            </tr>
            <tr class="text-[10px] text-gray-600">
              <td colspan="2" class="sticky left-0 z-30 bg-gray-50 border-r p-1">Plus forte moyenne</td>
              <template v-for="m in matieres" :key="'f2-'+m._id">
                <td :colspan="getMaxNotes(m._id)" class="border-r"></td>
                <td class="border-r p-1 text-center bg-green-50">
                  {{ subjectStats[m._id]?.max?.toFixed(2) || '-' }}
                </td>
                <td class="border-r p-1 bg-yellow-50"></td>
              </template>
              <td class="border-r p-1 bg-orange-50"></td>
              <td class="p-1 text-center bg-green-100 text-green-900">
                {{ overallStats?.maxAverage?.toFixed(2) || '-' }}
              </td>
            </tr>
            <tr class="text-[10px] text-gray-600">
              <td colspan="2" class="sticky left-0 z-30 bg-gray-50 border-r p-1 border-b">Plus faible moyenne</td>
              <template v-for="m in matieres" :key="'f3-'+m._id">
                <td :colspan="getMaxNotes(m._id)" class="border-r border-b"></td>
                <td class="border-r border-b p-1 text-center bg-red-50">
                  {{ subjectStats[m._id]?.min?.toFixed(2) || '-' }}
                </td>
                <td class="border-r border-b p-1 bg-yellow-50"></td>
              </template>
              <td class="border-r border-b p-1 bg-orange-50"></td>
              <td class="border-b p-1 text-center bg-red-100 text-red-900">
                {{ overallStats?.minAverage?.toFixed(2) || '-' }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filters.classe && filters.classe !== 'all'" class="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
      <span class="material-symbols-outlined text-5xl text-gray-300 mb-4 block">inbox</span>
      <h2 class="text-xl font-bold text-gray-800">Aucune donnée trouvée</h2>
      <p class="text-gray-500">Aucune note validée n'a été trouvée pour les critères sélectionnés.</p>
    </div>

    <!-- Welcome State -->
    <div v-else-if="!filters.classe" class="bg-gray-50 p-12 rounded-xl border-2 border-dashed border-gray-200 text-center">
      <span class="material-symbols-outlined text-5xl text-gray-300 mb-4 block">table_chart</span>
      <h2 class="text-xl font-bold text-gray-400">Sélectionnez une classe pour commencer</h2>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineComponent, h } from 'vue';
import api, { BASE_ASSET_URL } from '@/services/api';
import { useToast } from '@/composables/useToast';

const { success, error: toastError } = useToast();

// Inline sub-component to render a single class table (for "all classes" view)
const ClassTable = defineComponent({
  props: ['sheet'],
  setup(props) {
    const getMaxNotes = (matiereId) => {
      let max = 0;
      props.sheet.matrix.forEach(row => {
        const n = row.matieres[matiereId]?.notes?.length || 0;
        if (n > max) max = n;
      });
      return max;
    };
    const getColSpan = (matiereId) => getMaxNotes(matiereId) + 2; // notes + Moy + Pond.
    const getMoyenneClass = (moy) => {
      if (moy === null || moy === undefined) return '';
      if (moy >= 10) return 'text-green-600';
      if (moy >= 7) return 'text-orange-600';
      return 'text-red-600';
    };
    return () => {
      const s = props.sheet;
      return h('table', { class: 'w-full border-collapse text-xs' }, [
        h('thead', { class: 'sticky top-0 z-20 bg-gray-50' }, [
          h('tr', [
            h('th', { rowspan: 2, class: 'sticky left-0 z-30 bg-gray-50 border-r border-b p-2 w-10' }, 'N°'),
            h('th', { rowspan: 2, class: 'sticky left-10 z-30 bg-gray-50 border-r border-b p-2 min-w-[180px] text-left' }, 'Élève'),
            ...s.matieres.map(m => h('th', { colspan: getColSpan(m._id), class: 'border-r border-b p-2 text-center uppercase font-bold bg-blue-50 text-blue-900' }, m.nom)),
            h('th', { rowspan: 2, class: 'border-r border-b p-2 bg-orange-50 text-orange-800 font-bold min-w-[65px]' }, 'Total Pond.'),
            h('th', { rowspan: 2, class: 'border-b p-2 bg-gray-100 font-bold min-w-[60px]' }, 'MOY. GEN'),
          ]),
          h('tr', s.matieres.flatMap(m => [
            ...Array.from({ length: getMaxNotes(m._id) }, (_, i) => h('th', { class: 'border-r border-b p-1 text-[9px] font-normal text-gray-500 text-center w-8' }, `N${i + 1}`)),
            h('th', { class: 'border-r border-b p-1 font-bold text-center bg-gray-50 w-10' }, 'Moy'),
            h('th', { class: 'border-r border-b p-1 font-bold text-center bg-yellow-50 text-yellow-800 w-12' }, 'Pond.'),
          ])),
        ]),
        h('tbody', s.matrix.map((row, idx) => h('tr', { class: 'hover:bg-gray-50' }, [
          h('td', { class: 'sticky left-0 z-10 bg-white border-r border-b p-2 text-center' }, idx + 1),
          h('td', { class: 'sticky left-10 z-10 bg-white border-r border-b p-2 font-bold whitespace-nowrap' }, `${row.nom} ${row.prenom}`),
          ...s.matieres.flatMap(m => {
            const sm = row.matieres[m._id];
            const pond = (sm?.moyenne != null && sm?.coeff) ? (sm.moyenne * sm.coeff).toFixed(2) : '-';
            return [
              ...Array.from({ length: getMaxNotes(m._id) }, (_, i) => h('td', { class: 'border-r border-b p-1 text-center' }, sm?.notes?.[i] != null ? sm.notes[i].toFixed(1) : '-')),
              h('td', { class: `border-r border-b p-1 text-center font-bold ${getMoyenneClass(sm?.moyenne)}` }, sm?.moyenne != null ? sm.moyenne.toFixed(2) : '-'),
              h('td', { class: 'border-r border-b p-1 text-center bg-yellow-50 text-yellow-900 font-semibold' }, pond),
            ];
          }),
          h('td', { class: 'border-r border-b p-2 text-center font-bold bg-orange-50 text-orange-900' }, (() => {
            let total = 0; let hasAny = false;
            s.matieres.forEach(m => { const sm = row.matieres[m._id]; if (sm?.moyenne != null && sm?.coeff) { total += sm.moyenne * sm.coeff; hasAny = true; } });
            return hasAny ? total.toFixed(2) : '-';
          })()),
          h('td', { class: `border-b p-2 text-center font-black bg-gray-50 ${getMoyenneClass(row.moyenneGenerale)}` }, row.moyenneGenerale ? row.moyenneGenerale.toFixed(2) : '-'),
        ]))),
        h('tfoot', { class: 'sticky bottom-0 z-20 bg-gray-50 font-bold border-t-2 border-gray-300' }, [
          h('tr', [
            h('td', { colspan: 2, class: 'sticky left-0 z-30 bg-gray-50 border-r p-2' }, 'MOYENNE DE CLASSE'),
            ...s.matieres.flatMap(m => [
              h('td', { colspan: getMaxNotes(m._id), class: 'border-r' }),
              h('td', { class: 'border-r p-2 text-center bg-blue-100 text-blue-900' }, s.subjectStats?.[m._id]?.avg?.toFixed(2) || '-'),
              h('td', { class: 'border-r p-2 bg-yellow-50' }),
            ]),
            h('td', { class: 'border-r p-2 bg-orange-50' }),
            h('td', { class: 'p-2 text-center bg-blue-200 text-blue-950' }, s.overallStats?.classAverage?.toFixed(2) || '-'),
          ]),
          h('tr', { class: 'text-[10px] text-gray-600' }, [
            h('td', { colspan: 2, class: 'sticky left-0 z-30 bg-gray-50 border-r p-1' }, 'Plus forte moyenne'),
            ...s.matieres.flatMap(m => [
              h('td', { colspan: getMaxNotes(m._id), class: 'border-r' }),
              h('td', { class: 'border-r p-1 text-center bg-green-50' }, s.subjectStats?.[m._id]?.max?.toFixed(2) || '-'),
              h('td', { class: 'border-r p-1 bg-yellow-50' }),
            ]),
            h('td', { class: 'border-r p-1 bg-orange-50' }),
            h('td', { class: 'p-1 text-center bg-green-100 text-green-900' }, s.overallStats?.maxAverage?.toFixed(2) || '-'),
          ]),
          h('tr', { class: 'text-[10px] text-gray-600' }, [
            h('td', { colspan: 2, class: 'sticky left-0 z-30 bg-gray-50 border-r p-1 border-b' }, 'Plus faible moyenne'),
            ...s.matieres.flatMap(m => [
              h('td', { colspan: getMaxNotes(m._id), class: 'border-r border-b' }),
              h('td', { class: 'border-r border-b p-1 text-center bg-red-50' }, s.subjectStats?.[m._id]?.min?.toFixed(2) || '-'),
              h('td', { class: 'border-r border-b p-1 bg-yellow-50' }),
            ]),
            h('td', { class: 'border-r border-b p-1 bg-orange-50' }),
            h('td', { class: 'border-b p-1 text-center bg-red-100 text-red-900' }, s.overallStats?.minAverage?.toFixed(2) || '-'),
          ]),
        ]),
      ]);
    };
  },
});

const filters = ref({
  classe: '',
  periode: 'Trimestre 1',
  anneeScolaire: '2025-2026'
});

const classes = ref([]);
const matieres = ref([]);
const matrix = ref([]);
const subjectStats = ref({});
const overallStats = ref(null);
const schoolConfig = ref({});

const availablePeriodes = computed(() => {
  if (!filters.value.classe || filters.value.classe === 'all') {
    return ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Semestre 1', 'Semestre 2'];
  }
  const selectedClass = classes.value.find(c => c._id === filters.value.classe);
  if (!selectedClass) return [];
  return selectedClass.filiere === 'Technique' 
    ? ['Semestre 1', 'Semestre 2'] 
    : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
});

watch(() => filters.value.classe, (newVal) => {
  if (newVal && newVal !== 'all') {
    const selectedClass = classes.value.find(c => c._id === newVal);
    if (selectedClass) {
      const periods = selectedClass.filiere === 'Technique' 
        ? ['Semestre 1', 'Semestre 2'] 
        : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
      if (!periods.includes(filters.value.periode)) {
        filters.value.periode = periods[0];
      }
    }
  }
});

const fetchSchoolConfig = async () => {
  try {
    const res = await api.getSchoolConfig();
    if (res.data.success && res.data.data) {
      schoolConfig.value = res.data.data.value || {};
    }
  } catch (err) {
    console.error('Failed to fetch school config', err);
  }
};

const fetchClasses = async () => {
  try {
    const res = await api.getClasses();
    classes.value = res.data.data;
  } catch (err) {
    console.error('Failed to load classes', err);
  }
};

const allClassesData = ref([]); // For "all" mode
const loading = ref(false);
const exporting = ref(false);

onMounted(() => {
  fetchClasses();
  fetchSchoolConfig();
});

const loadData = async () => {
  if (!filters.value.classe) return;

  loading.value = true;
  matrix.value = [];
  allClassesData.value = [];

  try {
    if (filters.value.classe === 'all') {
      // Load data for each class in parallel
      const results = await Promise.allSettled(
        classes.value.map(c =>
          api.getMasterSheetData(c._id, {
            periode: filters.value.periode,
            anneeScolaire: filters.value.anneeScolaire
          }).then(res => res.data.data)
        )
      );
      allClassesData.value = results
        .filter(r => r.status === 'fulfilled' && r.value.matrix?.length > 0)
        .map(r => r.value);
    } else {
      const res = await api.getMasterSheetData(filters.value.classe, {
        periode: filters.value.periode,
        anneeScolaire: filters.value.anneeScolaire
      });
      const { matieres: m, matrix: ma, subjectStats: s, overallStats: os } = res.data.data;
      matieres.value = m;
      matrix.value = ma;
      subjectStats.value = s;
      overallStats.value = os;
    }
  } catch (err) {
    console.error('Failed to load master sheet', err);
  } finally {
    loading.value = false;
  }
};

const getMaxNotes = (matiereId) => {
  let max = 0;
  matrix.value.forEach(row => {
    const n = row.matieres[matiereId]?.notes?.length || 0;
    if (n > max) max = n;
  });
  return max;
};

const getColSpan = (matiereId) => {
  return getMaxNotes(matiereId) + 2; // notes + Moy + Pond.
};

const getMoyenneClass = (moy) => {
  if (moy === null || moy === undefined) return '';
  if (moy >= 10) return 'text-green-600';
  if (moy >= 7) return 'text-orange-600';
  return 'text-red-600';
};

const getTotalPond = (row) => {
  let total = 0;
  let hasAny = false;
  matieres.value.forEach(m => {
    const sm = row.matieres[m._id];
    if (sm?.moyenne != null && sm?.coeff) {
      total += sm.moyenne * sm.coeff;
      hasAny = true;
    }
  });
  return hasAny ? total.toFixed(2) : '-';
};

const exportPDF = async () => {
  if (exporting.value) return;
  exporting.value = true;

  try {
    const res = await api.downloadMasterSheetPDF(filters.value.classe, {
      periode: filters.value.periode,
      anneeScolaire: filters.value.anneeScolaire
    });

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = filters.value.classe === 'all' ? 'Toutes_les_classes' : 'MasterSheet';
    link.download = `${fileName}_${filters.value.periode.replace(' ', '_')}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    success('Le PDF a été généré avec succès');
  } catch (err) {
    console.error('Export failed', err);
    toastError('Échec de la génération du PDF');
  } finally {
    exporting.value = false;
  }
};

const printSheet = () => {
  const printArea = document.getElementById('master-sheet-print-area');
  if (!printArea) return;

  const win = window.open('', '_blank', 'width=1400,height=900');
  
  const headerHtml = `
    <div class="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
      <div style="width: 30%; font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">
        <p style="margin: 0 0 2px 0;">${schoolConfig.value.region || 'LA FORMATION PROFESSIONNELLE ET TECHNIQUE'}</p>
        <p style="margin: 0 0 2px 0;">${schoolConfig.value.subRegion || 'RÉGION CENTRE'}</p>
        <p style="margin: 0 0 2px 0;">${schoolConfig.value.schoolName || 'LYCÉE WEND PUIRÉ DE SAABA'}</p>
      </div>
      <div style="width: 40%; display: flex; flex-direction: column; align-items: center; text-align: center;">
        ${schoolConfig.value.logo ? 
          `<img src="${BASE_ASSET_URL}${schoolConfig.value.logo}" style="height: 60px; max-width: 180px; object-fit: contain; margin-bottom: 5px;" />` : 
          `<div style="font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.05em;">${schoolConfig.value.shortName || 'LWS'}</div>`
        }
        ${schoolConfig.value.motto ? `<div style="font-size: 9px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px;">${schoolConfig.value.motto}</div>` : ''}
      </div>
      <div style="width: 30%; text-align: right; font-size: 10px; font-weight: bold; text-transform: uppercase; line-height: 1.2;">
        <p style="margin: 0 0 2px 0;">${schoolConfig.value.country || 'BURKINA FASO'}</p>
        <p style="font-size: 9px; font-style: italic; text-transform: none; font-weight: normal; margin: 0;">${schoolConfig.value.patrie || 'La Patrie ou la Mort, nous Vaincrons'}</p>
      </div>
    </div>
  `;

  win.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Récapitulatif des Notes - ${className} - ${filters.value.periode} ${filters.value.anneeScolaire}</title>
      <style>
        @page { size: A3 landscape; margin: 8mm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; margin: 0; color: #333; }
        /* Each class block = direct child div of the print area */
        #master-sheet-print-area > div { page-break-after: always; margin-bottom: 0; }
        #master-sheet-print-area > div:last-child { page-break-after: avoid; }
        /* Remove card styling for print */
        .overflow-x-auto { overflow: visible !important; max-height: none !important; }
        table { width: 100%; border-collapse: collapse; border: 1px solid #555; }
        th, td { border: 1px solid #555; padding: 2px 3px; text-align: center; font-size: 7.5px; }
        th { background: #f3f4f6 !important; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        /* Color preservation */
        .bg-blue-50 { background: #dbeafe !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-yellow-50 { background: #fef9c3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-orange-50 { background: #fff7ed !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-gray-50 { background: #f9fafb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-blue-100 { background: #dbeafe !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-blue-200 { background: #bfdbfe !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-green-50 { background: #f0fdf4 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-green-100 { background: #dcfce7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-red-50 { background: #fef2f2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .bg-red-100 { background: #fee2e2 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .text-green-600 { color: #16a34a !important; }
        .text-orange-600 { color: #ea580c !important; }
        .text-red-600 { color: #dc2626 !important; }
        .text-orange-800, .text-orange-900 { color: #9a3412 !important; }
        .text-yellow-800, .text-yellow-900 { color: #854d0e !important; }
        .font-bold, .font-black, .font-semibold { font-weight: bold; }
        .text-left { text-align: left; }
        .whitespace-nowrap { white-space: nowrap; }
        /* Flatten sticky/card styles */
        .sticky { position: static !important; }
        .rounded-xl, .shadow-sm { border-radius: 0; box-shadow: none; }
        /* Class header: keep blue bar but hide Material Icons span */
        .material-symbols-outlined { display: none; }
        /* Blue class header bar */
        .bg-blue-600 { background: #2563eb !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 4px 8px; font-weight: bold; font-size: 11px; }
        .text-blue-100 { color: #dbeafe !important; }
        .text-blue-900 { color: #1e3a8a !important; }
        .bg-blue-900 { background: #1e3a8a !important; }
      </style>
    </head>
    <body>
      ${headerHtml}
      <div style="text-align:center; margin-bottom: 10px; font-size: 13px; font-weight: bold; border-bottom: 2px solid #555; padding-bottom: 6px; padding-top: 4px;">
        RÉCAPITULATIF DES NOTES — ${className} — ${filters.value.periode} ${filters.value.anneeScolaire}
      </div>
      ${printArea.innerHTML}
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 500);
};
</script>

<style scoped>
.sticky {
  position: sticky;
}

thead th {
  background-clip: padding-box;
}

/* Custom scrollbar for better feel */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
