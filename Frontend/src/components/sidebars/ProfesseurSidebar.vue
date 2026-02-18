<template>
  <aside class="w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-[#e7edf3] dark:border-slate-800">
    <div class="p-6 flex flex-col h-full justify-between">
      <div class="flex flex-col gap-8">
        <div class="flex items-center gap-3 px-2">
          <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span class="material-symbols-outlined">school</span>
          </div>
          <h1 class="text-lg font-bold tracking-tight">EduManager</h1>
        </div>

        <nav class="flex flex-col gap-1.5 flex-grow">
          <router-link to="/professeur" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('ProfesseurDashboard') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
            <p class="text-sm font-medium">Tableau de bord</p>
          </router-link>
          <router-link to="/professeur/emploi-temps" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('ProfesseurEmploiTemps') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">calendar_today</span>
            <p class="text-sm font-medium">Emploi du temps</p>
          </router-link>
          <router-link to="/professeur/saisie-notes" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('ProfesseurSaisieNotes') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">edit_note</span>
            <p class="text-sm font-medium">Saisie des notes</p>
          </router-link>
          <router-link to="/professeur/classes" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('ProfesseurClasses') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">groups</span>
            <p class="text-sm font-medium">Mes Classes</p>
          </router-link>
          <router-link to="/professeur/master-sheet" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('ProfesseurMasterSheet') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">table_chart</span>
            <span class="text-sm font-medium">Récapitulatif des Notes</span>
          </router-link>

          <router-link to="/professeur/profil" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('ProfesseurProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">person</span>
            <p class="text-sm font-medium">Profil</p>
          </router-link>
        </nav>
      </div>
      <div class="flex flex-col gap-3">
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition-all hover:bg-white dark:hover:bg-slate-800 group">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Actuelle</p>
            <div class="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all group-hover:scale-125"></div>
          </div>
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Année Scolaire {{ academicYear }}</p>
        </div>
        <router-link to="/login" class="flex items-center gap-3 px-3 py-2 rounded-xl h-11 justify-center bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-bold transition-all click-press">
          <span class="material-symbols-outlined text-sm">logout</span>
          <p class="text-sm">Déconnexion</p>
        </router-link>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAcademicYear } from '@/composables/useAcademicYear'

const route = useRoute()
const { academicYear } = useAcademicYear()

const isActive = (routeName) => {
  return route.name === routeName
}
</script>
