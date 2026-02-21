<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-200 p-8">
    <div class="max-w-[1200px] mx-auto">
      <!-- Page Heading -->
      <header class="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-[#0e141b] dark:text-white text-4xl font-black tracking-tight">Ma Progression</h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-base">Suivi détaillé de vos performances académiques et comparaison de classe</p>
        </div>
      </header>

      <!-- Segmented Buttons -->
      <div class="flex mb-8">
        <div class="flex h-11 w-full max-w-md items-center justify-center rounded-xl bg-[#e7edf3] dark:bg-slate-800 p-1">
          <label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-[#4e7397] text-sm font-medium transition-all">
            <span class="truncate">Trimestre 1</span>
            <input class="hidden" name="period" type="radio" value="T1"/>
          </label>
          <label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-[#4e7397] text-sm font-medium transition-all">
            <span class="truncate">Trimestre 2</span>
            <input checked="" class="hidden" name="period" type="radio" value="T2"/>
          </label>
          <label class="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 has-[:checked]:bg-white dark:has-[:checked]:bg-slate-700 has-[:checked]:shadow-sm has-[:checked]:text-primary text-[#4e7397] text-sm font-medium transition-all">
            <span class="truncate">Trimestre 3</span>
            <input class="hidden" name="period" type="radio" value="T3"/>
          </label>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Moyenne Générale</p>
            <span class="material-symbols-outlined text-primary">analytics</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-bold">{{ progressionData.moyenneGenerale?.toFixed(1) || '--' }}/20</p>
          <div class="flex items-center gap-1 text-[#078838] text-sm font-bold">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            <span>+0.5 ce mois</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Rang de classe</p>
            <span class="material-symbols-outlined text-primary">leaderboard</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-bold">{{ progressionData.rangClasse || '--' }}<sup>ème</sup> <span class="text-lg font-normal text-[#4e7397]">/ {{ progressionData.effectifClasse || '--' }}</span></p>
          <p class="text-slate-500 dark:text-slate-400 text-xs font-normal">Sur {{ progressionData.effectifClasse || '--' }} élèves</p>
          <div class="flex items-center gap-1 text-[#e73908] text-sm font-bold">
            <span class="material-symbols-outlined text-sm">trending_down</span>
            <span>-1 place</span>
          </div>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Assiduité</p>
            <span class="material-symbols-outlined text-primary">event_available</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-bold">98%</p>
          <p class="text-[#4e7397] text-sm font-medium italic">2 absences justifiées</p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Evolution Chart -->
        <div class="flex flex-col gap-4 rounded-xl border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div class="flex justify-between items-center">
            <p class="text-[#0e141b] dark:text-white text-lg font-bold">Évolution de la moyenne</p>
            <div class="flex gap-2">
              <div class="flex items-center gap-1">
                <div class="size-2 rounded-full bg-primary"></div>
                <span class="text-[10px] text-[#4e7397]">Moi</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="size-2 rounded-full bg-[#d0dbe7]"></div>
                <span class="text-[10px] text-[#4e7397]">Classe</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div class="h-[220px] w-full relative">
              <svg fill="none" height="100%" preserveAspectRatio="none" viewBox="0 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
                <!-- Student Line Shadow -->
                <path d="M0 100C50 90 100 120 150 80C200 40 250 60 300 30C350 10 400 40 478 20V150H0V100Z" fill="url(#studentGradient)"></path>
                <!-- Class Avg Line (Reference) -->
                <path d="M0 110C50 110 100 115 150 105C200 100 250 105 300 95C350 90 400 100 478 95" stroke="#d0dbe7" stroke-dasharray="4 4" stroke-width="2"></path>
                <!-- Student Main Line -->
                <path d="M0 100C50 90 100 120 150 80C200 40 250 60 300 30C350 10 400 40 478 20" stroke="#197fe6" stroke-linecap="round" stroke-width="4"></path>
                <defs>
                  <linearGradient gradientUnits="userSpaceOnUse" id="studentGradient" x1="239" x2="239" y1="20" y2="150">
                    <stop stop-color="#197fe6" stop-opacity="0.2"></stop>
                    <stop offset="1" stop-color="#197fe6" stop-opacity="0"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="flex justify-between px-2">
              <p class="text-[#4e7397] text-xs font-bold">Sept</p>
              <p class="text-[#4e7397] text-xs font-bold">Oct</p>
              <p class="text-[#4e7397] text-xs font-bold">Nov</p>
              <p class="text-[#4e7397] text-xs font-bold">Déc</p>
              <p class="text-[#4e7397] text-xs font-bold">Jan</p>
            </div>
          </div>
        </div>

        <!-- Comparison by Subject -->
        <div class="flex flex-col gap-4 rounded-xl border border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
          <p class="text-[#0e141b] dark:text-white text-lg font-bold">Performance par matière</p>
          <div v-if="progressionData.matieres.length > 0" class="flex flex-col gap-4 py-2">
            <div v-for="matiere in progressionData.matieres" :key="matiere.nom" class="flex flex-col gap-1">
              <div class="flex justify-between text-xs font-medium mb-1">
                <span>{{ matiere.nom }}</span>
                <span class="text-primary font-bold">{{ matiere.moyenne.toFixed(1) }} / {{ matiere.moyenneClasse?.toFixed(1) || '12.0' }} avg</span>
              </div>
              <div class="w-full h-2 bg-[#e7edf3] dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div 
                  class="h-full transition-all duration-500" 
                  :class="matiere.moyenne >= 10 ? 'bg-primary' : 'bg-red-400'"
                  :style="{ width: `${Math.min(100, (matiere.moyenne / 20) * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center text-slate-400 text-sm">
            Aucune donnée disponible pour ce trimestre.
          </div>
        </div>
      </div>

      <!-- Strengths & Insights -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Points Forts -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-[#078838]">verified</span>
            <h3 class="text-[#0e141b] dark:text-white font-bold">Points Forts</h3>
          </div>
          <ul v-if="progressionData.pointsForts.length > 0" class="flex flex-col gap-3">
            <li v-for="(point, idx) in progressionData.pointsForts" :key="idx" class="flex gap-3 items-start">
              <div class="mt-1 flex-shrink-0 size-5 rounded-full bg-[#078838]/10 flex items-center justify-center text-[#078838]">
                <span class="material-symbols-outlined text-[14px]">check</span>
              </div>
              <p class="text-sm text-[#4e7397] dark:text-slate-300">
                <span class="font-bold text-[#0e141b] dark:text-white">{{ point.titre }} :</span> {{ point.description }}
              </p>
            </li>
          </ul>
          <p v-else class="text-sm text-slate-400 italic">Analysez vos notes pour identifier vos points forts.</p>
        </div>

        <!-- Axes d'Amélioration -->
        <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-symbols-outlined text-[#e73908]">info</span>
            <h3 class="text-[#0e141b] dark:text-white font-bold">Axes d'amélioration</h3>
          </div>
          <ul v-if="progressionData.axesAmelioration.length > 0" class="flex flex-col gap-3">
            <li v-for="(axe, idx) in progressionData.axesAmelioration" :key="idx" class="flex gap-3 items-start">
              <div class="mt-1 flex-shrink-0 size-5 rounded-full bg-[#e73908]/10 flex items-center justify-center text-[#e73908]">
                <span class="material-symbols-outlined text-[14px]">warning</span>
              </div>
              <p class="text-sm text-[#4e7397] dark:text-slate-300">
                <span class="font-bold text-[#0e141b] dark:text-white">{{ axe.titre }} :</span> {{ axe.description }}
              </p>
            </li>
          </ul>
          <p v-else class="text-sm text-slate-400 italic">Continuez vos efforts dans toutes les matières.</p>
        </div>
      </div>

      <!-- Footer / Feedback -->
      <footer class="mt-12 py-6 border-t border-[#d0dbe7] dark:border-slate-700 flex justify-between items-center text-[#4e7397] text-xs">
        <p>© 2024 Unica - Portails Élèves</p>
        <div class="flex gap-4">
          <a class="hover:text-primary underline" href="#">Contacter un professeur</a>
          <a class="hover:text-primary underline" href="#">Besoin d'aide ?</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const isLoading = ref(true);
const user = ref(null);
const progressionData = ref({
  moyenneGenerale: 0,
  rangClasse: 0,
  effectifClasse: 0,
  matieres: [],
  pointsForts: [],
  axesAmelioration: []
});

const selectedPeriod = ref('T2');

const fetchData = async () => {
  try {
    isLoading.value = true;
    
    // Récupérer l'utilisateur connecté
    const userRes = await api.getMe();
    user.value = userRes.data.data;
    
    // Récupérer les statistiques de l'élève
    if (user.value._id) {
      try {
        const statsRes = await api.getStudentStats(user.value._id.toString())
        if (statsRes.data.success) {
          progressionData.value.moyenneGenerale = statsRes.data.data.moyenneGenerale;
          // Rankings usually come from Bulletins or a dedicated ranking system
          // We'll try to find the latest bulletin to get the rank if available
          const bulletinsRes = await api.getBulletinsByEleve(user.value._id);
          if (bulletinsRes.data.success && bulletinsRes.data.data.length > 0) {
            const latestBulletin = bulletinsRes.data.data[0];
            progressionData.value.rangClasse = latestBulletin.rang;
            progressionData.value.effectifClasse = latestBulletin.effectif;
          }
        }
      } catch (error) {
        console.warn('Stats non disponibles:', error);
      }
    }
    
    // Récupérer les notes pour les matières
    if (user.value._id) {
      try {
        const notesRes = await api.getNotes({ eleve: user.value._id.toString(), statut: 'VALIDEE' });
        if (notesRes.data.success) {
          const allNotes = notesRes.data.data;
          
          // Group notes by matiere
          const matiereGroups = {};
          allNotes.forEach(note => {
            if (!note.matiere) return;
            const mId = note.matiere._id;
            if (!matiereGroups[mId]) {
              matiereGroups[mId] = {
                nom: note.matiere.nom,
                total: 0,
                count: 0
              };
            }
            matiereGroups[mId].total += note.moyenne;
            matiereGroups[mId].count += 1;
          });
          
          progressionData.value.matieres = Object.values(matiereGroups).map(m => ({
            nom: m.nom,
            moyenne: m.total / m.count,
            moyenneClasse: 12.0, // Placeholder as class avg per subject is complex to fetch
            evolution: '+0.0'
          }));

          // Derive points forts from subjects with moyenne > 15
          progressionData.value.pointsForts = progressionData.value.matieres
            .filter(m => m.moyenne >= 15)
            .map(m => ({
              titre: `Excellence en ${m.nom}`,
              description: `Votre moyenne de ${m.moyenne.toFixed(1)} témoigne d'une excellente maîtrise.`
            }));
            
          if (progressionData.value.pointsForts.length === 0) {
            progressionData.value.pointsForts.push({ titre: 'Assiduité', description: 'Continuez vos efforts réguliers dans toutes les matières.' });
          }

          // Derive axes d'amélioration from subjects with moyenne < 10
          progressionData.value.axesAmelioration = progressionData.value.matieres
            .filter(m => m.moyenne < 10)
            .map(m => ({
              titre: `${m.nom} à renforcer`,
              description: `Une moyenne de ${m.moyenne.toFixed(1)} nécessite un travail plus approfondi.`
            }));

          if (progressionData.value.axesAmelioration.length === 0) {
            progressionData.value.axesAmelioration.push({ titre: 'Participation', description: 'N\'hésitez pas à prendre davantage la parole en classe.' });
          }
        }
      } catch (error) {
        console.warn('Notes non disponibles:', error);
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Add Material Symbols font
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Lexend font
  const lexendLink = document.createElement('link');
  lexendLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap';
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
    .filled-icon {
      font-variation-settings: 'FILL' 1;
    }
  `;
  document.head.appendChild(style);
});
</script>
