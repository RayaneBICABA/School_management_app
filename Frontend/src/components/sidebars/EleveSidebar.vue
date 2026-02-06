<template>
  <aside class="w-72 bg-white dark:bg-[#1a242f] border-r border-slate-200 dark:border-slate-700 flex flex-col fixed h-full z-10">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="bg-primary/10 p-2 rounded-lg">
          <span class="material-symbols-outlined text-primary text-3xl">school</span>
        </div>
        <span class="text-xl font-bold tracking-tight">EduDash</span>
      </div>

      <nav class="flex flex-col gap-1">
        <router-link to="/eleve" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveDashboard') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="text-sm">Tableau de bord</span>
        </router-link>
        <router-link to="/eleve/notes" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveNotes') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">history_edu</span>
          <span class="text-sm font-medium">Historique des notes</span>
        </router-link>
        <router-link to="/eleve/bulletins" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveBulletins') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">description</span>
          <span class="text-sm font-medium">Bulletins</span>
        </router-link>
        <router-link to="/eleve/discipline" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveDiscipline') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">security_update_warning</span>
          <span class="text-sm font-medium">Discipline</span>
        </router-link>
        <router-link to="/eleve/calendrier" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveCalendrier') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">calendar_today</span>
          <span class="text-sm font-medium">Calendrier</span>
        </router-link>
        <router-link to="/eleve/notifications" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveNotifications') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">notifications</span>
          <span class="text-sm font-medium">Notifications</span>
          <span class="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>
        </router-link>
        <router-link to="/eleve/profil" class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors" :class="isActive('EleveProfil') ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'">
          <span class="material-symbols-outlined">person</span>
          <span class="text-sm font-medium">Mon Profil</span>
        </router-link>
      </nav>
    </div>
    <div class="mt-auto p-6 border-t border-slate-200 dark:border-slate-700">
      <router-link to="/login" class="flex items-center gap-3 px-3 py-2 text-red-500 hover:text-red-600 transition-colors">
        <span class="material-symbols-outlined">logout</span>
        <span class="text-sm font-medium">Déconnexion</span>
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
