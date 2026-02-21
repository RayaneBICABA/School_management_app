<template>
  <div v-if="user" class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="max-w-5xl mx-auto px-8 py-8">
      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div class="flex min-w-72 flex-col gap-1">
          <h2 class="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Paramètres du Profil</h2>
          <p class="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Gérez vos informations personnelles et vos paramètres de sécurité.</p>
        </div>
      </div>

      <!-- Profile Header Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <div class="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-6">
            <div class="relative group">
              <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-28 w-28 border-4 border-slate-50 dark:border-slate-800 shadow-sm flex items-center justify-center bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <span v-if="!user.photo || user.photo === 'no-photo.jpg'" class="material-symbols-outlined text-4xl text-slate-400">person</span>
                <img v-else :src="user.photo" class="w-full h-full object-cover rounded-full"/>
              </div>
              <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
              <button @click="$refs.fileInput.click()" class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-transform cursor-pointer">
                <span class="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>
            <div class="flex flex-col justify-center">
              <p class="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">{{ user.nom }} {{ user.prenom }}</p>
              <p class="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">{{ user.role }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Bureau 102</span>
                <span class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase italic">ID: {{ user._id.substring(0,8).toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <div class="flex gap-3 w-full md:w-auto">
            <button @click="handleUpdateDetails" :disabled="isUpdating" class="flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 disabled:opacity-50">
              <span class="material-symbols-outlined text-sm mr-2" v-if="isUpdating">sync</span>
              <span class="truncate">{{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Column 1 & 2: Main Info -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Informations Personnelles -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-lg font-bold">Informations Personnelles</h3>
            </div>
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Prénom</label>
                <input v-model="user.prenom" class="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary h-11 px-4" type="text"/>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Nom</label>
                <input v-model="user.nom" class="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary h-11 px-4" type="text"/>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-slate-600 dark:text-slate-400">E-mail Professionnel</label>
                <input v-model="user.email" disabled class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-sm w-full px-4 h-11 cursor-not-allowed text-slate-500" type="email"/>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-slate-600 dark:text-slate-400">Numéro de Téléphone</label>
                <input v-model="user.telephone" class="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary h-11 px-4" type="tel"/>
              </div>
            </div>
          </div>

          <!-- Login History -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold">Dernières connexions</h3>
                <span class="text-xs text-slate-500 font-medium">(10)</span>
              </div>
              <button @click="clearHistory" class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1" title="Vider l'historique de connexion" v-if="user?.lastLogins?.length > 1">
                <span class="material-symbols-outlined text-sm">delete_sweep</span>
                Vider
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-4 -mx-4 transition-colors rounded-lg">
                <div class="flex items-center gap-4">
                  <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span class="material-symbols-outlined text-slate-400">
                      {{ getDeviceIcon(login.userAgent) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-bold">{{ parseUserAgent(login.userAgent) }}</p>
                    <p class="text-xs text-slate-500">{{ formatDate(login.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs font-mono text-slate-400">{{ login.ip }}</p>
                  <span v-if="index === 0" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-tighter">Session actuelle</span>
                </div>
              </div>
              <div v-if="!(user.lastLogins && user.lastLogins.length)" class="text-center py-6 text-sm italic text-slate-500">
                Aucun historique disponible
              </div>
            </div>
          </div>
        </div>

        <!-- Column 3: Sidebar Settings -->
        <div class="space-y-8">
          <!-- Sécurité & Identifiants -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 class="text-lg font-bold">Sécurité du Compte</h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="space-y-4">
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-slate-500 uppercase">Mot de passe actuel</label>
                  <input v-model="passwords.current" type="password" class="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary px-4 py-2" placeholder="••••••••"/>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-xs font-semibold text-slate-500 uppercase">Nouveau</label>
                  <input v-model="passwords.new" type="password" class="rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-primary px-4 py-2" placeholder="••••••••"/>
                </div>
                <div v-if="passwordError" class="text-red-500 text-[10px] italic">{{ passwordError }}</div>
                <button @click="handleUpdatePassword" :disabled="isUpdatingPassword" class="w-full bg-slate-900 dark:bg-primary text-white text-xs font-bold py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50">
                  {{ isUpdatingPassword ? 'En cours...' : 'Changer le mot de passe' }}
                </button>
              </div>

              <div class="border-t border-slate-100 dark:border-slate-800 pt-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <span class="material-symbols-outlined text-green-600">verified_user</span>
                    </div>
                    <div>
                      <p class="text-[12px] font-bold">2FA Security</p>
                      <p class="text-[10px] text-slate-500">Protection active</p>
                    </div>
                  </div>
                  <div class="relative inline-flex items-center cursor-pointer">
                    <input v-model="securitySettings.twoFA" class="sr-only peer" type="checkbox"/>
                    <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assigned Classes -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 class="text-lg font-bold">Classes suivies</h3>
            </div>
            <div class="p-4 space-y-2">
              <div v-for="(classItem, index) in assignedClasses" :key="index" class="flex items-center justify-between p-2.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 group transition-colors">
                <span class="text-sm font-medium">{{ classItem }}</span>
                <button @click="removeClass(index)" class="material-symbols-outlined text-sm text-slate-400 group-hover:text-red-500 cursor-pointer">close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const user = ref(null);
const isUpdating = ref(false);
const isUpdatingPassword = ref(false);
const passwordError = ref('');
const fileInput = ref(null);

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
            user.value.photo = res.data.data;
            alert('Photo de profil mise à jour !');
        }
    } catch (error) {
        console.error('Erreur upload photo:', error);
        alert('Erreur lors de l\'envoi de la photo');
    }
};

const passwords = ref({
    current: '',
    new: ''
});

const fetchData = async () => {
    try {
        const res = await api.getMe();
        if (res.data.success) {
            user.value = res.data.data;
        }
    } catch (error) {
        console.error('Erreur chargement profil cpe:', error);
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
        alert('Erreur lors de la mise à jour');
    } finally {
        isUpdating.value = false;
    }
};

const handleUpdatePassword = async () => {
    if (passwords.value.new.length < 6) {
        passwordError.value = 'Le mot de passe doit faire au moins 6 caractères';
        return;
    }

    passwordError.value = '';
    isUpdatingPassword.value = true;
    try {
        const res = await api.updatePassword({
            currentPassword: passwords.value.current,
            newPassword: passwords.value.new
        });
        if (res.data.success) {
            alert('Mot de passe sécurisé !');
            passwords.value = { current: '', new: '' };
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

// Paramètres de sécurité
const securitySettings = ref({
  twoFA: true
})

// Préférences de notification
const notifications = ref([
  {
    id: 1,
    title: 'Alertes d\'absences',
    description: 'Notifier pour chaque absence injustifiée',
    enabled: true
  },
  {
    id: 2,
    title: 'Nouveaux messages',
    description: 'Alertes en temps réel pour la messagerie',
    enabled: true
  },
  {
    id: 3,
    title: 'Rapports hebdomadaires',
    description: 'Synthèse par email chaque vendredi',
    enabled: false
  }
])

// Classes assignées
const assignedClasses = ref([
  '6ème A',
  '6ème B',
  '5ème C',
  '5ème D'
])

const removeClass = (index) => {
  assignedClasses.value.splice(index, 1)
}

onMounted(() => {
    fetchData();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
</script>
