<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col overflow-y-auto">
      <!-- PageHeading -->
      <header class="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-8">
        <div class="max-w-5xl mx-auto flex flex-wrap justify-between items-end gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-primary font-bold text-sm">
              <span class="material-symbols-outlined text-sm">edit_calendar</span>
              Configuration Active
            </div>
            <h1 class="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Année Scolaire {{ config.year }}</h1>
            <p class="text-slate-500 dark:text-slate-400 text-base max-w-xl">Définissez les périodes d'enseignement, le calendrier des vacances et les règles globales de calcul de moyennes pour cet établissement.</p>
          </div>
          <div class="flex gap-3">
            <button @click="saveConfiguration" :disabled="isSaving" class="flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined mr-2" v-if="isSaving">sync</span>
              {{ isSaving ? 'Enregistrement...' : 'Valider la Configuration' }}
            </button>
          </div>
        </div>
      </header>
      
      <!-- Tabs Navigation -->
      <div class="bg-white dark:bg-slate-950 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-8">
          <nav class="flex gap-10">
            <a class="flex items-center gap-2 border-b-4 border-primary text-primary pb-4 pt-6 group" href="#">
              <span class="material-symbols-outlined text-[20px] active-icon">schedule</span>
              <p class="text-sm font-bold tracking-wide">Périodes & Dates</p>
            </a>
            <router-link to="/admin/gestion-vacances" class="flex items-center gap-2 border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-4 pt-6 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">beach_access</span>
              <p class="text-sm font-bold tracking-wide">Vacances</p>
            </router-link>
            <router-link to="/admin/cloture-administrative" class="flex items-center gap-2 border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-4 pt-6 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">verified_user</span>
              <p class="text-sm font-bold tracking-wide">Clôture Administrative</p>
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- Content Body -->
      <div class="max-w-5xl mx-auto w-full p-8 flex flex-col gap-8 pb-24">
        <!-- Section: Sélection de la Filière -->
        <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Configuration par Filière</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Définissez le système de découpage spécifique à chaque filière.</p>
          </div>
          <div class="p-6">
            <div class="flex gap-4 justify-center">
              <button 
                @click="selectedFiliere = 'generale'"
                :class="selectedFiliere === 'generale' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                class="px-8 py-3 rounded-xl font-bold transition-all"
              >
                Filière Générale
              </button>
              <button 
                @click="selectedFiliere = 'technique'"
                :class="selectedFiliere === 'technique' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'"
                class="px-8 py-3 rounded-xl font-bold transition-all"
              >
                Filière Technique
              </button>
            </div>
          </div>
        </section>

        <!-- Section: Type de Découpage -->
        <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 class="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Système de Découpage - {{ selectedFiliere === 'generale' ? 'Générale' : 'Technique' }}</h2>
              <p class="text-slate-500 dark:text-slate-400 text-sm">Sélectionnez comment l'année est divisée pour cette filière.</p>
            </div>
          </div>
          <div class="p-6">
            <div class="flex h-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 max-w-md mx-auto">
              <label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-bold transition-all">
                <span class="truncate">Trimestres (3)</span>
                <input v-model="currentFiliereConfig.periodType" class="invisible w-0" name="period-type" type="radio" value="Trimestres"/>
              </label>
              <label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-slate-500 dark:text-slate-400 text-sm font-bold transition-all">
                <span class="truncate">Semestres (2)</span>
                <input v-model="currentFiliereConfig.periodType" class="invisible w-0" name="period-type" type="radio" value="Semestres"/>
              </label>
            </div>
          </div>
        </section>
        
        <section>
          <div class="flex items-center justify-between pb-6">
             <h2 class="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">Définition des Dates des Périodes</h2>
             <div class="relative max-w-[200px]">
                <label class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Modifier l'année</label>
                <input v-model="config.year" class="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold" type="text" placeholder="ex: 2023-2024" />
             </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Period 1 Card -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="bg-primary/10 text-primary p-2 rounded-lg">
                  <span class="material-symbols-outlined text-[20px]">filter_1</span>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ currentFiliereConfig.periodType === 'Trimestres' ? '1er Trimestre' : '1er Semestre' }}</h3>
              </div>
              <div class="flex flex-col gap-3 mt-2">
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date de début</label>
                  <input v-model="currentFiliereConfig.periods[0].start" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" type="date"/>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date de fin</label>
                  <input v-model="currentFiliereConfig.periods[0].end" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" type="date"/>
                </div>
              </div>
            </div>
            <!-- Period 2 Card -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="bg-primary/10 text-primary p-2 rounded-lg">
                  <span class="material-symbols-outlined text-[20px]">filter_2</span>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ currentFiliereConfig.periodType === 'Trimestres' ? '2ème Trimestre' : '2ème Semestre' }}</h3>
              </div>
              <div class="flex flex-col gap-3 mt-2">
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date de début</label>
                  <input v-model="currentFiliereConfig.periods[1].start" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" type="date"/>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date de fin</label>
                  <input v-model="currentFiliereConfig.periods[1].end" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" type="date"/>
                </div>
              </div>
            </div>
            <!-- Period 3 Card (Only for Trimestres) -->
            <div v-if="currentFiliereConfig.periodType === 'Trimestres'" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="bg-primary/10 text-primary p-2 rounded-lg">
                  <span class="material-symbols-outlined text-[20px]">filter_3</span>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white">3ème Trimestre</h3>
              </div>
              <div class="flex flex-col gap-3 mt-2">
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date de début</label>
                  <input v-model="currentFiliereConfig.periods[2].start" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" type="date"/>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date de fin</label>
                  <input v-model="currentFiliereConfig.periods[2].end" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary" type="date"/>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Section: Date Limite de Saisie -->
        <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Date Limite de Saisie des Notes</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Définissez une date après laquelle les professeurs ne pourront plus saisir de notes pour chaque période.</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Period 1 Deadline -->
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <div class="bg-primary/10 text-primary p-1.5 rounded-lg">
                    <span class="material-symbols-outlined text-[18px]">filter_1</span>
                  </div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ currentFiliereConfig.periodType === 'Trimestres' ? '1er Trimestre' : '1er Semestre' }}</h3>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date limite</label>
                  <input v-model="config.gradeDeadlines.period1" class="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="date"/>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Verrouiller la saisie</label>
                  <button @click="config.gradeDeadlines.period1Locked = !config.gradeDeadlines.period1Locked" :class="config.gradeDeadlines.period1Locked ? 'bg-red-500' : 'bg-slate-300'" class="w-10 h-5 rounded-full relative transition-colors">
                    <div :class="config.gradeDeadlines.period1Locked ? 'right-1' : 'left-1'" class="absolute top-1 size-3 bg-white rounded-full transition-all"></div>
                  </button>
                </div>
                <p v-if="config.gradeDeadlines.period1Locked" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  Saisie verrouillée
                </p>
              </div>

              <!-- Period 2 Deadline -->
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <div class="bg-primary/10 text-primary p-1.5 rounded-lg">
                    <span class="material-symbols-outlined text-[18px]">filter_2</span>
                  </div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm">{{ currentFiliereConfig.periodType === 'Trimestres' ? '2ème Trimestre' : '2ème Semestre' }}</h3>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date limite</label>
                  <input v-model="config.gradeDeadlines.period2" class="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="date"/>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Verrouiller la saisie</label>
                  <button @click="config.gradeDeadlines.period2Locked = !config.gradeDeadlines.period2Locked" :class="config.gradeDeadlines.period2Locked ? 'bg-red-500' : 'bg-slate-300'" class="w-10 h-5 rounded-full relative transition-colors">
                    <div :class="config.gradeDeadlines.period2Locked ? 'right-1' : 'left-1'" class="absolute top-1 size-3 bg-white rounded-full transition-all"></div>
                  </button>
                </div>
                <p v-if="config.gradeDeadlines.period2Locked" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  Saisie verrouillée
                </p>
              </div>

              <!-- Period 3 Deadline (Only for Trimestres) -->
              <div v-if="currentFiliereConfig.periodType === 'Trimestres'" class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <div class="bg-primary/10 text-primary p-1.5 rounded-lg">
                    <span class="material-symbols-outlined text-[18px]">filter_3</span>
                  </div>
                  <h3 class="font-bold text-slate-900 dark:text-white text-sm">3ème Trimestre</h3>
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Date limite</label>
                  <input v-model="config.gradeDeadlines.period3" class="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="date"/>
                </div>
                <div class="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Verrouiller la saisie</label>
                  <button @click="config.gradeDeadlines.period3Locked = !config.gradeDeadlines.period3Locked" :class="config.gradeDeadlines.period3Locked ? 'bg-red-500' : 'bg-slate-300'" class="w-10 h-5 rounded-full relative transition-colors">
                    <div :class="config.gradeDeadlines.period3Locked ? 'right-1' : 'left-1'" class="absolute top-1 size-3 bg-white rounded-full transition-all"></div>
                  </button>
                </div>
                <p v-if="config.gradeDeadlines.period3Locked" class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">lock</span>
                  Saisie verrouillée
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Section: Informations Établissement -->
        <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 class="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Informations Établissement</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Ces informations apparaissent sur l'en-tête de tous les bulletins générés.</p>
          </div>
          <div class="p-6 flex flex-col gap-6">
            <div class="flex items-start gap-8">
              <!-- Logo Upload -->
              <div class="flex flex-col items-center gap-3">
                <div class="size-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <img v-if="schoolConfig.logo" :src="`http://localhost:5000${schoolConfig.logo}`" class="max-w-full max-h-full object-contain" />
                  <span v-else class="material-symbols-outlined text-4xl text-slate-300">image</span>
                </div>
                <input type="file" ref="logoInput" class="hidden" @change="handleLogoUpload" accept="image/*" />
                <button @click="$refs.logoInput.click()" class="text-xs font-bold text-primary hover:underline">
                  {{ schoolConfig.logo ? 'Changer le logo' : 'Ajouter un logo' }}
                </button>
              </div>

              <!-- General Info -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Nom de l'établissement</label>
                  <input v-model="schoolConfig.schoolName" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" placeholder="ex: LYCÉE WEND PUIRÉ DE SAABA" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Sigle / Nom court</label>
                  <input v-model="schoolConfig.shortName" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" placeholder="ex: LWS" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Slogan / Devise</label>
                  <input v-model="schoolConfig.motto" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" placeholder="ex: DISCIPLINE-TRAVAIL-SUCCES" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Téléphone</label>
                  <input v-model="schoolConfig.phone" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" placeholder="ex: 51 54 88 11" />
                </div>
                <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Région (En-tête haut)</label>
                  <input v-model="schoolConfig.region" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" placeholder="ex: RÉGION CENTRE" />
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
               <div>
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Pays</label>
                  <input v-model="schoolConfig.country" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" />
                </div>
                <div class="md:col-span-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">Slogan Secondaire (Ex: La Patrie ou la Mort...)</label>
                  <input v-model="schoolConfig.patrie" class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm" type="text" />
                </div>
            </div>
          </div>
        </section>

        <!-- Help Alert -->
        <div class="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl p-4 flex gap-4">
          <span class="material-symbols-outlined text-sky-600 dark:text-sky-400">info</span>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-bold text-sky-900 dark:text-sky-100">Conseil d'administration</p>
            <p class="text-sm text-sky-800 dark:text-sky-300">Toutes les dates saisies ici seront appliquées aux emplois du temps et aux carnets de notes de tous les professeurs.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/services/api';
