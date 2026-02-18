<template>
  <div class="flex-1 min-w-0">

    <!-- Main Content -->
    <main class="flex-1 p-8">
      <!-- Class Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <router-link to="/professeur/classes" class="text-[#4e7397] hover:text-primary transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
          </router-link>
          <div>
            <h1 class="text-3xl font-bold text-[#0e141b] dark:text-white">3ème A - Mathématiques</h1>
            <p class="text-[#4e7397] dark:text-slate-400">32 élèves • Année scolaire 2023-2024</p>
          </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d0dbe7] dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">groups</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-[#0e141b] dark:text-white">32</p>
                <p class="text-xs text-[#4e7397] dark:text-slate-400">Total élèves</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d0dbe7] dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-green-600">trending_up</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">14.2</p>
                <p class="text-xs text-[#4e7397] dark:text-slate-400">Moyenne générale</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d0dbe7] dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-amber-600">assignment</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-amber-600">8</p>
                <p class="text-xs text-[#4e7397] dark:text-slate-400">Évaluations</p>
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d0dbe7] dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-blue-600">event</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-blue-600">3</p>
                <p class="text-xs text-[#4e7397] dark:text-slate-400">Prochains contrôles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 mb-8">
        <router-link to="/professeur/nouvelle-evaluation" class="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined mr-2">add</span>
          Nouvelle évaluation
        </router-link>
        <router-link to="/professeur/faire-appel" class="px-6 py-3 bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-700 text-[#0e141b] dark:text-slate-200 font-semibold rounded-lg hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined mr-2">fact_check</span>
          Faire l'appel
        </router-link>
        <button @click="exporterListe" class="px-6 py-3 bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-700 text-[#0e141b] dark:text-slate-200 font-semibold rounded-lg hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined mr-2">download</span>
          Exporter la liste
        </button>
      </div>

      <!-- Students List -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-[#d0dbe7] dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-800">
          <h3 class="text-lg font-semibold text-[#0e141b] dark:text-white">Liste des élèves</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Élève</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Moyenne</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Absences</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Dernière note</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#d0dbe7] dark:divide-slate-700">
              <tr v-for="student in students" :key="student.id" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div>
                      <p class="font-medium text-[#0e141b] dark:text-white">{{ student.name }}</p>
                      <p class="text-sm text-[#4e7397] dark:text-slate-400">Matricule: {{ student.matricule }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-semibold" :class="getMoyenneColor(student.moyenne)">{{ student.moyenne }}/20</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-[#4e7397] dark:text-slate-400">{{ student.absences }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-medium text-[#0e141b] dark:text-white">{{ student.lastNote }}/20</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button class="text-primary hover:text-primary/80 text-sm font-medium">Voir</button>
                    <button class="text-[#4e7397] hover:text-primary text-sm font-medium">Notes</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

// Générer un matricule unique
const generateMatricule = (student, index) => {
  // Si l'étudiant a déjà un matricule, le conserver
  if (student.matricule && student.matricule !== 'N/A' && student.matricule !== '-') {
    return student.matricule
  }
  
  // Sinon, générer un matricule dynamiquement
  const currentYear = new Date().getFullYear()
  const baseMatricule = `${currentYear}`
  
  // Utiliser le nom pour créer une partie unique
  const nameParts = student.name.split(' ')
  const firstName = nameParts[0] || 'ELEVE'
  const lastName = nameParts[1] || 'INCONNU'
  
  const namePart = `${lastName.slice(0, 3).toUpperCase()}${firstName.slice(0, 3).toUpperCase()}`
  
  // Ajouter un index pour garantir l'unicité
  const indexPart = String(index + 1).padStart(3, '0')
  
  return `${baseMatricule}-${namePart}${indexPart}`
}

const students = ref([])
const isLoading = ref(true)
const classeId = route.params.id

const fetchStudents = async () => {
  try {
    isLoading.value = true
    const response = await api.getStudentsByClass(classeId)
    const rawData = Array.isArray(response.data.data) ? response.data.data : []
    
    students.value = rawData.map((student, index) => ({
      id: student._id,
      name: `${student.prenom} ${student.nom}`,
      moyenne: student.moyenneGenerale || 0,
      absences: student.totalAbsences || 0,
      lastNote: student.derniereNote || 0,
      matricule: generateMatricule(student, index)
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des élèves:', error)
    students.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStudents()
})

const getMoyenneColor = (moyenne) => {
  if (moyenne >= 15) return 'text-green-600'
  if (moyenne >= 12) return 'text-blue-600'
  if (moyenne >= 10) return 'text-amber-600'
  return 'text-red-600'
}

const exporterListe = () => {
  console.log('Exporting student list...')
  alert('Export de la liste lancé !')
}
</script>
