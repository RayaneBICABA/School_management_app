<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-200 p-8">
    <div class="max-w-6xl mx-auto">
      <header class="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div class="flex flex-col gap-2">
          <h2 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-tight">Bonjour, Marc ! 👋</h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-lg">Voici un aperçu de vos résultats et de votre emploi du temps.</p>
        </div>
        <div class="flex items-center gap-4">
            <router-link to="/eleve/notifications" class="size-10 rounded-xl bg-white dark:bg-[#1a242f] flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-primary transition-colors">
                <span class="material-symbols-outlined">notifications</span>
            </router-link>
            <div class="flex items-center gap-3 bg-white dark:bg-[#1a242f] px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <span class="material-symbols-outlined text-slate-400">calendar_month</span>
              <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">Lundi, 22 Octobre 2023</span>
            </div>
        </div>
      </header>
      
      <!-- Key Metrics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium leading-normal uppercase tracking-wider">Moyenne Générale</p>
            <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">+0.2%</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-bold leading-tight">15.4 <span class="text-base font-normal text-slate-400">/ 20</span></p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium leading-normal uppercase tracking-wider">Crédits validés</p>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-bold leading-tight">42 <span class="text-base font-normal text-slate-400">/ 60</span></p>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-2">
            <div class="bg-primary h-2 rounded-full" style="width: 70%"></div>
          </div>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium leading-normal uppercase tracking-wider">Absences</p>
            <span class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full">Ce mois</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-bold leading-tight">2h</p>
        </div>
      </div>
      
      <!-- Main Grid Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column: Schedule -->
        <section class="bg-white dark:bg-[#1a242f] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 class="text-[#0e141b] dark:text-white text-xl font-bold leading-tight tracking-tight">Emploi du temps du jour</h2>
            <router-link to="/eleve/calendrier" class="text-primary text-sm font-semibold hover:underline">Voir semaine</router-link>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-[48px_1fr] gap-x-4">
              <!-- Step 1 -->
              <div class="flex flex-col items-center pt-1">
                <div class="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                  <span class="material-symbols-outlined">menu_book</span>
                </div>
                <div class="w-[2px] bg-slate-200 dark:bg-slate-700 h-10 my-1"></div>
              </div>
              <div class="flex flex-col pb-6">
                <p class="text-[#0e141b] dark:text-white text-base font-semibold">Mathématiques</p>
                <div class="flex items-center gap-3 text-[#4e7397] dark:text-slate-400 text-sm mt-1">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">schedule</span> 08:00 - 10:00</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">meeting_room</span> Salle 204</span>
                </div>
              </div>
              <!-- Step 2 -->
              <div class="flex flex-col items-center">
                <div class="flex items-center justify-center size-10 rounded-full bg-orange-100 text-orange-600">
                  <span class="material-symbols-outlined">science</span>
                </div>
                <div class="w-[2px] bg-slate-200 dark:bg-slate-700 h-10 my-1"></div>
              </div>
              <div class="flex flex-col pb-6">
                <p class="text-[#0e141b] dark:text-white text-base font-semibold">Physique-Chimie</p>
                <div class="flex items-center gap-3 text-[#4e7397] dark:text-slate-400 text-sm mt-1">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">schedule</span> 10:15 - 12:15</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">meeting_room</span> Labo B</span>
                </div>
              </div>
              <!-- Step 3 -->
              <div class="flex flex-col items-center">
                <div class="flex items-center justify-center size-10 rounded-full bg-green-100 text-green-600">
                  <span class="material-symbols-outlined">translate</span>
                </div>
                <div class="w-[2px] bg-slate-200 dark:bg-slate-700 h-10 my-1"></div>
              </div>
              <div class="flex flex-col pb-6">
                <p class="text-[#0e141b] dark:text-white text-base font-semibold">Anglais</p>
                <div class="flex items-center gap-3 text-[#4e7397] dark:text-slate-400 text-sm mt-1">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">schedule</span> 14:00 - 15:30</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">meeting_room</span> Salle 102</span>
                </div>
              </div>
              <!-- Step 4 -->
              <div class="flex flex-col items-center">
                <div class="flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-600">
                  <span class="material-symbols-outlined">history</span>
                </div>
              </div>
              <div class="flex flex-col">
                <p class="text-[#0e141b] dark:text-white text-base font-semibold">Histoire-Géo</p>
                <div class="flex items-center gap-3 text-[#4e7397] dark:text-slate-400 text-sm mt-1">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">schedule</span> 15:45 - 17:15</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-xs">meeting_room</span> Salle 301</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Right Column: Grades and Progress -->
        <div class="flex flex-col gap-8">
          <!-- Recent Grades -->
          <section class="bg-white dark:bg-[#1a242f] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 class="text-[#0e141b] dark:text-white text-xl font-bold leading-tight tracking-tight">Dernières notes</h2>
              <router-link to="/eleve/notes" class="text-primary text-sm font-semibold hover:underline">Voir tout</router-link>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-slate-700">
              <div class="px-6 py-4 flex items-center justify-between">
                <div>
                  <p class="font-semibold text-sm">Contrôle de Français</p>
                  <p class="text-xs text-slate-400 mt-0.5">Hier, 14:30</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg text-primary">16.5 <span class="text-xs font-normal text-slate-400">/ 20</span></p>
                  <span class="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 uppercase font-bold">Excellent</span>
                </div>
              </div>
              <div class="px-6 py-4 flex items-center justify-between">
                <div>
                  <p class="font-semibold text-sm">Devoir Maison de Maths</p>
                  <p class="text-xs text-slate-400 mt-0.5">18 Oct 2023</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg text-primary">14.0 <span class="text-xs font-normal text-slate-400">/ 20</span></p>
                  <span class="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase font-bold">Bien</span>
                </div>
              </div>
              <div class="px-6 py-4 flex items-center justify-between">
                <div>
                  <p class="font-semibold text-sm">TP Physique</p>
                  <p class="text-xs text-slate-400 mt-0.5">15 Oct 2023</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-lg text-primary">12.5 <span class="text-xs font-normal text-slate-400">/ 20</span></p>
                  <span class="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase font-bold">Correct</span>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Subject Progress -->
          <section class="bg-white dark:bg-[#1a242f] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
              <h2 class="text-[#0e141b] dark:text-white text-xl font-bold leading-tight tracking-tight">Moyennes par matière</h2>
            </div>
            <div class="p-6 space-y-4">
              <div class="space-y-1.5">
                <div class="flex justify-between text-sm font-medium">
                  <span>Mathématiques</span>
                  <span class="text-primary font-bold">14.5</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div class="h-1.5 bg-primary rounded-full" style="width: 72.5%"></div>
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-sm font-medium">
                  <span>Philosophie</span>
                  <span class="text-primary font-bold">16.2</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div class="h-1.5 bg-primary rounded-full" style="width: 81%"></div>
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-sm font-medium">
                  <span>Anglais LV1</span>
                  <span class="text-primary font-bold">17.8</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div class="h-1.5 bg-primary rounded-full" style="width: 89%"></div>
                </div>
              </div>
              <div class="space-y-1.5">
                <div class="flex justify-between text-sm font-medium">
                  <span>Physique-Chimie</span>
                  <span class="text-primary font-bold">13.2</span>
                </div>
                <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <div class="h-1.5 bg-primary rounded-full" style="width: 66%"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
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
  `;
  document.head.appendChild(style);
});
</script>
