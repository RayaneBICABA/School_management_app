<template>
  <aside class="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
    <div class="p-6 flex items-center gap-3">
      <div class="bg-primary size-10 rounded-lg flex items-center justify-center text-white">
        <span class="material-symbols-outlined">school</span>
      </div>
      <div class="flex flex-col">
        <h1 class="text-slate-900 dark:text-white text-base font-bold leading-tight">Gestion Scolaire</h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">Admin Panel</p>
      </div>
    </div>
    <nav class="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
      <router-link to="/admin" 
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" 
        :class="isActive('AdminDashboard') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'"
      >
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">dashboard</span>
        <span class="text-sm font-medium">Tableau de bord</span>
      </router-link>

      <!-- Gestion Utilisateurs Dropdown -->
      <div class="space-y-1">
        <button @click="isUsersOpen = !isUsersOpen" 
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary" 
          :class="{'bg-slate-50 dark:bg-slate-800 text-primary dark:text-primary': isUsersOpen || isActive('AdminUsers')}"
        >
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">group</span>
            <span class="text-sm font-medium">Gestion Utilisateurs</span>
          </div>
          <span class="material-symbols-outlined text-lg transition-transform duration-300" :class="{'rotate-180': isUsersOpen}">expand_more</span>
        </button>

        <transition
          enter-active-class="transition-all duration-300 ease-out-expo"
          leave-active-class="transition-all duration-200 ease-in-out-soft"
          enter-from-class="opacity-0 -translate-y-2 max-h-0 overflow-hidden"
          enter-to-class="opacity-100 translate-y-0 max-h-40 overflow-hidden"
          leave-from-class="opacity-100 translate-y-0 max-h-40 overflow-hidden"
          leave-to-class="opacity-0 -translate-y-2 max-h-0 overflow-hidden"
        >
          <div v-show="isUsersOpen" class="pl-4 space-y-1">
              <!-- Administration -->
              <div class="flex items-center group">
                 <router-link to="/admin/utilisateurs/administration" class="flex-1 flex items-center gap-2 px-3 py-2 rounded-l-lg transition-all text-xs font-medium" :class="isActiveParam('administration') ? 'text-primary bg-primary/5 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'">
                   <span class="size-1.5 rounded-full bg-blue-500"></span>
                   Administration
                 </router-link>
                 <router-link to="/admin/ajouter-utilisateur?role=ADMIN" class="px-2 py-2 rounded-r-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all click-press" title="Ajouter membre administration">
                   <span class="material-symbols-outlined text-sm">add</span>
                 </router-link>
              </div>

              <!-- Parents -->
               <div class="flex items-center group">
                 <router-link to="/admin/utilisateurs/parents" class="flex-1 flex items-center gap-2 px-3 py-2 rounded-l-lg transition-all text-xs font-medium" :class="isActiveParam('parents') ? 'text-primary bg-primary/5 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'">
                   <span class="size-1.5 rounded-full bg-green-500"></span>
                   Gestion des Parents
                 </router-link>
                 <router-link to="/admin/ajouter-utilisateur?role=PARENT" class="px-2 py-2 rounded-r-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all click-press" title="Ajouter parent">
                   <span class="material-symbols-outlined text-sm">add</span>
                 </router-link>
              </div>

              <!-- Eleves -->
               <div class="flex items-center group">
                 <router-link to="/admin/utilisateurs/eleves" class="flex-1 flex items-center gap-2 px-3 py-2 rounded-l-lg transition-all text-xs font-medium" :class="isActiveParam('eleves') ? 'text-primary bg-primary/5 font-bold' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'">
                   <span class="size-1.5 rounded-full bg-purple-500"></span>
                   Gestion des Élèves
                 </router-link>
                 <router-link to="/admin/ajouter-utilisateur?role=ELEVE" class="px-2 py-2 rounded-r-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-all click-press" title="Ajouter élève">
                   <span class="material-symbols-outlined text-sm">add</span>
                 </router-link>
              </div>
          </div>
        </transition>
      </div>

      <router-link to="/admin/classes" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminClasses') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">account_tree</span>
        <span class="text-sm font-medium">Classes & Filières</span>
      </router-link>
      <router-link to="/admin/cours" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminCours') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">calendar_today</span>
        <span class="text-sm font-medium">Cours & Emplois du temps</span>
      </router-link>
      <router-link to="/admin/examens" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminExamens') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">history_edu</span>
        <span class="text-sm font-medium">Examens</span>
      </router-link>
      <router-link to="/admin/affectations" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminAffectations') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">assignment_ind</span>
        <span class="text-sm font-medium">Affectations</span>
      </router-link>
      <router-link to="/admin/notes" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminNotes') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">description</span>
        <span class="text-sm font-medium">Gestion des Notes</span>
      </router-link>
      <router-link to="/admin/validation-bulletins" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminValidation') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">verified</span>
        <span class="text-sm font-medium">Validation Bulletins</span>
      </router-link>
      <router-link to="/admin/master-sheet" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminMasterSheet') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">table_chart</span>
        <span class="text-sm font-medium">Récapitulatif des Notes</span>
      </router-link>
      <div class="my-4 border-t border-slate-100 dark:border-slate-800"></div>
      <router-link to="/admin/configuration" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminConfig') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">settings</span>
        <span class="text-sm font-medium">Configuration Année</span>
      </router-link>

      <router-link to="/admin/profil" class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out-expo group" :class="isActive('AdminProfil') ? 'sidebar-active' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-primary transition-all'">
        <span class="material-symbols-outlined text-xl transition-transform group-hover:scale-110">account_circle</span>
        <span class="text-sm font-medium">Profil</span>
      </router-link>
    </nav>
    <div class="p-4 space-y-3">
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition-all hover:bg-white dark:hover:bg-slate-800">
        <div class="flex items-center justify-between">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Actuelle</p>
          <div class="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAcademicYear } from '@/composables/useAcademicYear'

// Déclarer les événements émis
defineEmits(['logout'])

const route = useRoute()
const { academicYear } = useAcademicYear()

// Initialize based on current route
const isUserRoute = () => route.name === 'AdminUsers' || route.name === 'AdminAjouterUtilisateur'
const isUsersOpen = ref(isUserRoute())

// Sync dropdown state with route changes
watch(() => route.path, () => {
  if (isUserRoute()) {
    isUsersOpen.value = true
  } else {
    isUsersOpen.value = false
  }
})

const isActive = (routeName) => {
  return route.name === routeName
}

const isActiveParam = (type) => {
    return route.params.type === type
}
</script>
