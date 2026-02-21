<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-200">
    <main class="max-w-[1200px] mx-auto py-10 px-6">
      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-3 mb-2">
          <router-link to="/admin/affectations" class="flex items-center gap-2 text-[#4e7397] hover:text-primary transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="text-sm font-medium">Retour aux affectations</span>
          </router-link>
        </div>
        <p class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          {{ isEditMode ? 'Modifier l\'affectation' : 'Affecter un Professeur' }}
        </p>
        <p class="text-[#4e7397] text-base font-normal">
          {{ isEditMode ? 'Mise à jour des paramètres de cette affectation.' : 'Lier un enseignant à une matière et des classes spécifiques.' }}
        </p>
        </div>
        <div class="flex items-center gap-2 text-sm text-[#4e7397] bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
          <span class="material-symbols-outlined text-primary">info</span>
          <span>Session 2023-2024</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Assignment Form -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <!-- Select Professor -->
              <div class="flex flex-col gap-2">
                <label class="text-[#0e141b] dark:text-white text-base font-semibold">Choisir un Enseignant</label>
                <div class="relative">
                  <select v-model="selectedProf" class="form-input w-full rounded-lg border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none">
                    <option disabled value="">Rechercher par nom</option>
                    <option v-for="p in profs" :key="p._id" :value="p._id">{{ p.nom }} {{ p.prenom }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#4e7397]">
                    <span class="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
              <!-- Select Subject -->
              <div class="flex flex-col gap-2">
                <label class="text-[#0e141b] dark:text-white text-base font-semibold">Matière à Enseigner</label>
                <div class="relative">
                  <select v-model="selectedMatiere" @change="fetchMatiereClasses" class="form-input w-full rounded-lg border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none">
                    <option disabled value="">Sélectionner la matière</option>
                    <option v-for="m in matieres" :key="m._id" :value="m._id">{{ m.nom }}</option>
                  </select>
                  <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#4e7397]">
                    <span class="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
              <!-- Volume Horaire Selection -->
              <div class="flex flex-col gap-2 lg:col-span-2">
                <label class="text-[#0e141b] dark:text-white text-base font-semibold">Volume Horaire Par Semaine (Heures)</label>
                <div class="flex items-center gap-4">
                  <input v-model.number="volumeHoraire" type="range" min="1" max="10" step="0.5" class="grow h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                  <div class="min-w-[80px] text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 font-bold text-primary">
                    {{ volumeHoraire }}h
                  </div>
                </div>
                <p class="text-xs text-[#4e7397]">Ce volume sera appliqué à toutes les classes sélectionnées ci-dessous.</p>
              </div>
            </div>
            <!-- Classes Selection -->
            <div>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-[#0e141b] dark:text-white text-lg font-bold">Classes Concernées</h3>
                <div class="flex gap-2">
                  <span class="text-xs font-medium text-[#4e7397] uppercase tracking-wider">Sélectionner par niveau:</span>
                  <button class="text-xs text-primary font-bold hover:underline">6ème</button>
                  <button class="text-xs text-primary font-bold hover:underline">5ème</button>
                  <button class="text-xs text-primary font-bold hover:underline">4ème</button>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div v-if="!selectedMatiere" class="col-span-2 text-center py-4 text-slate-400 italic">Veuillez d'abord sélectionner une matière</div>
                <div v-else-if="matiereClasses.length === 0" class="col-span-2 text-center py-4 text-slate-400 italic">Aucune classe n'enseigne cette matière</div>
                <!-- Class Card Item -->
                <label v-for="mc in matiereClasses" :key="mc._id" class="flex items-center gap-3 p-4 border border-[#d0dbe7] dark:border-slate-700 rounded-lg cursor-pointer hover:bg-primary/5 transition-colors group">
                  <input v-model="selectedClasses" :value="mc" class="w-5 h-5 rounded border-[#d0dbe7] text-primary focus:ring-primary" type="checkbox"/>
                  <div class="flex flex-col">
                    <span class="font-bold text-[#0e141b] dark:text-white">{{ mc.classe?.niveau }} {{ mc.classe?.section }}</span>
                    <span class="text-xs text-[#4e7397]">{{ mc.heuresParSemaine || 2 }}h / semaine</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Summary Sidebar -->
        <div class="space-y-6">
          <!-- Workload Card -->
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 class="text-[#0e141b] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">analytics</span>
              Charge de Travail
            </h3>
            <div class="mb-6">
              <div class="flex justify-between items-end mb-2">
                <span class="text-sm text-[#4e7397]">Hebdomadaire</span>
                <span class="text-2xl font-black text-primary">
                  {{ currentProfWorkload }}h <span class="text-sm font-normal text-[#4e7397]">/ 18h</span>
                </span>
              </div>
              <div class="w-full bg-[#e7edf3] dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                <div 
                  class="bg-primary h-full rounded-full transition-all duration-500" 
                  :style="{ width: Math.min((currentProfWorkload / 18) * 100, 100) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-[#4e7397] mt-2">
                {{ 18 - currentProfWorkload > 0 ? `Le professeur a encore ${18 - currentProfWorkload}h de disponibilité.` : 'Le professeur est à pleine charge.' }}
              </p>
            </div>
            <div class="space-y-4">
              <div class="p-3 bg-background-light dark:bg-slate-800/50 rounded-lg border border-dashed border-[#d0dbe7] dark:border-slate-700">
                <p class="text-xs font-semibold text-[#4e7397] uppercase mb-2">Récapitulatif sélection</p>
                <ul class="text-sm space-y-2">
                  <li v-for="c in selectedClasses" :key="c._id" class="flex justify-between">
                    <span>{{ c.classe?.section }}</span>
                    <span class="font-bold">{{ c.heuresParSemaine || 2 }}h</span>
                  </li>
                  <li v-if="selectedClasses.length === 0" class="text-slate-400 italic">Aucune classe sélectionnée</li>
                  <li class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-primary font-bold">
                    <span>Total Sélection</span>
                    <span>+{{ totalSelectedHeures }}h</span>
                  </li>
                  <li class="flex justify-between text-slate-800 dark:text-slate-200 font-black pt-1">
                    <span>Charge Totale Future</span>
                    <span>{{ currentProfWorkload + totalSelectedHeures }}h</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Conflicts / Warnings -->
          <div class="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
            <div class="flex gap-3">
              <span class="material-symbols-outlined text-amber-600">warning</span>
              <div>
                <p class="text-sm font-bold text-amber-800 dark:text-amber-400">Chevauchement Possible</p>
                <p class="text-xs text-amber-700 dark:text-amber-500 mt-1">Vérifiez l'emploi du temps de la classe Première S1 (Lundi 08:00).</p>
              </div>
            </div>
          </div>
          <!-- Action Buttons -->
          <div class="flex flex-col gap-3">
            <button @click="confirmAssignment" :disabled="isSubmitting" class="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">{{ isSubmitting ? 'sync' : 'assignment_turned_in' }}</span>
              {{ isSubmitting ? 'Affectation en cours...' : 'Confirmer l\'affectation' }}
            </button>
            <router-link to="/admin/affectations" class="w-full bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-700 text-[#0e141b] dark:text-white font-semibold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center">
              Annuler
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Stats -->
    <footer class="mt-auto py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div class="max-w-[1200px] mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
        <div class="flex gap-8">
          <div class="flex flex-col">
            <span class="text-xs text-[#4e7397]">Total Professeurs</span>
            <span class="font-bold">{{ profs.length }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-[#4e7397]">Total Affectations</span>
            <span class="font-bold">{{ allAssignments.length }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-[#4e7397]">Heures Planifiées</span>
            <span class="font-bold">{{ totalGlobalHeures }}h</span>
          </div>
        </div>
        <p class="text-sm text-[#4e7397]">AdminScolaire v2.4.0 • Système de Gestion Intégré</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const profs = ref([]);
const matieres = ref([]);
const allAssignments = ref([]); // All assignments to calculate workload
const matiereClasses = ref([]);
const selectedProf = ref('');
const selectedMatiere = ref('');
const selectedClasses = ref([]);
const volumeHoraire = ref(2);
const isSubmitting = ref(false);
const isEditMode = ref(false);
const editingAssignmentId = ref(null);

const fetchData = async () => {
  try {
    const [usersRes, matieresRes, assignmentsRes] = await Promise.all([
      api.getUsers(),
      api.getMatieres(),
      api.getAllGlobalClasseMatieres()
    ]);
    profs.value = usersRes.data.data.filter(u => u.role === 'PROFESSEUR');
    matieres.value = matieresRes.data.data;
    allAssignments.value = assignmentsRes.data.data;

    // Handle Edit Mode
    if (route.query.edit) {
      isEditMode.value = true;
      editingAssignmentId.value = route.query.edit;
      const assignment = allAssignments.value.find(a => a._id === editingAssignmentId.value);
      if (assignment) {
        selectedProf.value = assignment.professeur?._id || '';
        selectedMatiere.value = assignment.matiere?._id || '';
        volumeHoraire.value = assignment.heuresParSemaine || 2;
        await fetchMatiereClasses();
        // For edit mode, we might want to pre-select ONLY the current assignment's class
        selectedClasses.value = matiereClasses.value.filter(mc => mc._id === editingAssignmentId.value);
      }
    }
  } catch (error) {
    console.error('Erreur chargement:', error);
  }
};

const fetchMatiereClasses = async () => {
    if (!selectedMatiere.value) return;
    try {
        const res = await api.getAllGlobalClasseMatieres();
        allAssignments.value = res.data.data;
        // Filter those matching the selected subject
        matiereClasses.value = allAssignments.value.filter(mc => mc.matiere?._id === selectedMatiere.value);
        if (!isEditMode.value) {
          selectedClasses.value = [];
        }
    } catch (error) {
        console.error('Erreur chargement classes:', error);
    }
};

// Calculate current workload for selected professor
const currentProfWorkload = computed(() => {
    if (!selectedProf.value) return 0;
    // Filter assignments for this professor, EXCLUDING the one being edited if in edit mode (to show baseline)
    // Or maybe INCLUDING all but then adding the NEW selection below.
    // Let's show the TOTAL workload they ALREADY HAVE.
    return allAssignments.value
        .filter(a => a.professeur?._id === selectedProf.value)
        .reduce((acc, a) => acc + (a.heuresParSemaine || 2), 0);
});

// Calculate total selection hours
const totalSelectedHeures = computed(() => {
    return selectedClasses.value.length * volumeHoraire.value;
});

// Calculate total global hours (for all teachers)
const totalGlobalHeures = computed(() => {
    return allAssignments.value.reduce((acc, a) => acc + (a.heuresParSemaine || 2), 0);
});

const confirmAssignment = async () => {
    if (!selectedProf.value) return alert('Veuillez sélectionner un enseignant');
    if (selectedClasses.value.length === 0) return alert('Veuillez sélectionner au moins une classe');
    
    isSubmitting.value = true;
    try {
        if (isEditMode.value && editingAssignmentId.value) {
            // In edit mode we focus on updating specific assignments
            await Promise.all(selectedClasses.value.map(c => 
                api.updateClasseMatiere(c.classe._id, c._id, { 
                    professeur: selectedProf.value,
                    heuresParSemaine: volumeHoraire.value 
                })
            ));
        } else {
            // Standard assignment (multiple)
            await Promise.all(selectedClasses.value.map(c => 
                api.updateClasseMatiere(c.classe._id, c._id, { 
                    professeur: selectedProf.value,
                    heuresParSemaine: volumeHoraire.value
                })
            ));
        }
        alert('Opération réussie !');
        router.push('/admin/affectations');
    } catch (error) {
        console.error('Erreur affectation:', error);
        alert('Erreur lors de l\'affectation');
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
  fetchData();
  
  // Add Material Symbols font
  const link = document.createElement('link');
  // ... rest of the existing mount logic ...
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Inter font
  const interLink = document.createElement('link');
  interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
  interLink.rel = 'stylesheet';
  document.head.appendChild(interLink);

  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Inter', sans-serif;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #d0dbe7;
      border-radius: 10px;
    }
  `;
  document.head.appendChild(style);
});
</script>
