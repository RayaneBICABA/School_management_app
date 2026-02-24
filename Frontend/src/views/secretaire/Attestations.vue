<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-white">
    <div class="max-w-[1200px] mx-auto py-8 px-8">
      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div class="flex flex-col gap-2">
          <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Attestations et Diplômes</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base font-normal leading-normal">Générez, signez et archivez les documents officiels pour les élèves admis.</p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 rounded-lg text-sm font-bold text-[#0e141b] dark:text-white hover:bg-slate-50 transition-colors">
            <span class="material-symbols-outlined text-[20px]">history</span>
            Journal d'audit
          </button>
          <button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-md transition-all">
            <span class="material-symbols-outlined text-[20px]">draw</span>
            Configuration Signature
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">En attente de génération</p>
            <span class="material-symbols-outlined text-primary">pending_actions</span>
          </div>
          <p class="text-[#0e141b] dark:text-white text-3xl font-bold leading-tight">124</p>
          <div class="flex items-center gap-1">
            <span class="text-[#078838] text-xs font-bold">+12%</span>
            <span class="text-[#4e7397] text-[10px]">vs session précédente</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Diplômes Délivrés</p>
            <span class="material-symbols-outlined text-primary">verified</span>
          </div>
          <p class="text-[#0e141b] dark:text-white text-3xl font-bold leading-tight">856</p>
          <div class="flex items-center gap-1">
            <span class="text-[#078838] text-xs font-bold">+5%</span>
            <span class="text-[#4e7397] text-[10px]">taux de délivrance</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Taux de Réussite Global</p>
            <span class="material-symbols-outlined text-primary">grade</span>
          </div>
          <p class="text-[#0e141b] dark:text-white text-3xl font-bold leading-tight">92.4%</p>
          <div class="flex items-center gap-1">
            <span class="text-[#e73908] text-xs font-bold">-2%</span>
            <span class="text-[#4e7397] text-[10px]">évolution annuelle</span>
          </div>
        </div>
      </div>

      <!-- Main Section with Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="flex border-b border-[#d0dbe7] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-6">
          <button class="flex items-center gap-2 border-b-2 border-primary text-primary px-4 py-4 text-sm font-bold tracking-tight">
            <span class="material-symbols-outlined text-[18px]">group_add</span>
            Génération en masse
          </button>
          <button class="flex items-center gap-2 border-b-2 border-transparent text-[#4e7397] hover:text-primary px-4 py-4 text-sm font-bold tracking-tight transition-colors">
            <span class="material-symbols-outlined text-[18px]">inventory</span>
            Registre des documents
          </button>
        </div>

        <!-- Toolbar -->
        <div class="p-6 border-b border-[#d0dbe7] dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
          <div class="flex gap-2">
            <select class="rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary">
              <option>Toutes les classes</option>
              <option>Terminale S1</option>
              <option>Terminale L1</option>
              <option>Troisième A</option>
            </select>
            <select class="rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-primary focus:border-primary">
              <option>Tous les statuts</option>
              <option>Admis</option>
              <option>En attente</option>
            </select>
          </div>
          <div class="flex gap-2">
            <button class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-[#0e141b] dark:text-white rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors">
              <span class="material-symbols-outlined text-[16px]">download</span>
              Télécharger la sélection
            </button>
            <button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm">
              <span class="material-symbols-outlined text-[16px]">auto_fix</span>
              Générer en masse (45)
            </button>
          </div>
        </div>

        <!-- Students Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4e7397] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700">
                  <input class="rounded border-slate-300 text-primary focus:ring-primary" type="checkbox"/>
                </th>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700">Élève / ID</th>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700">Classe</th>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700">Moyenne / Décision</th>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700">Type de Document</th>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700">Statut</th>
                <th class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#d0dbe7] dark:divide-slate-700 text-sm">
              <tr 
                v-for="(student, index) in paginatedStudents" 
                :key="student.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
               >
                <td class="px-6 py-4"><input v-model="student.checked" class="rounded border-slate-300 text-primary" type="checkbox"/></td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-[#0e141b] dark:text-white">{{ student.nom }}</span>
                    <span class="text-xs text-[#4e7397]">ID: {{ student.id }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">{{ student.classe }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-primary">{{ student.moyenne.toFixed(2) }}/20</span>
                    <span class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{{ student.decision }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-[#4e7397]">{{ student.document }}</td>
                <td class="px-6 py-4">
                  <span v-if="student.statut === 'À générer'" class="inline-flex items-center gap-1 text-amber-600 font-medium italic">
                    <span class="material-symbols-outlined text-[14px]">hourglass_empty</span>
                    À générer
                  </span>
                  <span v-else-if="student.statut === 'Généré'" class="inline-flex items-center gap-1 text-green-600 font-medium">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span>
                    Généré
                  </span>
                  <span v-else class="inline-flex items-center gap-1 text-primary font-medium">
                    <span class="material-symbols-outlined text-[14px]">ink_pen</span>
                    {{ student.statut }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 rounded text-[#4e7397]">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button class="p-1.5 hover:bg-primary/10 rounded text-primary">
                      <span class="material-symbols-outlined text-[18px]">{{ student.statut === 'Signé' ? 'share' : (student.statut === 'Généré' ? 'download' : 'print') }}</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="paginatedStudents.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-slate-500 italic">Aucun élève trouvé</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-[#d0dbe7] dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
          <p class="text-xs text-[#4e7397]">
            Affichage de {{ Math.min(startItem, totalItems) }} à {{ Math.min(endItem, totalItems) }} sur {{ totalItems }} élèves
          </p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-xs text-[#4e7397]">Afficher:</span>
              <select v-model="itemsPerPage" class="h-8 rounded border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#0e141b] dark:text-white px-2 focus:ring-primary focus:border-primary">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
              </select>
            </div>
            <div class="flex gap-2">
              <button 
                @click="prevPage" 
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Précédent
              </button>
              <button 
                @click="nextPage" 
                :disabled="currentPage === totalPages || totalPages === 0"
                class="px-3 py-1 rounded border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer / Info Section -->
      <div class="mt-8 flex flex-wrap gap-6 items-start">
        <div class="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-3 text-primary">
            <span class="material-symbols-outlined">security</span>
            <h4 class="font-bold">Sécurité et Conformité</h4>
          </div>
          <p class="text-sm text-[#4e7397] dark:text-slate-400 leading-relaxed mb-4">
            Toutes les attestations générées sont munies d'un code QR unique permettant la vérification d'authenticité par des tiers. La signature numérique du chef d'établissement est apposée automatiquement sur les PDF finaux après approbation.
          </p>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-[18px]">lock</span>
              <span class="text-[11px] font-bold text-[#0e141b] dark:text-white uppercase tracking-tight">Chiffrement AES-256</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-[18px]">verified_user</span>
              <span class="text-[11px] font-bold text-[#0e141b] dark:text-white uppercase tracking-tight">Norme ISO 27001</span>
            </div>
          </div>
        </div>
        <div class="w-full md:w-80 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 rounded-xl p-6">
          <h4 class="font-bold text-[#0e141b] dark:text-white mb-4">Actions Rapides</h4>
          <div class="flex flex-col gap-3">
            <button class="flex items-center justify-between p-3 rounded-lg border border-[#d0dbe7] dark:border-slate-700 hover:border-primary hover:text-primary transition-all group">
              <span class="text-sm font-medium">Export Registre PDF</span>
              <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">picture_as_pdf</span>
            </button>
            <button class="flex items-center justify-between p-3 rounded-lg border border-[#d0dbe7] dark:border-slate-700 hover:border-primary hover:text-primary transition-all group">
              <span class="text-sm font-medium">Statistiques Annuelles</span>
              <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">analytics</span>
            </button>
            <button class="flex items-center justify-between p-3 rounded-lg border border-[#d0dbe7] dark:border-slate-700 hover:border-primary hover:text-primary transition-all group">
              <span class="text-sm font-medium">Purge des Brouillons</span>
              <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">delete_sweep</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const students = ref([
  { id: '2023-00452', nom: 'Jean-Pierre Durand', classe: 'Terminale S1', moyenne: 16.45, decision: 'Admis', document: 'Diplôme de Bac', statut: 'À générer', checked: false },
  { id: '2023-00128', nom: 'Marie-Claire Lefebvre', classe: 'Terminale S1', moyenne: 14.20, decision: 'Admis', document: 'Attestation Scolarité', statut: 'Généré', checked: false },
  { id: '2023-00911', nom: 'Amadou Diallo', classe: 'Terminale L1', moyenne: 12.50, decision: 'Admis', document: 'Diplôme de Bac', statut: 'Signé', checked: false },
]);

const currentPage = ref(1);
const itemsPerPage = ref(10);

const totalItems = computed(() => students.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const startItem = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endItem = computed(() => currentPage.value * itemsPerPage.value);

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return students.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

watch(itemsPerPage, () => {
  currentPage.value = 1;
});

onMounted(() => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const publicSansLink = document.createElement('link');
  publicSansLink.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap';
  publicSansLink.rel = 'stylesheet';
  document.head.appendChild(publicSansLink);

  const style = document.createElement('style');
  style.textContent = `
    body { font-family: 'Public Sans', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  `;
  document.head.appendChild(style);
});
</script>
