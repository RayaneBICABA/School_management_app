const fs = require('fs');

const templateContent = `<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-[1200px] mx-auto p-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] font-display">
            Supervision des Notes
          </h1>
          <p class="text-[#4e7397] dark:text-slate-400 mt-2 text-lg">
            Validation et suivi des notes du corps professoral
          </p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 mb-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Classe</label>
          <select 
            v-model="selectedClasse" 
            @change="onFilterChange"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes les classes</option>
            <option v-for="c in classes" :key="c._id" :value="c._id">
              {{ c.niveau }} {{ c.section }}
            </option>
          </select>
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Matière</label>
          <select 
            v-model="selectedMatiere" 
            @change="onFilterChange"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes les matières</option>
            <option v-for="m in availableMatieres" :key="m._id" :value="m._id">
              {{ m.nom }}
            </option>
          </select>
        </div>

        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Période</label>
          <select 
            v-model="selectedPeriode" 
            @change="onFilterChange"
            class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
          >
            <option value="">Toutes les périodes</option>
            <option v-for="p in availablePeriodes" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[300px]">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-[#4e7397]">Chargement des notes...</p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div v-else>
        
        <!-- Tabs -->
        <div class="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6 font-display">
          <button 
            @click="activeTab = 'pending'"
            class="px-6 py-3 font-bold text-sm transition-colors border-b-2"
            :class="activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            En attente ({{ pendingNotes.length }})
          </button>
          <button 
            @click="activeTab = 'validated'"
            class="px-6 py-3 font-bold text-sm transition-colors border-b-2"
            :class="activeTab === 'validated' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Validées
          </button>
        </div>

        <!-- Notes List (Pending) -->
        <template v-if="activeTab === 'pending'">
          <div v-if="pendingNotes.length > 0">
            <!-- Header with bulk actions -->
            <div class="flex justify-between items-center mb-4">
              <p class="text-[#4e7397] font-semibold">{{ pendingNotes.length }} note(s) en attente</p>
              <button 
                @click="validateAllNotes"
                :disabled="isValidatingAll"
                class="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span class="material-symbols-outlined">done_all</span>
                {{ isValidatingAll ? 'Validation en cours...' : 'Valider tout' }}
              </button>
            </div>

            <!-- Notes cards -->
            <div class="space-y-4">
              <div v-for="note in pendingNotes" :key="note._id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">
                        {{ note.classe?.niveau }} {{ note.classe?.section }} - {{ note.matiere?.nom }}
                      </h3>
                      <p class="text-sm text-[#4e7397] mt-1">
                        Professeur: {{ note.professeur?.prenom }} {{ note.professeur?.nom }} • {{ note.periode }}
                      </p>
                    </div>
                    <span class="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-full text-xs font-bold">
                      ⏳ En attente
                    </span>
                  </div>

                  <div class="mb-4">
                    <p class="text-sm font-semibold text-[#0e141b] dark:text-white mb-2">Élève: {{ note.eleve?.prenom }} {{ note.eleve?.nom }}</p>
                    <p v-if="note.eleve?.matricule" class="text-xs text-[#4e7397] dark:text-slate-400">Matricule: {{ note.eleve?.matricule }}</p>
                    <div class="flex gap-4 flex-wrap">
                      <div v-for="(noteItem, index) in note.notes" :key="index" class="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
                        <span class="text-xs text-[#4e7397]">{{ noteItem.type }}</span>
                        <p class="text-lg font-bold text-primary">{{ noteItem.valeur }}/20</p>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-3 mt-4">
                    <button 
                      @click="validateNote(note._id)"
                      class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span class="material-symbols-outlined text-[18px]">check_circle</span>
                      Valider
                    </button>
                    <button 
                      @click="openRejectModal(note)"
                      class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <span class="material-symbols-outlined text-[18px]">cancel</span>
                      Rejeter
                    </button>
                    <router-link
                      :to="{ name: 'CenseurDetailNotesMatiere', query: { classe: note.classe?._id, matiere: note.matiere?._id, periode: note.periode } }"
                      class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                      title="Voir les détails"
                    >
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Empty State -->
          <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">task_alt</span>
            <p class="text-[#4e7397] text-lg">Aucune note en attente de validation pour ces critères.</p>
          </div>
        </template>

        <!-- Notes List (Validated) -->
        <template v-else-if="activeTab === 'validated'">
          <div v-if="validatedNotes.length > 0">
            <div class="flex justify-between items-center mb-4">
              <p class="text-[#4e7397] font-semibold">{{ validatedNotes.length }} note(s) validée(s)</p>
            </div>
            <!-- Notes cards -->
            <div class="space-y-4">
              <div v-for="note in validatedNotes" :key="note._id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div class="p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">
                        {{ note.classe?.niveau }} {{ note.classe?.section }} - {{ note.matiere?.nom }}
                      </h3>
                      <p class="text-sm text-[#4e7397] mt-1">
                        Professeur: {{ note.professeur?.prenom }} {{ note.professeur?.nom }} • {{ note.periode }}
                      </p>
                    </div>
                    <span class="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-bold">
                      ✅ Validée
                    </span>
                  </div>

                  <div class="mb-4 flex gap-4 flex-wrap">
                      <div class="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg flex items-center gap-2">
                        <span class="text-sm font-semibold text-[#0e141b] dark:text-white">Détails de la matière</span>
                      </div>
                  </div>

                  <div class="flex gap-3">
                    <router-link
                      :to="{ name: 'CenseurDetailNotesMatiere', query: { classe: note.classe?._id, matiere: note.matiere?._id, periode: note.periode } }"
                      class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-primary border border-slate-200 dark:border-slate-700 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 w-full"
                      title="Voir les détails et/ou débloquer"
                    >
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                      Voir les détails / Débloquer
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Empty State -->
          <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">task_alt</span>
            <p class="text-[#4e7397] text-lg">Aucune note validée pour ces critères.</p>
          </div>
        </template>

      </div>

      <!-- Reject Modal -->
      <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showRejectModal = false">
        <div class="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-xl font-bold text-[#0e141b] dark:text-white mb-4">Rejeter la note</h3>
          <div class="mb-4">
            <label class="block text-sm font-bold text-[#0e141b] dark:text-white mb-2">Motif du rejet</label>
            <textarea 
              v-model="rejectReason"
              rows="4"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:ring-2 focus:ring-primary"
              placeholder="Expliquez pourquoi vous rejetez cette note..."
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button 
              @click="showRejectModal = false"
              class="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-[#0e141b] dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Annuler
            </button>
            <button 
              @click="confirmReject"
              :disabled="!rejectReason.trim()"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>`;

const content = fs.readFileSync('Frontend/src/views/censeur/GestionNotes.vue', 'utf8');
const scriptPart = content.split('</template>')[1];
fs.writeFileSync('Frontend/src/views/censeur/GestionNotes.vue', templateContent + scriptPart);

