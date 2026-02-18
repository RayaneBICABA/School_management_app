<template>
  <div class="flex min-h-screen flex-col md:flex-row bg-background-light dark:bg-background-dark">
    <!-- Left Side: Visual/Hero Section -->
    <div class="relative hidden w-1/2 flex-col justify-between overflow-hidden lg:flex">
      <!-- Premium CSS Mesh Background -->
      <div class="absolute inset-0 bg-primary overflow-hidden">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/30 rounded-full blur-[150px] animate-pulse" style="animation-delay: 1s"></div>
        <div class="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-primary via-indigo-900 to-slate-900 opacity-90"></div>
        <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div class="relative z-10 p-12">
        <div class="flex items-center gap-3 text-white">
          <div class="size-10 rounded-lg bg-white p-2 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-2xl">school</span>
          </div>
          <span class="text-2xl font-bold tracking-tight">Academia Plus</span>
        </div>
      </div>
      <div class="relative z-10 p-12 text-white">
        <h1 class="text-4xl font-black leading-tight tracking-tight lg:text-5xl">
          Bienvenue dans votre espace éducatif
        </h1>
        <p class="mt-4 text-lg font-light text-slate-200">
          Gérez votre parcours académique avec efficacité et simplicité grâce à notre plateforme intégrée.
        </p>
        <div class="mt-8 flex gap-4">
          <button class="flex items-center justify-center rounded-lg bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/30">
            Guide d'utilisation
          </button>
          <button class="flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-slate-100">
            Assistance technique
          </button>
        </div>
      </div>
    </div>
    
    <!-- Right Side: Form Section -->
    <div class="flex flex-1 flex-col items-center justify-center px-6 py-12 dark:bg-background-dark sm:px-12 lg:w-1/2">
      <div class="mb-8 flex items-center gap-3 lg:hidden">
        <div class="size-8 rounded-lg bg-primary p-1.5 flex items-center justify-center text-white">
          <span class="material-symbols-outlined">school</span>
        </div>
        <h2 class="text-[#0e141b] dark:text-slate-50 text-xl font-bold">Système de gestion scolaire</h2>
      </div>
      <div class="w-full max-w-[440px] space-y-8">
        <!-- Success Message -->
        <div v-if="showSuccessMessage" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
            <div>
              <h3 class="text-green-800 dark:text-green-200 font-semibold">Inscription réussie !</h3>
              <p class="text-green-700 dark:text-green-300 text-sm mt-1">
                Votre compte a été créé avec succès. Un administrateur va valider votre inscription et vous recevrez une notification lorsque votre compte sera activé.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <h1 class="text-[#0e141b] dark:text-slate-50 text-[32px] font-bold leading-tight tracking-tight">Connexion au Système</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-sm font-normal">Veuillez entrer vos identifiants pour accéder à votre compte.</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
            <div>
              <h3 class="text-red-800 dark:text-red-200 font-semibold">Erreur de connexion</h3>
              <p class="text-red-700 dark:text-red-300 text-sm mt-1">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="flex flex-col gap-2">
            <label class="text-[#0e141b] dark:text-slate-50 text-base font-medium leading-normal">Email ou Matricule</label>
            <input v-model="form.email" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#d0dbe7] bg-white dark:bg-background-dark dark:border-slate-700 text-[#0e141b] dark:text-slate-50 focus:border-primary focus:ring-1 focus:ring-primary h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal" placeholder="exemple@ecole.com ou MATRICULE123" type="text" required/>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[#0e141b] dark:text-slate-50 text-base font-medium leading-normal">Mot de passe</label>
            <div class="relative flex w-full items-stretch overflow-hidden rounded-lg border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-background-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
              <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-input w-full min-w-0 flex-1 border-none bg-transparent h-14 text-[#0e141b] dark:text-slate-50 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal focus:ring-0" placeholder="••••••••" required/>
              <button type="button" @click="showPassword = !showPassword" class="flex items-center px-4 text-[#4e7397] cursor-pointer hover:text-primary">
                <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.remember" class="h-5 w-5 rounded border-[#d0dbe7] dark:border-slate-700 text-primary focus:ring-primary focus:ring-offset-0 bg-white dark:bg-background-dark" type="checkbox"/>
              <span class="text-sm font-medium text-[#4e7397] dark:text-slate-400">Se souvenir de moi</span>
            </label>
            <a class="text-sm font-bold text-primary hover:underline" href="#">Mot de passe oublié ?</a>
          </div>
          <button type="submit" :disabled="isLoading" class="flex w-full items-center justify-center rounded-lg bg-primary h-14 px-5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isLoading" class="flex items-center gap-2">
              <span class="material-symbols-outlined animate-spin">refresh</span>
              <span>Connexion...</span>
            </span>
            <span v-else>Se connecter</span>
          </button>
        </form>
        <div class="flex flex-col items-center gap-4">
          <div class="text-center">
            <p class="text-sm text-[#4e7397] dark:text-slate-400">Pas encore de compte ?</p>
            <router-link to="/inscription" class="text-sm font-bold text-primary hover:underline">
              S'inscrire
            </router-link>
          </div>
        </div>
        <div class="pt-8 border-t border-solid border-[#e7edf3] dark:border-slate-800">
          <div class="flex flex-col items-center justify-center gap-4 text-center">
            <p class="text-sm text-[#4e7397] dark:text-slate-400">Vous rencontrez des difficultés ?</p>
            <div class="flex flex-wrap justify-center gap-4">
              <a class="flex items-center gap-1.5 text-sm font-bold text-[#0e141b] dark:text-slate-300 hover:text-primary" href="#">
                <span class="material-symbols-outlined text-sm">help</span>
                Besoin d'aide ?
              </a>
              <a class="flex items-center gap-1.5 text-sm font-bold text-[#0e141b] dark:text-slate-300 hover:text-primary" href="#">
                <span class="material-symbols-outlined text-sm">support_agent</span>
                Contactez le support
              </a>
            </div>
          </div>
        </div>
      </div>
      <footer class="mt-auto pt-8 text-center text-xs text-[#4e7397] dark:text-slate-500">
        <p>© 2024 Academia Plus. Tous droits réservés.</p>
        <div class="mt-2 flex justify-center gap-4">
          <a class="hover:underline" href="#">Mentions Légales</a>
          <a class="hover:underline" href="#">Confidentialité</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const showPassword = ref(false)
const showSuccessMessage = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const form = ref({
  email: '',
  password: '',
  remember: false
})

// Vérifier si l'utilisateur vient de s'inscrire
onMounted(() => {
  if (route.query.registered === 'true') {
    showSuccessMessage.value = true
    // Pré-remplir l'email si fourni
    if (route.query.email) {
      form.value.email = route.query.email
    }
    // Masquer le message après 10 secondes
    setTimeout(() => {
      showSuccessMessage.value = false
    }, 10000)
  }
})

const handleLogin = async () => {
  errorMessage.value = ''
  isLoading.value = true

  try {
    const response = await api.login({
      email: form.value.email,
      password: form.value.password
    })

    const { token, data: user } = response.data

    // Store auth data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    // Redirect based on role
    const roleMap = {
      'ADMIN': '/admin',
      'ELEVE': '/eleve',
      'PROFESSEUR': '/professeur',
      'PARENT': '/parent',
      'CENSEUR': '/censeur',
      'CPE': '/cpe',
      'PROVISEUR': '/proviseur',
      'SECRETAIRE': '/secretaire'
    }

    const redirectPath = roleMap[user.role] || '/login'
    router.push(redirectPath)

  } catch (error) {
    console.error('Erreur de connexion:', error)
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error
    } else {
      errorMessage.value = 'Une erreur est survenue lors de la connexion.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
