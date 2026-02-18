<template>
  <aside class="w-72 bg-white dark:bg-[#1a242f] border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-10">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="bg-primary/10 p-2 rounded-lg">
          <span class="material-symbols-outlined text-primary text-3xl">school</span>
        </div>
        <span class="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Giscard</span>
      </div>

      <nav class="flex flex-col gap-1.5 flex-grow">
        <router-link to="/eleve" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveDashboard') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
          <span class="text-sm font-medium">Tableau de bord</span>
        </router-link>
        <router-link to="/eleve/progression" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveProgression') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">insights</span>
          <span class="text-sm font-medium">Ma Progression</span>
        </router-link>
        <router-link to="/eleve/notes" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveNotes') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">history_edu</span>
          <span class="text-sm font-medium">Mes Notes</span>
        </router-link>
        <router-link to="/eleve/bulletins" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveBulletins') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">description</span>
          <span class="text-sm font-medium">Bulletins</span>
        </router-link>
        <router-link to="/eleve/discipline" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveDiscipline') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">security_update_warning</span>
          <span class="text-sm font-medium">Discipline</span>
        </router-link>
        <router-link to="/eleve/calendrier" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveCalendrier') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">calendar_today</span>
          <span class="text-sm font-medium">Calendrier</span>
        </router-link>
        <router-link to="/eleve/notifications" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveNotifications') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">notifications</span>
          <span class="text-sm font-medium">Notifications</span>
          <span class="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">3</span>
        </router-link>
        <router-link to="/eleve/profil" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('EleveProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">person</span>
          <span class="text-sm font-medium">Mon Profil</span>
        </router-link>
      </nav>
    </div>
    <div class="mt-auto p-6 border-t border-slate-200 dark:border-slate-700">
      <router-link to="/login" class="flex items-center gap-3 px-3 py-2 text-red-500 hover:text-red-600 transition-all click-press">
        <span class="material-symbols-outlined">logout</span>
        <span class="text-sm font-medium">Déconnexion</span>
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
