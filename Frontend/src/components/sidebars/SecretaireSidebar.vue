<template>
  <aside class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined">school</span>
        </div>
        <h1 class="text-lg font-bold">Secrétariat</h1>
      </div>
      <nav class="flex flex-col gap-1.5 flex-grow">
        <router-link to="/secretaire" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('SecretaireDashboard') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
          <span class="text-sm font-medium">Tableau de bord</span>
        </router-link>
        <router-link to="/secretaire/bulletins" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('SecretaireBulletins') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">print</span>
          <span class="text-sm font-medium">Impression Bulletins</span>
        </router-link>
        <router-link to="/secretaire/master-sheet" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('SecretaireMasterSheet') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">table_chart</span>
          <span class="text-sm font-medium">Récapitulatif des Notes</span>
        </router-link>

        <router-link to="/secretaire/archives" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('SecretaireArchives') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">archive</span>
          <span class="text-sm font-medium">Archives Scolaires</span>
        </router-link>

        <!-- Divider -->
        <div class="my-3 border-t border-slate-200 dark:border-slate-700"></div>

        <!-- User Management Section -->
        <div class="mb-2">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Gestion</p>
          <router-link to="/secretaire/utilisateurs" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('SecretaireUtilisateurs') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">group</span>
            <span class="text-sm font-medium">Administration</span>
          </router-link>
          <router-link to="/secretaire/eleves" 
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
            :class="isActive('SecretaireEleves') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
          >
            <span class="material-symbols-outlined transition-transform group-hover:scale-110">school</span>
            <span class="text-sm font-medium">Élèves</span>
          </router-link>
        </div>

        <!-- Divider -->
        <div class="my-3 border-t border-slate-200 dark:border-slate-700"></div>

        <router-link to="/secretaire/profil" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('SecretaireProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">person</span>
          <span class="text-sm font-medium">Profil</span>
        </router-link>
      </nav>
    </div>
    <div class="px-6 py-4 space-y-4">
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition-all hover:bg-white dark:hover:bg-slate-800 group">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Actuelle</p>
          <div class="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all group-hover:scale-125"></div>
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Année Scolaire {{ academicYear }}</p>
      </div>
      <div class="border-t border-slate-200 dark:border-slate-700 pt-2">
        <router-link to="/login" class="flex items-center gap-3 px-3 py-2 rounded-xl h-11 justify-center bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-bold transition-all click-press">
          <span class="material-symbols-outlined text-sm">logout</span>
          <span class="text-sm font-medium">Déconnexion</span>
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
