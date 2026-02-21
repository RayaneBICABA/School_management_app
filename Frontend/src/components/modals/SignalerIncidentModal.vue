<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <span class="material-symbols-outlined">report_problem</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Signaler un incident</h3>
            <p class="text-xs text-slate-500">Documentez l'événement pour le suivi Vie Scolaire</p>
          </div>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
          <span class="material-symbols-outlined text-red-500">error</span>
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Student Search / Selection -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Élève concerné</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                v-model="studentSearch" 
                @input="searchStudents"
                class="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                placeholder="Rechercher un élève..." 
                type="text"
              />
              <!-- Results dropdown -->
              <div v-if="searchResults.length > 0 && !selectedStudent" class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                <button 
                  v-for="s in searchResults" 
                  :key="s._id"
                  @click="selectStudent(s)"
                  class="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 flex flex-col border-b border-slate-100 dark:border-slate-700 last:border-0"
                >
                  <span class="text-sm font-bold">{{ s.nom }} {{ s.prenom }}</span>
                  <span class="text-[10px] text-slate-500">{{ s.classe?.niveau }} {{ s.classe?.section }}</span>
                </button>
              </div>
              <!-- Selected Badge -->
              <div v-if="selectedStudent" class="mt-2 flex items-center justify-between p-2.5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {{ selectedStudent.nom[0] }}{{ selectedStudent.prenom[0] }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold">{{ selectedStudent.nom }} {{ selectedStudent.prenom }}</span>
                    <span class="text-[10px] text-slate-500">{{ selectedStudent.classe?.niveau }} {{ selectedStudent.classe?.section }}</span>
                  </div>
                </div>
                <button @click="selectedStudent = null; studentSearch = ''" class="text-slate-400 hover:text-red-500 transition-colors">
                  <span class="material-symbols-outlined text-sm">cancel</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Incident Type -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Type d'incident</label>
            <select v-model="form.type" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
              <option value="Discipline">Discipline / Comportement</option>
              <option value="Médical">Médical / Accident</option>
              <option value="Pédagogique">Pédagogique / Travail</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Priority -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Priorité</label>
            <div class="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <button @click="form.priorite = 'Basse'" :class="['flex-1 py-1.5 text-xs font-bold rounded-md transition-all', form.priorite === 'Basse' ? 'bg-white dark:bg-slate-700 text-green-600 shadow-sm' : 'text-slate-500']">Basse</button>
              <button @click="form.priorite = 'Moyenne'" :class="['flex-1 py-1.5 text-xs font-bold rounded-md transition-all', form.priorite === 'Moyenne' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm' : 'text-slate-500']">Moyenne</button>
              <button @click="form.priorite = 'Haute'" :class="['flex-1 py-1.5 text-xs font-bold rounded-md transition-all', form.priorite === 'Haute' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500']">Haute</button>
            </div>
          </div>
          <!-- Location -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Lieu de l'incident</label>
            <input v-model="form.lieu" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: Salle 204, Cour, Couloir..." type="text"/>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Titre synthétique</label>
          <input v-model="form.titre" class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Ex: Retard répété, Insolence envers professeur..." type="text"/>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Description détaillée</label>
          <textarea v-model="form.description" rows="4" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Décrivez les faits de manière objective..."></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
        <button @click="$emit('close')" class="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Annuler</button>
        <button 
          @click="submitIncident" 
          :disabled="!isValid || isSubmitting"
          class="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-sm">sync</span>
          <span class="material-symbols-outlined text-sm">send</span>
          Envoyer le rapport
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/services/api'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'success'])

const isSubmitting = ref(false)
const error = ref('')
const studentSearch = ref('')
const searchResults = ref([])
const selectedStudent = ref(null)

const form = ref({
  eleve: '',
  type: 'Discipline',
  priorite: 'Moyenne',
  lieu: '',
  titre: '',
  description: ''
})

const isValid = computed(() => {
  return selectedStudent.value && form.value.titre && form.value.description && form.value.type
})

const searchStudents = async () => {
  if (studentSearch.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const res = await api.getUsers()
    const allUsers = res.data.data
    searchResults.value = allUsers.filter(u => 
      u.role === 'ELEVE' && 
      (u.nom.toLowerCase().includes(studentSearch.value.toLowerCase()) || 
       u.prenom.toLowerCase().includes(studentSearch.value.toLowerCase()))
    ).slice(0, 5)
  } catch (err) {
    console.error('Search error:', err)
  }
}

const selectStudent = (student) => {
  selectedStudent.value = student
  form.value.eleve = student._id
  studentSearch.value = `${student.nom} ${student.prenom}`
  searchResults.value = []
}

const submitIncident = async () => {
  if (!isValid.value) return
  
  isSubmitting.value = true
  error.value = ''
  try {
    await api.createIncident(form.value)
    emit('success')
    // Reset form
    form.value = {
      eleve: '',
      type: 'Discipline',
      priorite: 'Moyenne',
      lieu: '',
      titre: '',
      description: ''
    }
    selectedStudent.value = null
    studentSearch.value = ''
    emit('close')
  } catch (err) {
    error.value = err.response?.data?.error || "Erreur lors de l'envoi du rapport"
  } finally {
    isSubmitting.value = false
  }
}
</script>
