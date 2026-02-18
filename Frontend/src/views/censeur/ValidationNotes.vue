<template>
  <div class="validation-notes-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Validation des Notes</span>
      </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Validation des Notes</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Validez ou rejetez les notes soumises par les professeurs.</p>
      </div>
    </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-[#4e7397]">En attente</span>
            <span class="material-symbols-outlined text-yellow-500">pending_actions</span>
          </div>
          <p class="text-3xl font-bold text-yellow-600">{{ stats.enAttente }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-[#4e7397]">Validées</span>
            <span class="material-symbols-outlined text-green-500">check_circle</span>
          </div>
          <p class="text-3xl font-bold text-green-600">{{ stats.validees }}</p>
        </div>
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-[#4e7397]">Rejetées</span>
            <span class="material-symbols-outlined text-red-500">cancel</span>
          </div>
          <p class="text-3xl font-bold text-red-600">{{ stats.rejetees }}</p>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Classe</label>
            <select v-model="filters.classe" @change="loadNotes" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Toutes les classes</option>
              <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                {{ classe.niveau }} {{ classe.section }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Matière</label>
            <select v-model="filters.matiere" @change="loadNotes" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Toutes les matières</option>
              <option v-for="matiere in matieres" :key="matiere._id" :value="matiere._id">
                {{ matiere.nom }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Période</label>
            <select v-model="filters.periode" @change="loadNotes" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Toutes les périodes</option>
              <option value="Trimestre 1">Trimestre 1</option>
              <option value="Trimestre 2">Trimestre 2</option>
              <option value="Trimestre 3">Trimestre 3</option>
              <option value="Semestre 1">Semestre 1</option>
              <option value="Semestre 2">Semestre 2</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Statut</label>
            <select v-model="filters.statut" @change="loadNotes" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validée</option>
              <option value="REJETEE">Rejetée</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Liste des notes -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Notes à valider</h2>
          <p class="text-sm text-[#4e7397] mt-1">{{ notes.length }} note(s) trouvée(s)</p>
        </div>

        <div v-if="isLoading" class="p-8 text-center">
          <p class="text-[#4e7397]">Chargement...</p>
        </div>

        <div v-else-if="notes.length === 0" class="p-8 text-center">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">check_circle</span>
          <p class="text-[#4e7397]">Aucune note à valider</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Élève</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Classe</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Matière</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Période</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Professeur</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#0e141b] dark:text-white">Notes</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-primary">Moyenne</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#0e141b] dark:text-white">Statut</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-[#0e141b] dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="note in notes" :key="note._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-[#0e141b] dark:text-white">
                  {{ note.eleve?.prenom }} {{ note.eleve?.nom }}
                </td>
                <td class="px-6 py-4 text-sm text-[#4e7397]">
                  {{ note.classe?.niveau }} {{ note.classe?.section }}
                </td>
                <td class="px-6 py-4 text-sm text-[#4e7397]">{{ note.matiere?.nom }}</td>
                <td class="px-6 py-4 text-sm text-[#4e7397]">{{ note.periode }}</td>
                <td class="px-6 py-4 text-sm text-[#4e7397]">
                  {{ note.professeur?.prenom }} {{ note.professeur?.nom }}
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex justify-center gap-2">
                    <span v-for="(n, index) in note.notes" :key="index" class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold">
                      {{ n.valeur }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-lg font-bold text-primary">{{ calculateMoyenne(note.notes) }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="getStatutClass(note.statut)" class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ getStatutLabel(note.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      v-if="note.statut === 'EN_ATTENTE'" 
                      @click="openValidateModal(note)" 
                      class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                      title="Valider"
                    >
                      <span class="material-symbols-outlined">check_circle</span>
                    </button>
                    <button 
                      v-if="note.statut === 'EN_ATTENTE'" 
                      @click="openRejectModal(note)" 
                      class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Rejeter"
                    >
                      <span class="material-symbols-outlined">cancel</span>
                    </button>
                    <button 
                      @click="viewDetails(note)" 
                      class="p-2 text-[#4e7397] hover:text-primary transition-colors"
                      title="Détails"
                    >
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Rejet -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeRejectModal">
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-800">
        <h3 class="text-xl font-bold text-[#0e141b] dark:text-white mb-4">Rejeter la note</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Motif du rejet</label>
          <textarea 
            v-model="rejectMotif" 
            rows="4" 
            class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white"
            placeholder="Expliquez pourquoi vous rejetez cette note..."
          ></textarea>
        </div>
        <div class="flex gap-3 justify-end">
          <button @click="closeRejectModal" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-[#0e141b] dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Annuler
          </button>
          <button @click="confirmReject" :disabled="!rejectMotif" class="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
            Rejeter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const notes = ref([]);
const classes = ref([]);
const matieres = ref([]);
const isLoading = ref(false);
const showRejectModal = ref(false);
const selectedNote = ref(null);
const rejectMotif = ref('');

const filters = ref({
  classe: '',
  matiere: '',
  periode: '',
  statut: 'EN_ATTENTE'
});

const stats = computed(() => {
  return {
    enAttente: notes.value.filter(n => n.statut === 'EN_ATTENTE').length,
    validees: notes.value.filter(n => n.statut === 'VALIDEE').length,
    rejetees: notes.value.filter(n => n.statut === 'REJETEE').length
  };
});

const loadNotes = async () => {
  isLoading.value = true;
  try {
    const params = {};
    if (filters.value.classe) params.classe = filters.value.classe;
    if (filters.value.matiere) params.matiere = filters.value.matiere;
    if (filters.value.periode) params.periode = filters.value.periode;
    if (filters.value.statut) params.statut = filters.value.statut;

    const res = await api.getNotes(params);
    if (res.data.success) {
      notes.value = res.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement notes:', error);
  } finally {
    isLoading.value = false;
  }
};

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

const calculateMoyenne = (notesArray) => {
  if (!notesArray || notesArray.length === 0) return '-';
  const sum = notesArray.reduce((acc, n) => acc + n.valeur, 0);
  return (sum / notesArray.length).toFixed(2);
};

const openValidateModal = async (note) => {
  if (!confirm(`Valider la note de ${note.eleve?.prenom} ${note.eleve?.nom} en ${note.matiere?.nom} ?\n\nMoyenne: ${calculateMoyenne(note.notes)}/20`)) {
    return;
  }

  try {
    await api.validateNote(note._id);
    alert('Note validée avec succès !');
    loadNotes();
  } catch (error) {
    console.error('Erreur validation note:', error);
    alert('Erreur lors de la validation de la note');
  }
};

const openRejectModal = (note) => {
  selectedNote.value = note;
  rejectMotif.value = '';
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  selectedNote.value = null;
  rejectMotif.value = '';
};

const confirmReject = async () => {
  if (!rejectMotif.value) return;

  try {
    await api.rejectNote(selectedNote.value._id, rejectMotif.value);
    alert('Note rejetée avec succès !');
    closeRejectModal();
    loadNotes();
  } catch (error) {
    console.error('Erreur rejet note:', error);
    alert('Erreur lors du rejet de la note');
  }
};

const viewDetails = (note) => {
  const details = `
Élève: ${note.eleve?.prenom} ${note.eleve?.nom}
Classe: ${note.classe?.niveau} ${note.classe?.section}
Matière: ${note.matiere?.nom}
Période: ${note.periode}
Professeur: ${note.professeur?.prenom} ${note.professeur?.nom}

Notes:
${note.notes.map((n, i) => `${n.type}: ${n.valeur}/20`).join('\n')}

Moyenne: ${calculateMoyenne(note.notes)}/20
Statut: ${getStatutLabel(note.statut)}
${note.motifRejet ? `\nMotif de rejet: ${note.motifRejet}` : ''}
  `;
  alert(details);
};

const getStatutClass = (statut) => {
  switch (statut) {
    case 'VALIDEE': return 'bg-green-100 text-green-700';
    case 'REJETEE': return 'bg-red-100 text-red-700';
    case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutLabel = (statut) => {
  switch (statut) {
    case 'VALIDEE': return 'Validée';
    case 'REJETEE': return 'Rejetée';
    case 'EN_ATTENTE': return 'En attente';
    default: return 'Brouillon';
  }
};

onMounted(() => {
  loadNotes();
  loadClasses();
  loadMatieres();

  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
