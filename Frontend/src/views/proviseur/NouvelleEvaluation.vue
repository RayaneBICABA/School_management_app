<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark">
    <div class="max-w-[700px] mx-auto p-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm mb-6">
        <router-link to="/proviseur" class="text-[#4e7397] hover:text-primary transition-colors">Accueil</router-link>
        <span class="text-[#4e7397]">/</span>
        <span class="text-[#0e141b] dark:text-white font-semibold">Nouvelle Évaluation</span>
      </nav>

      <!-- Main Form Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#d0dbe7] dark:border-slate-800 overflow-hidden">
        <div class="px-8 py-6 border-b border-[#d0dbe7] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 class="text-2xl font-bold text-[#0e141b] dark:text-white">Planifier une Évaluation</h2>
          <p class="text-sm text-[#4e7397] mt-1">Créez une session d'évaluation (DS, Examen) pour l'ensemble de l'établissement.</p>
        </div>

        <form @submit.prevent="submitEvaluation" class="p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200" for="eval-title">Titre de l'évaluation</label>
            <input v-model="evaluation.title" id="eval-title" type="text" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm p-3 dark:text-white" placeholder="Ex: Devoir Commun de Mathématiques" required/>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200" for="eval-type">Type d'examen</label>
              <select v-model="evaluation.type" id="eval-type" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm p-3 dark:text-white">
                <option value="interro">Interrogation</option>
                <option value="ds">Devoir Surveillé</option>
                <option value="examen">Examen national / blanc</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200" for="eval-coeff">Coefficient suggéré</label>
              <input v-model="evaluation.coeff" id="eval-coeff" min="0.5" step="0.5" type="number" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm p-3 dark:text-white"/>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200" for="eval-date">Date de début</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397] text-lg">calendar_today</span>
                <input v-model="evaluation.date" id="eval-date" type="date" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm p-3 pl-10 dark:text-white" required/>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200" for="eval-class">Niveau ou Classe</label>
              <select v-model="evaluation.classe" id="eval-class" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm p-3 dark:text-white">
                <option value="tous">Tous les niveaux</option>
                <option value="terminale">Toutes les Terminales</option>
                <option value="premiere">Toutes les Premières</option>
                <option value="seconde">Toutes les Secondes</option>
                <option value="3emeA">3ème A specifically</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200" for="eval-desc">Description ou directives administratives</label>
            <textarea v-model="evaluation.description" id="eval-desc" placeholder="Détails de l'organisation, surveillants requis, matériel autorisé..." rows="4" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-background-light dark:bg-slate-800 focus:ring-primary focus:border-primary text-sm p-3 dark:text-white"></textarea>
          </div>

          <div class="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <span class="material-symbols-outlined text-primary">info</span>
            <p class="text-xs text-slate-500 font-medium leading-relaxed">
              En tant que proviseur, cette évaluation sera notifiée à tous les professeurs des classes concernées et aux parents.
            </p>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button type="button" @click="$router.back()" class="px-6 py-2.5 rounded-lg text-sm font-bold text-[#4e7397] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Annuler
            </button>
            <button type="submit" class="px-8 py-2.5 rounded-lg text-sm font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
              Diffuser l'Évaluation
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'

const { success } = useToast()
const router = useRouter()

const evaluation = ref({
  title: '',
  type: 'ds',
  coeff: 1.0,
  date: '',
  classe: 'tous',
  description: ''
})

const submitEvaluation = () => {
  console.log('Proviseur Evaluation created:', evaluation.value)
  // Animation ou redirection
  success('Évaluation diffusée avec succès !')
  router.push('/proviseur')
}
</script>
