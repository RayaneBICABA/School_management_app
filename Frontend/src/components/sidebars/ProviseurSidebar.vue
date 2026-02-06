<template>
  <aside class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
    <div class="p-6 flex items-center gap-3">
      <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
        <span class="material-symbols-outlined">school</span>
      </div>
      <div class="flex flex-col">
        <h1 class="text-slate-900 dark:text-white text-base font-bold leading-tight">Gestion Scolaire</h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Panel Proviseur</p>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        <router-link to="/proviseur" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurDashboard') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurDashboard') ? 'text-primary' : ''">dashboard</span>
          <p class="text-sm" :class="isActive('ProviseurDashboard') ? 'font-semibold' : 'font-medium'">Tableau de bord</p>
        </router-link>
        <router-link to="/proviseur/suivi-activite" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurSuivi') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurSuivi') ? 'text-primary' : ''">groups</span>
          <p class="text-sm" :class="isActive('ProviseurSuivi') ? 'font-semibold' : 'font-medium'">Suivi activité enseignante</p>
        </router-link>
        <router-link to="/proviseur/validation-bulletins" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurValidation') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurValidation') ? 'text-primary' : ''">description</span>
          <p class="text-sm" :class="isActive('ProviseurValidation') ? 'font-semibold' : 'font-medium'">Validation des bulletins</p>
        </router-link>
        <router-link to="/proviseur/classes" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurClasses') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurClasses') ? 'text-primary' : ''">school</span>
          <p class="text-sm" :class="isActive('ProviseurClasses') ? 'font-semibold' : 'font-medium'">Classes & Filières</p>
        </router-link>

        <router-link to="/proviseur/emploi-temps" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurEmploiTemps') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurEmploiTemps') ? 'text-primary' : ''">calendar_month</span>
          <p class="text-sm" :class="isActive('ProviseurEmploiTemps') ? 'font-semibold' : 'font-medium'">Emploi du Temps</p>
        </router-link>

        <router-link to="/proviseur/affectation-eleves" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurAffectationEleves') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurAffectationEleves') ? 'text-primary' : ''">assignment_ind</span>
          <p class="text-sm" :class="isActive('ProviseurAffectationEleves') ? 'font-semibold' : 'font-medium'">Affectation des élèves</p>
        </router-link>
        <router-link to="/proviseur/utilisateurs" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurUtilisateurs') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurUtilisateurs') ? 'text-primary' : ''">manage_accounts</span>
          <p class="text-sm" :class="isActive('ProviseurUtilisateurs') ? 'font-semibold' : 'font-medium'">Gestion des Utilisateurs</p>
        </router-link>
        <router-link to="/proviseur/profil" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors" :class="isActive('ProviseurProfil') ? 'active-nav' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined" :class="isActive('ProviseurProfil') ? 'text-primary' : ''">person</span>
          <p class="text-sm" :class="isActive('ProviseurProfil') ? 'font-semibold' : 'font-medium'">Profil</p>
        </router-link>
    </nav>
    <div class="p-4 space-y-3">
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Actuelle</p>
          <div class="size-2 rounded-full bg-green-500"></div>
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Année Scolaire 2023-2024</p>
      </div>
      <router-link to="/login" class="flex w-full items-center justify-center gap-2 rounded-lg h-11 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all">
        <span class="material-symbols-outlined text-sm">logout</span>
        <span class="truncate">Déconnexion</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (routeName) => {
  return route.name === routeName
}
</script>

<style scoped>
.active-nav {
  background-color: #e7edf3;
  color: #0e141b;
}

.dark .active-nav {
  background-color: #1e293b;
  color: #ffffff;
}
</style>