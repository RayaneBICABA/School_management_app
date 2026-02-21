<template>
  <aside class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
    <div class="p-6 flex items-center gap-3">
      <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
        <span class="material-symbols-outlined">school</span>
      </div>
      <div class="flex flex-col">
        <h1 class="text-slate-900 dark:text-white text-base font-bold leading-tight">Unica</h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Panel Proviseur</p>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
        <router-link to="/proviseur" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurDashboard') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
          <p class="text-sm font-medium">Tableau de bord</p>
        </router-link>
        <router-link to="/proviseur/suivi-activite" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurSuivi') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">groups</span>
          <p class="text-sm font-medium">Suivi activité enseignante</p>
        </router-link>
        <router-link to="/proviseur/validation-bulletins" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurValidation') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">description</span>
          <p class="text-sm font-medium">Validation des bulletins</p>
        </router-link>
        <router-link to="/proviseur/master-sheet" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurMasterSheet') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">table_chart</span>
          <span class="text-sm font-medium">Récapitulatif des Notes</span>
        </router-link>
        <router-link to="/proviseur/classes" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurClasses') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">school</span>
          <p class="text-sm font-medium">Classes & Filières</p>
        </router-link>

        <router-link to="/proviseur/emploi-temps" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurEmploiTemps') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">calendar_month</span>
          <p class="text-sm font-medium">Emploi du Temps</p>
        </router-link>

        <router-link to="/proviseur/affectation-eleves" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurAffectationEleves') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">assignment_ind</span>
          <p class="text-sm font-medium">Affectation des élèves</p>
        </router-link>
        <router-link to="/proviseur/utilisateurs" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurUtilisateurs') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">manage_accounts</span>
          <p class="text-sm font-medium">Gestion des Utilisateurs</p>
        </router-link>
        <router-link to="/proviseur/profil" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ProviseurProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">person</span>
          <p class="text-sm font-medium">Profil</p>
        </router-link>
    </nav>
    <div class="p-4 space-y-3">
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition-all hover:bg-white dark:hover:bg-slate-800 group">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Actuelle</p>
          <div class="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all group-hover:scale-125"></div>
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Année Scolaire {{ academicYear }}</p>
      </div>
      <router-link to="/login" class="flex w-full items-center justify-center gap-2 rounded-xl h-11 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all click-press">
        <span class="material-symbols-outlined text-sm">logout</span>
        <span class="truncate">Déconnexion</span>
      </router-link>
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

<style scoped>
</style>