<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
      <span class="material-symbols-outlined text-primary">settings</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Paramètres du Compte</h3>
    </div>

    <div class="space-y-8">
      <!-- Security Section -->
      <div class="space-y-6">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary">security</span>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Sécurité du Compte</h4>
        </div>
        
        <div class="flex flex-col gap-3">
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Mot de passe</p>
          <button 
            @click="showPasswordModal = true" 
            class="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 rounded-lg text-slate-900 dark:text-white font-bold text-sm transition-all group"
          >
            <span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">lock_reset</span>
            Changer le mot de passe
          </button>
        </div>
      </div>

      <!-- Login History Section -->
      <div class="space-y-6">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary">history</span>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Historique des Connexions</h4>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-100 dark:border-slate-800">
                <th class="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Date</th>
                <th class="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Adresse IP</th>
                <th class="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Navigateur</th>
                <th class="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              <tr v-for="(login, index) in (student?.lastLogins || [])" :key="index" class="border-b border-slate-50 dark:border-slate-800">
                <td class="py-4 px-2 font-medium">{{ formatDate(login.date) }}</td>
                <td class="py-4 px-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-xs text-slate-400">language</span>
                    <span class="font-mono text-xs">{{ login.ip || 'N/A' }}</span>
                  </div>
                </td>
                <td class="py-4 px-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-xs text-slate-400">devices</span>
                    <span class="text-xs">{{ getBrowserName(login.userAgent) || 'N/A' }}</span>
                  </div>
                </td>
                <td class="py-4 px-2">
                  <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Réussi</span>
                </td>
              </tr>
              <tr v-if="!(student.lastLogins && student.lastLogins.length)">
                <td colspan="4" class="py-8 text-center text-slate-500 italic">Aucun historique de connexion disponible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Account Preferences -->
      <div class="space-y-6">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary">tune</span>
          <h4 class="text-base font-bold text-slate-900 dark:text-white">Préférences</h4>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-white">Notifications par email</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Recevoir les notifications importantes par email</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" v-model="emailNotifications">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/50 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div class="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-white">Mode sombre</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Utiliser le thème sombre par défaut</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" v-model="darkMode">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/50 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <h3 class="font-bold text-lg">Changer le mot de passe</h3>
          <button @click="closePasswordModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold">Mot de passe actuel</label>
            <input 
              v-model="passwords.current" 
              type="password" 
              class="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 h-11 px-4 focus:ring-primary focus:border-primary" 
              placeholder="••••••••"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">Nouveau mot de passe</label>
            <input 
              v-model="passwords.new" 
              type="password" 
              class="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 h-11 px-4 focus:ring-primary focus:border-primary" 
              placeholder="••••••••"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold">Confirmer le nouveau mot de passe</label>
            <input 
              v-model="passwords.confirm" 
              type="password" 
              class="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 h-11 px-4 focus:ring-primary focus:border-primary" 
              placeholder="••••••••"
            />
          </div>
          <div v-if="passwordError" class="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {{ passwordError }}
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="closePasswordModal" class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Annuler</button>
          <button 
            @click="handleUpdatePassword" 
            :disabled="isUpdatingPassword" 
            class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50"
          >
            {{ isUpdatingPassword ? 'En cours...' : 'Mettre à jour' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import api from '@/services/api'

// Props
const props = defineProps({
  student: {
    type: Object,
    required: true
  }
})

// State
const showPasswordModal = ref(false)
const isUpdatingPassword = ref(false)
const passwordError = ref('')
const emailNotifications = ref(true)
const darkMode = ref(false)

const passwords = ref({
  current: '',
  new: '',
  confirm: ''
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getBrowserName = (userAgent) => {
  if (!userAgent) return 'N/A'
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Autre'
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordError.value = ''
  passwords.value = { current: '', new: '', confirm: '' }
}

const handleUpdatePassword = async () => {
  if (passwords.value.new !== passwords.value.confirm) {
    passwordError.value = 'Les mots de passe ne correspondent pas'
    return
  }
  if (passwords.value.new.length < 6) {
    passwordError.value = 'Le nouveau mot de passe doit faire au moins 6 caractères'
    return
  }

  passwordError.value = ''
  isUpdatingPassword.value = true
  try {
    const res = await api.updatePassword({
      currentPassword: passwords.value.current,
      newPassword: passwords.value.new
    })
    if (res.data.success) {
      alert('Mot de passe mis à jour avec succès !')
      closePasswordModal()
    }
  } catch (error) {
    passwordError.value = error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe'
  } finally {
    isUpdatingPassword.value = false
  }
}

// Initialize preferences
onMounted(() => {
  // Load user preferences from localStorage or API
  emailNotifications.value = localStorage.getItem('emailNotifications') !== 'false'
  darkMode.value = localStorage.getItem('darkMode') === 'true'
})

// Watch for preference changes
watch([emailNotifications, darkMode], ([email, dark]) => {
  localStorage.setItem('emailNotifications', email)
  localStorage.setItem('darkMode', dark)
  
  // Apply dark mode
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})
</script>
