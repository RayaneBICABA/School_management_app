<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#0e141b] dark:text-slate-50">
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
      <!-- Top Navigation Bar -->
      <header class="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-8 py-4">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg text-primary">
              <span class="material-symbols-outlined">analytics</span>
            </div>
            <h2 class="text-lg font-bold tracking-tight">Supervision des Notes</h2>
          </div>
          <div class="flex items-center gap-6 border-l border-slate-200 dark:border-slate-800 pl-8">
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold uppercase text-slate-400 tracking-wider">Période:</span>
              <select v-model="selectedPeriod" class="bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 border-none focus:ring-0 cursor-pointer hover:text-primary transition-colors">
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Trimestre 2">Trimestre 2</option>
                <option value="Trimestre 3">Trimestre 3</option>
                <option value="Semestre 1">Semestre 1</option>
                <option value="Semestre 2">Semestre 2</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Page Content -->
      <div class="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Classes complétées</p>
              <span class="material-symbols-outlined text-green-500">verified</span>
            </div>
            <div class="flex items-baseline gap-2">
              <p class="text-3xl font-bold">{{ fullClasses }}/{{ filteredClasses.length }}</p>
              <span class="text-slate-400 text-sm font-medium">{{ ((fullClasses/filteredClasses.length)*100 || 0).toFixed(0) }}%</span>
            </div>
          </div>
        </div>
        
        <!-- Main Layout Body: Class Progress & Alerts -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Class & Subject Progress -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Header & Filter -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 class="text-xl font-bold">Suivi par Classe</h3>
              <div class="w-full md:w-64">
                <select v-model="selectedClassId" class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  <option value="" disabled selected>Sélectionner une classe...</option>
                  <option v-for="cls in filteredClasses" :key="cls._id" :value="cls._id">
                    {{ cls.niveau }} {{ cls.section }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Content Area -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm min-h-[300px]">
              
              <!-- Empty State -->
              <div v-if="!selectedClassId" class="flex flex-col items-center justify-center h-[300px] text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-3 opacity-50">school</span>
                <p>Veuillez sélectionner une classe pour voir le détail des matières.</p>
              </div>

              <!-- Data Table -->
              <table v-else class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Matière</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Enseignant</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Évaluations</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Statut</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                   <tr v-if="selectedClassSubjects.length === 0">
                    <td colspan="5" class="px-6 py-10 text-center text-slate-500">Aucune matière affectée à cette classe.</td>
                  </tr>
                  <tr v-for="subject in selectedClassSubjects" :key="subject.matiere._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">
                      {{ subject.matiere.nom }}
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <span v-if="subject.professeur" class="flex items-center gap-2">
                         <span class="size-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {{ subject.professeur.prenom[0] }}{{ subject.professeur.nom[0] }}
                         </span>
                         {{ subject.professeur.prenom }} {{ subject.professeur.nom }}
                      </span>
                      <span v-else class="text-orange-500 text-xs italic">Non assigné</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {{ subject.evalCount }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                       <span 
                        :class="[
                          'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded-full border shadow-sm',
                          subject.isValidated 
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                        ]"
                      >
                        <span class="material-symbols-outlined text-[16px]">{{ subject.isValidated ? 'check_circle' : 'pending' }}</span>
                        {{ subject.isValidated ? 'Validé' : 'En cours' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                       <button class="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                          <span class="material-symbols-outlined icon-sm">visibility</span>
                       </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Right Column: Alerts Panel -->
          <div class="space-y-4">
            <div class="flex items-center justify-between px-2">
              <h3 class="text-xl font-bold">Alertes de Saisie</h3>
              <button class="text-primary text-xs font-bold uppercase tracking-wider hover:underline">Tout notifier</button>
            </div>
            <div class="flex flex-col gap-3">
              <div v-if="entryAlerts.length === 0" class="text-center py-4 text-slate-400 italic">Aucune alerte de saisie</div>
              <!-- Alert Card -->
              <div 
                v-for="alert in entryAlerts.slice(0, 5)" 
                :key="alert._id"
                class="flex flex-col gap-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-white dark:bg-slate-900 p-4 shadow-sm relative overflow-hidden"
              >
                <div class="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div class="flex items-start gap-3">
                  <div class="p-2 bg-red-50 rounded-lg text-red-500">
                    <span class="material-symbols-outlined">warning</span>
                  </div>
                  <div class="flex flex-col flex-1">
                    <h4 class="text-sm font-bold leading-tight">{{ alert.professeur?.prenom }} {{ alert.professeur?.nom }} - {{ alert.matiere?.nom }}</h4>
                    <p class="text-slate-500 dark:text-slate-400 text-xs mt-1">Saisie manquante ({{ alert.classe?.niveau }} {{ alert.classe?.section }})</p>
                  </div>
                </div>
              </div>
              <button v-if="entryAlerts.length > 5" class="flex items-center justify-center gap-2 p-3 text-sm font-bold text-slate-500 hover:text-primary transition-colors border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <span class="material-symbols-outlined text-[20px]">expand_more</span>
                <span>Voir toutes les alertes ({{ entryAlerts.length }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const allClasses = ref([]);
const grades = ref([]);
const assignments = ref([]);
const isLoading = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const [classesRes, gradesRes, assignmentsRes] = await Promise.all([
      api.getClasses(),
      api.getGrades(),
      api.getAllGlobalClasseMatieres()
    ]);
    console.log('Classes Response:', classesRes);
    console.log('Classes Data:', classesRes.data);
    allClasses.value = Array.isArray(classesRes.data.data) ? classesRes.data.data : [];
    grades.value = Array.isArray(gradesRes.data.data) ? gradesRes.data.data : [];
    assignments.value = Array.isArray(assignmentsRes.data.data) ? assignmentsRes.data.data : [];
  } catch (error) {
    console.error('Erreur chargement notes:', error);
  } finally {
    isLoading.value = false;
  }
};

const selectedClassId = ref('');
const selectedPeriod = ref('Trimestre 1');

// Filter classes based on selected Period (Trimester -> General, Semester -> Technical)
const filteredClasses = computed(() => {
    if (selectedPeriod.value.toLowerCase().includes('trimestre')) {
        return allClasses.value.filter(c => c.filiere === 'Générale' || !c.filiere || c.filiere === 'Generale'); // Default to General if undefined
    } else {
        return allClasses.value.filter(c => c.filiere === 'Technique');
    }
});

// Watcher to reset selected class when period type changes
import { watch } from 'vue';
watch(selectedPeriod, () => {
    selectedClassId.value = '';
});

const selectedClassSubjects = computed(() => {
    if (!selectedClassId.value) return [];
    
    // 1. Get all subjects assigned to this class
    const classAssignments = assignments.value.filter(a => a.classe && (a.classe._id === selectedClassId.value || a.classe === selectedClassId.value));
    
    // 2. Map to display objects with stats
    return classAssignments.map(assignment => {
        // Get all grades for this class & subject AND selected period
        const subjectGrades = grades.value.filter(g => 
            (g.classe?._id === selectedClassId.value || g.classe === selectedClassId.value) && 
            (g.matiere?._id === assignment.matiere?._id || g.matiere === assignment.matiere?._id) &&
            g.periode === selectedPeriod.value
        );
        
        // Count evaluations
        const maxGradesPerStudent = subjectGrades.reduce((max, g) => {
            return g.notes && g.notes.length > max ? g.notes.length : max;
        }, 0);
        
        // Check Validation
        const isCenseurValidated = subjectGrades.some(g => g.statut === 'VALIDEE');
        
        return {
            ...assignment,
            evalCount: maxGradesPerStudent,
            isValidated: maxGradesPerStudent >= 2 && isCenseurValidated
        };
    });
});

const entryAlerts = computed(() => {
    // Alerte si une affectation existe mais aucune note n'est saisie pour ce binôme classe-matière
    return assignments.value.filter(a => {
        if (!a.professeur) return false;
        const hasGrades = grades.value.some(g => 
            g.classe?._id === a.classe?._id && 
            g.matiere?._id === a.matiere?._id
        );
        return !hasGrades;
    });
});

const fullClasses = computed(() => {
    // Determine completed classes based on new logic (optional, for the top card)
    // A class is full if all its subjects are validated
    return filteredClasses.value.filter(cls => {
        const classAssignments = assignments.value.filter(a => a.classe && (a.classe._id === cls._id || a.classe === cls._id));
        if (classAssignments.length === 0) return false;
        
        const allSubjectsValidated = classAssignments.every(assignment => {
             const subjectGrades = grades.value.filter(g => 
                (g.classe?._id === cls._id || g.classe === cls._id) && 
                (g.matiere?._id === assignment.matiere?._id || g.matiere === assignment.matiere?._id)
            );
            const maxGrades = subjectGrades.reduce((max, g) => g.notes ? Math.max(max, g.notes.length) : max, 0);
            const isValidated = subjectGrades.some(g => g.statut === 'VALIDEE');
            return maxGrades >= 2 && isValidated;
        });
        
        return allSubjectsValidated;
    }).length;
});

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
  interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
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
    .fill-icon {
      font-variation-settings: 'FILL' 1;
    }
    .font-display {
      font-family: 'Inter', sans-serif;
    }
  `;
  document.head.appendChild(style);
});
</script>
