<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <router-link to="/admin/notes" class="text-[#4e7397] hover:text-primary transition-colors">
              <span class="material-symbols-outlined">arrow_back</span>
            </router-link>
            <h1 class="text-3xl font-black text-[#0e141b] dark:text-white">Saisie de Notes</h1>
          </div>
          <p class="text-[#4e7397] dark:text-slate-400 ml-10">Saisir des notes directement. Les notes seront validées automatiquement.</p>
        </div>
        <div class="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800 text-sm font-medium">
          <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
          Saisie Admin · Validation automatique
        </div>
      </div>

      <!-- Sélection du professeur (optionnelle) -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-[#0e141b] dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">person</span>
            1. Professeur <span class="text-slate-400 font-normal text-sm">(optionnel)</span>
          </h2>
          <button
            v-if="selectedProf"
            @click="clearProf"
            class="text-xs text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <span class="material-symbols-outlined text-sm">close</span>
            Effacer
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">
              Saisir au nom d'un professeur
            </label>
            <select
              v-model="selectedProf"
              @change="onProfChange"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white"
            >
              <option value="">— Aucun (saisie en mon nom d'Admin) —</option>
              <option v-for="prof in professeurs" :key="prof._id" :value="prof._id">
                {{ prof.prenom }} {{ prof.nom }}
              </option>
            </select>
          </div>
          <div class="flex items-center gap-3 p-3 rounded-lg border" :class="selectedProf
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'">
            <span class="material-symbols-outlined" :class="selectedProf ? 'text-blue-600' : 'text-slate-400'">info</span>
            <p class="text-sm" :class="selectedProf ? 'text-blue-800 dark:text-blue-200' : 'text-slate-500 dark:text-slate-400'">
              <template v-if="selectedProf">
                Notes enregistrées <strong>au nom de {{ profSelectionne?.prenom }} {{ profSelectionne?.nom }}</strong>,
                validées par vous (Admin).
              </template>
              <template v-else>
                Le bulletin affichera le <strong>professeur officiel de la matière</strong> (affecté dans la classe). Si aucun prof n'est affecté, votre nom apparaîtra.
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Filtres classe/matière/période -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 class="text-lg font-bold text-[#0e141b] dark:text-white mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">tune</span>
          2. Classe, Matière et Période
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Classe *</label>
            <select
              v-model="selectedClasse"
              @change="onClasseChange"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white"
            >
              <option value="">Sélectionner une classe</option>
              <option v-for="classe in classesDisponibles" :key="classe._id" :value="classe._id">
                {{ classe.niveau }} {{ classe.section }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Matière *</label>
            <select
              v-model="selectedMatiere"
              @change="onMatiereChange"
              :disabled="!selectedClasse"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white disabled:opacity-50"
            >
              <option value="">Sélectionner une matière</option>
              <option v-for="matiere in matieresDisponibles" :key="matiere._id" :value="matiere._id">
                {{ matiere.nom }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Période *</label>
            <select
              v-model="selectedPeriode"
              @change="loadData"
              :disabled="!selectedMatiere"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white disabled:opacity-50"
            >
              <option value="">Sélectionner une période</option>
              <option v-for="p in periodes" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="showAddEvalModal = true"
              :disabled="!selectedClasse || !selectedMatiere || !selectedPeriode"
              class="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">add</span>
              Ajouter Évaluation
            </button>
          </div>
        </div>
      </div>

      <!-- Tableau des notes -->
      <div v-if="selectedClasse && selectedMatiere && selectedPeriode" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center">
            <div>
              <div class="flex items-center gap-3">
                <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">3. Saisie des notes</h2>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">admin_panel_settings</span>
                  Validation directe
                </span>
              </div>
              <p class="text-sm text-[#4e7397] mt-1">{{ eleves.length }} élève(s) · {{ evaluations.length }} évaluation(s)</p>
            </div>
            <button
              @click="saveAndValidateAllNotes"
              :disabled="isSaving || evaluations.length === 0"
              class="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span class="material-symbols-outlined">{{ isSaving ? 'hourglass_empty' : 'check_circle' }}</span>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer et Valider' }}
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="p-8 text-center">
          <p class="text-[#4e7397]">Chargement...</p>
        </div>

        <div v-else-if="eleves.length === 0" class="p-8 text-center">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">school</span>
          <p class="text-[#4e7397]">Aucun élève dans cette classe</p>
        </div>

        <div v-else-if="evaluations.length === 0" class="p-8 text-center border-t border-slate-200 dark:border-slate-800">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">assignment</span>
          <p class="text-[#4e7397] mb-4">Aucune évaluation créée pour cette période</p>
          <button
            @click="showAddEvalModal = true"
            class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            <span class="material-symbols-outlined">add</span>
            Créer une évaluation
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-bold text-[#0e141b] dark:text-white sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">Élève</th>
                <th
                  v-for="evaluation in evaluations"
                  :key="evaluation._id"
                  class="px-4 py-3 text-center text-sm font-bold text-[#0e141b] dark:text-white min-w-[140px]"
                >
                  <div class="flex items-center justify-center gap-2">
                    <span>{{ evaluation.nom }}</span>
                    <button
                      @click="deleteEvaluation(evaluation._id)"
                      class="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Supprimer cette évaluation"
                    >
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3 text-center text-sm font-bold text-primary min-w-[100px]">Moyenne</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="eleve in eleves" :key="eleve._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3 text-sm font-medium text-[#0e141b] dark:text-white sticky left-0 bg-white dark:bg-slate-900">
                  <p>{{ eleve.prenom }} {{ eleve.nom }}</p>
                  <p class="text-xs text-[#4e7397]">{{ eleve.matricule }}</p>
                </td>
                <td
                  v-for="evaluation in evaluations"
                  :key="evaluation._id"
                  class="px-4 py-3 text-center"
                >
                  <input
                    v-model.number="notesData[eleve._id][evaluation.nom]"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    class="w-20 px-2 py-1 text-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="-"
                  />
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-lg font-bold text-primary">{{ calculateMoyenne(eleve._id) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Note de bas de page -->
        <div class="p-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-200 dark:border-amber-800">
          <div class="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
            <span class="material-symbols-outlined text-sm mt-0.5">warning</span>
            <p>
              Ces notes seront immédiatement enregistrées en statut <strong>VALIDÉE</strong>
              <template v-if="selectedProf"> au nom de <strong>{{ profSelectionne?.prenom }} {{ profSelectionne?.nom }}</strong></template>
              <template v-else>. Le bulletin affichera le <strong>professeur officiel de la matière</strong> tel qu'il est affecté dans la classe</template>.
              Cette action ne peut être annulée que par un administrateur.
            </p>
          </div>
        </div>
      </div>

      <!-- Message initial -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">edit_note</span>
        <p class="text-[#4e7397] text-lg">Sélectionnez une classe, une matière et une période pour commencer</p>
        <p class="text-sm text-slate-400 mt-2">Le professeur est optionnel — si non renseigné, les notes seront en votre nom</p>
      </div>
    </div>

    <!-- Modal Ajouter Évaluation -->
    <AjouterEvaluationModal
      :show="showAddEvalModal"
      :matiere="selectedMatiere"
      :classe="selectedClasse"
      :periode="selectedPeriode"
      :professeur="selectedProf || undefined"
      @close="showAddEvalModal = false"
      @created="onEvaluationCreated"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      confirm-text="Oui, valider"
      cancel-text="Annuler"
      type="warning"
      @confirm="executeConfirmAction"
      @cancel="showConfirmModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import AjouterEvaluationModal from '@/components/modals/AjouterEvaluationModal.vue';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';
import { useToast } from '@/composables/useToast';

const { success, error, warning } = useToast();

// State
const professeurs = ref([]);
const selectedProf = ref('');
const allClasses = ref([]); // toutes les classes (admin)
const classesProf = ref([]); // classes du prof sélectionné

const matieresDisponibles = ref([]);
const allClasseMatieres = ref([]); // affectations toutes classes

const selectedClasse = ref('');
const selectedMatiere = ref('');
const selectedPeriode = ref('');
const periodes = ref([]);

const eleves = ref([]);
const evaluations = ref([]);
const notesData = ref({});

const isLoading = ref(false);
const isSaving = ref(false);
const showAddEvalModal = ref(false);

const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const pendingAction = ref(null);

// Classes affichées selon si un prof est sélectionné ou non
const classesDisponibles = computed(() =>
  selectedProf.value ? classesProf.value : allClasses.value
);

// Computed
const profSelectionne = computed(() =>
  professeurs.value.find(p => p._id === selectedProf.value)
);

// Génère un matricule de fallback si absent
const generateMatricule = (student, index) => {
  if (student.matricule && student.matricule !== 'N/A' && student.matricule !== '-') return student.matricule;
  const year = new Date().getFullYear();
  const namePart = `${student.nom?.slice(0, 3).toUpperCase() || 'ELV'}${student.prenom?.slice(0, 3).toUpperCase() || 'ELE'}`;
  return `${year}-${namePart}${String(index + 1).padStart(3, '0')}`;
};

// Chargement initial : toutes les classes + tous les profs
const loadInitialData = async () => {
  try {
    const [profsRes, classesRes, classMatieresRes] = await Promise.all([
      api.getUsers({ role: 'PROFESSEUR' }),
      api.getClasses(),
      api.getAllGlobalClasseMatieres()
    ]);
    if (profsRes.data.success) professeurs.value = profsRes.data.data;
    if (classesRes.data.success) allClasses.value = classesRes.data.data;
    if (classMatieresRes.data.success) allClasseMatieres.value = classMatieresRes.data.data;
  } catch (err) {
    console.error('Erreur chargement données initiales:', err);
  }
};

// Quand un prof est sélectionné, filtrer ses classes
const onProfChange = async () => {
  selectedClasse.value = '';
  selectedMatiere.value = '';
  selectedPeriode.value = '';
  classesProf.value = [];
  matieresDisponibles.value = [];
  eleves.value = [];
  evaluations.value = [];

  if (!selectedProf.value) return;

  try {
    const res = await api.getProfesseurAffectations(selectedProf.value);
    if (res.data.success && Array.isArray(res.data.data)) {
      const classesMap = new Map();
      res.data.data.forEach(affectation => {
        if (affectation.classe && !classesMap.has(affectation.classe._id)) {
          classesMap.set(affectation.classe._id, affectation.classe);
        }
      });
      classesProf.value = Array.from(classesMap.values());
    }
  } catch (err) {
    console.error('Erreur chargement affectations prof:', err);
    error('Impossible de charger les classes de ce professeur');
  }
};

const clearProf = () => {
  selectedProf.value = '';
  classesProf.value = [];
  onProfChange();
};

const onClasseChange = async () => {
  selectedMatiere.value = '';
  selectedPeriode.value = '';
  eleves.value = [];
  evaluations.value = [];
  matieresDisponibles.value = [];

  if (!selectedClasse.value) return;

  // Définir les périodes selon la filière
  const classe = classesDisponibles.value.find(c => c._id === selectedClasse.value);
  const filiere = classe?.filiere || 'Générale';
  periodes.value = filiere === 'Générale'
    ? ['Trimestre 1', 'Trimestre 2', 'Trimestre 3']
    : ['Semestre 1', 'Semestre 2'];

  // Charger les matières de cette classe
  try {
    let matieres = [];
    if (selectedProf.value) {
      // Matières du prof pour cette classe (via ses affectations)
      const res = await api.getProfesseurAffectations(selectedProf.value);
      if (res.data.success) {
        const matSet = new Map();
        res.data.data
          .filter(a => a.classe?._id === selectedClasse.value)
          .forEach(a => {
            if (a.matiere && !matSet.has(a.matiere._id)) matSet.set(a.matiere._id, a.matiere);
          });
        matieres = Array.from(matSet.values());
      }
    } else {
      // Toutes les matières de la classe
      const res = await api.getClasseMatieres(selectedClasse.value);
      if (res.data.success) {
        matieres = res.data.data.map(cm => cm.matiere).filter(Boolean);
      }
    }
    matieresDisponibles.value = matieres;
  } catch (err) {
    console.error('Erreur chargement matières:', err);
  }
};

const onMatiereChange = () => {
  selectedPeriode.value = '';
  eleves.value = [];
  evaluations.value = [];
};

const loadData = async () => {
  if (!selectedClasse.value || !selectedMatiere.value || !selectedPeriode.value) return;

  isLoading.value = true;
  try {
    // Charger les élèves
    const elevesRes = await api.getUsers({ classe: selectedClasse.value, role: 'ELEVE' });
    if (elevesRes.data.success) {
      eleves.value = elevesRes.data.data.map((s, i) => ({ ...s, matricule: generateMatricule(s, i) }));
    }

    // Charger les évaluations (colonnes)
    const evalsRes = await api.getNoteColumns({
      classe: selectedClasse.value,
      matiere: selectedMatiere.value,
      periode: selectedPeriode.value
    });
    evaluations.value = evalsRes.data.success ? evalsRes.data.data : [];

    // Initialiser la grille
    const tempData = {};
    eleves.value.forEach(eleve => {
      tempData[eleve._id] = {};
      evaluations.value.forEach(ev => { tempData[eleve._id][ev.nom] = null; });
    });

    // Charger les notes existantes
    const notesQuery = {
      classe: selectedClasse.value,
      matiere: selectedMatiere.value,
      periode: selectedPeriode.value
    };
    if (selectedProf.value) notesQuery.professeur = selectedProf.value;

    const notesRes = await api.getNotes(notesQuery);
    if (notesRes.data.success) {
      notesRes.data.data.forEach(noteDoc => {
        const eleveId = noteDoc.eleve?._id || noteDoc.eleve;
        if (tempData[eleveId]) {
          noteDoc.notes.forEach(n => { tempData[eleveId][n.type] = n.valeur; });
        }
      });
    }

    notesData.value = tempData;
  } catch (err) {
    console.error('Erreur chargement données:', err);
    error('Erreur lors du chargement des données');
  } finally {
    isLoading.value = false;
  }
};

const calculateMoyenne = (eleveId) => {
  const notes = notesData.value[eleveId];
  if (!notes) return '-';
  const valid = Object.values(notes).filter(n => n !== null && n !== '');
  if (valid.length === 0) return '-';
  return (valid.reduce((a, b) => a + parseFloat(b), 0) / valid.length).toFixed(2);
};

const deleteEvaluation = async (evalId) => {
  confirmModalTitle.value = 'Supprimer l\'évaluation ?';
  confirmModalMessage.value = 'Supprimer cette évaluation ? Toutes les notes associées seront supprimées.';
  pendingAction.value = async () => {
    try {
      await api.deleteNoteColumn(evalId);
      success('Évaluation supprimée');
      await loadData();
    } catch (err) {
      error('Erreur lors de la suppression');
    }
  };
  showConfirmModal.value = true;
};

const executeConfirmAction = async () => {
  if (pendingAction.value) await pendingAction.value();
  showConfirmModal.value = false;
  pendingAction.value = null;
};

const saveAndValidateAllNotes = () => {
  if (evaluations.value.length === 0) {
    warning('Veuillez d\'abord créer au moins une évaluation');
    return;
  }
  const auteur = selectedProf.value
    ? `au nom de ${profSelectionne.value?.prenom} ${profSelectionne.value?.nom}`
    : 'en votre nom (Administrateur)';
  confirmModalTitle.value = 'Enregistrer et valider les notes ?';
  confirmModalMessage.value = `Ces notes seront enregistrées ${auteur} et immédiatement validées. Elles seront incluses dans les bulletins. Confirmez-vous ?`;
  pendingAction.value = doSaveAndValidate;
  showConfirmModal.value = true;
};

const doSaveAndValidate = async () => {
  isSaving.value = true;
  let savedCount = 0;
  let errorCount = 0;

  try {
    for (const eleve of eleves.value) {
      const elevesNotes = notesData.value[eleve._id];
      const notesArray = [];

      evaluations.value.forEach(evaluation => {
        const val = elevesNotes[evaluation.nom];
        if (val !== null && val !== '') {
          notesArray.push({ valeur: parseFloat(val), type: evaluation.nom, coefficient: 1 });
        }
      });

      if (notesArray.length === 0) continue;

      // Vérifier si une note existe déjà
      const existingRes = await api.getNotes({
        eleve: eleve._id,
        matiere: selectedMatiere.value,
        periode: selectedPeriode.value
      });

      try {
        if (existingRes.data.data?.length > 0) {
          await api.updateNote(existingRes.data.data[0]._id, { notes: notesArray });
        } else {
          const payload = {
            eleve: eleve._id,
            matiere: selectedMatiere.value,
            classe: selectedClasse.value,
            periode: selectedPeriode.value,
            notes: notesArray
          };
          // Ajouter le professeur seulement s'il est sélectionné
          if (selectedProf.value) payload.professeurId = selectedProf.value;

          await api.createNotes(payload);
        }
        savedCount++;
      } catch (err) {
        console.error(`Erreur pour l'élève ${eleve.nom}:`, err.response?.data || err);
        errorCount++;
      }
    }

    if (savedCount > 0) success(`${savedCount} notes enregistrées et validées avec succès !`);
    if (errorCount > 0) warning(`${errorCount} note(s) n'ont pas pu être enregistrées.`);

    await loadData();
  } catch (err) {
    console.error('Erreur sauvegarde:', err);
    error('Erreur lors de l\'enregistrement des notes');
  } finally {
    isSaving.value = false;
  }
};

const onEvaluationCreated = () => loadData();

onMounted(() => {
  loadInitialData();
});
</script>
