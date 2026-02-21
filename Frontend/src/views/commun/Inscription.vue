<template>
  <div class="bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-100 transition-colors duration-200 min-h-screen">
    <div class="flex min-h-screen w-full flex-col lg:flex-row">
      <!-- Academic Sidebar (Hidden on mobile, visible on desktop) -->
      <div class="hidden lg:flex lg:w-5/12 xl:w-1/3 relative overflow-hidden bg-primary">
        <div class="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBBgYs9DVjo1Vf8R0viSJSEhyq1fxzBngMyIzN9G3dPwvizj_f5QXQXQ7tJGXzh4YwhZbQAifPxE4x5Esa8caFThpTWnXk6v_JdudCgseRQ5s_V9SFGD1Wgn47eAMSzhR0-ivp7Og5CBt5ByAFNZgsHl0zp0DUZpCIsXJuAuQaQA-GnqrSU-AiGqaXy98Cmg2j1MKhoL4rNI6SJZe3B73tWZlvoYToQM4WkOjYkr9B_OEWEL0vXzS2bqU1OGGBQCXhO3wZnNbGURiY');">
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/20"></div>
        <div class="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div class="flex items-center gap-2 mb-8">
              <div class="p-2 bg-white rounded-lg shadow-lg">
                <span class="material-symbols-outlined text-primary text-3xl">school</span>
              </div>
              <span class="text-white text-xl font-bold tracking-tight">Unica</span>
            </div>
            <h1 class="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
              Rejoignez votre plateforme académique
            </h1>
            <p class="text-white/80 text-lg font-light max-w-md">
              Accédez à vos cours, consultez vos notes et échangez avec vos professeurs en quelques clics.
            </p>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-4 text-white/90">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span class="material-symbols-outlined">verified_user</span>
              </div>
              <p class="text-sm">Vérification de matricule instantanée</p>
            </div>
            <div class="flex items-center gap-4 text-white/90">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span class="material-symbols-outlined">lock</span>
              </div>
              <p class="text-sm">Données sécurisées et conformes RGPD</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-background-light dark:bg-background-dark">
        <div class="w-full max-w-[500px] flex flex-col gap-8">
          <!-- Page Heading -->
          <div class="flex flex-col gap-2">
            <div class="lg:hidden flex items-center gap-2 mb-6">
              <span class="material-symbols-outlined text-primary text-2xl">school</span>
              <span class="text-[#0e141b] dark:text-white font-bold">Unica</span>
            </div>
            <h2 class="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-tight">Inscription Élève</h2>
            <p class="text-[#4e7397] dark:text-slate-400 text-base font-normal">Créez votre compte pour accéder à votre espace personnel.</p>
          </div>

          <!-- Error Message -->
          <div v-if="serverError" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-start gap-3">
              <span class="material-symbols-outlined text-red-600 dark:text-red-400">error</span>
              <div>
                <h3 class="text-red-800 dark:text-red-200 font-semibold">Erreur d'inscription</h3>
                <p class="text-red-700 dark:text-red-300 text-sm mt-1">
                  {{ serverError }}
                </p>
              </div>
            </div>
          </div>

          <!-- Registration Form -->
          <form @submit.prevent="handleInscription" class="flex flex-col gap-5">  
            <!-- Full Name Field -->
            <div class="flex flex-col gap-2">
              <label class="text-[#0e141b] dark:text-white text-sm font-semibold">Nom</label>
              <input 
                v-model="form.nom" 
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal shadow-sm" 
                placeholder="Dupont" 
                type="text"
                :class="{ 'border-red-500': errors.nom }"
              />
              <span v-if="errors.nom" class="text-red-500 text-xs">{{ errors.nom }}</span>
            </div>

            <!-- First Name Field -->
            <div class="flex flex-col gap-2">
              <label class="text-[#0e141b] dark:text-white text-sm font-semibold">Prénom</label>
              <input 
                v-model="form.prenom" 
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal shadow-sm" 
                placeholder="Jean" 
                type="text"
                :class="{ 'border-red-500': errors.prenom }"
              />
              <span v-if="errors.prenom" class="text-red-500 text-xs">{{ errors.prenom }}</span>
            </div>

            <!-- Phone Field -->
            <div class="flex flex-col gap-2">
              <label class="text-[#0e141b] dark:text-white text-sm font-semibold">Numéro de téléphone</label>
              <input 
                v-model="form.telephone" 
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal shadow-sm" 
                placeholder="+226 XX XX XX XX" 
                type="tel"
                :class="{ 'border-red-500': errors.telephone }"
              />
              <span v-if="errors.telephone" class="text-red-500 text-xs">{{ errors.telephone }}</span>
            </div>

            <!-- Email Field -->
            <div class="flex flex-col gap-2">
              <label class="text-[#0e141b] dark:text-white text-sm font-semibold">Adresse Email</label>
              <input 
                v-model="form.email" 
                class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal shadow-sm" 
                placeholder="jean.dupont@ecole.com" 
                type="email"
                :class="{ 'border-red-500': errors.email }"
              />
              <span v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</span>
            </div>

            <!-- Password Field -->
            <div class="flex flex-col gap-2">
              <label class="text-[#0e141b] dark:text-white text-sm font-semibold">Mot de passe</label>
              <div class="relative">
                <input 
                  v-model="form.password" 
                  class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal shadow-sm" 
                  placeholder="••••••••" 
                  :type="showPassword ? 'text' : 'password'"
                  :class="{ 'border-red-500': errors.password }"
                />
                <button @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#4e7397] dark:text-slate-400" type="button">
                  <span class="material-symbols-outlined">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <span v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</span>
            </div>

            <!-- Confirm Password Field -->
            <div class="flex flex-col gap-2">
              <label class="text-[#0e141b] dark:text-white text-sm font-semibold">Confirmer le mot de passe</label>
              <div class="relative">
                <input 
                  v-model="form.confirmPassword" 
                  class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0e141b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 h-14 placeholder:text-[#4e7397] dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal shadow-sm" 
                  placeholder="••••••••" 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :class="{ 'border-red-500': errors.confirmPassword }"
                />
                <button @click="showConfirmPassword = !showConfirmPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#4e7397] dark:text-slate-400" type="button">
                  <span class="material-symbols-outlined">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="text-red-500 text-xs">{{ errors.confirmPassword }}</span>
            </div>

            <!-- Submit Button -->
            <button 
              :disabled="isLoading"
              class="mt-4 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <span class="material-symbols-outlined animate-spin">refresh</span>
                <span>Inscription en cours...</span>
              </span>
              <span v-else class="truncate">Créer mon compte élève</span>
            </button>

            <!-- Validation Notice -->
            <div class="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg mt-2">
              <span class="material-symbols-outlined text-[#4e7397] text-xl">info</span>
              <p class="text-xs text-[#4e7397] dark:text-slate-400 leading-relaxed">
                Votre compte sera créé avec le rôle <strong>ÉLÈVE</strong> et restera en attente de validation administrative avant de pouvoir vous connecter.
              </p>
            </div>
          </form>

          <!-- Footer Links -->
          <div class="flex justify-center gap-2 pt-4 border-t border-[#d0dbe7] dark:border-slate-800">
            <p class="text-sm text-[#4e7397] dark:text-slate-400">Déjà inscrit ?</p>
            <router-link to="/login" class="text-sm font-bold text-primary hover:underline">Se connecter</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// Données du formulaire
const form = ref({
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Messages d'erreur
const errors = ref({
  nom: '',
  prenom: '',
  telephone: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// États
const isLoading = ref(false)
const serverError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation du formulaire
const validateForm = () => {
  let isValid = true
  
  // Réinitialiser les erreurs
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = ''
  })
  
  // Validation nom
  if (!form.value.nom.trim()) {
    errors.value.nom = 'Le nom est requis'
    isValid = false
  }
  
  // Validation prénom
  if (!form.value.prenom.trim()) {
    errors.value.prenom = 'Le prénom est requis'
    isValid = false
  }
  
  // Validation téléphone
  if (!form.value.telephone.trim()) {
    errors.value.telephone = 'Le numéro de téléphone est requis'
    isValid = false
  } else if (!/^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/.test(form.value.telephone)) {
    errors.value.telephone = 'Format de numéro invalide'
    isValid = false
  }
  
  // Validation email
  if (!form.value.email.trim()) {
    errors.value.email = 'L\'email est requis'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Format d\'email invalide'
    isValid = false
  }
  
  // Validation mot de passe
  if (!form.value.password) {
    errors.value.password = 'Le mot de passe est requis'
    isValid = false
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Le mot de passe doit contenir au moins 8 caractères'
    isValid = false
  }
  
  // Validation confirmation mot de passe
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'La confirmation du mot de passe est requise'
    isValid = false
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Les mots de passe ne correspondent pas'
    isValid = false
  }
  
  return isValid
}

// Soumission du formulaire
const handleInscription = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  
  try {
    serverError.value = ''
    // Appel API pour l'inscription
    await api.register({
      nom: form.value.nom,
      prenom: form.value.prenom,
      email: form.value.email,
      telephone: form.value.telephone,
      password: form.value.password,
      role: 'ELEVE' // Par défaut
    })
    
    // Redirection vers la page de connexion avec un message de succès
    router.push({
      path: '/login',
      query: { 
        registered: 'true',
        email: form.value.email
      }
    })
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    if (error.response && error.response.data && error.response.data.error) {
      serverError.value = error.response.data.error;
    } else {
      serverError.value = "Une erreur s'est produite lors de l'inscription.";
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const lexendLink = document.createElement('link');
  lexendLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@400;700&display=swap';
  lexendLink.rel = 'stylesheet';
  document.head.appendChild(lexendLink);

  const style = document.createElement('style');
  style.textContent = `
    body { font-family: 'Lexend', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  `;
  document.head.appendChild(style);
});
</script>
