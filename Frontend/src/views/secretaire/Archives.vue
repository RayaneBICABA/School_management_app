<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-50">
    <main class="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 py-8 gap-6">
      <!-- PageHeading -->
      <div class="flex flex-wrap justify-between items-end gap-3">
        <div class="flex flex-col gap-1">
          <h1 class="text-[#0e141b] dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">Archives Bulletins</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base font-normal">Consultez et imprimez les bulletins des années antérieures.</p>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <!-- Year Selection -->
        <div class="flex flex-col gap-1 w-full md:w-48">
          <label class="text-xs font-bold text-slate-500 uppercase">Année Scolaire</label>
          <select v-model="filters.annee" @change="fetchData" class="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 text-sm font-medium focus:ring-2 ring-primary/50 text-slate-700 dark:text-slate-200">
            <option v-for="annee in annees" :key="annee" :value="annee">{{ annee }}</option>
          </select>
        </div>

        <!-- Period Selection -->
        <div class="flex flex-col gap-1 w-full md:w-48">
          <label class="text-xs font-bold text-slate-500 uppercase">Période</label>
          <select v-model="filters.periode" @change="fetchData" class="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 text-sm font-medium focus:ring-2 ring-primary/50 text-slate-700 dark:text-slate-200">
            <option value="Trimestre 1">Trimestre 1</option>
            <option value="Trimestre 2">Trimestre 2</option>
            <option value="Trimestre 3">Trimestre 3</option>
            <option value="Semestre 1">Semestre 1</option>
            <option value="Semestre 2">Semestre 2</option>
          </select>
        </div>

        <!-- Search Box -->
        <div class="flex-1 w-full">
          <label class="text-xs font-bold text-slate-500 uppercase mb-1 block">Recherche Éléve</label>
          <div class="flex w-full items-stretch rounded-lg h-11 bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
            <div class="text-[#4e7397] flex items-center justify-center px-4">
              <span class="material-symbols-outlined">search</span>
            </div>
            <input v-model="searchQuery" class="flex-1 border-none bg-transparent text-[#0e141b] dark:text-slate-50 focus:ring-0 px-2 text-sm placeholder:text-[#4e7397]" placeholder="Nom ou matricule..." />
          </div>
        </div>

         <!-- Class Filter (Optional) -->
        <div class="flex flex-col gap-1 w-full md:w-48">
            <label class="text-xs font-bold text-slate-500 uppercase">Classe (Optionnel)</label>
            <select v-model="selectedClass" class="w-full h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 text-sm font-medium focus:ring-2 ring-primary/50 text-slate-700 dark:text-slate-200">
                <option value="">Toutes les classes</option>
                <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.niveau }} {{ c.section }}</option>
            </select>
        </div>

        <button @click="fetchData" class="h-11 px-6 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
            <span class="material-symbols-outlined">refresh</span>
            Actualiser
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <span class="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
      </div>

      <!-- Content: Class List -->
      <div v-else class="flex flex-col gap-6 pb-10">
        <div v-if="filteredClassesData.length === 0" class="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">folder_off</span>
            <p class="text-slate-500 text-lg">Aucun bulletin trouvé pour cette période.</p>
            <p class="text-slate-400 text-sm">Essayez de changer les filtres ou l'année scolaire.</p>
        </div>

        <div v-for="group in filteredClassesData" :key="group.classe._id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <!-- Class Header -->
            <div 
                @click="toggleClasse(group.classe._id)"
                class="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <div class="flex items-center gap-4">
                    <div class="size-10 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                        {{ group.classe.niveau.substring(0,2).toUpperCase() }}{{ group.classe.section.substring(0,1) }}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">{{ group.classe.niveau }} {{ group.classe.section }}</h3>
                        <p class="text-xs text-[#4e7397] dark:text-slate-400">
                            {{ group.bulletins.length }} bulletins trouvés
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                     <button 
                        @click.stop="downloadClassPDF(group)"
                        class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors z-10"
                        title="Télécharger tous les bulletins de la classe"
                    >
                        <span class="material-symbols-outlined text-sm">download</span>
                        PDF Classe
                    </button>
                    <span class="material-symbols-outlined text-slate-400 transition-transform duration-300" :class="{ 'rotate-180': expandedClasses[group.classe._id] }">expand_more</span>
                </div>
            </div>

            <!-- Bulletins List (Accordion Content) -->
            <div v-show="expandedClasses[group.classe._id]" class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th class="px-6 py-3 font-semibold">Matricule</th>
                            <th class="px-6 py-3 font-semibold">Élève</th>
                            <th class="px-6 py-3 font-semibold">Moyenne</th>
                            <th class="px-6 py-3 font-semibold">Rang</th>
                            <th class="px-6 py-3 font-semibold">Mention</th>
                            <th class="px-6 py-3 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr v-for="bulletin in group.bulletins" :key="bulletin._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td class="px-6 py-3 text-sm font-medium text-slate-500">{{ bulletin.eleve.matricule || '-' }}</td>
                            <td class="px-6 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                {{ bulletin.eleve.nom }} {{ bulletin.eleve.prenom }}
                            </td>
                            <td class="px-6 py-3 text-sm font-bold" :class="getGradeColor(bulletin.moyenneGenerale)">
                                {{ bulletin.moyenneGenerale ? bulletin.moyenneGenerale.toFixed(2) : '-' }}
                            </td>
                            <td class="px-6 py-3 text-sm text-slate-600 dark:text-slate-400">
                                {{ bulletin.rang ? bulletin.rang + 'e' : '-' }}
                            </td>
                              <td class="px-6 py-3 text-sm italic">
                                <span v-if="bulletin.signatureProviseur" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[10px] font-bold">
                                  <span class="material-symbols-outlined text-[12px]">verified</span>
                                  Validé
                                </span>
                                <span v-else class="text-slate-400 dark:text-slate-500 text-[10px]">
                                  Non signé
                                </span>
                            </td>
                            <td class="px-6 py-3 text-right">
                                <div class="flex items-center gap-2 justify-end">
                                    <button 
                                        @click="viewBulletin(bulletin)"
                                        class="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors"
                                        title="Prévisualiser le bulletin"
                                    >
                                        <span class="material-symbols-outlined">visibility</span>
                                    </button>
                                    <button 
                                        v-if="bulletin.signatureProviseur"
                                        @click="downloadBulletin(bulletin._id)"
                                        class="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
                                        title="Télécharger le PDF"
                                    >
                                        <span class="material-symbols-outlined">download</span>
                                    </button>
                                    <div v-else class="text-[10px] italic text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded" title="Non signé par le Proviseur">
                                        Non signé
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </main>

    <!-- Bulletin Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 z-[100] overflow-y-auto no-print">
        <BulletinTemplate 
            :bulletin="selectedBulletinData" 
            :eleve="selectedBulletinData.eleve" 
            :classe="selectedBulletinData.classe"
            :is-student-view="false"
            @close="showPreview = false"
            @download="() => downloadBulletin(selectedBulletinData._id)"
        />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';
