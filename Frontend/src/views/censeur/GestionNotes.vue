<template>
  <div class="gestion-notes-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Gestion des Notes</span>
      </nav>

      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Gestion des Notes</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base">Validez ou rejetez les notes soumises par les professeurs.</p>
        </div>
      </div>

        <!-- Filters -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Classe</label>
              <select 
                v-model="selectedClasse" 
                @change="onFilterChange"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes les classes</option>
                <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                  {{ classe.niveau }} {{ classe.section }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Matière</label>
              <select 
                v-model="selectedMatiere"
                @change="onFilterChange"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes les matières</option>
                <option v-for="matiere in availableMatieres" :key="matiere._id" :value="matiere._id">
                  {{ matiere.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Période</label>
              <select 
                v-model="selectedPeriode"
                @change="onFilterChange"
                class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes les périodes</option>
                <option v-for="periode in availablePeriodes" :key="periode" :value="periode">
                  {{ periode }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="text-center">
            <span class="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
            <p class="text-[#4e7397] mt-4">Chargement des notes...</p>
          </div>
        </div>

        <!-- Notes List -->
        <div v-else-if="pendingNotes.length > 0">
          <!-- Header with bulk actions -->
          <div class="flex justify-between items-center mb-4">
            <p class="text-[#4e7397] font-semibold">{{ pendingNotes.length }} note(s) en attente</p>
            <button 
              @click="validateAllNotes"
              :disabled="isValidatingAll"
              class="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span class="material-symbols-outlined">done_all</span>
              {{ isValidatingAll ? 'Validation en cours...' : 'Valider tout' }}
            </button>
          </div>

          <!-- Notes cards -->
          <div class="space-y-4">
          <div v-for="note in pendingNotes" :key="note._id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                <span class="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-full text-xs font-bold">
                  ⏳ En attente
                </span>
              </div>

              <div class="mb-4">
                <p class="text-sm font-semibold text-[#0e141b] dark:text-white mb-2">Élève: {{ note.eleve?.prenom }} {{ note.eleve?.nom }}</p>
                <p v-if="note.eleve?.matricule" class="text-xs text-[#4e7397] dark:text-slate-400">Matricule: {{ note.eleve?.matricule }}</p>
                <div class="flex gap-4 flex-wrap">
                  <div v-for="(noteItem, index) in note.notes" :key="index" class="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                    <span class="text-xs text-[#4e7397]">{{ noteItem.type }}</span>
                    <p class="text-lg font-bold text-primary">{{ noteItem.valeur }}/20</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button 
                  @click="validateNote(note._id)"
                  class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined">check_circle</span>
                  Valider
                </button>
                <button 
                  @click="openRejectModal(note)"
                  class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined">cancel</span>
                  Rejeter
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">task_alt</span>
          <p class="text-[#4e7397] text-lg">Aucune note en attente de validation</p>
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
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const classes = ref([]);
const matieres = ref([]);
const pendingNotes = ref([]);
const allPendingNotes = ref([]); // Toutes les notes en attente pour filtrage

// Options de filtres disponibles (filtrées dynamiquement)
const availableMatieres = ref([]);
const availablePeriodes = ref([]);

const selectedClasse = ref('');
const selectedMatiere = ref('');
const selectedPeriode = ref('');

const isLoading = ref(false);
const isValidatingAll = ref(false);
const showRejectModal = ref(false);
const rejectReason = ref('');
const selectedNoteForReject = ref(null);

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
    const res = await api.getPendingNotes({});
    if (res.data.success) {
      allPendingNotes.value = res.data.data;
      updateAvailableFilters();
    }
  } catch (error) {
    console.error('Erreur chargement toutes les notes:', error);
  }
};

// Mettre à jour les options de filtres disponibles basées sur les notes en attente
const updateAvailableFilters = () => {
  const notes = allPendingNotes.value;
  
  // Filtrer les matières disponibles selon la classe sélectionnée
  if (selectedClasse.value) {
    const matieresInClasse = new Set(
      notes
        .filter(note => note.classe?._id === selectedClasse.value)
        .map(note => note.matiere?._id)
    );
    availableMatieres.value = matieres.value.filter(m => matieresInClasse.has(m._id));
  } else {
    // Si aucune classe sélectionnée, montrer toutes les matières qui ont des notes en attente
    const matieresWithNotes = new Set(notes.map(note => note.matiere?._id));
    availableMatieres.value = matieres.value.filter(m => matieresWithNotes.has(m._id));
  }
  
  // Filtrer les périodes disponibles selon classe et matière sélectionnées
  let filteredNotes = notes;
  if (selectedClasse.value) {
    filteredNotes = filteredNotes.filter(note => note.classe?._id === selectedClasse.value);
  }
  if (selectedMatiere.value) {
    filteredNotes = filteredNotes.filter(note => note.matiere?._id === selectedMatiere.value);
  }
  
  const periodesWithNotes = new Set(filteredNotes.map(note => note.periode));
  availablePeriodes.value = Array.from(periodesWithNotes).sort();
};

const loadPendingNotes = async () => {
  isLoading.value = true;

  try {
    const params = {};
    if (selectedClasse.value) params.classe = selectedClasse.value;
    if (selectedMatiere.value) params.matiere = selectedMatiere.value;
    if (selectedPeriode.value) params.periode = selectedPeriode.value;

    console.log('Chargement notes avec filtres:', params);
    const res = await api.getPendingNotes(params);
    console.log('Notes reçues:', res.data);
    
    if (res.data.success) {
      pendingNotes.value = res.data.data;
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

const openRejectModal = (note) => {
  selectedNoteForReject.value = note;
  rejectReason.value = '';
  showRejectModal.value = true;
};

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    return;
  }

  try {
    await api.rejectNote(selectedNoteForReject.value._id, {
      motifRejet: rejectReason.value
    });
    alert('Note rejetée. Le professeur sera notifié.');
    showRejectModal.value = false;
    loadPendingNotes();
  } catch (error) {
    console.error('Erreur rejet note:', error);
    alert('Erreur lors du rejet de la note');
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
