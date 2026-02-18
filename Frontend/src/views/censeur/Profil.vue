<template>
  <div class="profil-view">
    <div v-if="user" class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium text-slate-400">Mon Profil</span>
      </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Paramètres du Profil</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Gérez vos informations personnelles et vos préférences de sécurité.</p>
      </div>
      <button @click="handleUpdateDetails" :disabled="isUpdating" class="flex items-center gap-2 cursor-pointer rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50">
        <span class="material-symbols-outlined" v-if="!isUpdating">save</span>
        <span class="material-symbols-outlined animate-spin" v-else>sync</span>
        <span>{{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}</span>
      </button>
    </div>

    <!-- Profile Header Card -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center gap-6">
        <div class="relative group">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-center bg-slate-200 dark:bg-slate-700">
            <span v-if="!photoUrl" class="material-symbols-outlined text-4xl text-slate-400">person</span>
            <img v-else :src="photoUrl" class="w-full h-full object-cover rounded-full"/>
          </div>
          <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
          <button @click="$refs.fileInput.click()" class="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-md hover:text-primary cursor-pointer">
            <span class="material-symbols-outlined text-sm">photo_camera</span>
          </button>
        </div>
        <div class="flex flex-col justify-center grow">
          <p class="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{{ user.prenom }} {{ user.nom }}</p>
          <p class="text-slate-600 dark:text-slate-400 text-base font-normal mb-1">{{ user.role }}</p>
          <div class="flex items-center gap-4 mt-2">
            <span class="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              <span class="material-symbols-outlined text-[14px]">history</span>
              ID: {{ user._id.substring(0,8).toUpperCase() }}
            </span>
            <span class="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded font-medium">
              <span class="material-symbols-outlined text-[14px]">verified_user</span>
              Compte Vérifié
            </span>
          </div>
        </div>
      </div>
    </div>



    <!-- Form Sections -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Contact Info -->
      <div class="flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-2 mb-6">
            <span class="material-symbols-outlined text-primary">contact_mail</span>
            <h3 class="text-lg font-bold">Informations de contact</h3>
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-semibold text-slate-600">Prénom</label>
                <input v-model="user.prenom" class="rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary w-full px-4 py-2.5" type="text"/>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm font-semibold text-slate-600">Nom</label>
                <input v-model="user.nom" class="rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary w-full px-4 py-2.5" type="text"/>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-600">Email professionnel</label>
              <input v-model="user.email" disabled class="rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm w-full px-4 py-2.5 cursor-not-allowed text-slate-500" type="email"/>
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-semibold text-slate-600">Téléphone</label>
              <input v-model="user.telephone" class="rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary w-full px-4 py-2.5" type="tel"/>
            </div>
          </div>
        </div>


      </div>

      <!-- Right Column: Security & Settings -->
      <div class="flex flex-col gap-6">


        <!-- Login History -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div class="flex items-center gap-2 mb-6">
            <span class="material-symbols-outlined text-primary">history</span>
            <h3 class="text-lg font-bold">Dernières connexions</h3>
          </div>
          <div class="space-y-4">
            <div v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-slate-400">
                  {{ getDeviceIcon(login.userAgent) }}
                </span>
                <div>
                  <p class="text-sm font-bold">{{ parseUserAgent(login.userAgent) }}</p>
                  <p class="text-xs text-slate-500">{{ formatDate(login.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-mono text-slate-400">{{ login.ip }}</p>
                <span v-if="index === 0" class="text-[10px] text-green-500 font-bold uppercase">Actuelle</span>
              </div>
            </div>
            <div v-if="!(user.lastLogins && user.lastLogins.length)" class="text-center py-4 text-sm italic text-slate-500">
              Aucun historique disponible
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-primary/10 border border-primary/20 rounded-xl mt-6">
      <div class="flex gap-3">
        <span class="material-symbols-outlined text-primary">info</span>
        <div>
          <p class="text-sm font-bold text-primary">Aide & Support</p>
          <p class="text-xs text-primary/80 mt-1">Besoin d'aide pour configurer votre profil ? Contactez l'administrateur informatique de l'établissement.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

// Données réactives
const activeTab = ref('personnel')
const user = ref(null)
const isUpdating = ref(false)
const isUpdatingPassword = ref(false)
const passwordError = ref('')
const fileInput = ref(null)

const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 2Mo)');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await api.uploadPhoto(formData);
        if (res.data.success) {
            // Reload user data to get updated photo
            await fetchData();
            alert('Photo de profil mise à jour !');
        }
    } catch (error) {
        console.error('Erreur upload photo:', error);
        alert('Erreur lors de l\'envoi de la photo');
    }
};

// Computed property for photo URL
const photoUrl = computed(() => {
    console.log('🖼️ Computing photoUrl, user.photo:', user.value?.photo);
    
    if (!user.value || !user.value.photo || user.value.photo === 'no-photo.jpg') {
        console.log('🖼️ No photo, returning null');
        return null;
    }
    // If photo already contains http, return as is
    if (user.value.photo.startsWith('http')) {
        console.log('🖼️ Photo has http, returning as is:', user.value.photo);
        return user.value.photo;
    }
    // Otherwise, prepend backend URL
    const fullUrl = `http://localhost:5000${user.value.photo}`;
    console.log('🖼️ Returning full URL:', fullUrl);
    return fullUrl;
});

// Données du mot de passe
const passwordData = ref({
  current: '',
  new: '',
  confirm: ''
})

// Configuration des alertes
const alertesConfig = ref([
  {
    id: 1,
    titre: 'Notes manquantes',
    description: 'Alertes hebdomadaires sur les retards de saisie',
    email: true,
    sms: false
  },
  {
    id: 2,
    titre: 'Absences injustifiées',
    description: 'Notifications en temps réel sur les pics d\'absences',
    email: true,
    sms: true
  },
  {
    id: 3,
    titre: 'Fin de cycle académique',
    description: 'Rapports de synthèse de fin de trimestre',
    email: true,
    sms: false
  }
])

// Paramètres de sécurité
const securitySettings = ref({
  twoFactor: true
})

const fetchData = async () => {
    try {
        const res = await api.getMe();
        if (res.data.success) {
            user.value = res.data.data;
        }
    } catch (error) {
        console.error('Erreur chargement profil censeur:', error);
    }
};

const handleUpdateDetails = async () => {
    isUpdating.value = true;
    try {
        const res = await api.updateDetails({
            nom: user.value.nom,
            prenom: user.value.prenom,
            telephone: user.value.telephone
        });
        if (res.data.success) {
            alert('Profil mis à jour !');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur technique lors de la mise à jour');
    } finally {
        isUpdating.value = false;
    }
};

const handleUpdatePassword = async () => {
    if (passwordData.value.new !== passwordData.value.confirm) {
        passwordError.value = 'Les mots de passe ne correspondent pas';
        return;
    }
    if (passwordData.value.new.length < 6) {
        passwordError.value = 'Minimum 6 caractères';
        return;
    }

    passwordError.value = '';
    isUpdatingPassword.value = true;
    try {
        const res = await api.updatePassword({
            currentPassword: passwordData.value.current,
            newPassword: passwordData.value.new
        });
        if (res.data.success) {
            alert('Mot de passe mis à jour !');
            passwordData.value = { current: '', new: '', confirm: '' };
        }
    } catch (error) {
        passwordError.value = error.response?.data?.error || 'Erreur technique';
    } finally {
        isUpdatingPassword.value = false;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const getDeviceIcon = (ua) => {
    if (!ua) return 'desktop_windows';
    if (/mobile/i.test(ua)) return 'smartphone';
    if (/tablet/i.test(ua)) return 'tablet_mac';
    return 'desktop_windows';
};

const parseUserAgent = (ua) => {
    if (!ua) return 'Navigateur inconnu';
    if (ua.includes('Chrome')) return 'Chrome on ' + (ua.includes('Windows') ? 'Windows' : 'OS');
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Navigateur Web';
};

const toggleAlerte = (id, type) => {
  const alerte = alertesConfig.value.find(a => a.id === id)
  if (alerte) {
    alerte[type] = !alerte[type]
  }
}

onMounted(() => {
    fetchData();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
</script>
