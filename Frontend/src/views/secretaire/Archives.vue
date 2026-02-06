<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-50">
    <main class="flex-1 flex flex-col max-w-[1440px] mx-auto w-full px-6 py-8 gap-6">
      <!-- PageHeading -->
      <div class="flex flex-wrap justify-between items-end gap-3">
        <div class="flex flex-col gap-1">
          <h1 class="text-[#0e141b] dark:text-slate-50 text-4xl font-black leading-tight tracking-[-0.033em]">Gestion des Archives</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base font-normal">Consultez les bulletins historiques et gérez les demandes de duplicatas.</p>
        </div>
        <div class="flex gap-3">
          <button @click="exportCSV" class="flex items-center gap-2 cursor-pointer rounded-lg h-10 px-4 bg-[#e7edf3] dark:bg-slate-800 text-[#0e141b] dark:text-slate-50 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-sm">download</span>
            Exporter CSV
          </button>
          <button @click="exportZIP" class="flex items-center gap-2 cursor-pointer rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors">
            <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
            Archive ZIP
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Main Content Area -->
        <div class="flex-1 flex flex-col gap-4">
          <!-- Search and Filters -->
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div class="w-full">
              <label class="flex flex-col h-12 w-full">
                <div class="flex w-full flex-1 items-stretch rounded-lg h-full border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div class="text-[#4e7397] flex bg-slate-50 dark:bg-slate-800 items-center justify-center px-4">
                    <span class="material-symbols-outlined">search</span>
                  </div>
                  <input v-model="filters.search" @input="fetchStudents" class="flex-1 border-none bg-white dark:bg-slate-900 text-[#0e141b] dark:text-slate-50 focus:ring-0 px-4 text-base placeholder:text-[#4e7397]" placeholder="Rechercher un élève par nom, matricule ou classe..." />
                </div>
              </label>
            </div>
            <!-- Chips / Dropdown Filters -->
            <div class="flex gap-3 flex-wrap">
              <select v-model="filters.annee" @change="fetchStudents" class="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 border border-slate-200 dark:border-slate-700 text-[#0e141b] dark:text-slate-50 text-sm font-medium">
                <option value="">Toutes les années</option>
                <option v-for="annee in annees" :key="annee" :value="annee">{{ annee }}</option>
              </select>
              <select v-model="filters.filiere" @change="fetchStudents" class="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 border border-slate-200 dark:border-slate-700 text-[#0e141b] dark:text-slate-50 text-sm font-medium">
                <option value="">Toutes les filières</option>
                <option v-for="filiere in filieres" :key="filiere" :value="filiere">{{ filiere }}</option>
              </select>
              <select v-model="filters.classe" @change="fetchStudents" class="flex h-10 items-center justify-center gap-x-2 rounded-lg bg-slate-50 dark:bg-slate-800 px-4 border border-slate-200 dark:border-slate-700 text-[#0e141b] dark:text-slate-50 text-sm font-medium">
                <option value="">Toutes les classes</option>
                <option v-for="classe in classes" :key="classe._id" :value="classe._id">{{ classe.nom }}</option>
              </select>
              <button @click="resetFilters" class="ml-auto text-primary text-sm font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">filter_alt_off</span>
                Réinitialiser
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div v-if="isLoading" class="p-8 text-center">
              <p class="text-slate-500">Chargement...</p>
            </div>
            <div v-else-if="students.length === 0" class="p-8 text-center">
              <p class="text-slate-500">Aucun élève trouvé</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th class="px-6 py-4 text-[#0e141b] dark:text-slate-50 text-sm font-bold">Matricule</th>
                    <th class="px-6 py-4 text-[#0e141b] dark:text-slate-50 text-sm font-bold">Nom & Prénom</th>
                    <th class="px-6 py-4 text-[#0e141b] dark:text-slate-50 text-sm font-bold">Classe</th>
                    <th class="px-6 py-4 text-[#0e141b] dark:text-slate-50 text-sm font-bold">Année</th>
                    <th class="px-6 py-4 text-primary text-sm font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-for="student in students" :key="student._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="px-6 py-4 text-[#4e7397] dark:text-slate-400 text-sm">{{ student.matricule || 'N/A' }}</td>
                    <td class="px-6 py-4 font-medium text-[#0e141b] dark:text-slate-50 text-sm">{{ student.prenom }} {{ student.nom }}</td>
                    <td class="px-6 py-4 text-[#4e7397] dark:text-slate-400 text-sm">{{ student.classe?.nom || 'Non assigné' }}</td>
                    <td class="px-6 py-4 text-[#4e7397] dark:text-slate-400 text-sm text-center">{{ student.annee || '2023-2024' }}</td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button @click="viewStudent(student)" class="p-2 text-[#4e7397] hover:text-primary transition-colors" title="Visualiser">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                        <button @click="printDuplicata(student)" class="p-2 text-primary hover:bg-primary/10 rounded transition-colors" title="Générer Duplicata">
                          <span class="material-symbols-outlined">print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p class="text-[#4e7397] text-sm">Affichage de {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, totalStudents) }} sur {{ totalStudents }} résultats</p>
              <div class="flex gap-2">
                <button @click="previousPage" :disabled="currentPage === 1" class="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[#4e7397] disabled:opacity-50">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :class="['px-4 py-2 rounded-lg text-sm font-medium', page === currentPage ? 'bg-primary text-white' : 'border border-slate-200 dark:border-slate-700 text-[#4e7397]']">{{ page }}</button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[#4e7397] disabled:opacity-50">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';

const { success, error, info } = useToast();

const students = ref([]);
const classes = ref([]);
const filieres = ref([]);
const annees = ref([]);
const isLoading = ref(false);
const currentPage = ref(1);
const perPage = ref(10);
const totalStudents = ref(0);

const filters = ref({
  search: '',
  annee: '',
  filiere: '',
  classe: ''
});

// Modal state
const showConfirmModal = ref(false);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');
const confirmModalActionText = ref('Confirmer');
const confirmModalCancelText = ref('Annuler');
const confirmModalType = ref('info');
const pendingAction = ref(null);

const fetchStudents = async () => {
  try {
    isLoading.value = true;
    const params = {
      role: 'ELEVE',
      page: currentPage.value,
      limit: perPage.value,
      populate: 'classe'
    };
    
    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.classe) params.classe = filters.value.classe;
    
    const res = await api.getUsers(params);
    if (res.data.success) {
      students.value = res.data.data;
      totalStudents.value = res.data.count || res.data.data.length;
    }
  } catch (err) {
    console.error('Erreur chargement élèves:', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchClasses = async () => {
  try {
    const res = await api.getClasses();
    if (res.data.success) {
      classes.value = res.data.data;
      // Extract unique filieres from classes
      const uniqueFilieres = [...new Set(classes.value.map(c => c.filiere).filter(Boolean))];
      filieres.value = uniqueFilieres;
    }
  } catch (err) {
    console.error('Erreur chargement classes:', err);
  }
};

const fetchAnnees = async () => {
  try {
    // Fetch unique years from students or use default
    const currentYear = new Date().getFullYear();
    annees.value = [
      `${currentYear}-${currentYear + 1}`,
      `${currentYear - 1}-${currentYear}`,
      `${currentYear - 2}-${currentYear - 1}`
    ];
  } catch (err) {
    console.error('Erreur chargement années:', err);
  }
};

const resetFilters = () => {
  filters.value = {
    search: '',
    annee: '',
    filiere: '',
    classe: ''
  };
  currentPage.value = 1;
  fetchStudents();
};

const totalPages = computed(() => Math.ceil(totalStudents.value / perPage.value));

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 3;
  let start = Math.max(1, currentPage.value - 1);
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchStudents();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchStudents();
  }
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchStudents();
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

const viewStudent = (student) => {
  openConfirmModal(
    'Détails de l\'élève',
    `Nom & Prénom: ${student.prenom} ${student.nom}\nMatricule: ${student.matricule || 'N/A'}\nClasse: ${student.classe?.nom || 'N/A'}`,
    'Fermer',
    () => {},
    'info',
    'Fermer'
  );
  // Hack to ensure logic works as "OK" closing it.
  confirmModalActionText.value = 'OK';
  confirmModalCancelText.value = 'Fermer';
};

const printDuplicata = (student) => {
  info(`Génération de duplicata pour ${student.prenom} ${student.nom}...`);
  // Mock functionality
  setTimeout(() => {
    success('Duplicata généré avec succès');
  }, 1000);
};

const exportCSV = async () => {
  try {
    const csvContent = [
      ['Matricule', 'Nom', 'Prénom', 'Classe', 'Année'].join(','),
      ...students.value.map(s => [
        s.matricule || 'N/A',
        s.nom,
        s.prenom,
        s.classe?.nom || 'N/A',
        s.annee || '2023-2024'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `archives_eleves_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    success('Export CSV réussi');
  } catch (err) {
    console.error('Erreur export CSV:', err);
    error('Erreur lors de l\'export CSV');
  }
};

const exportZIP = () => {
  info('Fonction Archive ZIP en cours de développement.');
};

onMounted(() => {
  fetchStudents();
  fetchClasses();
  fetchAnnees();
  
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const lexendLink = document.createElement('link');
  lexendLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&family=Noto+Sans:wght@100..900&display=swap';
  lexendLink.rel = 'stylesheet';
  document.head.appendChild(lexendLink);

  const style = document.createElement('style');
  style.textContent = `
    body { font-family: 'Lexend', 'Noto Sans', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  `;
  document.head.appendChild(style);
});
</script>
