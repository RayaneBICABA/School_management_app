<template>
  <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm">
      <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
      <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
      <router-link to="/censeur/classes" class="text-[#4e7397] hover:text-primary font-medium">Gestion des Classes</router-link>
      <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
      <span class="font-medium">Fiche Élève</span>
    </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Fiche Élève</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Vue détaillée de la performance et de l'assiduité.</p>
      </div>
    </div>

      <!-- Student Info Card -->
      <div class="bg-white rounded-lg border p-6">
        <div class="flex items-center gap-6 mb-6">
          <div class="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold">
            {{ student.prenom?.charAt(0).toUpperCase() }}{{ student.nom?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-900">{{ student.prenom }} {{ student.nom }}</h2>
            <p class="text-slate-500">Matricule: {{ student.matricule }}</p>
            <p class="text-slate-500">Classe: {{ student.classe }}</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 p-4 rounded-lg">
            <p class="text-xs text-slate-500 uppercase">Moyenne Générale</p>
            <p class="text-xl font-bold text-primary">{{ (student.moyenneGenerale || 0).toFixed(2) }}/20</p>
          </div>
          <div class="bg-slate-50 p-4 rounded-lg">
            <p class="text-xs text-slate-500 uppercase">Absences</p>
            <p class="text-xl font-bold text-orange-600">{{ student.absences || 0 }}</p>
          </div>
          <div class="bg-slate-50 p-4 rounded-lg">
            <p class="text-xs text-slate-500 uppercase">Retards</p>
            <p class="text-xl font-bold text-yellow-600">{{ student.retards || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="bg-white rounded-lg border p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4">Notes par matière</h3>
        <div class="space-y-3">
          <div v-for="note in notes" :key="note.matiere" class="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <div>
              <p class="font-medium text-slate-900">{{ note.matiere }}</p>
              <p class="text-sm text-slate-500">Coefficient: {{ note.coefficient }}</p>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg">{{ (note.valeur || 0).toFixed(2) }}/20</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!student.nom" class="bg-white rounded-lg border p-12 text-center">
        <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">person</span>
        <p class="text-slate-500">Informations de l'élève non disponibles</p>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const student = ref({})
const notes = ref([])

// Charger les informations de l'élève
const fetchStudentInfo = async () => {
  try {
    // Utiliser une API générique pour les informations de l'élève
    const response = await api.getUsers({ role: 'ELEVE', id: route.params.eleveId })
    if (response.data.success && response.data.data.length > 0) {
      student.value = response.data.data[0]
      await fetchNotes()
    } else {
      // Utiliser des données de test
      student.value = {
        id: route.params.eleveId,
        nom: 'Dupont',
        prenom: 'Jean',
        matricule: 'MAT001',
        classe: '2nde A',
        moyenneGenerale: 15.5,
        absences: 2,
        retards: 1
      }
      await fetchNotes()
    }
  } catch (error) {
    console.error('Erreur chargement élève:', error)
    // Utiliser des données de test en cas d'erreur
    student.value = {
      id: route.params.eleveId,
      nom: 'Dupont',
      prenom: 'Jean',
      matricule: 'MAT001',
      classe: '2nde A',
      moyenneGenerale: 15.5,
      absences: 2,
      retards: 1
    }
    await fetchNotes()
  } finally {
    isLoading.value = false
  }
}

// Charger les notes de l'élève
const fetchNotes = async () => {
  try {
    // Utiliser des données de test pour les notes
    notes.value = [
      { matiere: 'Mathématiques', coefficient: 4, valeur: 16.5 },
      { matiere: 'Français', coefficient: 3, valeur: 14.0 },
      { matiere: 'Physique', coefficient: 3, valeur: 15.2 },
      { matiere: 'Anglais', coefficient: 2, valeur: 13.8 }
    ]
  } catch (error) {
    console.error('Erreur chargement notes:', error)
    notes.value = []
  }
}

onMounted(() => {
  fetchStudentInfo()
})
</script>
