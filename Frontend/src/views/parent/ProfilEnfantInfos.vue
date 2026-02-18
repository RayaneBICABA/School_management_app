<template>
  <div class="space-y-6">
    <!-- Information Section -->
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-slate-900 dark:text-white text-lg font-bold">Informations Administratives</h3>
        <button @click="$emit('edit-info')" class="text-primary text-sm font-medium flex items-center gap-1">
          <span class="material-symbols-outlined text-lg">edit</span>
          Modifier
        </button>
      </div>
      <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <div class="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 py-4">
          <p class="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Date de naissance</p>
          <p class="text-slate-900 dark:text-white text-sm font-medium">{{ formatDate(childProfile.birthDate) }}</p>
        </div>
        <div class="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 py-4">
          <p class="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Lieu de naissance</p>
          <p class="text-slate-900 dark:text-white text-sm font-medium">{{ childProfile.birthPlace }}</p>
        </div>
        <div class="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 py-4">
          <p class="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Adresse de résidence</p>
          <p class="text-slate-900 dark:text-white text-sm font-medium">{{ childProfile.address }}</p>
        </div>
        <div class="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 py-4">
          <p class="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Groupe Sanguin</p>
          <p class="text-slate-900 dark:text-white text-sm font-medium">{{ childProfile.bloodGroup }}</p>
        </div>
        <div class="flex flex-col gap-1 py-4">
          <p class="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Langue Maternelle</p>
          <p class="text-slate-900 dark:text-white text-sm font-medium">{{ childProfile.nativeLanguage }}</p>
        </div>
        <div class="flex flex-col gap-1 py-4">
          <p class="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Date d'inscription</p>
          <p class="text-slate-900 dark:text-white text-sm font-medium">{{ childProfile.enrollmentDate }}</p>
        </div>
      </div>
      
      <!-- Missing Information Alert -->
      <div v-if="hasMissingInfo" class="mx-4 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div class="flex items-start gap-2">
          <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg mt-0.5">warning</span>
          <div class="flex-1">
            <p class="text-sm font-medium text-amber-800 dark:text-amber-200">Informations incomplètes</p>
            <p class="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Certaines informations de votre enfant sont manquantes. Cliquez sur "Modifier" pour les compléter.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Teaching Team Preview -->
    <div>
      <div class="flex justify-between items-end mb-3 px-1">
        <h3 class="text-slate-900 dark:text-white text-lg font-bold">Professeurs Principaux</h3>
        <button @click="$emit('view-team')" class="text-primary text-sm font-medium">Voir tout l'équipe</button>
      </div>
      <div v-if="mainTeachers.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="teacher in mainTeachers" :key="teacher.id" class="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-hover hover:border-primary/50">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-12" :style="`background-image: url('${teacher.avatar}')`"></div>
          <div class="flex flex-col flex-1">
            <h4 class="text-slate-900 dark:text-white text-sm font-bold">{{ teacher.name }}</h4>
            <p class="text-slate-500 dark:text-slate-400 text-xs">{{ teacher.subject }}</p>
          </div>
          <button @click="$emit('contact-teacher', teacher)" class="text-slate-500 hover:text-primary transition-colors">
            <span class="material-symbols-outlined">mail</span>
          </button>
        </div>
      </div>
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">school</span>
        <p class="text-slate-500 dark:text-slate-400 text-sm">Aucun professeur assigné actuellement</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  childProfile: {
    type: Object,
    required: true
  },
  mainTeachers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit-info', 'contact-teacher', 'view-team'])

// Vérifier si des informations sont manquantes
const hasMissingInfo = computed(() => {
  const fields = [
    props.childProfile.birthDate,
    props.childProfile.birthPlace,
    props.childProfile.address,
    props.childProfile.bloodGroup
  ]
  
  return fields.some(field => 
    !field || field === 'Non renseigné(e)' || field === 'Non défini(e)' || field === 'Non renseigné'
  )
})

// Formater la date
const formatDate = (dateString) => {
  if (!dateString || dateString === 'Non renseignée') return dateString
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateString
  }
}
</script>
