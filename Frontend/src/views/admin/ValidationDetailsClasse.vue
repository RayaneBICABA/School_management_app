<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-[1200px] mx-auto p-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-slate-500 dark:text-slate-400">Chargement des détails de la classe...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm text-slate-500 mb-4 font-display">
          <router-link to="/admin/validation-bulletins" class="hover:text-primary transition-colors">Validation des bulletins</router-link>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <span class="font-medium text-slate-900 dark:text-white">{{ classeInfo.nom }}</span>
        </nav>

        <!-- Page Heading with Back Button -->
        <div class="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div class="flex items-center gap-3">
            <button @click="$router.go(-1)" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>Retour</span>
            </button>
            <div class="flex flex-col gap-1 font-display">
              <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">{{ classeInfo.nom }}</h1>
              <div class="flex items-center gap-4 mt-2">
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-base">person</span>
                  {{ classeInfo.totalEleves }} Élèves
                </div>
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-base">school</span>
                  Prof. Principal: {{ classeInfo.profPrincipal }}
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">
                  En attente de validation
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="validerClasseEntiere" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 shadow-md transition-colors">
              <span class="material-symbols-outlined text-[20px]">verified</span>
              Valider la classe entière
            </button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase">Moyenne Classe</p>
            <p class="text-xl font-black text-primary mt-1">{{ stats.moyenneClasse }}/20</p>
          </div>
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase">Plus haute moy.</p>
            <p class="text-xl font-black text-green-600 mt-1">{{ stats.plusHauteMoy }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase">Plus basse moy.</p>
          <p class="text-xl font-black text-red-500 mt-1">{{ stats.plusBasseMoy }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase">Bulletins Prêts</p>
          <p class="text-xl font-black text-slate-800 dark:text-white mt-1">{{ stats.bulletinsPrets }}/{{ classeInfo.totalEleves }}</p>
        </div>
      </div>

      <!-- Students Table -->
      <div v-if="students.length > 0" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse font-display">
            <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">Rang</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Élève</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Moyenne Générale</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="student in students" :key="student.id" class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center size-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm" :class="{'bg-yellow-100 text-yellow-700': student.rang === 1}">
                    {{ student.rangText }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {{ student.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-[#0e141b] dark:text-white">{{ student.nom }}</p>
                      <p class="text-xs text-slate-500">ID: {{ student.matricule }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-black" :class="student.moyenne >= 10 ? 'text-green-600' : 'text-red-500'">
                      {{ student.moyenne }} / 20
                    </span>
                    <div class="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full" :class="student.moyenne >= 10 ? 'bg-green-500' : 'bg-red-500'" :style="`width: ${student.moyenne * 5}%`"></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="voirBulletin(student)" class="inline-flex items-center gap-1 text-primary text-sm font-bold hover:underline">
                    Voir bulletin
                    <span class="material-symbols-outlined text-base">open_in_new</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <p class="text-xs text-slate-500 font-medium">Affichage de {{ students.length }} élèves sur {{ classeInfo.totalEleves }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center mb-12">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-slate-400">school</span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun élève trouvé</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Cette classe ne contient aucun élève pour le moment.
            </p>
          </div>
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
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const classeId = route.params.id
const { success, error: showError } = useToast()

const isLoading = ref(true)
const classeInfo = ref({
  nom: '',
  totalEleves: 0,
  profPrincipal: '',
  niveau: '',
  section: '',
  serie: ''
})

const stats = ref({
  moyenneClasse: '0.00',
  plusHauteMoy: '0.00',
  plusBasseMoy: '0.00',
  bulletinsPrets: 0
})

const students = ref([])

// Voir le bulletin d'un élève
const voirBulletin = (student) => {
  if (student.bulletinId) {
    // We navigate to proviseur bulletin view as it is common or shared
    // Checking if /admin/bulletin/:id exists, else use proviseur one as it's likely identical
    router.push(`/proviseur/bulletin/${student.bulletinId}`)
  } else {
    showError('Aucun bulletin trouvé pour cet élève');
  }
}

// Charger les données de la classe
const fetchClasseDetails = async () => {
  try {
    isLoading.value = true
    const classeResponse = await api.getClasse(classeId)
    const classeData = classeResponse.data?.data || classeResponse.data
    
    if (!classeData) {
      throw new Error('Données de classe non trouvées')
    }
    
    classeInfo.value = {
      nom: classeData.section || classeData.nom || `Classe ${classeId}`,
      totalEleves: 0,
      profPrincipal: classeData.profPrincipal ? `${classeData.profPrincipal.nom} ${classeData.profPrincipal.prenom}` : 'Non assigné',
      niveau: classeData.niveau || '',
      section: classeData.section || '',
      serie: classeData.serie || ''
    }
    
    const bulletinsResponse = await api.getBulletinsByClasse(classeId);
    const bulletins = bulletinsResponse.data?.data || [];
    
    students.value = bulletins.map((b, index) => ({
      id: b.eleve._id,
      bulletinId: b._id,
      rang: parseInt(b.rang) || index + 1,
      rangText: b.rang === '1' ? '1er' : `${b.rang}e`,
      nom: `${b.eleve.nom} ${b.eleve.prenom}`,
      matricule: b.eleve.matricule || 'N/A',
      initials: `${b.eleve.nom?.[0] || ''}${b.eleve.prenom?.[0] || ''}`.toUpperCase(),
      moyenne: (b.moyenneGenerale || 0).toFixed(2),
      appreciation: b.appreciationGenerale || ''
    }));

    if (students.value.length === 0) {
         const studentsResponse = await api.getStudentsByClass(classeId)
         const studentsData = studentsResponse.data?.data || []
         students.value = studentsData.map((student, index) => ({
            id: student._id || student.id,
            bulletinId: null,
            rang: '-',
            rangText: '-',
            nom: `${student.nom || ''} ${student.prenom || ''}`.trim(),
            matricule: student.matricule || 'N/A',
            initials: `${student.nom?.[0] || ''}${student.prenom?.[0] || ''}`.toUpperCase(),
            moyenne: '0.00',
            appreciation: ''
         }));
    }
    
    classeInfo.value.totalEleves = students.value.length
    
    if (students.value.length > 0) {
      const moyennes = students.value.map(s => parseFloat(s.moyenne)).filter(m => m > 0);
      if (moyennes.length > 0) {
          stats.value = {
            moyenneClasse: (moyennes.reduce((sum, m) => sum + m, 0) / moyennes.length).toFixed(2),
            plusHauteMoy: Math.max(...moyennes).toFixed(2),
            plusBasseMoy: Math.min(...moyennes).toFixed(2),
            bulletinsPrets: bulletins.length
          }
      } else {
           stats.value = {
            moyenneClasse: '0.00',
            plusHauteMoy: '0.00',
            plusBasseMoy: '0.00',
            bulletinsPrets: 0
          }
      }

    } else {
      stats.value = {
        moyenneClasse: '0.00',
        plusHauteMoy: '0.00',
        plusBasseMoy: '0.00',
        bulletinsPrets: 0
      }
    }
    
  } catch (error) {
    console.error('Erreur chargement détails classe:', error)
    students.value = []
    classeInfo.value.totalEleves = 0
  } finally {
    isLoading.value = false
  }
}

const validerClasseEntiere = async () => {
    if (!confirm(`Confirmez-vous la validation de tous les bulletins pour la classe ${classeInfo.value.nom} ?`)) return;
    
    try {
        await api.validateClassBulletins(classeId);
        success('Classe validée avec succès !');
        fetchClasseDetails();
    } catch (e) {
        console.error(e);
        showError('Erreur lors de la validation de la classe.');
    }
}

onMounted(() => {
  fetchClasseDetails()
})
</script>
