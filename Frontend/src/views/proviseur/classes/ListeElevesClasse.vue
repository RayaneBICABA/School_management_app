<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <button @click="$router.go(-1)" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
            <span class="material-symbols-outlined">arrow_back</span>
            <span>Retour aux classes</span>
          </button>
          <h1 class="text-3xl font-black text-[#0e141b] dark:text-white">Liste des Élèves</h1>
        </div>
        <p class="text-[#4e7397] dark:text-slate-400 ml-14" v-if="classe">
          {{ classe.niveau }} {{ classe.section }} - {{ eleves.length }} élève(s)
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
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom Complet</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="eleve in eleves" :key="eleve._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.matricule }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-primary font-bold text-sm">{{ getInitials(eleve) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.prenom }} {{ eleve.nom }}</p>
                      <p v-if="eleve.email" class="text-xs text-slate-500">{{ eleve.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-[#0e141b] dark:text-slate-300">{{ eleve.email || 'Non renseigné' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-[#0e141b] dark:text-slate-300">{{ eleve.telephone || 'Non renseigné' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    @click="voirFicheEleve(eleve)"
                    class="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span class="material-symbols-outlined text-sm">person</span>
                    Voir la fiche
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const classeId = route.params.id

const isLoading = ref(true)
const eleves = ref([])
const classe = ref(null)

// Récupérer les initiales d'un élève
const getInitials = (eleve) => {
  return `${eleve.prenom?.[0] || ''}${eleve.nom?.[0] || ''}`.toUpperCase()
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