import { useAcademicYear } from '@/composables/useAcademicYear';

const isSaving = ref(false);
const selectedFiliere = ref('generale');
const { refreshYear } = useAcademicYear();

const schoolConfig = ref({
    schoolName: '',
    shortName: '',
    motto: '',
    phone: '',
    region: '',
    subRegion: 'RÉGION CENTRE',
    country: 'BURKINA FASO',
    patrie: 'La Patrie ou la Mort, nous Vaincrons',
    logo: ''
});

const config = ref({
    year: '2025-2026',
    filieres: {
        generale: {
            periodType: 'Trimestres',
            periods: [
                { name: 'T1', start: '2025-09-04', end: '2025-12-22' },
                { name: 'T2', start: '2026-01-08', end: '2026-03-29' },
                { name: 'T3', start: '2026-04-15', end: '2026-07-05' }
            ]
        },
        technique: {
            periodType: 'Semestres',
            periods: [
                { name: 'S1', start: '2025-09-04', end: '2026-01-26' },
                { name: 'S2', start: '2026-02-05', end: '2026-06-28' },
                { name: 'S3', start: '', end: '' } // Dummy for structure consistency if needed
            ]
        }
    },
    gradeDeadlines: {
        period1: '',
        period1Locked: false,
        period2: '',
        period2Locked: false,
        period3: '',
        period3Locked: false
    }
});

