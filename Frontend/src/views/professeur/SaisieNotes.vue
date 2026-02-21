<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-[#0e141b] dark:text-white mb-2">Saisie des Notes</h1>
        <p class="text-[#4e7397] dark:text-slate-400">Gérez les évaluations et notes de vos élèves</p>
      </div>

      <!-- Filtres -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Classe</label>
            <select v-model="selectedClasse" @change="onClasseChange" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Sélectionner une classe</option>
              <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                {{ classe.niveau }} {{ classe.section }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Matière</label>
            <select v-model="selectedMatiere" @change="onMatiereChange" :disabled="!selectedClasse" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white disabled:opacity-50">
              <option value="">Sélectionner une matière</option>
              <option v-for="matiere in matieres" :key="matiere._id" :value="matiere._id">
                {{ matiere.nom }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Période</label>
            <select v-model="selectedPeriode" @change="loadData" :disabled="!selectedMatiere" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white disabled:opacity-50">
              <option value="">Sélectionner une période</option>
              <option v-for="periode in periodes" :key="periode" :value="periode">{{ periode }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button 
              @click="showAddEvalModal = true" 
              :disabled="!selectedClasse || !selectedMatiere || !selectedPeriode || notesStatus === 'VALIDEE' || notesStatus === 'EN_ATTENTE'"
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
                <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Notes des élèves</h2>
                <span v-if="notesStatus" class="px-3 py-1 rounded-full text-xs font-bold" :class="getStatusClass(notesStatus)">
                  {{ getStatusText(notesStatus) }}
                </span>
              </div>
              <p class="text-sm text-[#4e7397] mt-1">{{ eleves.length }} élève(s) - {{ evaluations.length }} évaluation(s)</p>
            </div>
            <div class="flex gap-3">
              <button 
                @click="saveAllNotes" 
                :disabled="isSaving || notesStatus === 'VALIDEE'"
                class="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-symbols-outlined">save</span>
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer tout' }}
              </button>
              <button 
                @click="submitForValidation" 
                :disabled="isSubmitting || notesStatus === 'VALIDEE' || notesStatus === 'EN_ATTENTE'"
                class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-symbols-outlined">send</span>
                {{ isSubmitting ? 'Soumission...' : 'Soumettre pour validation' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Alerte de verrouillage et demande de déblocage -->
        <div v-if="isLocked" class="p-4 bg-orange-50 dark:bg-orange-900/20 border-t border-b border-orange-200 dark:border-orange-800">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3 flex-1">
              <span class="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">lock</span>
              <div>
                <h3 class="font-bold text-orange-900 dark:text-orange-100 mb-1">Saisie verrouillée</h3>
                <p class="text-sm text-orange-800 dark:text-orange-200">
                  La saisie des notes est verrouillée pour cette période. 
                  {{ lockReason }}
                </p>
                <p v-if="hasPendingUnlockRequest" class="text-sm text-orange-700 dark:text-orange-300 mt-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  Demande de déblocage en attente de traitement par le censeur
                </p>
                <p v-else-if="hasApprovedUnlockRequest" class="text-sm text-green-700 dark:text-green-300 mt-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  Déblocage approuvé - Vous pouvez saisir des notes
                </p>
              </div>
            </div>
            <button 
              v-if="!hasPendingUnlockRequest && !hasApprovedUnlockRequest"
              @click="showUnlockRequestModal = true"
              class="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span class="material-symbols-outlined">lock_open</span>
              Demander un déblocage
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="p-8 text-center">
          <p class="text-[#4e7397]">Chargement...</p>
        </div>

        <div v-else-if="eleves.length === 0" class="p-8 text-center">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">school</span>
          <p class="text-[#4e7397]">Aucun élève dans cette classe</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-bold text-[#0e141b] dark:text-white sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">
                  Élève
                </th>
                <th 
                  v-for="evaluation in evaluations" 
                  :key="evaluation._id" 
                  class="px-4 py-3 text-center text-sm font-bold text-[#0e141b] dark:text-white min-w-[120px]"
                >
                  <div class="flex items-center justify-center gap-2">
                    <span>{{ evaluation.nom }}</span>
                    <button 
                      @click="deleteEvaluation(evaluation._id)" 
                      :disabled="notesStatus === 'VALIDEE' || notesStatus === 'EN_ATTENTE'"
                      class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Supprimer cette évaluation"
                    >
                      <span class="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </th>
                <th class="px-4 py-3 text-center text-sm font-bold text-primary min-w-[100px]">
                  Moyenne
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="eleve in eleves" :key="eleve._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-4 py-3 text-sm font-medium text-[#0e141b] dark:text-white sticky left-0 bg-white dark:bg-slate-900">
                  <div>
                    <p>{{ eleve.nom }} {{ eleve.prenom }}</p>
                    <p class="text-xs text-[#4e7397]">{{ eleve.matricule }}</p>
                  </div>
                </td>
                <td 
                  v-for="evaluation in evaluations" 
                  :key="evaluation._id" 
                  class="px-4 py-3 text-center"
                >
                  <template v-if="isDispensed(eleve._id)">
                    <div class="flex flex-col items-center justify-center">
                      <span class="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded">DISPENSÉ</span>
                    </div>
                  </template>
                  <input 
                    v-else
                    v-model.number="notesData[eleve._id][evaluation.nom]" 
                    type="number" 
                    min="0" 
                    max="20" 
                    step="0.5"
                    :disabled="notesStatus === 'VALIDEE' || notesStatus === 'EN_ATTENTE'"
                    class="w-20 px-2 py-1 text-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary/20 disabled:opacity-70 disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
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

        <!-- Message si aucune évaluation -->
        <div v-if="!isLoading && evaluations.length === 0" class="p-8 text-center border-t border-slate-200 dark:border-slate-800">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">assignment</span>
          <p class="text-[#4e7397] mb-4">Aucune évaluation créée pour cette période</p>
          <button 
            @click="showAddEvalModal = true"
            :disabled="notesStatus === 'VALIDEE' || notesStatus === 'EN_ATTENTE'"
            class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            <span class="material-symbols-outlined">add</span>
            Créer votre première évaluation
          </button>
        </div>
      </div>

      <!-- Message initial -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">edit_note</span>
        <p class="text-[#4e7397] text-lg">Sélectionnez une classe, une matière et une période pour commencer</p>
      </div>
    </div>

    <!-- Modal Ajouter Évaluation -->
    <AjouterEvaluationModal 
      :show="showAddEvalModal"
      :matiere="selectedMatiere"
      :classe="selectedClasse"
      :periode="selectedPeriode"
      @close="showAddEvalModal = false"
      @created="onEvaluationCreated"
    />

    <!-- Modal Demande de Déblocage -->
    <div v-if="showUnlockRequestModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full shadow-2xl">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-[#0e141b] dark:text-white">Demande de Déblocage</h2>
            <button @click="showUnlockRequestModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
              <div class="text-sm text-blue-900 dark:text-blue-100">
                <p class="font-bold mb-1">Informations de la demande</p>
                <p><strong>Classe:</strong> {{ classes.find(c => c._id === selectedClasse)?.niveau }} {{ classes.find(c => c._id === selectedClasse)?.section }}</p>
                <p><strong>Matière:</strong> {{ matieres.find(m => m._id === selectedMatiere)?.nom }}</p>
                <p><strong>Période:</strong> {{ selectedPeriode }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">
              Motif de la demande <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="unlockRequestMotif"
              rows="4"
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Expliquez pourquoi vous avez besoin d'un déblocage (ex: erreur de saisie, note manquante, etc.)"
            ></textarea>
            <p class="text-xs text-slate-500 mt-1">Maximum 500 caractères</p>
          </div>
        </div>

        <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button 
            @click="showUnlockRequestModal = false"
            class="px-6 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="submitUnlockRequest"
            :disabled="isSubmittingUnlockRequest || !unlockRequestMotif.trim()"
            class="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span class="material-symbols-outlined">send</span>
            {{ isSubmittingUnlockRequest ? 'Envoi...' : 'Envoyer la demande' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :confirm-text="confirmModalActionText"
      :cancel-text="confirmModalCancelText"
      :type="confirmModalType"
      @confirm="executeConfirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import AjouterEvaluationModal from '@/components/modals/AjouterEvaluationModal.vue';
import { useToast } from '@/composables/useToast';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';

const { success, error, warning } = useToast();

// Générer un matricule unique
const generateMatricule = (student, index) => {
  // Si l'étudiant a déjà un matricule, le conserver
  if (student.matricule && student.matricule !== 'N/A' && student.matricule !== '-') {
    return student.matricule
  }
  
  // Sinon, générer un matricule dynamiquement
  const currentYear = new Date().getFullYear()
  const baseMatricule = `${currentYear}`
  
  // Utiliser le nom et prénom pour créer une partie unique
  const namePart = `${student.nom?.slice(0, 3).toUpperCase() || 'ELV'}${student.prenom?.slice(0, 3).toUpperCase() || 'ELE'}`
  
  // Ajouter un index pour garantir l'unicité
  const indexPart = String(index + 1).padStart(3, '0')
  
  return `${baseMatricule}-${namePart}${indexPart}`
}

const classes = ref([]);
const matieres = ref([]);
const eleves = ref([]);
const evaluations = ref([]);
const periodes = ref([]);
const notesData = ref({});
const dispensations = ref([]);

const selectedClasse = ref('');
const selectedMatiere = ref('');
const selectedPeriode = ref('');

const isLoading = ref(false);
const isSaving = ref(false);
const isSubmitting = ref(false);
const showAddEvalModal = ref(false);
const notesStatus = ref(null); // EN_ATTENTE, VALIDEE, REJETEE
const currentNoteId = ref(null); // ID de la note pour soumission

// Unlock request state
const showUnlockRequestModal = ref(false);
const unlockRequests = ref([]);
const unlockRequestMotif = ref('');
const isSubmittingUnlockRequest = ref(false);
const isLocked = ref(false);
const lockReason = ref('');

// Modal state
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const confirmModalActionText = ref('Confirmer');
const confirmModalCancelText = ref('Annuler');
const confirmModalType = ref('info');
const pendingAction = ref(null);

const loadClasses = async () => {
  try {
    // Charger les affectations du professeur (classe-matière)
    const res = await api.getProfessorClasses();
    console.log('Affectations du professeur:', res.data);
    
    if (res.data.success && Array.isArray(res.data.data)) {
      // Extraire les classes uniques
      const classesMap = new Map();
      res.data.data.forEach(affectation => {
        if (affectation.classe && !classesMap.has(affectation.classe._id)) {
          classesMap.set(affectation.classe._id, affectation.classe);
        }
      });
      classes.value = Array.from(classesMap.values());
      console.log('Classes du professeur:', classes.value);
    }
  } catch (err) {
    console.error('Erreur chargement classes du professeur:', err);
  }
};

const onClasseChange = async () => {
  selectedMatiere.value = '';
  selectedPeriode.value = '';
  eleves.value = [];
  evaluations.value = [];
  matieres.value = [];
  periodes.value = [];
  
  if (!selectedClasse.value) return;
  
  console.log('Classe sélectionnée:', selectedClasse.value);
  
  // Charger la classe complète pour obtenir la filière
  const classe = classes.value.find(c => c._id === selectedClasse.value);
  console.log('Classe trouvée:', classe);
  
  if (classe) {
    // Log détaillé pour déboguer
    console.log('🔍 Détails de la classe:');
    console.log('  - ID:', classe._id);
    console.log('  - Niveau:', classe.niveau);
    console.log('  - Section:', classe.section);
    console.log('  - Filière (valeur brute):', classe.filiere);
    console.log('  - Filière (type):', typeof classe.filiere);
    console.log('  - Comparaison avec "Générale":', classe.filiere === 'Générale');
    console.log('  - Comparaison avec "Technique":', classe.filiere === 'Technique');
    
    // Définir les périodes selon la filière
    // Par défaut, si filiere est undefined, utiliser Générale (trimestres)
    const filiere = classe.filiere || 'Générale';
    periodes.value = filiere === 'Générale'
      ? ['Trimestre 1', 'Trimestre 2', 'Trimestre 3']
      : ['Semestre 1', 'Semestre 2'];
    
    // Si la période actuelle n'est pas dans la liste, on la réinitialise
    if (selectedPeriode.value && !periodes.value.includes(selectedPeriode.value)) {
      selectedPeriode.value = '';
    }
    
    console.log('✅ Périodes définies:', periodes.value);
    
    // Charger les matières que ce professeur enseigne dans cette classe
    try {
      console.log('Chargement des matières du professeur pour cette classe');
      const res = await api.getProfessorClasses();
      console.log('Affectations complètes:', res.data);
      
      if (res.data.success && Array.isArray(res.data.data)) {
        // Filtrer les matières pour la classe sélectionnée
        const matieresForClasse = res.data.data
          .filter(affectation => affectation.classe._id === selectedClasse.value)
          .map(affectation => affectation.matiere);
        
        // Supprimer les doublons
        const matieresSet = new Set();
        const matieresArray = [];
        matieresForClasse.forEach(matiere => {
          if (matiere && !matieresSet.has(matiere._id)) {
            matieresSet.add(matiere._id);
            matieresArray.push(matiere);
          }
        });
        
        matieres.value = matieresArray;
        console.log('Matières du professeur pour cette classe:', matieres.value);
      } else {
        console.warn('Format de réponse inattendu:', res.data);
      }
    } catch (err) {
      console.error('Erreur chargement matières du professeur:', err);
      console.error('Détails erreur:', err.response?.data);
    }
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
    const elevesRes = await api.getUsers({ 
      classe: selectedClasse.value, 
      role: 'ELEVE' 
    });
    if (elevesRes.data.success) {
      // Transformer les données avec génération de matricules
      const rawData = elevesRes.data.data;
      eleves.value = rawData.map((student, index) => ({
        ...student,
        matricule: generateMatricule(student, index)
      }));
    }

    // Charger les évaluations (colonnes)
    const evalsRes = await api.getNoteColumns({
      classe: selectedClasse.value,
      matiere: selectedMatiere.value,
      periode: selectedPeriode.value
    });
    if (evalsRes.data.success) {
      evaluations.value = evalsRes.data.data;
    }

    // Charger les notes existantes
    const notesRes = await api.getNotes({
      classe: selectedClasse.value,
      matiere: selectedMatiere.value,
      periode: selectedPeriode.value
    });

    // Initialiser notesData
    const tempNotesData = {};
    eleves.value.forEach(eleve => {
      tempNotesData[eleve._id] = {};
      evaluations.value.forEach(evaluation => {
        tempNotesData[eleve._id][evaluation.nom] = null;
      });
    });

    // Charger les dispensations pour cette classe et matière
    try {
      const dispRes = await api.getDispensations({ 
        classe: selectedClasse.value, 
        matiere: selectedMatiere.value 
      });
      if (dispRes.data.success) {
        dispensations.value = dispRes.data.data;
      }
    } catch (dispErr) {
      console.error('Erreur chargement dispensations:', dispErr);
    }

    // Remplir avec les notes existantes et récupérer le statut
    if (notesRes.data.success && notesRes.data.data.length > 0) {
      // Récupérer le statut et l'ID de la première note (toutes ont le même statut pour une classe/matière/période)
      const firstNote = notesRes.data.data[0];
      notesStatus.value = firstNote.statut || null;
      currentNoteId.value = firstNote._id || null;
      
      notesRes.data.data.forEach(noteDoc => {
        if (tempNotesData[noteDoc.eleve._id]) {
          noteDoc.notes.forEach(note => {
            tempNotesData[noteDoc.eleve._id][note.type] = note.valeur;
          });
        }
      });
    } else {
      // Réinitialiser si aucune note
      notesStatus.value = null;
      currentNoteId.value = null;
    }

    notesData.value = tempNotesData;

  } catch (err) {
    console.error('Erreur chargement données:', err);
  } finally {
    isLoading.value = false;
  }
};

const isDispensed = (eleveId) => {
  return dispensations.value.some(d => d.eleve._id === eleveId || d.eleve === eleveId);
};

const calculateMoyenne = (eleveId) => {
  if (isDispensed(eleveId)) return 'DISP';
  
  const notes = notesData.value[eleveId];
  if (!notes) return '-';

  const validNotes = Object.values(notes).filter(n => n !== null && n !== '');
  if (validNotes.length === 0) return '-';

  const sum = validNotes.reduce((acc, n) => acc + parseFloat(n), 0);
  return (sum / validNotes.length).toFixed(2);
};

const saveAllNotes = async () => {
  isSaving.value = true;

  try {
    for (const eleve of eleves.value) {
      const elevesNotes = notesData.value[eleve._id];
      const notesArray = [];

      // Construire le tableau de notes
      evaluations.value.forEach(evaluation => {
        const noteValue = elevesNotes[evaluation.nom];
        if (noteValue !== null && noteValue !== '') {
          notesArray.push({
            valeur: parseFloat(noteValue),
            type: evaluation.nom,
            coefficient: 1
          });
        }
      });

      if (notesArray.length === 0) continue;

      // Vérifier si une note existe déjà
      const existingNotesRes = await api.getNotes({
        eleve: eleve._id,
        matiere: selectedMatiere.value,
        periode: selectedPeriode.value
      });

      if (existingNotesRes.data.data.length > 0) {
        // Mettre à jour
        const noteId = existingNotesRes.data.data[0]._id;
        await api.updateNote(noteId, { 
          notes: notesArray,
          periode: selectedPeriode.value,
          classe: selectedClasse.value,
          matiere: selectedMatiere.value
        });
      } else {
        // Créer - Ajouter l'ID du professeur connecté
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const noteData = {
          eleve: eleve._id,
          matiere: selectedMatiere.value,
          classe: selectedClasse.value,
          periode: selectedPeriode.value,
          professeur: user._id || user.id,
          notes: notesArray
        };
        console.log('Création de note avec données:', noteData);
        try {
          const response = await api.createNotes(noteData);
          console.log('Note créée avec succès:', response.data);
          // Stocker l'ID de la note pour la soumission
          if (!currentNoteId.value && response.data.data._id) {
            currentNoteId.value = response.data.data._id;
          }
        } catch (createError) {
          console.error('Erreur création note:', createError);
          console.error('Détails erreur:', createError.response?.data);
          throw createError;
        }
      }
    }

    success('Notes enregistrées avec succès !');
  } catch (err) {
    console.error('Erreur sauvegarde notes:', err);
    
    // Extraire le message d'erreur du backend
    let errorMessage = 'Erreur lors de l\'enregistrement des notes';
    
    if (err.response?.data?.error) {
      // Format JSON
      errorMessage = err.response.data.error;
      
      // Si c'est une erreur 403 (verrouillage), afficher l'alerte de déblocage
      if (err.response.status === 403) {
        isLocked.value = true;
        lockReason.value = errorMessage;
        return; // Ne pas afficher d'alert, l'alerte orange s'affichera
      }
    } else if (err.response?.status === 403) {
      // Le backend renvoie parfois du HTML, essayer d'extraire le message
      errorMessage = err.message || 'La saisie des notes est verrouillée pour cette période. Vous pouvez demander un déblocage au censeur.';
      isLocked.value = true;
      lockReason.value = errorMessage;
      return; // Ne pas afficher d'alert, l'alerte orange s'affichera
    }
    
    error(errorMessage);
  } finally {
    isSaving.value = false;
  }
};

const openConfirmModal = (title, message, actionText, action, type = 'info', cancelText = 'Annuler') => {
  confirmModalTitle.value = title;
  confirmModalMessage.value = message;
  confirmModalActionText.value = actionText;
  confirmModalCancelText.value = cancelText;
  confirmModalType.value = type;
  pendingAction.value = action;
  showConfirmModal.value = true;
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
  pendingAction.value = null;
};

const executeConfirmAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value();
  }
  closeConfirmModal();
};

const deleteEvaluation = (evalId) => {
  openConfirmModal(
    'Supprimer évaluation',
    'Supprimer cette évaluation ? Toutes les notes associées seront supprimées.',
    'Supprimer',
    async () => {
      try {
        await api.deleteNoteColumn(evalId);
        success('Évaluation supprimée avec succès !');
        loadData();
      } catch (err) {
        console.error('Erreur suppression évaluation:', err);
        error('Erreur lors de la suppression de l\'évaluation');
      }
    }
  );
};

const submitForValidation = async () => {
  openConfirmModal(
    'Soumettre les notes',
    'Soumettre toutes les notes de cette classe pour validation par le censeur ?',
    'Soumettre',
    async () => {
      isSubmitting.value = true;

      try {
        await api.submitNotesBulk({
          classe: selectedClasse.value,
          matiere: selectedMatiere.value,
          periode: selectedPeriode.value
        });
        notesStatus.value = 'EN_ATTENTE';
        success('Notes soumises avec succès ! Le censeur sera notifié.');
      } catch (err) {
        console.error('Erreur soumission notes:', err);
        error('Erreur lors de la soumission des notes');
      } finally {
        isSubmitting.value = false;
      }
    }
  );
};

const getStatusClass = (status) => {
  switch(status) {
    case 'EN_ATTENTE':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'VALIDEE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'REJETEE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getStatusText = (status) => {
  switch(status) {
    case 'EN_ATTENTE':
      return '⏳ En attente de validation';
    case 'VALIDEE':
      return '✓ Validée';
    case 'REJETEE':
      return '✗ Rejetée';
    default:
      return 'Brouillon';
  }
};

const onEvaluationCreated = () => {
  loadData();
};

// Unlock request computed properties
const hasPendingUnlockRequest = computed(() => {
  return unlockRequests.value.some(req => 
    req.classe === selectedClasse.value &&
    req.matiere === selectedMatiere.value &&
    req.periode === selectedPeriode.value &&
    req.statut === 'EN_ATTENTE'
  );
});

const hasApprovedUnlockRequest = computed(() => {
  return unlockRequests.value.some(req => 
    req.classe === selectedClasse.value &&
    req.matiere === selectedMatiere.value &&
    req.periode === selectedPeriode.value &&
    req.statut === 'APPROUVEE' &&
    // Vérifier que l'approbation est récente (7 jours)
    new Date(req.dateTraitement) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
});

// Load unlock requests
const loadUnlockRequests = async () => {
  try {
    const res = await api.getUnlockRequests();
    if (res.data.success) {
      unlockRequests.value = res.data.data;
    }
  } catch (err) {
    console.error('Erreur chargement demandes de déblocage:', err);
  }
};

// Submit unlock request
const submitUnlockRequest = async () => {
  if (!unlockRequestMotif.value.trim()) {
    warning('Veuillez saisir un motif pour votre demande');
    return;
  }

  isSubmittingUnlockRequest.value = true;
  try {
    const data = {
      classe: selectedClasse.value,
      matiere: selectedMatiere.value,
      periode: selectedPeriode.value,
      motif: unlockRequestMotif.value
    };

    const res = await api.createUnlockRequest(data);
    if (res.data.success) {
      success('Demande de déblocage envoyée avec succès');
      unlockRequestMotif.value = '';
      showUnlockRequestModal.value = false;
      await loadUnlockRequests();
    }
  } catch (err) {
    console.error('Erreur création demande:', err);
    error(err.response?.data?.error || 'Erreur lors de la création de la demande');
  } finally {
    isSubmittingUnlockRequest.value = false;
  }
};

// Check if period is locked
const checkLockStatus = async () => {
  // Cette fonction sera appelée après chaque changement de période
  // Pour l'instant, on simule en vérifiant si une erreur survient lors de la sauvegarde
  isLocked.value = false;
  lockReason.value = '';
};


onMounted(() => {
  loadClasses();
  loadUnlockRequests();

  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
