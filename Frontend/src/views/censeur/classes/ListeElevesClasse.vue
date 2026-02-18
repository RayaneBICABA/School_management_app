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
              <tr v-for="eleve in eleves" :key="eleve.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
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
                      <p class="text-xs text-slate-500">{{ eleve.classe?.niveau }} {{ eleve.classe?.section }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-[#0e141b] dark:text-slate-300">{{ eleve.email || 'N/A' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-[#0e141b] dark:text-slate-300">{{ eleve.telephone || 'N/A' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    @click="voirFicheEleve(eleve)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary bg-primary/10 hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <span class="material-symbols-outlined text-sm mr-1">visibility</span>
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
        <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">groups</span>
        <h3 class="text-lg font-medium text-slate-900 dark:text-white mb-2">Aucun élève trouvé</h3>
        <p class="text-slate-500 dark:text-slate-400">Cette classe ne contient aucun élève pour le moment.</p>
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
  router.push(`/censeur/classes/${classeId}/eleve/${eleve.id}`)
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
    if (classeResponse.data.success) {
      classe.value = classeResponse.data.data
    }
    
    // Récupérer les élèves de la classe
    const elevesResponse = await api.getStudentsByClass(classeId)
    const rawData = Array.isArray(elevesResponse.data.data) ? elevesResponse.data.data : []
    
    // Traiter les données pour générer les matricules si nécessaire
    eleves.value = rawData.map((student, index) => {
      // S'assurer que l'étudiant a un ID
      const studentId = student.id || student._id || `student-${index}`
      
      return {
        ...student,
        id: studentId, // Normaliser l'ID
        matricule: generateMatricule(student, index)
      }
    })
    
  } catch (error) {
    console.error('Erreur lors du chargement des élèves:', error)
    eleves.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEleves()
})
</script>
