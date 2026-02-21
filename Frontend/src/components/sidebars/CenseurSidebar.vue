<template>
  <aside class="w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
    <div class="p-6 flex flex-col h-full">
      <!-- Logo and App Name -->
      <div class="flex items-center gap-3 mb-8 px-2">
        <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined">school</span>
        </div>
        <h1 class="text-lg font-bold tracking-tight">Unica</h1>
      </div>

      <!-- Navigation Links -->
      <nav class="flex flex-col gap-1.5 flex-grow">
        <router-link to="/censeur" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurDashboard') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
          <p class="text-sm">Tableau de bord</p>
        </router-link>
        <router-link to="/censeur/suivi" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurSuivi') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">analytics</span>
          <p class="text-sm">Suivi Avancement</p>
        </router-link>
        <router-link to="/censeur/dispensations" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurDispensations') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">person_off</span>
          <p class="text-sm">Gestion des Dispensations</p>
        </router-link>
        <router-link to="/censeur/master-sheet" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurMasterSheet') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">table_chart</span>
          <p class="text-sm">Récapitulatif des Notes</p>
        </router-link>
        <router-link to="/censeur/notes" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurNotes') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">description</span>
          <p class="text-sm">Gestion des Notes</p>
        </router-link>
        <router-link to="/censeur/deblocage" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurDeblocage') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">lock_open</span>
          <p class="text-sm">Déblocage des Notes</p>
          <span class="ml-auto bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full" :class="isActive('CenseurDeblocage') ? 'bg-white/20 text-white shadow-sm' : ''">5</span>
        </router-link>
        <router-link to="/censeur/validation-evaluations" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurValidationEvaluations') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">rule</span>
          <p class="text-sm">Validation Évaluations</p>
        </router-link>
        <router-link to="/censeur/classes" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurClasses') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">school</span>
          <p class="text-sm">Classes & Filières</p>
        </router-link>
        <router-link to="/censeur/professeurs" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurProfesseurs') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">person</span>
          <p class="text-sm">Gestion des Professeurs</p>
        </router-link>
        <router-link to="/censeur/profil" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CenseurProfil') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-slate-200'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">account_circle</span>
          <p class="text-sm">Profil</p>
        </router-link>
      </nav>
      <!-- Bottom Actions -->
      <div class="mt-auto space-y-2">
        <button @click="$emit('openModal')" class="flex w-full items-center justify-center gap-2 rounded-xl h-11 bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all click-press">
          <span class="material-symbols-outlined text-sm">add</span>
          <span class="truncate">Nouvelle Session</span>
        </button>
        <button @click="$emit('logout')" class="flex w-full items-center justify-center gap-2 rounded-xl h-11 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all click-press">
          <span class="material-symbols-outlined text-sm">logout</span>
          <span class="truncate">Déconnexion</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAcademicYear } from '@/composables/useAcademicYear'

// Déclarer les événements émis
defineEmits(['openModal', 'logout'])

const route = useRoute()
const { academicYear } = useAcademicYear()

const isActive = (routeName) => {
  return route.name === routeName
}
</script>
