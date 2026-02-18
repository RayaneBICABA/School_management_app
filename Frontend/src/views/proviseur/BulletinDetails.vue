<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">
    <div v-if="isLoading" class="flex justify-center items-center h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="text-center text-red-500 mt-10">
      {{ error }}
    </div>

    <div v-else>
      <!-- Navigation -->
      <div class="max-w-[900px] mx-auto mb-6 flex items-center justify-between no-print">
        <button @click="$router.go(-1)" class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 text-slate-700 font-medium transition-colors">
          <span class="material-symbols-outlined">arrow_back</span>
          Retour
        </button>
        <div class="flex gap-3">
             <button v-if="canValidate" @click="handleValidate" class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 font-bold transition-colors">
                <span class="material-symbols-outlined">check_circle</span>
                Valider ce bulletin
             </button>
             <button v-if="canValidate" @click="handleReject" class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 font-bold transition-colors">
                <span class="material-symbols-outlined">cancel</span>
                Rejeter / Dévalider
             </button>
        </div>
      </div>

      <!-- Bulletin Content -->
      <BulletinTemplate
        :bulletin="bulletin"
        :eleve="bulletin.eleve"
        :classe="bulletin.classe"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import BulletinTemplate from '@/components/bulletin/BulletinTemplate.vue'

const route = useRoute()
const router = useRouter()
const { success, error: showError } = useToast()

const bulletinId = route.params.id
const bulletin = ref(null)
const isLoading = ref(true)
const error = ref(null)

const canValidate = computed(() => {
    return bulletin.value && (bulletin.value.statut === 'Prêt' || bulletin.value.statut === 'En cours' || bulletin.value.statut === 'CLOTURE_NOTES');
})

const fetchBulletin = async () => {
  try {
    isLoading.value = true
    const res = await api.getBulletin(bulletinId)
    if (res.data.success) {
      bulletin.value = res.data.data
    } else {
      error.value = 'Impossible de charger le bulletin'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Erreur lors du chargement du bulletin'
  } finally {
    isLoading.value = false
  }
}

const handleValidate = async () => {
    if (!confirm('Confirmer la validation de ce bulletin ? Cela le rendra visible aux parents.')) return;
    try {
        // Assuming finalizeBulletin or a similar endpoint for individual validation
        // Using finalizeBulletin based on API service inspection
        await api.finalizeBulletin(bulletinId); 
        success('Bulletin validé avec succès');
        fetchBulletin();
    } catch (e) {
        console.error(e);
        showError('Erreur lors de la validation');
    }
}

const handleReject = async () => {
    if (!confirm('Voulez-vous rejeter ce bulletin ? Il repassera en brouillon/en cours.')) return;
    try {
        // Implement reject logic if API supports it, otherwise manually update status
        // For now, let's try updating status to 'BROUILLON' or 'EN_COURS' via updateBulletin
        await api.updateBulletin(bulletinId, { statut: 'EN_COURS', signatureProviseur: false });
        success('Bulletin rejeté');
        fetchBulletin();
    } catch (e) {
        console.error(e);
        showError('Erreur lors du rejet');
    }
}

onMounted(() => {
  fetchBulletin()
})
</script>
