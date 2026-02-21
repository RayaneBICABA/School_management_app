<template>
  <div class="deblocage-notes-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link :to="dashboardPath" class="text-[#4e7397] hover:text-primary font-medium">{{ roleLabel }}</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Déblocage des Notes</span>
      </nav>

      <!-- Back Button -->
      <div class="mb-4">
        <button @click="$router.push(dashboardPath)" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
          <span class="material-symbols-outlined">arrow_back</span>
          <span>Retour au tableau de bord</span>
        </button>
      </div>

      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Demandes de Déblocage</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base">Gérez les demandes de déblocage de notes soumises par les professeurs.</p>
        </div>
      </div>

    <!-- Filtres -->
    <div class="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
      <div class="flex gap-4 items-center">
        <div class="relative flex-1">
          <input 
            v-model="searchQuery" 
            class="h-10 pl-10 pr-4 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary w-full" 
            placeholder="Rechercher par professeur, classe, matière..." 
            type="text"
          />
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
        </div>
        <select v-model="filterStatut" class="h-10 px-4 rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary">
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVEE">Approuvées</option>
          <option value="REJETEE">Rejetées</option>
        </select>
      </div>
    </div>

    <!-- Liste des demandes -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-slate-500">Chargement des demandes...</p>
    </div>

    <div v-else-if="filteredRequests.length === 0" class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
      <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">inbox</span>
      <p class="text-slate-500">Aucune demande de déblocage</p>
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="request in filteredRequests" 
        :key="request._id" 
        class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        <div class="p-6">
          <div class="flex justify-between items-start gap-4">
            <!-- Informations principales -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">
                  {{ request.professeur?.prenom }} {{ request.professeur?.nom }}
                </h3>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-bold" 
                  :class="getStatusClass(request.statut)"
                >
                  {{ getStatusText(request.statut) }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p class="text-xs text-slate-500 font-semibold mb-1">Classe</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">
                    {{ request.classe?.niveau }} {{ request.classe?.section }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-semibold mb-1">Matière</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ request.matiere?.nom }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 font-semibold mb-1">Période</p>
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ request.periode }}</p>
                </div>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p class="text-xs text-slate-500 font-semibold mb-2">Motif de la demande</p>
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ request.motif }}</p>
              </div>

              <div class="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">schedule</span>
                  Demandé le {{ formatDate(request.createdAt) }}
                </span>
                <span v-if="request.dateTraitement" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check</span>
                  Traité le {{ formatDate(request.dateTraitement) }}
                </span>
              </div>

              <!-- Raison du rejet -->
              <div v-if="request.statut === 'REJETEE' && request.raisonRejet" class="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p class="text-xs text-red-900 dark:text-red-100 font-semibold mb-1">Raison du rejet</p>
                <p class="text-sm text-red-800 dark:text-red-200">{{ request.raisonRejet }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="request.statut === 'EN_ATTENTE'" class="flex flex-col gap-2">
              <button 
                @click="approveRequest(request._id)"
                :disabled="isProcessing"
                class="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                <span class="material-symbols-outlined text-sm">check_circle</span>
                Approuver
              </button>
              <button 
                @click="openRejectModal(request)"
                :disabled="isProcessing"
                class="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                <span class="material-symbols-outlined text-sm">cancel</span>
                Rejeter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de rejet -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full shadow-2xl">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-[#0e141b] dark:text-white">Rejeter la demande</h2>
            <button @click="showRejectModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-orange-600 dark:text-orange-400">warning</span>
              <div class="text-sm text-orange-900 dark:text-orange-100">
                <p class="font-bold mb-1">Attention</p>
                <p>Le professeur sera notifié du rejet de sa demande. Veuillez expliquer la raison.</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">
              Raison du rejet <span class="text-red-500">*</span>
            </label>
            <textarea 
              v-model="rejectReason"
              rows="4"
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Expliquez pourquoi vous rejetez cette demande..."
            ></textarea>
          </div>
        </div>

        <div class="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button 
            @click="showRejectModal = false"
            class="px-6 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button 
            @click="rejectRequest"
            :disabled="isProcessing || !rejectReason.trim()"
            class="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span class="material-symbols-outlined">cancel</span>
            {{ isProcessing ? 'Rejet...' : 'Confirmer le rejet' }}
          </button>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const user = JSON.parse(localStorage.getItem('user') || '{}');
const userRole = user.role;

const dashboardPath = computed(() => {
  if (userRole === 'PROVISEUR') return '/proviseur';
  if (userRole === 'CENSEUR') return '/censeur';
  return '/admin';
});

const roleLabel = computed(() => {
  if (userRole === 'PROVISEUR') return 'Proviseur';
  if (userRole === 'CENSEUR') return 'Censeur';
  return 'Admin';
});

const unlockRequests = ref([]);
const isLoading = ref(false);
const isProcessing = ref(false);
const searchQuery = ref('');
const filterStatut = ref('');
const showRejectModal = ref(false);
const rejectReason = ref('');
const selectedRequest = ref(null);

// Computed properties
const filteredRequests = computed(() => {
  let filtered = unlockRequests.value;

  // Filtre par statut
  if (filterStatut.value) {
    filtered = filtered.filter(req => req.statut === filterStatut.value);
  }

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(req =>
      req.professeur?.nom?.toLowerCase().includes(query) ||
      req.professeur?.prenom?.toLowerCase().includes(query) ||
      req.classe?.niveau?.toLowerCase().includes(query) ||
      req.classe?.section?.toLowerCase().includes(query) ||
      req.matiere?.nom?.toLowerCase().includes(query) ||
      req.motif?.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Charger les demandes
const loadUnlockRequests = async () => {
  isLoading.value = true;
  try {
    const res = await api.getUnlockRequests();
    if (res.data.success) {
      unlockRequests.value = res.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement demandes:', error);
    alert('Erreur lors du chargement des demandes');
  } finally {
    isLoading.value = false;
  }
};

// Approuver une demande
const approveRequest = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir approuver cette demande ?')) {
    return;
  }

  isProcessing.value = true;
  try {
    const res = await api.approveUnlockRequest(id);
    if (res.data.success) {
      alert('Demande approuvée avec succès');
      await loadUnlockRequests();
    }
  } catch (error) {
    console.error('Erreur approbation:', error);
    alert(error.response?.data?.error || 'Erreur lors de l\'approbation');
  } finally {
    isProcessing.value = false;
  }
};

// Ouvrir le modal de rejet
const openRejectModal = (request) => {
  selectedRequest.value = request;
  rejectReason.value = '';
  showRejectModal.value = true;
};

// Rejeter une demande
const rejectRequest = async () => {
  if (!rejectReason.value.trim()) {
    alert('Veuillez saisir une raison pour le rejet');
    return;
  }

  isProcessing.value = true;
  try {
    const res = await api.rejectUnlockRequest(selectedRequest.value._id, {
      raisonRejet: rejectReason.value
    });
    if (res.data.success) {
      alert('Demande rejetée');
      showRejectModal.value = false;
      selectedRequest.value = null;
      rejectReason.value = '';
      await loadUnlockRequests();
    }
  } catch (error) {
    console.error('Erreur rejet:', error);
    alert(error.response?.data?.error || 'Erreur lors du rejet');
  } finally {
    isProcessing.value = false;
  }
};

// Utilitaires
const getStatusClass = (statut) => {
  switch (statut) {
    case 'EN_ATTENTE':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'APPROUVEE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'REJETEE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getStatusText = (statut) => {
  switch (statut) {
    case 'EN_ATTENTE':
      return '⏳ En attente';
    case 'APPROUVEE':
      return '✓ Approuvée';
    case 'REJETEE':
      return '✗ Rejetée';
    default:
      return statut;
  }
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadUnlockRequests();
});
</script>