// Watch for T1/S1 start date changes to update everything else
watch(() => config.value.filieres.generale.periods[0].start, (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return;
    updateYearAndCascase('generale', newVal);
});

watch(() => config.value.filieres.technique.periods[0].start, (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return;
    updateYearAndCascase('technique', newVal);
});

// Watch for T1/S1 end date to shift the next period's start
watch(() => config.value.filieres.generale.periods[0].end, (newVal) => {
    if (!newVal) return;
    suggestNextPeriodStart('generale', 0, newVal);
});

watch(() => config.value.filieres.generale.periods[1].end, (newVal) => {
    if (!newVal) return;
    suggestNextPeriodStart('generale', 1, newVal);
});

watch(() => config.value.filieres.technique.periods[0].end, (newVal) => {
    if (!newVal) return;
    suggestNextPeriodStart('technique', 0, newVal);
});

const suggestNextPeriodStart = (filiereKey, currentIdx, endDate) => {
    const filConfig = config.value.filieres[filiereKey];
    if (filConfig.periods[currentIdx + 1]) {
        const date = new Date(endDate);
        // Add ~17 days for Christmas/New Year breaks if it's Dec
        if (date.getMonth() === 11) {
            date.setDate(date.getDate() + 17);
        } else {
            date.setDate(date.getDate() + 7); // Default 1 week break
        }
        filConfig.periods[currentIdx + 1].start = date.toISOString().split('T')[0];
    }
}

