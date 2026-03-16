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
          <div class="relative group cursor-pointer" @click="showLightbox = true">
          <div class="size-28 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex items-center justify-center">
            <img v-if="photoPreview || (user.photo && user.photo !== 'no-photo.jpg')" :src="photoPreview || getFullPhotoUrl(user.photo)" class="w-full h-full object-cover transition-transform group-hover:scale-110"/>
            <span v-else class="material-symbols-outlined text-4xl text-slate-400">person_add</span>
          </div>
          <div class="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span class="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
          </div>
          <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
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
    </main>
  </div>
</template>



<script setup>
import { ref, onMounted } from 'vue';
import api, { BASE_ASSET_URL } from '@/services/api';
import { useToast } from '@/composables/useToast';

const { success, error } = useToast();

const user = ref(null);
const isUpdating = ref(false);
const isUpdatingPassword = ref(false);
const passwordError = ref('');
const fileInput = ref(null);
const photoPreview = ref(null);
const showLightbox = ref(false);

const getFullPhotoUrl = (path) => {
  if (!path || path === 'no-photo.jpg') return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_ASSET_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        error('L\'image est trop volumineuse (max 2Mo)');
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
            success('Photo de profil mise à jour !');
        }
    } catch (err) {
        console.error('Erreur upload photo:', err);
        error('Erreur lors de l\'envoi de la photo');
    }
};

const handleDeletePhoto = async () => {
    if (!confirm('Supprimer votre photo de profil ?')) return;
    try {
        console.log('🗑️ handleDeletePhoto triggered (Secretaire)');
        const res = await api.deletePhoto();
        if (res.data.success) {
            user.value.photo = 'no-photo.jpg';
            photoPreview.value = null;
            success('Photo supprimée avec succès');
        }
    } catch (err) {
        console.error('Erreur suppression photo:', err);
        error('Erreur lors de la suppression de la photo');
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