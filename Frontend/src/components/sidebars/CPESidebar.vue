<template>
  <aside class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
          <span class="material-symbols-outlined">school</span>
        </div>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">Année Scolaire {{ academicYear }}</p>
      </div>
      <nav class="flex flex-col gap-1.5 flex-grow">
        <router-link to="/cpe" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CPEDashboard') ? 'sidebar-active' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">dashboard</span>
          <span class="text-sm font-medium">Tableau de bord</span>
        </router-link>
        <router-link to="/cpe/absences" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CPEAbsences') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">event_busy</span>
          <span class="text-sm font-medium">Absences</span>
        </router-link>
        <router-link to="/cpe/master-sheet" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CPEMasterSheet') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">table_chart</span>
          <span class="text-sm font-medium">Récapitulatif des Notes</span>
        </router-link>

        <router-link to="/cpe/calendrier" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CPECalendrier') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">calendar_today</span>
          <span class="text-sm font-medium">Calendrier</span>
        </router-link>
        <router-link to="/cpe/notifications" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CPENotifications') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">notifications</span>
          <span class="text-sm font-medium">Envoi Notifications</span>
        </router-link>

        <router-link to="/cpe/profil" 
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
          :class="isActive('CPEProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
        >
          <span class="material-symbols-outlined transition-transform group-hover:scale-110">account_circle</span>
          <span class="text-sm font-medium">Mon Profil</span>
        </router-link>
      </nav>
    </div>
    <div class="mt-auto p-4">
      <button @click="$emit('logout')" class="flex w-full items-center justify-center gap-2 rounded-xl h-11 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all click-press">
        <span class="material-symbols-outlined text-sm">logout</span>
        <span class="truncate">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