const updateYearAndCascase = (filiereKey, startDate) => {
    const date = new Date(startDate);
    const startYear = date.getFullYear();
    const startMonth = date.getMonth();
    
    // 1. Update overall academic year string
    // Academic year usually starts in Aug/Sept/Oct
    if (startMonth >= 5) { // Jun-Dec
        config.value.year = `${startYear}-${startYear + 1}`;
    } else { // Jan-May
        config.value.year = `${startYear - 1}-${startYear}`;
    }

    const baseYear = startMonth >= 5 ? startYear : startYear - 1;

    // 2. Cascade years to other periods
    const filConfig = config.value.filieres[filiereKey];
    filConfig.periods.forEach((p, idx) => {
        if (idx > 0) {
            // Adjust start date year
            if (p.start) {
                const pDate = new Date(p.start);
                // If month is Sep-Dec, same year as start. If Jan-Aug, next year.
                pDate.setFullYear(pDate.getMonth() >= 8 ? baseYear : baseYear + 1);
                p.start = pDate.toISOString().split('T')[0];
            }
        }
        // Adjust end date year
        if (p.end) {
            const pEndDate = new Date(p.end);
            pEndDate.setFullYear(pEndDate.getMonth() >= 8 ? baseYear : baseYear + 1);
            p.end = pEndDate.toISOString().split('T')[0];
        }
    });

    // 3. Update grade deadlines year
    ['period1', 'period2', 'period3'].forEach((key) => {
        if (config.value.gradeDeadlines[key]) {
            const d = new Date(config.value.gradeDeadlines[key]);
            d.setFullYear(d.getMonth() >= 8 ? baseYear : baseYear + 1);
            config.value.gradeDeadlines[key] = d.toISOString().split('T')[0];
        }
    });
};

const fetchSchoolConfig = async () => {
    try {
        const res = await api.getSetting('school_config');
        if (res.data.success && res.data.data) {
            schoolConfig.value = {
                ...schoolConfig.value,
                ...res.data.data.value
            };
        }
    } catch (error) {
        if (error.response?.status !== 404) {
            console.error('Erreur chargement school config:', error);
        }
    }
};

