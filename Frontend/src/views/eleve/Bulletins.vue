<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 p-8">
    <div class="max-w-5xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span class="ml-4 text-slate-500">Chargement de vos bulletins...</span>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Page Heading -->
        <div class="flex flex-wrap justify-between items-end gap-3 mb-8">
          <div class="flex flex-col gap-3">

            <div class="flex flex-col gap-1">
              <h1 class="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">Mes Bulletins Scolaires</h1>
              <p class="text-slate-500 dark:text-slate-400 text-base">Année scolaire {{ currentSchoolYear }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="downloadAllBulletins" v-if="bulletins.length > 0" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
              <span class="material-symbols-outlined text-lg">download</span>
              Tout télécharger
            </button>
          </div>
        </div>

      <!-- Stats / Quick Glance -->
      <div v-if="bulletins.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Moyenne Générale</p>
            <span class="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg">trending_up</span>
          </div>
          <p class="text-slate-900 dark:text-white text-3xl font-bold">
            {{ (bulletins[0].moyenneGenerale - (bulletins[0].retraitPoints || 0)).toFixed(2) }}<span class="text-lg text-slate-400 font-normal">/20</span>
          </p>
          <p class="text-slate-500 text-xs font-semibold flex items-center gap-1">
             {{ bulletins[0].periode }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Conseil de Classe</p>
            <span class="material-symbols-outlined text-amber-500 bg-amber-500/10 p-1.5 rounded-lg">military_tech</span>
          </div>
          <p class="text-slate-900 dark:text-white text-3xl font-bold">{{ bulletins[0].decision || 'En attente' }}</p>
          <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">
            {{ bulletins[0].statut === 'VALIDE' || bulletins[0].statut === 'FINALISE' ? 'Validé le ' + formatDate(bulletins[0].updatedAt) : 'Non encore validé' }}
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Rang dans la classe</p>
            <span class="material-symbols-outlined text-purple-500 bg-purple-500/10 p-1.5 rounded-lg">leaderboard</span>
          </div>
          <p class="text-slate-900 dark:text-white text-3xl font-bold">{{ bulletins[0].rang || '-' }}<span class="text-lg text-slate-400 font-normal">{{ bulletins[0].rang === 1 ? 'er' : 'ème' }}</span></p>
          <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">Sur {{ bulletins[0].effectif || '-' }} élèves</p>
        </div>
      </div>

      <!-- Section: Historique -->
      <div class="mb-4">
        <h2 class="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Historique des bulletins</h2>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Période</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date de publication</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">État</th>
                <th class="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="b in bulletins" :key="b._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div class="size-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{{ b.periode.split(' ')[0][0] }}{{ b.periode.split(' ')[1] }}</div>
                    <span class="text-sm font-semibold text-slate-900 dark:text-white">{{ b.periode }}</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatDate(b.updatedAt) }}</span>
                </td>
                <td class="px-6 py-5">
                  <span :class="getStatusClass(b.statut)">
                    {{ b.statut }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right flex justify-end gap-2">
                  <button 
                    v-if="b.statut === 'VALIDE' || b.statut === 'FINALISE'"
                    @click="downloadBulletin(b)" 
                    class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <span class="material-symbols-outlined text-sm">download</span>
                    PDF
                  </button>
                  <button @click="viewBulletin(b)" class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
                    <span class="material-symbols-outlined text-sm">visibility</span>
                    Visionner
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bulletin Modal Content -->
      <div v-if="showBulletin" class="fixed inset-0 z-[100] overflow-y-auto no-print">
        <BulletinTemplate 
          :bulletin="selectedBulletin" 
          :eleve="user" 
          :classe="selectedBulletin.classe"
          :is-student-view="true"
          @close="showBulletin = false"
          @download="downloadBulletin"
        />
      </div>

      <!-- Subtle Banner / Notification -->
      <div class="mt-8 flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div class="size-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <span class="material-symbols-outlined">info</span>
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">Relevé de notes provisoire</p>
          <p class="text-xs text-slate-600 dark:text-slate-400">Vous pouvez consulter vos notes en temps réel avant la clôture du trimestre dans l'onglet "Notes & Devoirs".</p>
        </div>
        <router-link to="/eleve/notes" class="text-primary text-xs font-bold hover:underline">Accéder aux notes</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import BulletinTemplate from '@/components/bulletin/BulletinTemplate.vue';

const isLoading = ref(true);
const user = ref(null);
const bulletins = ref([]);
const showBulletin = ref(false);
const selectedBulletin = ref(null);
const currentSchoolYear = ref('2025-2026');

const downloadBulletin = async (bulletin) => {
  try {
    const res = await api.downloadBulletinPDF(bulletin._id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bulletin_${bulletin.periode.replace(' ', '_')}_${bulletin.anneeScolaire}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Erreur lors du téléchargement du bulletin:', error);
  }
};

const downloadAllBulletins = async () => {
  for (const b of bulletins.value) {
    if (b.statut === 'VALIDE' || b.statut === 'FINALISE') {
      await downloadBulletin(b);
    }
  }
};

const viewBulletin = (bulletin) => {
  selectedBulletin.value = bulletin;
  showBulletin.value = true;
};

const getStatusClass = (status) => {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ";
  if (status === 'FINALISE' || status === 'DISTRIBUE') return base + "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  return base + "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500";
};

const formatDate = (date) => {
  if (!date) return '--';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};

const getDecisionClass = (decision) => {
  if (!decision) return 'text-slate-500';
  if (decision.toLowerCase().includes('félicitation')) return 'text-emerald-600';
  if (decision.toLowerCase().includes('passable')) return 'text-blue-600';
  if (decision.toLowerCase().includes('redouble')) return 'text-red-600';
  return 'text-slate-600';
};

const fetchData = async () => {
  try {
    isLoading.value = true;
    const userRes = await api.getMe();
    user.value = userRes.data.data;
    
    if (user.value && user.value._id) {
       // Fetch bulletins
      const bulletinsRes = await api.getBulletins(user.value._id.toString());
      if (bulletinsRes.data.success) {
        bulletins.value = bulletinsRes.data.data;
      }

      // Fetch settings for school year
      try {
        const settingsRes = await api.getSettings();
        if (settingsRes.data.success) {
          const yearSetting = settingsRes.data.data.find(s => s.key === 'annee_scolaire');
          if (yearSetting) currentSchoolYear.value = yearSetting.value;
        }
      } catch (e) {
        console.warn('Could not fetch settings:', e);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des bulletins:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
  // Add Material Symbols font
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Lexend font
  const lexendLink = document.createElement('link');
  lexendLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap';
  lexendLink.rel = 'stylesheet';
  document.head.appendChild(lexendLink);

  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Lexend', sans-serif;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .material-symbols-outlined.fill {
      font-variation-settings: 'FILL' 1;
    }
  `;
  document.head.appendChild(style);
});
</script>