import { handlePDFAction } from '@/utils/pdfHelpers';
import BulletinTemplate from '@/components/bulletin/BulletinTemplate.vue';

const isLoading = ref(false);
const classes = ref([]);
const classesData = ref([]); // { classe: Object, bulletins: Array }
const expandedClasses = ref({});
const searchQuery = ref('');
const selectedClass = ref('');
const annees = ref([]);
const showPreview = ref(false);
const selectedBulletinData = ref(null);

const filters = ref({
    annee: '2025-2026',
    periode: 'Trimestre 1'
});

const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate last 5 years
    for (let i = 0; i < 5; i++) {
        years.push(`${currentYear - i}-${currentYear - i + 1}`);
    }
    // Also add previous one just in case we are at start of year/overlap
    years.push(`${currentYear - 1}-${currentYear}`);
    
    // Deduplicate and Sort
    const uniqueYears = [...new Set(years)].sort().reverse();
    annees.value = uniqueYears;
    
    // Set default if exists
    if (uniqueYears.length > 1) {
         filters.value.annee = uniqueYears[1]; // Usually prefer current academic year
    } else if (uniqueYears.length > 0) {
        filters.value.annee = uniqueYears[0];
    }
};

const toggleClasse = (classeId) => {
    expandedClasses.value[classeId] = !expandedClasses.value[classeId];
};

const getGradeColor = (grade) => {
    if (grade === undefined || grade === null) return 'text-slate-400';
    if (grade >= 10) return 'text-green-600 dark:text-green-400';
    if (grade >= 7) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
};

const fetchData = async () => {
    if (!filters.value.annee || !filters.value.periode) return;

    try {
        isLoading.value = true;
        classesData.value = []; // Reset

        // 1. Fetch Classes (Optimization: could cache this)
        if (classes.value.length === 0) {
            const classesRes = await api.getClasses();
            if (classesRes.data.success) {
                classes.value = classesRes.data.data;
            }
        }

        // 2. Fetch bulletins for each class
        // We fetch for all classes for the selected period/year
        const promises = classes.value.map(async (classe) => {
             try {
                const res = await api.getBulletinsByClasse(classe._id, {
                    anneeScolaire: filters.value.annee,
                    periode: filters.value.periode
                });
                
                const bulletins = res.data.data || [];
                
                // Only return if there are bulletins (archives view shouldn't show empty classes usually)
                if (bulletins.length > 0) {
                    return {
                        classe,
                        bulletins
                    };
                }
                return null;
             } catch (e) {
                 // console.error(e);
                 return null;
             }
        });

        const results = await Promise.all(promises);
        classesData.value = results.filter(r => r !== null);
        
    } catch (error) {
        console.error("Erreur chargement archives:", error);
    } finally {
        isLoading.value = false;
    }
};

const filteredClassesData = computed(() => {
    let data = classesData.value;

    if (selectedClass.value) {
        data = data.filter(group => group.classe._id === selectedClass.value);
    }

    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        data = data.map(group => {
            const matchingBulletins = group.bulletins.filter(b => 
                (b.eleve.nom && b.eleve.nom.toLowerCase().includes(query)) ||
                (b.eleve.prenom && b.eleve.prenom.toLowerCase().includes(query)) ||
                (b.eleve.matricule && b.eleve.matricule.toLowerCase().includes(query))
            );

            if (matchingBulletins.length > 0) {
                expandedClasses.value[group.classe._id] = true; // Auto expand when searching
                return { ...group, bulletins: matchingBulletins };
            }
            return null;
        }).filter(g => g !== null);
    }
    
    return data;
});

const downloadBulletin = (id) => {
    handlePDFAction(id, `Bulletin_Archive_${id}.pdf`, 'download');
};

const viewBulletin = (bulletin) => {
    selectedBulletinData.value = bulletin;
    showPreview.value = true;
};

const downloadClassPDF = async (group) => {
    try {
        const response = await api.downloadClassBulletins(group.classe._id, {
            anneeScolaire: filters.value.annee,
            periode: filters.value.periode
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
         // Clean filename
        const safePeriod = filters.value.periode.replace(/\s+/g, '-');
        link.setAttribute('download', `bulletins-archive-${group.classe.niveau}-${group.classe.section}-${safePeriod}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Download error", error);
        alert("Erreur lors du téléchargement. Assurez-vous que tous les bulletins sont validés.");
    }
};

onMounted(() => {
    generateYears();
    fetchData();
});
</script>