const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const base64 = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve(e.target.result);
        r.readAsDataURL(file);
    });

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/v1/settings/upload-logo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64 })
        });
        const data = await response.json();
        if (data.success) {
            schoolConfig.value.logo = data.data;
            alert('Logo mis à jour !');
        } else {
            alert('Erreur upload: ' + data.error);
        }
    } catch (err) {
        console.error(err);
        alert('Erreur lors de l\'envoi du logo');
    }
};

const currentFiliereConfig = computed(() => config.value.filieres[selectedFiliere.value]);

const fetchConfiguration = async () => {
    try {
        const res = await api.getSetting('academic_year_config');
        if (res.data.success && res.data.data) {
            const fetched = res.data.data.value;
            // Merge with default structure to avoid errors if new fields are missing
            config.value.year = fetched.year || config.value.year;
            
            // Load grade deadlines
            if (fetched.gradeDeadlines) {
                config.value.gradeDeadlines = {
                    ...config.value.gradeDeadlines,
                    ...fetched.gradeDeadlines
                };
            }
            
            if (fetched.filieres) {
                config.value.filieres = fetched.filieres;
            } else if (fetched.periodType) {
                // Migration logic from old single config
                config.value.filieres.generale.periodType = fetched.periodType;
                config.value.filieres.generale.periods = fetched.periods;
            }
        }
    } catch (error) {
        // Si la configuration n'existe pas encore (404), on utilise les valeurs par défaut
        if (error.response?.status === 404) {
            console.log('Configuration non trouvée, utilisation des valeurs par défaut');
        } else {
            console.error('Erreur chargement config:', error);
        }
    }
};

const saveConfiguration = async () => {
    isSaving.value = true;
    try {
        // Fetch latest to preserve other keys (like holidays, rules)
        let fullConfig = {};
        try {
            const res = await api.getSetting('academic_year_config');
            fullConfig = res.data.data?.value || {};
        } catch (error) {
            // Si la configuration n'existe pas (404), on part d'un objet vide
            if (error.response?.status !== 404) {
                throw error; // Re-throw si ce n'est pas une 404
            }
            console.log('Création de la configuration pour la première fois');
        }
        
        // Update year
        fullConfig.year = config.value.year;
        
        // Update grade deadlines
        fullConfig.gradeDeadlines = config.value.gradeDeadlines;
        
        // Update filieres but preserve existing properties (like coefficients)
        if (!fullConfig.filieres) fullConfig.filieres = {};
        
        ['generale', 'technique'].forEach(fKey => {
            if (!fullConfig.filieres[fKey]) fullConfig.filieres[fKey] = { periods: [] };
            
            fullConfig.filieres[fKey].periodType = config.value.filieres[fKey].periodType;
            
            // Sync periods (dates) while preserving coefficients
            const localPeriods = config.value.filieres[fKey].periods;
            const remotePeriods = fullConfig.filieres[fKey].periods;
            
            fullConfig.filieres[fKey].periods = localPeriods.map((lp, idx) => {
                const rp = remotePeriods[idx] || {};
                return { ...rp, ...lp }; // lp has the new dates
            });
        });

        console.log('💾 Sauvegarde de la configuration:', fullConfig);
        await api.updateSetting('academic_year_config', fullConfig);
        
        // Save school config
        await api.updateSetting('school_config', schoolConfig.value);
        
        alert('Configuration enregistrée avec succès !');
        
        // Refresh global academic year state for sidebars
        await refreshYear();

        // Recharger pour confirmer
        await fetchConfiguration();
        await fetchSchoolConfig();
    } catch (error) {
        console.error('Erreur enregistrement:', error);
        alert('Erreur lors de l\'enregistrement: ' + (error.response?.data?.error || error.message));
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
  fetchConfiguration();
  fetchSchoolConfig();
  fetchSchoolConfig();
  
  // Add Material Symbols font
  const link = document.createElement('link');
  // ... rest of the logic ...
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Inter font
  const interLink = document.createElement('link');
  interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  interLink.rel = 'stylesheet';
  document.head.appendChild(interLink);

  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Inter', sans-serif;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .active-icon {
      font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .font-display {
      font-family: 'Inter', sans-serif;
    }
  `;
  document.head.appendChild(style);
});
</script>
