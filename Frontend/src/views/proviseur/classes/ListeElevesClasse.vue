<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div class="flex items-center gap-3">
            <button @click="$router.go(-1)" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
              <span class="material-symbols-outlined">arrow_back</span>
              <span class="hidden sm:inline">Retour aux classes</span>
            </button>
            <h1 class="text-3xl font-black text-[#0e141b] dark:text-white">Liste des Élèves</h1>
          </div>
          <div class="flex items-center gap-4 flex-1 justify-end">
            <div class="relative w-full max-w-md">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Rechercher un élève..."
                class="w-full pl-10 pr-4 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
            <router-link :to="`/proviseur/ajouter-utilisateur?role=ELEVE&classe=${classeId}`" class="btn-organic flex items-center justify-center gap-2 px-5 h-11 bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/20 hover:bg-primary/90 text-sm whitespace-nowrap">
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              <span>Ajouter un élève</span>
            </router-link>
          </div>
        </div>
        <p class="text-[#4e7397] dark:text-slate-400 ml-14" v-if="classe">
          {{ classe.niveau }} {{ classe.section }} - 
          <span v-if="searchQuery" class="font-bold text-primary">{{ filteredEleves.length }} trouvé(s)</span>
          <span v-else>{{ eleves.length }} élève(s)</span>
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <span class="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
          <p class="text-[#4e7397] mt-4">Chargement des élèves...</p>
        </div>
      </div>

      <!-- Students Table -->
      <div v-else-if="eleves.length > 0" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Matricule</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom et prénoms</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date de naissance</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lieu de naissance</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Redoublant</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Sexe</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="eleve in filteredEleves" :key="eleve._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.matricule }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-primary font-bold text-sm">{{ getInitials(eleve) }}</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-[#0e141b] dark:text-white">{{ eleve.prenom }} {{ eleve.nom }}</p>
                        <p v-if="eleve.email" class="text-xs text-slate-500">{{ eleve.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="text-sm text-[#0e141b] dark:text-slate-200">{{ formatDate(eleve.dateNaissance) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="text-sm text-[#0e141b] dark:text-slate-200">{{ eleve.lieuNaissance || '-' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <div v-if="eleve.telephone" class="flex items-center justify-center gap-1 text-[#0e141b] dark:text-slate-200">
                      <span class="material-symbols-outlined text-[16px] text-slate-400">call</span>
                      <span class="text-sm">{{ eleve.telephone }}</span>
                   </div>
                   <span v-else class="text-slate-400 text-xs italic">Non renseigné</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span v-if="eleve.isRedoublant" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                     Oui
                   </span>
                   <span v-else class="text-slate-400 text-xs">Non</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span v-if="eleve.sexe === 'M'" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold" title="Masculin">M</span>
                   <span v-else-if="eleve.sexe === 'F'" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 text-xs font-bold" title="Féminin">F</span>
                   <span v-else class="text-slate-400 text-xs">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span :class="['px-2 py-1 rounded-full text-xs font-bold', getStatusClass(eleve.statutEleve || eleve.status)]">
                      {{ eleve.statutEleve || eleve.status || 'ACTIF' }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    @click="voirFicheEleve(eleve)"
                    class="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span class="material-symbols-outlined text-sm">person</span>
                    Voir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-slate-400">group</span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-[#0e141b] dark:text-white mb-2">Aucun élève trouvé</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Cette classe ne contient aucun élève pour le moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const classeId = route.params.id

const isLoading = ref(true)
const eleves = ref([])
const classe = ref(null)
const searchQuery = ref('')

const filteredEleves = computed(() => {
  if (!searchQuery.value) return eleves.value;
  const q = searchQuery.value.toLowerCase();
  return eleves.value.filter(e => 
    e.nom.toLowerCase().includes(q) || 
    e.prenom.toLowerCase().includes(q) ||
    e.matricule.toLowerCase().includes(q)
  );
});

// Récupérer les initiales d'un élève
const getInitials = (eleve) => {
  return `${eleve.prenom?.[0] || ''}${eleve.nom?.[0] || ''}`.toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusClass = (status) => {
  const map = {
    'ACTIF': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'AFFECTE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'INACTIF': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'NON AFFECTE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'EN_ATTENTE': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'BLOQUE': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
  }
  return map[status?.toUpperCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
}

// Voir la fiche d'un élève
const voirFicheEleve = (eleve) => {
  router.push(`/proviseur/classes/${classeId}/eleve/${eleve._id}`)
}

// Générer un matricule unique
const generateMatricule = (student, index) => {
  // Si l'étudiant a déjà un matricule, le conserver
  if (student.matricule && student.matricule !== 'N/A') {
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

// Charger les données de la classe
const fetchEleves = async () => {
  try {
    isLoading.value = true
    
    // Récupérer les informations de la classe
    const classeResponse = await api.getClasse(classeId)
    classe.value = classeResponse.data.data
    
    // Récupérer les élèves de la classe
    const elevesResponse = await api.getStudentsByClass(classeId)
    const rawData = Array.isArray(elevesResponse.data.data) ? elevesResponse.data.data : []
    
    // Transformer les données avec génération de matricules
    eleves.value = rawData.map((student, index) => ({
      ...student,
      matricule: generateMatricule(student, index)
    }))
    
  } catch (error) {
    console.error('Erreur chargement élèves:', error)
    eleves.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEleves()
})
</script>
