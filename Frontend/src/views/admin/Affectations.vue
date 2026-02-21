<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#0e141b] dark:text-slate-100">
    <!-- Main Content Area -->
    <main class="container mx-auto flex flex-col overflow-y-auto">
      <!-- Page Heading -->
      <header class="p-8">
        <div class="flex flex-wrap justify-between items-center gap-6">
          <div class="flex flex-col gap-2">
            <h2 class="text-[#0e141b] dark:text-white text-4xl font-black tracking-tight">Affectations</h2>
            <p class="text-[#4e7397] dark:text-slate-400 text-base">Gérez les charges horaires et les attributions des enseignants par classe.</p>
          </div>
          <router-link to="/admin/affecter-professeur" class="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined">add_circle</span>
            <span>Affecter un Professeur</span>
          </router-link>
        </div>
        <!-- Stats -->
        <div class="flex flex-wrap gap-4 mt-8">
          <div class="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Affectations</p>
            <div class="flex items-end gap-2">
              <p class="text-[#0e141b] dark:text-white text-3xl font-bold leading-none">{{ assignments.length }}</p>
            </div>
          </div>
          <div class="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Classes couvertes</p>
            <div class="flex items-end gap-2">
              <p class="text-[#0e141b] dark:text-white text-3xl font-bold leading-none">{{ classesCouvertes }}</p>
            </div>
          </div>
          <div class="flex min-w-[200px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Volume horaire total</p>
            <div class="flex items-end gap-2">
              <p class="text-[#0e141b] dark:text-white text-3xl font-bold leading-none">{{ totalHeures }}h</p>
            </div>
          </div>
        </div>
      </header>
      <!-- Search and Filter Section -->
      <section class="px-8 pb-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 p-2 shadow-sm">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <!-- SearchBar -->
            <div class="flex-1 w-full">
              <label class="flex items-center h-11 w-full bg-[#f0f4f8] dark:bg-slate-900 rounded-lg px-4 border border-transparent focus-within:border-primary transition-all">
                <span class="material-symbols-outlined text-[#4e7397]">search</span>
                <input v-model="searchQuery" class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-[#4e7397] dark:text-white" placeholder="Rechercher un professeur ou une matière..."/>
              </label>
            </div>
            <!-- Chips / Filters -->
            <div class="flex gap-2 flex-wrap px-2">
              <select v-model="selectedClassFilter" class="flex h-9 items-center rounded-lg bg-[#e7edf3] dark:bg-slate-700 px-4 text-[#0e141b] dark:text-white text-xs font-bold border border-[#d0dbe7] dark:border-slate-600 focus:ring-primary focus:border-primary">
                <option value="">Toutes les classes</option>
                <option v-for="cls in classes" :key="cls._id" :value="cls._id">{{ cls.section }}</option>
              </select>
              <select v-model="selectedSubjectFilter" class="flex h-9 items-center rounded-lg bg-[#e7edf3] dark:bg-slate-700 px-4 text-[#0e141b] dark:text-white text-xs font-bold border border-[#d0dbe7] dark:border-slate-600 focus:ring-primary focus:border-primary">
                <option value="">Toutes les matières</option>
                <option v-for="m in uniqueSubjects" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      <!-- Data Table Section -->
      <section class="px-8 pb-10">
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-[#d0dbe7] dark:border-slate-700">
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397]">Professeur</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397]">Matière</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397]">Classe</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397]">Volume Horaire</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397]">Statut Charge</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397] text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#d0dbe7] dark:divide-slate-700">
              <tr v-if="filteredAssignments.length === 0" class="text-center py-10">
                <td colspan="6" class="px-6 py-10 text-slate-500 italic text-center">Aucune affectation trouvée</td>
              </tr>
              <tr 
                v-for="a in filteredAssignments" 
                :key="a._id"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {{ a.professeur?.nom?.[0] }}{{ a.professeur?.prenom?.[0] }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-[#0e141b] dark:text-white">
                        {{ a.professeur ? `${a.professeur.nom} ${a.professeur.prenom}` : 'Non assigné' }}
                      </p>
                      <p class="text-xs text-[#4e7397]">ID: {{ a.professeur?.id?.substring(0,8) || 'N/A' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold">
                    {{ a.matiere?.nom }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm text-[#0e141b] dark:text-slate-300">{{ a.classe?.niveau }} {{ a.classe?.section }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-medium">{{ a.heuresParSemaine || 2 }}h / semaine</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        class="bg-primary h-full" 
                        :style="{ width: Math.min(((a.heuresParSemaine || 2) / 20) * 100, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs text-[#4e7397]">Optimale</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <router-link :to="`/admin/affecter-professeur?edit=${a._id}`" class="p-2 hover:bg-[#e7edf3] dark:hover:bg-slate-700 rounded-lg text-[#4e7397] transition-colors" title="Modifier">
                      <span class="material-symbols-outlined text-xl">edit</span>
                    </router-link>
                    <button @click="removeAssignment(a._id, a.classe?._id)" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors" title="Retirer l'enseignant">
                      <span class="material-symbols-outlined text-xl">person_remove</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Pagination (Simplified) -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-[#d0dbe7] dark:border-slate-700 flex justify-between items-center">
            <p class="text-xs text-[#4e7397]">Affichage de 1 à 10 sur 124 professeurs</p>
            <div class="flex gap-2">
              <button class="px-3 py-1 rounded border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium opacity-50 cursor-not-allowed">Précédent</button>
              <button class="px-3 py-1 rounded border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors">Suivant</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const assignments = ref([]);
const classes = ref([]);
const searchQuery = ref('');
const selectedClassFilter = ref('');
const selectedSubjectFilter = ref('');
const isLoading = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [assignmentsRes, classesRes] = await Promise.all([
      api.getAllGlobalClasseMatieres(),
      api.getClasses()
    ]);
    assignments.value = Array.isArray(assignmentsRes.data.data) ? assignmentsRes.data.data : [];
    classes.value = Array.isArray(classesRes.data.data) ? classesRes.data.data : [];
  } catch (error) {
    console.error('Erreur chargement données:', error);
  } finally {
    isLoading.value = false;
  }
};

const uniqueSubjects = computed(() => {
  const subjects = assignments.value.map(a => a.matiere?.nom).filter(Boolean);
  return [...new Set(subjects)];
});

const filteredAssignments = computed(() => {
  return assignments.value.filter(a => {
    const matchesSearch = !searchQuery.value || 
      (a.professeur?.nom?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (a.professeur?.prenom?.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (a.matiere?.nom?.toLowerCase().includes(searchQuery.value.toLowerCase()));
    
    const matchesClass = !selectedClassFilter.value || a.classe?._id === selectedClassFilter.value;
    const matchesSubject = !selectedSubjectFilter.value || a.matiere?.nom === selectedSubjectFilter.value;
    
    return matchesSearch && matchesClass && matchesSubject;
  });
});

const classesCouvertes = computed(() => {
  const classIds = assignments.value.map(a => a.classe?._id).filter(Boolean);
  return [...new Set(classIds)].length;
});

const totalHeures = computed(() => {
  return assignments.value.reduce((acc, current) => acc + (current.heuresParSemaine || 2), 0);
});

const removeAssignment = async (id, classeId) => {
  if (confirm('Êtes-vous sûr de vouloir retirer le professeur de cette matière ?')) {
    try {
      // In this specific UI, "removing" usually means unassigning the teacher from ClasseMatiere
      await api.updateClasseMatiere(classeId, id, { professeur: null });
      await fetchData();
    } catch (error) {
      console.error('Erreur retrait professeur:', error);
      alert('Erreur lors du retrait du professeur');
    }
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
    .active-link {
      background-color: #e7edf3;
      border-radius: 0.5rem;
    }
    .font-display {
      font-family: 'Inter', sans-serif;
    }
  `;
  document.head.appendChild(style);
});
</script>
