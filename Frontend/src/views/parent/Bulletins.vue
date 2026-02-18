<template>
  <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="max-w-6xl mx-auto py-8 px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bulletins Scolaires</h1>
        <p class="text-slate-500 dark:text-slate-400">Consultez et téléchargez les bulletins de notes de vos enfants</p>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold">Sélectionner l'enfant</label>
            <select v-model="selectedChild" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary">
              <option value="">Choisir un enfant</option>
              <option v-for="child in children" :key="child.id" :value="child.id">{{ child.name }} - {{ child.class }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold">Année scolaire</label>
            <select v-model="selectedYear" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary">
              <option value="">Choisir une année</option>
              <option v-for="year in schoolYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold">Trimestre</label>
            <select v-model="selectedTrimester" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary">
              <option value="">Choisir un trimestre</option>
              <option value="1">1er Trimestre</option>
              <option value="2">2ème Trimestre</option>
              <option value="3">3ème Trimestre</option>
            </select>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-slate-700 dark:text-slate-300 text-sm font-semibold">&nbsp;</label>
            <button @click="searchBulletins" class="rounded-lg bg-primary text-white text-sm font-bold h-10 px-4 shadow-md hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">search</span>
              <span>Rechercher</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bulletins List -->
      <div v-if="bulletins.length > 0" class="space-y-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Résultats</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="bulletin in bulletins" :key="bulletin.id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-4 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center justify-between mb-2">
                <span class="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">{{ bulletin.trimester }}</span>
                <span class="text-xs text-slate-500">{{ bulletin.date }}</span>
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white mb-1">{{ bulletin.childName }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ bulletin.class }} • {{ bulletin.year }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-800/50">
              <div class="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <p class="text-lg font-bold text-primary">{{ bulletin.average }}</p>
                  <p class="text-xs text-slate-500">Moyenne</p>
                </div>
                <div>
                  <p class="text-lg font-bold text-slate-900 dark:text-white">{{ bulletin.rank }}</p>
                  <p class="text-xs text-slate-500">Rang</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="viewBulletin(bulletin)" class="flex-1 flex items-center justify-center gap-2 rounded-lg h-8 px-3 bg-primary text-white text-xs font-bold hover:bg-blue-600 transition-all">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  <span>Voir</span>
                </button>
                <button 
                  @click="downloadBulletin(bulletin)" 
                  :class="bulletin.data.statut === 'VALIDE' || bulletin.data.statut === 'FINALISE' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed'"
                  class="flex items-center justify-center rounded-lg h-8 w-8 transition-all"
                  :title="bulletin.data.statut === 'VALIDE' || bulletin.data.statut === 'FINALISE' ? 'Télécharger' : 'En attente de validation'"
                >
                  <span class="material-symbols-outlined text-sm">download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulletin Preview Modal -->
      <div v-if="showBulletinModal" class="fixed inset-0 z-50 overflow-y-auto no-print">
        <BulletinTemplate 
          :bulletin="currentBulletin" 
          :eleve="currentBulletin.eleve" 
          :classe="currentBulletin.classe"
          @close="closeBulletinModal"
        />
      </div>

      <!-- Empty State -->
      <div v-else-if="hasSearched" class="text-center py-12">
        <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">description</span>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Aucun bulletin trouvé</h3>
        <p class="text-slate-500 dark:text-slate-400">Aucun bulletin ne correspond à vos critères de recherche</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import BulletinTemplate from '@/components/bulletin/BulletinTemplate.vue'

const route = useRoute()

// Données réactives
const selectedChild = ref('')
const selectedYear = ref('2023-2024')
const selectedTrimester = ref('')
const showBulletinModal = ref(false)
const currentBulletin = ref(null)
const hasSearched = ref(false)
const isLoading = ref(false)

// Watch for child selection change to auto-search
watch(selectedChild, (newVal) => {
  if (newVal) {
    searchBulletins()
  } else {
    bulletins.value = []
    hasSearched.value = false
  }
})

// Données des enfants
const children = ref([])

// Années scolaires - could be fetched from API in the future
const schoolYears = ref(['2023-2024', '2022-2023', '2021-2022'])

// Bulletins trouvés
const bulletins = ref([])

// Fetch children
const fetchChildren = async () => {
  try {
    const res = await api.getChildren()
    if (res.data.success) {
      children.value = res.data.data.map(child => ({
        id: child._id,
        name: `${child.prenom} ${child.nom}`,
        class: child.classe ? `${child.classe.niveau} ${child.classe.section}` : 'Sans classe'
      }))
      
      // Auto-select child if passed in query params
      if (route.query.child && children.value.find(c => c.id === route.query.child)) {
        selectedChild.value = route.query.child
        await searchBulletins()
      }
    }
  } catch (error) {
    console.error('Error fetching children:', error)
  }
}

// Fonctions
const searchBulletins = async () => {
  if (!selectedChild.value) return
  
  isLoading.value = true
  hasSearched.value = true
  
  try {
    const res = await api.getBulletinsByEleve(selectedChild.value)
    if (res.data.success) {
      bulletins.value = res.data.data.map(bulletin => ({
        id: bulletin._id,
        childName: bulletin.eleve?.nom ? `${bulletin.eleve.prenom} ${bulletin.eleve.nom}` : bulletin.eleve_nom || 'Élève inconnu',
        class: bulletin.classe?.niveau ? `${bulletin.classe.niveau} ${bulletin.classe.section}` : bulletin.classe_nom || 'Classe inconnue',
        year: bulletin.anneeScolaire,
        trimester: bulletin.periode,
        date: new Date(bulletin.dateGeneration).toLocaleDateString('fr-FR'),
        average: bulletin.moyenneGenerale?.toFixed(2) || '-',
        rank: bulletin.rang ? `${bulletin.rang}${bulletin.rang === 1 ? 'er' : 'e'}` : '-',
        data: bulletin
      }))
    }
  } catch (error) {
    console.error('Error fetching bulletins:', error)
    bulletins.value = []
  } finally {
    isLoading.value = false
  }
}

const viewBulletin = (bulletin) => {
  currentBulletin.value = bulletin.data
  showBulletinModal.value = true
}

const downloadBulletin = async (bulletin) => {
  // Check status before downloading
  if (bulletin.data.statut !== 'VALIDE' && bulletin.data.statut !== 'FINALISE') {
    alert('Ce bulletin n\'est pas encore validé et ne peut pas être téléchargé.')
    return
  }
  
  try {
    const response = await api.downloadBulletinPDF(bulletin.id)
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `bulletin-${bulletin.childName.replace(' ', '-')}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Error downloading bulletin:', error)
  }
}

const closeBulletinModal = () => {
  showBulletinModal.value = false
  currentBulletin.value = null
}

const printBulletin = () => {
  window.print()
}

// Initialize
onMounted(() => {
  fetchChildren()
})
</script>

<style scoped>
@media print {
  .no-print { 
    display: none !important; 
  }
  .print-area { 
    margin: 0 !important; 
    padding: 0 !important; 
    box-shadow: none !important; 
    width: 100% !important; 
  }
  body { 
    background: white !important; 
  }
}

.a4-container {
  width: 210mm;
  min-height: 297mm;
}
</style>
