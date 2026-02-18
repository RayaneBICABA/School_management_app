<template>
  <aside class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined">school</span>
        </div>
        <h1 class="text-lg font-bold">EduParent</h1>
      </div>
      <nav class="flex flex-col gap-1.5 flex-grow">
        <router-link to="/parent" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentDashboard') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
          <span class="text-sm font-medium">Tableau de bord</span>
        </router-link>
        <router-link to="/parent/bulletins" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentBulletins') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">description</span>
          <span class="text-sm font-medium">Bulletins</span>
        </router-link>
        <router-link to="/parent/notes" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentNotes') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">history_edu</span>
          <span class="text-sm font-medium">Historique des notes</span>
        </router-link>
        <router-link to="/parent/discipline" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentDiscipline') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">security_update_warning</span>
          <span class="text-sm font-medium">Discipline</span>
        </router-link>
        <router-link to="/parent/calendrier" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentCalendrier') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">calendar_today</span>
          <span class="text-sm font-medium">Calendrier</span>
        </router-link>
        <router-link to="/parent/notifications" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentNotifications') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">notifications</span>
          <span class="text-sm font-medium">Notifications</span>
        </router-link>
        <router-link to="/parent/justifier-absence" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentJustifierAbsence') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">edit_note</span>
          <span class="text-sm font-medium">Justifier une absence</span>
        </router-link>
        <router-link to="/parent/profil" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('ParentProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">account_circle</span>
          <span class="text-sm font-medium">Mon Profil</span>
        </router-link>
      </nav>
    </div>
    <div class="p-4 space-y-3">
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition-all hover:bg-white dark:hover:bg-slate-800 group">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Actuelle</p>
          <div class="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] transition-all group-hover:scale-125"></div>
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Année Scolaire {{ academicYear }}</p>
      </div>
      <button @click="$emit('logout')" class="flex w-full items-center justify-center gap-2 rounded-xl h-11 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all click-press">
        <span class="material-symbols-outlined text-sm">logout</span>
        <span class="truncate">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAcademicYear } from '@/composables/useAcademicYear'

// Déclarer les événements émis
defineEmits(['logout'])

const route = useRoute()
const { academicYear } = useAcademicYear()

const isActive = (routeName) => {
  return route.name === routeName
}
</script>
