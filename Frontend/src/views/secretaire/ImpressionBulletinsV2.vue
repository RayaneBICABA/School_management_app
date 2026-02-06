<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-[#0e141b] dark:text-white mb-2">Impression & Distribution des Bulletins</h1>
        <p class="text-[#4e7397] dark:text-slate-400">Gérez l'impression et la distribution des bulletins finalisés</p>
      </div>

      <!-- Filtres -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Classe</label>
            <select v-model="selectedClasse" @change="loadBulletins" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Toutes les classes</option>
              <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                {{ classe.niveau }} {{ classe.section }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Période</label>
            <select v-model="selectedPeriode" @change="loadBulletins" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
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
            <select v-model="selectedStatut" @change="loadBulletins" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Tous les statuts</option>
              <option value="FINALISE">Finalisé</option>
              <option value="DISTRIBUE">Distribué</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Actions groupées -->
      <div v-if="selectedBulletins.length > 0" class="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex justify-between items-center">
        <p class="text-primary font-bold">{{ selectedBulletins.length }} bulletin(s) sélectionné(s)</p>
        <div class="flex gap-3">
          <button @click="markAsDistributed" class="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Marquer comme distribué
          </button>
          <button @click="clearSelection" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-[#0e141b] dark:text-white rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            Annuler
          </button>
        </div>
      </div>

      <!-- Liste des bulletins -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Bulletins disponibles</h2>
          <p class="text-sm text-[#4e7397] mt-1">{{ bulletins.length }} bulletin(s)</p>
        </div>

        <div v-if="isLoading" class="p-8 text-center">
          <p class="text-[#4e7397]">Chargement...</p>
        </div>

        <div v-else-if="bulletins.length === 0" class="p-8 text-center">
          <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">description</span>
          <p class="text-[#4e7397]">Aucun bulletin trouvé</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-4 text-left">
                  <input 
                    type="checkbox" 
                    @change="toggleSelectAll" 
                    :checked="selectedBulletins.length === bulletins.filter(b => b.statut === 'FINALISE').length && bulletins.filter(b => b.statut === 'FINALISE').length > 0"
                    class="rounded border-slate-300 dark:border-slate-700"
                  />
                </th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Élève</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Classe</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Période</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-primary">Moyenne</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#0e141b] dark:text-white">Rang</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#0e141b] dark:text-white">Statut</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-[#0e141b] dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="bulletin in bulletins" :key="bulletin._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4">
                  <input 
                    v-if="bulletin.statut === 'FINALISE'"
                    type="checkbox" 
                    :value="bulletin._id" 
                    v-model="selectedBulletins"
                    class="rounded border-slate-300 dark:border-slate-700"
                  />
                </td>
                <td class="px-6 py-4 text-sm font-medium text-[#0e141b] dark:text-white">
                  {{ bulletin.eleve?.prenom }} {{ bulletin.eleve?.nom }}
                  <span class="text-xs text-[#4e7397] block">{{ bulletin.eleve?.matricule }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-[#4e7397]">
                  {{ bulletin.classe?.niveau }} {{ bulletin.classe?.section }}
                </td>
                <td class="px-6 py-4 text-sm text-[#4e7397]">{{ bulletin.periode }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="text-xl font-bold text-primary">{{ bulletin.moyenneGenerale?.toFixed(2) }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-lg font-bold text-[#0e141b] dark:text-white">{{ bulletin.rang }}/{{ bulletin.effectif }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="getStatutClass(bulletin.statut)" class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ getStatutLabel(bulletin.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      @click="printBulletin(bulletin)" 
                      class="p-2 text-[#4e7397] hover:text-primary transition-colors"
                      title="Imprimer"
                    >
                      <span class="material-symbols-outlined">print</span>
                    </button>
                    <button 
                      @click="viewBulletin(bulletin)" 
                      class="p-2 text-[#4e7397] hover:text-primary transition-colors"
                      title="Voir détails"
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
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';

const { success, error, info } = useToast();

const classes = ref([]);
const bulletins = ref([]);
const selectedBulletins = ref([]);
const isLoading = ref(false);

const selectedClasse = ref('');
const selectedPeriode = ref('');
const selectedStatut = ref('FINALISE');

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
    const res = await api.getClasses();
    if (res.data.success) {
      classes.value = res.data.data;
    }
  } catch (err) {
    console.error('Erreur chargement classes:', err);
  }
};

const loadBulletins = async () => {
  isLoading.value = true;
  try {
    let allBulletins = [];

    if (selectedClasse.value) {
      // Charger pour une classe spécifique
      const res = await api.getBulletinsByClasse(selectedClasse.value, {
        periode: selectedPeriode.value || undefined,
        statut: selectedStatut.value || undefined
      });
      if (res.data.success) {
        allBulletins = res.data.data;
      }
    } else {
      // Charger pour toutes les classes
      for (const classe of classes.value) {
        const res = await api.getBulletinsByClasse(classe._id, {
          periode: selectedPeriode.value || undefined,
          statut: selectedStatut.value || undefined
        });
        if (res.data.success) {
          allBulletins = [...allBulletins, ...res.data.data];
        }
      }
    }

    bulletins.value = allBulletins;
  } catch (err) {
    console.error('Erreur chargement bulletins:', err);
  } finally {
    isLoading.value = false;
  }
};

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedBulletins.value = bulletins.value
      .filter(b => b.statut === 'FINALISE')
      .map(b => b._id);
  } else {
    selectedBulletins.value = [];
  }
};

const clearSelection = () => {
  selectedBulletins.value = [];
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

const markAsDistributed = () => {
  if (selectedBulletins.value.length === 0) return;

  openConfirmModal(
    'Distribution des bulletins',
    `Marquer ${selectedBulletins.value.length} bulletin(s) comme distribué(s) ?`,
    'Confirmer',
    async () => {
      try {
        await api.distributeBulletins(selectedBulletins.value);
        success('Bulletins marqués comme distribués avec succès !');
        selectedBulletins.value = [];
        loadBulletins();
      } catch (err) {
        console.error('Erreur distribution bulletins:', err);
        error('Erreur lors de la distribution des bulletins');
      }
    },
    'warning'
  );
};

const printBulletin = (bulletin) => {
  const printContent = `
═══════════════════════════════════════
        BULLETIN SCOLAIRE
═══════════════════════════════════════

Élève: ${bulletin.eleve?.prenom} ${bulletin.eleve?.nom}
Matricule: ${bulletin.eleve?.matricule}
Classe: ${bulletin.classe?.niveau} ${bulletin.classe?.section}
Période: ${bulletin.periode}
Année scolaire: ${bulletin.anneeScolaire}

Moyenne Générale: ${bulletin.moyenneGenerale?.toFixed(2)}/20
Rang: ${bulletin.rang}/${bulletin.effectif}

Date: ${new Date().toLocaleDateString()}
═══════════════════════════════════════
  `;

  // Ouvrir fenêtre d'impression
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<pre>${printContent}</pre>`);
  printWindow.document.close();
  printWindow.print();
};

const viewBulletin = (bulletin) => {
  const details = `
Élève: ${bulletin.eleve?.prenom} ${bulletin.eleve?.nom}
Matricule: ${bulletin.eleve?.matricule}
Classe: ${bulletin.classe?.niveau} ${bulletin.classe?.section}
Période: ${bulletin.periode}

Moyenne Générale: ${bulletin.moyenneGenerale?.toFixed(2)}/20
Rang: ${bulletin.rang}/${bulletin.effectif}
Statut: ${getStatutLabel(bulletin.statut)}

Date de génération: ${new Date(bulletin.dateGeneration).toLocaleDateString()}
${bulletin.dateDistribution ? `Date de distribution: ${new Date(bulletin.dateDistribution).toLocaleDateString()}` : ''}
  `;
  
  // Use modal as an info dialog
  openConfirmModal(
    'Détails du Bulletin',
    details,
    'Fermer',
    () => {}, // No action on confirm/close
    'info',
    'Fermer' // Hack: both buttons close it essentially, or user clicks backdrop
  );
  // Ideally we disable one button or hide it, but this works for now.
  // Actually, let's just make 'Annuler' defined as empty string if we can. 
  // But ConfirmationModal doesn't hide it. So 'Fermer' on both or just one is fine.
  // I set Confirm to "Fermer" and Cancel to "Fermer" (via default or explicit).
  // Let's just set Confirm to "OK".
  confirmModalActionText.value = 'OK';
  confirmModalCancelText.value = 'Fermer';
};

const getStatutClass = (statut) => {
  switch (statut) {
    case 'FINALISE': return 'bg-green-100 text-green-700';
    case 'DISTRIBUE': return 'bg-blue-100 text-blue-700';
    case 'BROUILLON': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatutLabel = (statut) => {
  switch (statut) {
    case 'FINALISE': return 'Finalisé';
    case 'DISTRIBUE': return 'Distribué';
    case 'BROUILLON': return 'Brouillon';
    default: return statut;
  }
};

onMounted(() => {
  loadClasses();
  loadBulletins();

  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
