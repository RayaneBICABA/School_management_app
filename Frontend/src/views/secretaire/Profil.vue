<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#0e141b] dark:text-white">
    <main class="flex-1 overflow-y-auto">
      <div v-if="user" class="max-w-[1000px] mx-auto py-8 px-8">
        <div class="mb-8">
          <h1 class="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Profil Utilisateur</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base font-normal">Gérez vos informations personnelles, votre sécurité et vos préférences matérielles.</p>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <!-- Informations Personnelles -->
          <section class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 class="font-bold text-[#0e141b] dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">badge</span>
                Informations Personnelles et Professionnelles
              </h3>
              <button @click="handleUpdateDetails" :disabled="isUpdating" class="text-primary text-sm font-bold hover:underline disabled:opacity-50">
                {{ isUpdating ? 'Enregistrement...' : 'Sauvegarder' }}
              </button>
            </div>
            <div class="p-6">
              <div class="flex flex-col md:flex-row gap-8 items-start">
                <div class="relative group">
                  <div class="size-32 rounded-2xl bg-slate-200 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                    <span v-if="!user.photo || user.photo === 'no-photo.jpg'" class="material-symbols-outlined text-4xl text-slate-400">person</span>
                    <img v-else :src="user.photo" class="w-full h-full object-cover"/>
                  </div>
                  <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
                  <button @click="$refs.fileInput.click()" class="absolute -bottom-2 -right-2 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <span class="material-symbols-outlined text-sm">photo_camera</span>
                  </button>
                </div>
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#4e7397] uppercase tracking-wide">Nom</label>
                    <input v-model="user.nom" class="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-primary outline-none py-1 text-sm font-semibold"/>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#4e7397] uppercase tracking-wide">Prénom</label>
                    <input v-model="user.prenom" class="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-primary outline-none py-1 text-sm font-semibold"/>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#4e7397] uppercase tracking-wide">Téléphone</label>
                    <input v-model="user.telephone" class="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-primary outline-none py-1 text-sm font-semibold"/>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-[#4e7397] uppercase">Rôle Système</label>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded uppercase tracking-wider">{{ user.role }}</span>
                    </div>
                  </div>
                  <div class="space-y-1 col-span-1 md:col-span-2">
                    <label class="text-xs font-bold text-[#4e7397] uppercase">Adresse Email</label>
                    <p class="text-sm font-semibold dark:text-slate-400 mt-1">{{ user.email }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Sécurité et Périphériques -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Sécurité -->
            <section class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
              <div class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 class="font-bold text-[#0e141b] dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-amber-500">lock_open</span>
                  Sécurité du Compte
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium mb-1 dark:text-slate-300">Mot de passe actuel</label>
                    <input v-model="passwords.current" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-[#f8fafc] dark:bg-slate-900 text-sm focus:ring-primary" type="password" placeholder="••••••••"/>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1 dark:text-slate-300">Nouveau mot de passe</label>
                    <input v-model="passwords.new" class="w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-primary" placeholder="Nouveau" type="password"/>
                  </div>
                </div>
                <div v-if="passwordError" class="text-red-500 text-[11px]">{{ passwordError }}</div>
                <button @click="handleUpdatePassword" :disabled="isUpdatingPassword" class="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50">
                  {{ isUpdatingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
                </button>
                <div class="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg flex gap-3">
                  <span class="material-symbols-outlined text-amber-600 text-[20px]">info</span>
                  <p class="text-[11px] text-amber-800 dark:text-amber-200">Dernière modification il y a 45 jours. Nous recommandons un changement tous les 90 jours.</p>
                </div>
              </div>
            </section>

            <!-- Périphériques -->
            <section class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
              <div class="px-6 py-4 border-b border-[#d0dbe7] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 class="font-bold text-[#0e141b] dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-500">print</span>
                  Périphériques d'Impression
                </h3>
              </div>
              <div class="p-6 space-y-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 border border-[#d0dbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-primary">print</span>
                      <div>
                        <p class="text-sm font-bold">HP LaserJet Pro M404n</p>
                        <p class="text-[11px] text-[#4e7397]">Réseau local - 192.168.1.45</p>
                      </div>
                    </div>
                    <span class="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Par défaut</span>
                  </div>
                  <div class="flex items-center justify-between p-3 border border-[#d0dbe7] dark:border-slate-700 rounded-lg">
                    <div class="flex items-center gap-3 opacity-60">
                      <span class="material-symbols-outlined">print</span>
                      <div>
                        <p class="text-sm font-bold">Canon i-SENSYS LBP6030</p>
                        <p class="text-[11px] text-[#4e7397]">USB Direct - Poste local</p>
                      </div>
                    </div>
                    <button class="text-[11px] font-bold text-primary hover:underline">Définir défaut</button>
                  </div>
                </div>
                <div class="space-y-3 pt-2">
                  <h4 class="text-xs font-bold text-[#4e7397] uppercase">Paramètres PDF</h4>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Signature numérique auto</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input checked class="sr-only peer" type="checkbox"/>
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Archivage automatique après impression</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input class="sr-only peer" type="checkbox"/>
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Journal d'activité -->
          <section class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-[#0e141b] dark:text-white">Historique des dernières connexions</h3>
              <button @click="clearHistory" class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1" title="Vider l'historique de connexion" v-if="user?.lastLogins?.length > 1">
                <span class="material-symbols-outlined text-sm">delete_sweep</span>
                Vider
              </button>
            </div>
            <div class="space-y-4">
              <div v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="flex items-start gap-3 pb-4 border-b border-[#d0dbe7] dark:border-slate-700">
                <div class="size-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-blue-500 text-[18px]">
                    {{ getDeviceIcon(login.userAgent) }}
                  </span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ parseUserAgent(login.userAgent) }}</p>
                  <p class="text-xs text-[#4e7397]">{{ formatDate(login.date) }} • IP: {{ login.ip }}</p>
                </div>
                <span v-if="index === 0" class="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">Actuelle</span>
              </div>
              <div v-if="!(user.lastLogins && user.lastLogins.length)" class="py-4 text-center text-slate-500 italic text-sm">
                Aucun historique de connexion disponible
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

const { success, error } = useToast();

const user = ref(null);
const isUpdating = ref(false);
const isUpdatingPassword = ref(false);
const passwordError = ref('');
const fileInput = ref(null);

const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        error('L\'image est trop volumineuse (max 2Mo)');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await api.uploadPhoto(formData);
        if (res.data.success) {
            user.value.photo = res.data.data;
            success('Photo de profil mise à jour !');
        }
    } catch (err) {
        console.error('Erreur upload photo:', err);
        error('Erreur lors de l\'envoi de la photo');
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
    } catch (err) {
        console.error('Erreur chargement profil secretaire:', err);
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
            success('Profil mis à jour !');
        }
    } catch (err) {
        console.error('Erreur:', err);
        error('Erreur technique lors de la mise à jour');
    } finally {
        isUpdating.value = false;
    }
};

const handleUpdatePassword = async () => {
    if (passwords.value.new.length < 6) {
        passwordError.value = 'Minimum 6 caractères';
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
            success('Mot de passe mis à jour !');
            passwords.value = { current: '', new: '' };
        }
    } catch (err) {
        passwordError.value = err.response?.data?.error || 'Erreur technique';
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
            success('Historique des connexions vidé avec succès.');
        }
    } catch (error) {
        console.error('Erreur lors du vidage de l\'historique:', error);
        error('Erreur lors du vidage de l\'historique.');
    }
};

onMounted(() => {
    fetchData();
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const publicSansLink = document.createElement('link');
  publicSansLink.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap';
  publicSansLink.rel = 'stylesheet';
  document.head.appendChild(publicSansLink);

  const style = document.createElement('style');
  style.textContent = `
    body { font-family: 'Public Sans', sans-serif; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  `;
  document.head.appendChild(style);
});
</script>