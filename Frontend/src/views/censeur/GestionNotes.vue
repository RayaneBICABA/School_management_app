<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-[1200px] mx-auto p-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] font-display">
            Supervision des Notes
          </h1>
          <p class="text-[#4e7397] dark:text-slate-400 mt-2 text-lg">
            Validation et suivi des notes du corps professoral
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 mb-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Classe</label>
          <select 
            v-model="selectedClasse" 
            @change="onFilterChange"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes les classes</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.niveau }} {{ c.section }}
            </option>
          </select>
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Matière</label>
          <select 
            v-model="selectedMatiere" 
            @change="onFilterChange"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes les matières</option>
            <option v-for="m in availableMatieres" :key="m._id" :value="m._id">
              {{ m.nom }}
            </option>
          </select>
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Période</label>
          <select 
            v-model="selectedPeriode" 
            @change="onFilterChange"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes les périodes</option>
            <option v-for="p in availablePeriodes" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[300px]">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-[#4e7397]">Chargement des notes...</p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div v-else>
        
        <!-- Tabs -->
        <div class="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6 font-display">
          <button 
            @click="activeTab = 'pending'"
            class="px-6 py-3 font-bold text-sm transition-colors border-b-2"
            :class="activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            En attente ({{ pendingNotes.length }})
          </button>
          <button 
            @click="activeTab = 'validated'"
            class="px-6 py-3 font-bold text-sm transition-colors border-b-2"
            :class="activeTab === 'validated' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Validées
          </button>
        </div>

        <!-- Notes List (Pending) -->
        <template v-if="activeTab === 'pending'">
          <div v-if="groupedPendingNotes.length > 0">
            <!-- Header with bulk actions -->
            <div class="flex justify-between items-center mb-4">
              <p class="text-[#4e7397] font-semibold">{{ groupedPendingNotes.length }} lot(s) de notes en attente</p>
              <button 
                @click="validateAllNotes"
                :disabled="isValidatingAll"
                class="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-symbols-outlined">done_all</span>
                {{ isValidatingAll ? 'Validation en cours...' : 'Valider tout' }}
              </button>
            </div>

            <!-- Notes cards grouped -->
            <div class="space-y-6">
              <div v-for="group in groupedPendingNotes" :key="group.id" class="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden border-l-4 border-l-amber-500">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span class="material-symbols-outlined text-amber-500">folder_open</span>
                        <h3 class="text-xl font-bold text-[#0e141b] dark:text-white">
                          {{ group.classe?.niveau }} {{ group.classe?.section }} - {{ group.matiere?.nom }}
                        </h3>
                      </div>
                      <p class="text-sm text-[#4e7397]">
                        Professeur: {{ group.professeur?.prenom }} {{ group.professeur?.nom }} • {{ group.periode }}
                      </p>
                    </div>
                    <div class="flex flex-col items-end gap-2">
                       <span class="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-full text-xs font-bold">
                        ⏳ {{ group.count }} élève(s) en attente
                      </span>
                    </div>
                  </div>

                  <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Aperçu des élèves</p>
                    <div class="flex flex-wrap gap-2">
                      <span v-for="(eleve, idx) in group.eleves.slice(0, 5)" :key="eleve?._id" class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
                        {{ eleve?.nom }} {{ eleve?.prenom }}
                      </span>
                      <span v-if="group.count > 5" class="px-2 py-1 text-xs text-slate-400 font-medium">
                        + {{ group.count - 5 }} autres...
                      </span>
                    </div>
                  </div>

                  <div class="flex gap-3 mt-4">
                    <button 
                      @click="validateBulk(group)"
                      class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span class="material-symbols-outlined text-[18px]">done_all</span>
                      Valider le lot
                    </button>
                    <button 
                      @click="openRejectModal(group, true)"
                      class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span class="material-symbols-outlined text-[18px]">block</span>
                      Rejeter le lot
                    </button>
                    <router-link
                      :to="{ name: getDetailRouteName(), query: { classe: group.classe?._id, matiere: group.matiere?._id, periode: group.periode } }"
                      class="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      title="Voir les détails complets"
                    >
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                      Voir détails
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Empty State -->
          <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">task_alt</span>
            <p class="text-[#4e7397] text-lg">Aucune note en attente de validation pour ces critères.</p>
          </div>
        </template>

        <!-- Notes List (Validated) -->
        <template v-else-if="activeTab === 'validated'">
          <div v-if="validatedNotes.length > 0">
            <div class="flex justify-between items-center mb-4">
              <p class="text-[#4e7397] font-semibold">{{ validatedNotes.length }} note(s) validée(s)</p>
            </div>
            <!-- Notes cards -->
            <div class="space-y-4">
              <div v-for="note in validatedNotes" :key="note._id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">
                        {{ note.classe?.niveau }} {{ note.classe?.section }} - {{ note.matiere?.nom }}
                      </h3>
                      <p class="text-sm text-[#4e7397] mt-1">
                        Professeur: {{ note.professeur?.prenom }} {{ note.professeur?.nom }} • {{ note.periode }}
                      </p>
                    </div>
                    <span class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-bold">
                      ✅ Validée
                    </span>
                  </div>

                  <div class="mb-4 flex gap-4 flex-wrap">
                      <div class="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span class="text-sm font-semibold text-[#0e141b] dark:text-white">Détails de la matière</span>
                      </div>
                  </div>

                  <div class="flex gap-3">
                    <router-link
                      :to="{ name: getDetailRouteName(), query: { classe: note.classe?._id, matiere: note.matiere?._id, periode: note.periode } }"
                      class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 w-full"
                      title="Voir les détails et/ou débloquer"
                    >
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                      Voir les détails / Débloquer
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Empty State -->
          <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">task_alt</span>
            <p class="text-[#4e7397] text-lg">Aucune note validée pour ces critères.</p>
          </div>
        </template>

      </div>

      <!-- Reject Modal -->
      <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showRejectModal = false">
        <div class="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-bold text-[#0e141b] dark:text-white mb-4">Rejeter la note</h3>
          <div class="mb-4">
            <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Motif du rejet</label>
            <textarea 
              v-model="rejectReason"
              rows="4"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
              placeholder="Expliquez pourquoi vous rejetez cette note..."
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button 
              @click="showRejectModal = false"
              class="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-[#0e141b] dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="confirmReject"
              :disabled="!rejectReason.trim()"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

const user = JSON.parse(localStorage.getItem('user') || '{}');
const userRole = user.role;

const getDetailRouteName = () => {
  if (userRole === 'PROVISEUR') return 'ProviseurDetailNotesMatiere';
  if (userRole === 'CENSEUR') return 'CenseurDetailNotesMatiere';
  return 'AdminDetailNotesMatiere';
};

const route = useRoute();
const router = useRouter();

const classes = ref([]);
const matieres = ref([]);
const pendingNotes = ref([]);
const validatedNotes = ref([]);
const allPendingNotes = ref([]); // Toutes les notes en attente pour filtrage
const allValidatedNotes = ref([]); // Toutes les notes pour extraire filtres

const activeTab = ref(route.query.tab || 'pending');

// Options de filtres disponibles (filtrées dynamiquement)
const availableMatieres = ref([]);
const availablePeriodes = ref([]);

const selectedClasse = ref(route.query.classe || '');
const selectedMatiere = ref(route.query.matiere || '');
const selectedPeriode = ref(route.query.periode || '');

const isLoading = ref(false);
const isValidatingAll = ref(false);
const showRejectModal = ref(false);
const rejectReason = ref('');
const selectedNoteForReject = ref(null);
const isBulkReject = ref(false);

const groupedPendingNotes = computed(() => {
  const groups = new Map();
  pendingNotes.value.forEach(note => {
    const key = `${note.classe?._id}-${note.matiere?._id}-${note.periode}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        classe: note.classe,
        matiere: note.matiere,
        professeur: note.professeur,
        periode: note.periode,
        count: 0,
        eleves: []
      });
    }
    const group = groups.get(key);
    group.count++;
    group.eleves.push(note.eleve);
  });
  return Array.from(groups.values());
});

// Mettre à jour l'URL quand les filtres ou l'onglet changent
const updateQueryParams = () => {
  const query = {
    ...route.query,
    tab: activeTab.value,
    classe: selectedClasse.value || undefined,
    matiere: selectedMatiere.value || undefined,
    periode: selectedPeriode.value || undefined
  };
  router.replace({ query });
};

watch([activeTab, selectedClasse, selectedMatiere, selectedPeriode], () => {
  updateQueryParams();
});

const loadClasses = async () => {
  try {
    const res = await api.getClasses();
    if (res.data.success) {
      classes.value = res.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement classes:', error);
  }
};

const loadMatieres = async () => {
  try {
    const res = await api.getMatieres();
    if (res.data.success) {
      matieres.value = res.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement matières:', error);
  }
};

// Charger toutes les notes en attente pour extraire les filtres disponibles
const loadAllPendingNotes = async () => {
  try {
    const [pendingRes, validatedRes] = await Promise.all([
      api.getPendingNotes({}),
      api.getNotes({ statut: 'VALIDEE' })
    ]);
    if (pendingRes.data.success) {
      allPendingNotes.value = pendingRes.data.data;
    }
    if (validatedRes.data.success) {
      allValidatedNotes.value = validatedRes.data.data;
      // Dédoublonner par classe-matière-période pour la vue "Validées" afin d'éviter les répétitions par élève
      const uniqueValidatedMap = new Map();
      validatedRes.data.data.forEach(note => {
        const key = `${note.classe?._id}-${note.matiere?._id}-${note.periode}`;
        if (!uniqueValidatedMap.has(key)) {
          uniqueValidatedMap.set(key, note);
        }
      });
      validatedNotes.value = Array.from(uniqueValidatedMap.values());
    }
    updateAvailableFilters();
  } catch (error) {
    console.error('Erreur chargement toutes les notes:', error);
  }
};

// Mettre à jour les options de filtres disponibles basées sur les notes en attente
const updateAvailableFilters = () => {
  const notes = allPendingNotes.value;
  
  // Filtrer les matières disponibles selon la classe sélectionnée
  if (selectedClasse.value) {
    const selectedClassObj = classes.value.find(c => c._id === selectedClasse.value);
    
    const matieresInClasse = new Set(
      notes
        .filter(note => note.classe?._id === selectedClasse.value)
        .map(note => note.matiere?._id)
    );
    availableMatieres.value = matieres.value.filter(m => matieresInClasse.has(m._id));

    // Mettre à jour les périodes basées sur la filière de la classe
    if (selectedClassObj) {
      availablePeriodes.value = selectedClassObj.filiere === 'Technique'
        ? ['Semestre 1', 'Semestre 2']
        : ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
      
      // Si la période sélectionnée n'est plus valide, la réinitialiser
      if (selectedPeriode.value && !availablePeriodes.value.includes(selectedPeriode.value)) {
        selectedPeriode.value = '';
      }
    }
  } else {
    // Si aucune classe sélectionnée, montrer toutes les matières qui ont des notes en attente
    const matieresWithNotes = new Set(notes.map(note => note.matiere?._id));
    availableMatieres.value = matieres.value.filter(m => matieresWithNotes.has(m._id));
    
    // Montrer toutes les périodes possibles
    availablePeriodes.value = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Semestre 1', 'Semestre 2'];
  }
};

const loadPendingNotes = async () => {
  isLoading.value = true;

  try {
    const params = {};
    if (selectedClasse.value) params.classe = selectedClasse.value;
    if (selectedMatiere.value) params.matiere = selectedMatiere.value;
    if (selectedPeriode.value) params.periode = selectedPeriode.value;

    console.log('Chargement notes avec filtres:', params);
    const [pendingRes, validatedRes] = await Promise.all([
       api.getPendingNotes(params),
       api.getNotes({ ...params, statut: 'VALIDEE' })
    ]);
    
    if (pendingRes.data.success) {
      pendingNotes.value = pendingRes.data.data;
    }
    
    if (validatedRes.data.success) {
      const uniqueValidatedMap = new Map();
      validatedRes.data.data.forEach(note => {
        const key = `${note.classe?._id}-${note.matiere?._id}-${note.periode}`;
        if (!uniqueValidatedMap.has(key)) {
          uniqueValidatedMap.set(key, note);
        }
      });
      validatedNotes.value = Array.from(uniqueValidatedMap.values());
    }
  } catch (error) {
    console.error('Erreur chargement notes en attente:', error);
  } finally {
    isLoading.value = false;
  }
};

const onFilterChange = () => {
  console.log('Filtres changés:', {
    classe: selectedClasse.value,
    matiere: selectedMatiere.value,
    periode: selectedPeriode.value
  });
  
  // Réinitialiser les filtres dépendants si nécessaire
  if (!selectedClasse.value) {
    selectedMatiere.value = '';
    selectedPeriode.value = '';
  }
  
  // Mettre à jour les options disponibles
  updateAvailableFilters();
  
  // Charger les notes filtrées
  loadPendingNotes();
};

const validateNote = async (noteId) => {
  if (!confirm('Valider cette note ?')) {
    return;
  }

  try {
    await api.validateNote(noteId);
    alert('Note validée avec succès !');
    loadPendingNotes();
  } catch (error) {
    console.error('Erreur validation note:', error);
    alert('Erreur lors de la validation de la note');
  }
};

const validateBulk = async (group) => {
  if (!confirm(`Valider les notes de ${group.count} élèves pour ${group.matiere.nom} (${group.classe.niveau} ${group.classe.section}) ?`)) {
    return;
  }

  try {
    await api.validateNotesBulk({
      classe: group.classe._id,
      matiere: group.matiere._id,
      periode: group.periode
    });
    alert('Notes validées avec succès !');
    loadPendingNotes();
  } catch (err) {
    console.error('Erreur validation en masse:', err);
    alert('Erreur lors de la validation en masse');
  }
};

const validateAllNotes = async () => {
  if (!pendingNotes.value.length) {
    return;
  }

  const count = pendingNotes.value.length;
  if (!confirm(`Valider toutes les ${count} note(s) affichée(s) ?`)) {
    return;
  }

  isValidatingAll.value = true;

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const note of pendingNotes.value) {
      try {
        await api.validateNote(note._id);
        successCount++;
      } catch (error) {
        console.error(`Erreur validation note ${note._id}:`, error);
        errorCount++;
      }
    }

    if (errorCount > 0) {
      alert(`${successCount} note(s) validée(s) avec succès. ${errorCount} erreur(s).`);
    } else {
      alert(`Toutes les ${successCount} note(s) ont été validées avec succès !`);
    }

    loadPendingNotes();
  } catch (error) {
    console.error('Erreur validation en masse:', error);
    alert('Erreur lors de la validation en masse');
  } finally {
    isValidatingAll.value = false;
  }
};

const openRejectModal = (note, bulk = false) => {
  selectedNoteForReject.value = note;
  isBulkReject.value = bulk;
  rejectReason.value = '';
  showRejectModal.value = true;
};

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    return;
  }

  try {
    if (isBulkReject.value) {
      await api.rejectNotesBulk({
        classe: selectedNoteForReject.value.classe._id,
        matiere: selectedNoteForReject.value.matiere._id,
        periode: selectedNoteForReject.value.periode,
        motifRejet: rejectReason.value
      });
    } else {
      await api.rejectNote(selectedNoteForReject.value._id, {
        motifRejet: rejectReason.value
      });
    }
    alert('Lot rejeté. Le professeur sera notifié.');
    showRejectModal.value = false;
    loadPendingNotes();
  } catch (error) {
    console.error('Erreur rejet:', error);
    alert('Erreur lors du rejet');
  }
};

onMounted(() => {
  loadClasses();
  loadMatieres();
  loadAllPendingNotes(); // Charger toutes les notes pour initialiser les filtres
  loadPendingNotes();

  // Load Material Symbols font
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
