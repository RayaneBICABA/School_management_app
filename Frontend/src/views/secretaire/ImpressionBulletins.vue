<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-100">
    <!-- Breadcrumbs -->
    <div class="px-8 pt-6">
      <div class="flex items-center gap-2 text-sm">
        <router-link to="/secretaire" class="text-[#4e7397] dark:text-slate-400 hover:text-primary font-medium">Secrétariat</router-link>
        <span class="text-slate-400 font-medium">/</span>
        <span class="text-[#0e141b] dark:text-slate-200 font-bold">Impression des Bulletins</span>
      </div>
    </div>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4 px-8 py-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Impression des Bulletins</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base font-normal">Liste des bulletins validés par le Proviseur pour l'édition papier.</p>
      </div>
      <div class="flex gap-3">
        <button class="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 transition-colors">
          <span class="material-symbols-outlined text-lg">history</span>
          Historique d'impression
        </button>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="px-8 pb-4">
      <div class="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div class="flex-1 w-full">
          <label class="flex flex-col w-full h-11">
            <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div class="text-[#4e7397] flex border-none bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
                <span class="material-symbols-outlined">search</span>
              </div>
              <input v-model="searchQuery" class="form-input flex w-full min-w-0 flex-1 border-none bg-slate-100 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-0 h-full placeholder:text-[#4e7397] px-4 rounded-r-lg text-sm font-normal" placeholder="Rechercher un élève par matricule ou nom..." />
            </div>
          </label>
        </div>
        <div class="flex flex-wrap gap-2 w-full md:w-auto">
          <!-- Année Scolaire Select -->
          <select v-model="selectedAnnee" class="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm h-11 px-4 text-slate-700 dark:text-slate-200 focus:ring-primary min-w-[120px]">
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>

          <!-- Période Select -->
          <select v-model="selectedPeriode" class="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm h-11 px-4 text-slate-700 dark:text-slate-200 focus:ring-primary min-w-[140px]">
             <option value="Trimestre 1">Trimestre 1</option>
             <option value="Trimestre 2">Trimestre 2</option>
             <option value="Trimestre 3">Trimestre 3</option>
             <option value="Semestre 1">Semestre 1</option>
             <option value="Semestre 2">Semestre 2</option>
          </select>

          <!-- Classe Select -->
          <select v-model="selectedClass" class="bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm h-11 px-4 text-slate-700 dark:text-slate-200 focus:ring-primary min-w-[160px]">
            <option value="">Toutes les classes</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">{{ c.niveau }} {{ c.section }}</option>
          </select>
          
          <button @click="fetchData" class="bg-primary text-white h-11 px-6 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
            <span class="material-symbols-outlined">refresh</span>
            Actualiser
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <span class="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
    </div>

    <!-- Content Area: Classes Groups -->
    <div v-else class="px-8 flex flex-col gap-8 pb-10">
      <div v-for="classeData in filteredClassesData" :key="classeData.classe._id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
          <div class="flex items-center gap-4">
            <div class="size-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
               {{ classeData.classe.niveau.includes('è') ? (classeData.classe.niveau[0] + 'e' + classeData.classe.section[0].toUpperCase()) : (classeData.classe.niveau.substring(0,2).toUpperCase() + classeData.classe.section[0].toUpperCase()) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">{{ classeData.classe.niveau }} {{ classeData.classe.section }}</h3>
                <span v-if="classeData.readiness && !classeData.readiness.isReady && classeData.signedByProviseurCount < classeData.totalStudents" 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      title="Classe en attente de complétion des évaluations">
                  <span class="size-1.5 rounded-full mr-1.5 bg-amber-500"></span>
                  Partiellement prête
                </span>
              </div>
              <p class="text-sm text-[#4e7397] dark:text-slate-400">
                {{ classeData.totalStudents }} élèves • Bulletins validés (Proviseur): {{ classeData.signedByProviseurCount }}/{{ classeData.totalStudents }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button 
                @click="downloadClassPDF(classeData)"
                class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="classeData.signedByProviseurCount === 0"
                :title="classeData.signedByProviseurCount === 0 ? 'Aucun bulletin validé' : 'Télécharger le fichier PDF'"
            >
              <span class="material-symbols-outlined text-lg">download</span>
              Télécharger
            </button>
            <button 
                @click="printClassPDF(classeData)"
                class="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="classeData.signedByProviseurCount === 0"
                :title="classeData.signedByProviseurCount === 0 ? 'Aucun bulletin validé' : 'Ouvrir pour impression'"
            >
              <span class="material-symbols-outlined text-lg">print</span>
              Imprimer
            </button>
            <button @click="toggleClasse(classeData.classe._id)" class="text-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <span>{{ expandedClasses[classeData.classe._id] ? 'Masquer' : 'Voir' }} la liste</span>
              <span class="material-symbols-outlined text-lg transition-transform" :class="{ 'rotate-180': expandedClasses[classeData.classe._id] }">expand_more</span>
            </button>
          </div>
        </div>
        <div v-show="expandedClasses[classeData.classe._id]" class="overflow-x-auto transition-all duration-300">
          <table class="w-full text-left">
            <thead class="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th class="px-6 py-3 font-semibold">Matricule</th>
                <th class="px-6 py-3 font-semibold">Nom & Prénoms</th>
                <th class="px-6 py-3 font-semibold">Moyenne Gén.</th>
                <th class="px-6 py-3 font-semibold">Statut</th>
                <th class="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="bulletin in classeData.bulletins" :key="bulletin._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">{{ bulletin.eleve.matricule || '-' }}</td>
                <td class="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{{ bulletin.eleve.nom }} {{ bulletin.eleve.prenom }}</td>
                <td class="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{{ bulletin.moyenneGenerale ? bulletin.moyenneGenerale.toFixed(2) : '-' }}</td>
                <td class="px-6 py-4">
                  <span v-if="bulletin.statut === 'DISTRIBUE'" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    <span class="size-1.5 rounded-full bg-green-500"></span>
                    Distribué
                  </span>
                   <span v-else-if="bulletin.statut === 'FINALISE'" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium" :class="bulletin.signatureProviseur ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'">
                    <span class="size-1.5 rounded-full" :class="bulletin.signatureProviseur ? 'bg-green-500' : 'bg-blue-500'"></span>
                    {{ bulletin.signatureProviseur ? 'Validé (Proviseur)' : 'Prêt (Signé Censeur)' }}
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    <span class="size-1.5 rounded-full bg-amber-500"></span>
                    {{ bulletin.statut }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div v-if="bulletin.statut === 'FINALISE' || bulletin.statut === 'DISTRIBUE'" class="flex items-center gap-2 justify-end">
                    <button 
                            @click="viewBulletin(bulletin)"
                            class="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 shadow-sm transition-all flex items-center gap-2"
                            title="Prévisualiser le bulletin">
                      <span class="material-symbols-outlined text-sm">visibility</span>
                      Voir
                    </button>
                    <button 
                            v-if="bulletin.signatureProviseur"
                            @click="downloadIndividualBulletin(bulletin._id, bulletin.eleve)"
                            class="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all flex items-center gap-2"
                            title="Télécharger le PDF">
                      <span class="material-symbols-outlined text-sm">download</span>
                      Télécharger
                    </button>
                    <button 
                            v-if="bulletin.signatureProviseur"
                            @click="printIndividualBulletin(bulletin._id, bulletin.eleve)"
                            class="bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 shadow-sm transition-all flex items-center gap-2"
                            title="Ouvrir pour impression">
                      <span class="material-symbols-outlined text-sm">print</span>
                      Imprimer
                    </button>
                    <div v-else class="text-[10px] italic text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded" title="En attente de signature du Proviseur">
                      Attente Proviseur
                    </div>
                  </div>
                   <button v-else class="text-slate-400 cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 ml-auto" disabled>
                    En attente
                  </button>
                </td>
              </tr>
              <tr v-if="classeData.bulletins.length === 0">
                  <td colspan="5" class="text-center py-4 text-slate-500">Aucun bulletin trouvé pour cette classe.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-if="classesData.length === 0" class="text-center py-10">
        <p class="text-slate-500 text-lg">Aucune donnée de classe disponible.</p>
      </div>
    </div>

    <!-- Bulletin Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 z-[100] overflow-y-auto no-print">
        <BulletinTemplate 
            :bulletin="selectedBulletinData" 
            :eleve="selectedBulletinData.eleve" 
            :classe="selectedBulletinData.classe"
            :is-student-view="false"
            @close="showPreview = false"
            @download="() => printBulletin(selectedBulletinData._id, selectedBulletinData.eleve)"
        />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { handlePDFAction } from '@/utils/pdfHelpers';
import BulletinTemplate from '@/components/bulletin/BulletinTemplate.vue';

const route = useRoute();
const isLoading = ref(true);
const classes = ref([]);
const classesData = ref([]); // Holds combined data of class + its bulletins
const expandedClasses = ref({});
const searchQuery = ref('');
const selectedClass = ref('');
const selectedPeriode = ref('Trimestre 1');
const selectedAnnee = ref('2025-2026');
const showPreview = ref(false);
const selectedBulletinData = ref(null);
const currentUser = ref(null);

const fetchAcademicConfig = async () => {
    try {
        const res = await api.getSetting('academic_year_config');
        if (res.data.success && res.data.data?.value) {
            selectedAnnee.value = res.data.data.value.year || '2025-2026';
            // Default to first period in list if available, or stay with Trimestre 1
            if (res.data.data.value.periods && res.data.data.value.periods.length > 0) {
                // Find the currently active period if possible, otherwise first one
                const now = new Date();
                const activePeriod = res.data.data.value.periods.find(p => 
                    new Date(p.start) <= now && new Date(p.end) >= now
                );
                selectedPeriode.value = activePeriod ? activePeriod.name : res.data.data.value.periods[0].name;
            }
        }
    } catch (error) {
        console.error('Error fetching academic config:', error);
    }
};

const toggleClasse = (classeId) => {
  expandedClasses.value[classeId] = !expandedClasses.value[classeId];
};

const filteredClassesData = computed(() => {
    let data = classesData.value;

    // Filter by Class Selection
    if (selectedClass.value) {
        data = data.filter(c => c.classe._id === selectedClass.value);
    }

    // Filter by Search Query (Student Name or Matricule)
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        data = data.map(group => {
            const matchedBulletins = group.bulletins.filter(b => 
                (b.eleve.matricule && b.eleve.matricule.toLowerCase().includes(query)) ||
                (b.eleve.nom && b.eleve.nom.toLowerCase().includes(query)) ||
                (b.eleve.prenom && b.eleve.prenom.toLowerCase().includes(query))
            );
            
            // Return group only if it has matched bulletins
            if (matchedBulletins.length > 0) {
                 // Clone group to avoid mutation of original data, but keep same reference to class object if possible
                 // Auto-expand if searching
                 expandedClasses.value[group.classe._id] = true;

                return {
                    ...group,
                    bulletins: matchedBulletins,
                };
            }
            return null;
        }).filter(group => group !== null);
    }

    return data;
});

const downloadIndividualBulletin = (bulletinId, eleve) => {
    const filename = `Bulletin_${eleve.nom}_${eleve.prenom}.pdf`;
    handlePDFAction(bulletinId, filename, 'download');
};

const printIndividualBulletin = (bulletinId, eleve) => {
    const filename = `Bulletin_${eleve.nom}_${eleve.prenom}.pdf`;
    handlePDFAction(bulletinId, filename, 'view');
};

const viewBulletin = (bulletin) => {
    selectedBulletinData.value = bulletin;
    showPreview.value = true;
};

// Common validation check for printing/downloading
const validatePrint = (classeData) => {
    if (classeData.signedByProviseurCount === 0) {
        alert("Impossible d'imprimer : Aucun bulletin n'a été validé par le Proviseur.");
        return false;
    }

    if (classeData.signedByProviseurCount !== classeData.totalStudents) {
        if (!confirm(`Attention : Tous les bulletins ne sont pas encore validés (${classeData.signedByProviseurCount}/${classeData.totalStudents}). Voulez-vous imprimer uniquement les bulletins validés ?`)) {
            return false;
        }
    }
    return true;
};

const downloadClassPDF = async (classeData) => {
    if (!validatePrint(classeData)) return;
    
    try {
        const response = await api.downloadClassBulletins(classeData.classe._id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `bulletins-${classeData.classe.niveau}-${classeData.classe.section}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error("Erreur téléchargement PDF classe", error);
        alert("Erreur lors du téléchargement des bulletins.");
    }
};

const printClassPDF = async (classeData) => {
    if (!validatePrint(classeData)) return;

    try {
        const response = await api.downloadClassBulletins(classeData.classe._id);
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        // Open PDF in new tab, allowing user to print from there
        window.open(fileURL, '_blank');
    } catch (error) {
        console.error("Erreur impression PDF classe", error);
        alert("Erreur lors de la préparation de l'impression.");
    }
};

const fetchData = async () => {
    try {
        isLoading.value = true;
        
        // 1. Get class readiness status from validation stats API
        const validationStatsRes = await api.getValidationPageStats();
        const classReadinessMap = {};
        
        if (validationStatsRes.data.success) {
            const classesData = validationStatsRes.data.data.classes || [];
            classesData.forEach(c => {
                classReadinessMap[c.id] = {
                    isReady: c.statut === 'Prêt',
                    statut: c.statut,
                    bulletinsCount: c.bulletinsCount || 0,
                    signedCount: c.signedCount || 0
                };
            });
        }
        
        // 2. Get all classes
        const classesRes = await api.getClasses();
        if (classesRes.data.success) {
             classes.value = classesRes.data.data;
        }

        // 3. For each class, get bulletins and filter based on readiness
        const dataPromises = classes.value.map(async (classe) => {
            try {
                // Get students count
                const usersRes = await api.getUsers({ classe: classe._id, role: 'ELEVE' });
                const totalStudents = usersRes.data.count || 0;

                // Get bulletins with filters
                const bulletinsRes = await api.getBulletinsByClasse(classe._id, {
                    periode: selectedPeriode.value,
                    anneeScolaire: selectedAnnee.value
                });
                const bulletins = bulletinsRes.data.data || [];
                
                const signedByProviseurCount = bulletins.filter(b => b.signatureProviseur).length;
                
                // Get readiness status for this class
                const readiness = classReadinessMap[classe._id] || { 
                    isReady: false, 
                    statut: 'En attente',
                    bulletinsCount: bulletins.length,
                    signedCount: signedByProviseurCount
                };

                // FILTER LOGIC: Only show class if:
                // 1. Class is "ready" (2+ evaluations per subject), OR
                // 2. At least one bulletin is signed by proviseur (already validated)
                const shouldShow = readiness.isReady || signedByProviseurCount > 0;

                if (!shouldShow) {
                    return null; // Hide this class
                }

                return {
                    classe,
                    totalStudents,
                    signedByProviseurCount,
                    bulletins,
                    readiness // Include readiness info for UI display
                };
            } catch (err) {
                console.error(`Error fetching data for class ${classe.niveau}`, err);
                return null;
            }
        });

        const results = await Promise.all(dataPromises);
        classesData.value = results.filter(r => r !== null);
        
        // Expand the requested class from query param if exists
        if (route.query.classe) {
            expandedClasses.value[route.query.classe] = true;
        }

    } catch (error) {
        console.error('Erreur chargement données:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchAcademicConfig();
    await fetchData();

    // Add Material Symbols font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add Lexend font
    const lexendLink = document.createElement('link');
    lexendLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap';
    lexendLink.rel = 'stylesheet';
    document.head.appendChild(lexendLink);

    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: 'Lexend', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    `;
    document.head.appendChild(style);
});

// Re-fetch when filters change
import { watch } from 'vue';
watch([selectedPeriode, selectedAnnee, selectedClass], () => {
    fetchData();
});
</script>
