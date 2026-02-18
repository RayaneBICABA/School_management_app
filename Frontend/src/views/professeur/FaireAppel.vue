<template>
  <div class="flex-1 min-w-0">

    <!-- Main Content -->
    <main class="flex-1 p-8 pb-12">
      <!-- Call Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <router-link to="/professeur/classes" class="text-[#4e7397] hover:text-primary transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
          </router-link>
          <div>
            <h1 class="text-3xl font-bold text-[#0e141b] dark:text-white">Faire l'Appel</h1>
            <p class="text-[#4e7397] dark:text-slate-400">{{ classeInfo.nom }} - Mathématiques • {{ currentDate }}</p>
          </div>
        </div>

        <!-- Call Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600">{{ callStats.present }}</p>
                <p class="text-xs text-green-700 dark:text-green-400">Présents</p>
              </div>
            </div>
          </div>
          <div class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-amber-600">schedule</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-amber-600">{{ callStats.late }}</p>
                <p class="text-xs text-amber-700 dark:text-amber-400">En retard</p>
              </div>
            </div>
          </div>
          <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-red-600">cancel</span>
              </div>
              <div>
                <p class="text-2xl font-bold text-red-600">{{ callStats.absent }}</p>
                <p class="text-xs text-red-700 dark:text-red-400">Absents</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-4 mb-8">
        <button @click="markAllPresent" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
          <span class="material-symbols-outlined mr-2">check_circle</span>
          Marquer tous présents
        </button>
        <button @click="resetCall" class="px-6 py-3 bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-700 text-[#0e141b] dark:text-slate-200 font-semibold rounded-lg hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined mr-2">refresh</span>
          Réinitialiser
        </button>
        <button @click="saveCall" class="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined mr-2">save</span>
          Sauvegarder l'appel
        </button>
      </div>

      <!-- Students List for Call -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-[#d0dbe7] dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-[#0e141b] dark:text-white">Liste d'appel</h3>
            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2 text-sm text-[#4e7397] dark:text-slate-400">
                <input type="checkbox" v-model="showOnlyAbsent" class="rounded border-[#d0dbe7] text-primary focus:ring-primary">
                Afficher uniquement les absents/retards
              </label>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto scroll-fade-mask">
          <table class="w-full border-separate border-spacing-0">
            <thead class="bg-slate-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Élève</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Présent</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">En retard</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Absent</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-[#4e7397] dark:text-slate-400 uppercase tracking-wider">Observations</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#d0dbe7] dark:divide-slate-700">
              <tr v-for="student in filteredStudents" :key="student.id" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary text-sm">person</span>
                    </div>
                    <div>
                      <p class="font-medium text-[#0e141b] dark:text-white">{{ student.name }}</p>
                      <p class="text-sm text-[#4e7397] dark:text-slate-400">{{ student.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <input 
                    type="radio" 
                    :name="'status-' + student.id" 
                    v-model="student.status" 
                    value="present"
                    class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  >
                </td>
                <td class="px-6 py-4 text-center">
                  <input 
                    type="radio" 
                    :name="'status-' + student.id" 
                    v-model="student.status" 
                    value="late"
                    class="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                  >
                </td>
                <td class="px-6 py-4 text-center">
                  <input 
                    type="radio" 
                    :name="'status-' + student.id" 
                    v-model="student.status" 
                    value="absent"
                    class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  >
                </td>
                <td class="px-6 py-4">
                  <input 
                    type="text" 
                    v-model="student.observations"
                    placeholder="Ajouter une observation..."
                    class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                </td>
              </tr>
              <!-- Bottom Padding Row -->
              <tr>
                <td colspan="5" class="py-6"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const classeId = route.query.id
const matiereId = route.query.matiereId // Fixed: Capture matiere ID
const classeInfo = ref({ nom: 'Chargement...' })

const currentDate = ref(new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const showOnlyAbsent = ref(false)
const isLoading = ref(true)

const students = ref([])

const fetchStudents = async () => {
  if (!classeId) return
  try {
    isLoading.value = true
    const response = await api.getStudentsByClass(classeId)
    students.value = response.data.data.map(s => ({
      id: s._id,
      name: `${s.prenom} ${s.nom}`,
      status: 'present',
      observations: ''
    }))
    
    // Also fetch class info to display the name
    const classeRes = await api.getClasse(classeId)
    classeInfo.value = classeRes.data.data
  } catch (error) {
    console.error('Erreur lors du chargement des élèves:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStudents()
})

const callStats = computed(() => {
  const present = students.value.filter(s => s.status === 'present').length
  const late = students.value.filter(s => s.status === 'late').length
  const absent = students.value.filter(s => s.status === 'absent').length
  return { present, late, absent }
})

const filteredStudents = computed(() => {
  if (!showOnlyAbsent.value) return students.value
  return students.value.filter(s => s.status !== 'present')
})

const markAllPresent = () => {
  students.value.forEach(student => {
    student.status = 'present'
    student.observations = ''
  })
}

const resetCall = () => {
  students.value.forEach(student => {
    student.status = 'present'
    student.observations = ''
  })
}

const saveCall = async () => {
  try {
    const attendanceData = {
      classeId,
      matiereId, // Fixed: Send matiere ID
      date: new Date(),
      attendanceList: students.value.map(s => ({
        studentId: s.id,
        status: s.status,
        observations: s.observations
      }))
    }

    await api.saveAttendance(attendanceData)
    alert('Appel sauvegardé avec succès !')
    router.push('/professeur/classes')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'appel:', error)
    alert('Erreur lors de la sauvegarde de l\'appel.')
  }
}
</script>
 
<style scoped>
/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 70, 229, 0.2) transparent;
  scroll-behavior: smooth;
}
 
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
 
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
 
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(79, 70, 229, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
}
 
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(79, 70, 229, 0.3);
}

/* Ensure sticky header borders look right */
th {
  background-clip: padding-box;
}

/* Premium Scroll Fade Effect */
.scroll-fade-mask {
  mask-image: linear-gradient(to bottom, 
    black 0%, 
    black 90%, 
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(to bottom, 
    black 0%, 
    black 90%, 
    transparent 100%
  );
}
</style>
