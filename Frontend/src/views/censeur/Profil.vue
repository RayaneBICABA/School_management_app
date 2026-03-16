<template>
  <div class="profil-view">
    <div v-if="user" class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium text-slate-400">Mon Profil</span>
      </nav>
      <!-- Photo Lightbox -->
      <div v-if="showLightbox" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 md:p-12 animate-in fade-in duration-300" @click="showLightbox = false">
        <!-- Close Button -->
        <button class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]" @click.stop="showLightbox = false">
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>

        <!-- Enlarged Image Container -->
        <div class="relative max-w-2xl w-full aspect-square md:aspect-[4/3] flex items-center justify-center animate-in zoom-in duration-300" @click.stop>
          <img 
            :src="photoPreview || getFullPhotoUrl(user.photo) || 'no-photo.jpg'" 
            class="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white/10"
            @error="e => e.target.src = 'no-photo.jpg'"
          />
          
          <!-- Bottom Action Bar -->
          <div class="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
            <button 
              @click="$refs.fileInput.click(); showLightbox = false" 
              class="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
            >
              <span class="material-symbols-outlined text-xl">photo_camera</span>
              CHANGER
            </button>
            <button 
              v-if="user.photo && user.photo !== 'no-photo.jpg'" 
              @click="handleDeletePhoto(); showLightbox = false" 
              class="flex items-center gap-2 px-6 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
            >
              <span class="material-symbols-outlined text-xl">delete</span>
              SUPPRIMER
            </button>
          </div>
        </div>
      </div>

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
          <div class="relative group cursor-pointer" @click="showLightbox = true">
            <div class="w-24 h-24 rounded-2xl bg-white border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden flex items-center justify-center">
              <img v-if="photoPreview || (user.photo && user.photo !== 'no-photo.jpg')" :src="photoPreview || getFullPhotoUrl(user.photo)" class="w-full h-full object-cover transition-transform group-hover:scale-110"/>
              <span v-else class="material-symbols-outlined text-4xl text-slate-400">person</span>
            </div>
            <div class="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
            </div>
            <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
          </div>
        <div class="flex flex-col justify-center grow">
          <p class="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{{ user.nom }} {{ user.prenom }}</p>
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
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">history</span>
              <h3 class="text-lg font-bold">Dernières connexions</h3>
            </div>
            <button @click="clearHistory" class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1" title="Vider l'historique de connexion" v-if="user?.lastLogins?.length > 1">
              <span class="material-symbols-outlined text-sm">delete_sweep</span>
              Vider
            </button>
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
import api, { BASE_ASSET_URL } from '@/services/api'

// Données réactives
const activeTab = ref('personnel')
const user = ref(null)
const isUpdating = ref(false)
const isUpdatingPassword = ref(false)
const passwordError = ref('')
const fileInput = ref(null)
const photoPreview = ref(null);
const showLightbox = ref(false);

const getFullPhotoUrl = (path) => {
  if (!path || path === 'no-photo.jpg') return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_ASSET_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const handlePhotoUpload = async (event) => {
    console.log('🖼️ handlePhotoUpload triggered (Censeur)')
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 2Mo)');
        return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        photoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await api.uploadPhoto(formData);
        if (res.data.success) {
            user.value.photo = res.data.data;
            alert('Photo de profil mise à jour !');
        }
    } catch (error) {
        console.error('Erreur upload photo:', error);
        alert('Erreur lors de l\'envoi de la photo');
    }
};

const handleDeletePhoto = async () => {
    if (!confirm('Supprimer votre photo de profil ?')) return;
    try {
        console.log('🗑️ handleDeletePhoto triggered (Censeur)');
        const res = await api.deletePhoto();
        if (res.data.success) {
            user.value.photo = 'no-photo.jpg';
            photoPreview.value = null;
            alert('Photo supprimée avec succès');
        }
    } catch (error) {
        console.error('Erreur suppression photo:', error);
        alert('Erreur lors de la suppression de la photo');
    }
};

// Computed property for photo URL
const photoUrl = computed(() => {
    if (!user.value || !user.value.photo || user.value.photo === 'no-photo.jpg') {
        return null;
    }
    // If photo already contains http, return as is
    if (user.value.photo.startsWith('http')) {
        return user.value.photo;
    }
    // Otherwise, prepend dynamic backend URL
    return `${BASE_ASSET_URL}${user.value.photo}`;
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

const clearHistory = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider l\'historique de vos connexions ? (La session actuelle sera conservée)')) {
        return;
    }

    try {
        const res = await api.clearConnectionHistory();
        if (res.data.success) {
            user.value.lastLogins = res.data.data;
            alert('Historique des connexions vidé avec succès.');
        }
    } catch (error) {
        console.error('Erreur lors du vidage de l\'historique:', error);
        alert('Erreur lors du vidage de l\'historique.');
    }
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
