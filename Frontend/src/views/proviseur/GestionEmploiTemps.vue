<template>
  <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 text-[#0e141b] dark:text-slate-100">
    <div class="max-w-[1400px] mx-auto w-full flex flex-col gap-6 p-8">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestion Emploi du Temps</h1>
          <p class="text-slate-500 dark:text-slate-400">Planifiez les cours hebdomadaires pour chaque classe.</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">class</span>
            <select v-model="selectedClasse" @change="fetchSchedule" class="pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none min-w-[200px]">
              <option value="" disabled>Sélectionner une classe</option>
              <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                {{ classe.niveau }} {{ classe.section }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>

      <!-- Schedule Grid -->
      <div v-else-if="selectedClasse" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/50">
                <th class="w-20 px-4 py-4 text-center text-xs font-black uppercase text-slate-400 tracking-wider border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-slate-50 z-10">
                  Heure
                </th>
                <th v-for="day in weekDays" :key="day" class="min-w-[160px] px-4 py-4 text-center text-sm font-bold text-slate-900 dark:text-white border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hour in hours" :key="hour" class="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <!-- Time Column -->
                <td class="px-2 py-3 border-b border-r border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 text-center sticky left-0 bg-white dark:bg-slate-800 z-10 border-t-0">
                  {{ formatTime(hour) }}
                </td>

                <!-- Day Columns -->
                <td v-for="day in weekDays" :key="`${day}-${hour}`" 
                    @click="openModal(day, hour)"
                    class="p-1 border-b border-r border-slate-200 dark:border-slate-700 last:border-r-0 relative h-20 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors bg-white dark:bg-slate-800">
                  
                  <!-- Slot Content -->
                  <div v-if="getSchedule(day, hour)" 
                       class="h-full w-full rounded-lg bg-primary/10 border border-primary/20 p-2 flex flex-col justify-between group/card hover:bg-primary/20 transition-colors">
                    <div>
                      <p class="text-xs font-black text-primary uppercase truncate mb-0.5">
                        {{ getSchedule(day, hour).matiere.nom }}
                      </p>
                      <p class="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">
                         {{ getSchedule(day, hour).professeur ? `${getSchedule(day, hour).professeur.prenom} ${getSchedule(day, hour).professeur.nom}` : 'Non assigné' }}
                      </p>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                       <span class="text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {{ getSchedule(day, hour).salle || '?' }}
                      </span>
                      <button @click.stop="deleteSchedule(getSchedule(day, hour)._id)" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-all">
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <!-- Empty State (Hover) -->
                  <div v-else class="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100">
                    <span class="material-symbols-outlined text-slate-300">add</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- No Selection State -->
      <div v-else class="flex flex-col items-center justify-center py-20 text-slate-400">
        <span class="material-symbols-outlined text-6xl mb-4 text-slate-300">calendar_today</span>
        <p class="text-lg font-medium">Sélectionnez une classe pour gérer son emploi du temps</p>
      </div>
    </div>

    <!-- Edit/Add Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">
            Programmer un cours
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- Context Info -->
          <div class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-100 text-sm font-medium">
            <span class="material-symbols-outlined">event</span>
            <span>{{ form.jour }} à {{ form.creneau }}</span>
            <span class="w-1 h-1 rounded-full bg-blue-400 mx-1"></span>
             <span>{{ classes.find(c => c._id === selectedClasse)?.niveau }} {{ classes.find(c => c._id === selectedClasse)?.section }}</span>
          </div>

          <!-- Matière Select -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase text-slate-500 ml-1">Matière</label>
            <select v-model="form.matiere" @change="onMatiereChange" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none">
              <option value="" disabled>Choisir une matière</option>
              <option v-for="m in matieres" :key="m._id" :value="m._id">
                {{ m.nom }} (Code: {{ m.code }})
              </option>
            </select>
          </div>

           <!-- Professeur Preview -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase text-slate-500 ml-1">Professeur (Auto-assigné)</label>
            <div class="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">person</span>
              <span>{{ assignedProfName || 'Aucun professeur associé' }}</span>
            </div>
            <p v-if="!assignedProfName && form.matiere" class="text-xs text-amber-500 font-medium ml-1">
              ⚠️ Attention: Aucun professeur n'est lié à cette matière pour cette classe.
            </p>
          </div>

           <!-- Salle Input -->
          <div class="space-y-1.5">
             <label class="text-xs font-bold uppercase text-slate-500 ml-1">Salle</label>
             <input v-model="form.salle" type="text" placeholder="Ex: Salle 12, Labo..." class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" />
          </div>

          <!-- Error Message -->
          <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold flex items-start gap-2">
            <span class="material-symbols-outlined text-lg">error</span>
            <span>{{ errorMsg }}</span>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900">
           <button @click="closeModal" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Annuler
          </button>
           <button @click="saveSchedule" :disabled="isSaving || !form.matiere" class="px-5 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none">
            {{ isSaving ? '...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :isOpen="showConfirmModal"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="onConfirmDelete"
      @cancel="closeConfirmModal"
      type="danger"
      actionLabel="Supprimer"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue';

const { success, error } = useToast();

const classes = ref([]);
const schedules = ref([]);
const matieres = ref([]);
const classeMatieres = ref([]);

const selectedClasse = ref('');
const isLoading = ref(false);
const isSaving = ref(false);

const showModal = ref(false);
const errorMsg = ref('');

// Calendar Config: 07h00 to 18h00 explictly
const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const form = ref({
  jour: '',
  creneau: '',
  matiere: '',
  salle: '',
  professeur: null
});

const assignedProfName = ref('');

// Confirmation Modal State
const showConfirmModal = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const itemToDelete = ref(null);

onMounted(async () => {
  await loadClasses();
  await loadMatieres();
});

const loadClasses = async () => {
  try {
    const res = await api.getClasses();
    if(res.data.success) classes.value = res.data.data;
  } catch(e) { console.error(e); }
};

const loadMatieres = async () => {
    try {
        const res = await api.getMatieres();
        if(res.data.success) matieres.value = res.data.data;
    } catch(e) { console.error(e); }
}

const fetchSchedule = async () => {
  if(!selectedClasse.value) return;
  isLoading.value = true;
  try {
    const res = await api.getSchedules({ classe: selectedClasse.value });
    schedules.value = res.data.data;

    const cmRes = await api.getClasseMatieres(selectedClasse.value);
    if(cmRes.data.success) {
        classeMatieres.value = cmRes.data.data;
    }

  } catch(err) {
    console.error(err);
    error('Impossible de charger l\'emploi du temps');
  } finally {
    isLoading.value = false;
  }
};

const formatTime = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const getSchedule = (day, hour) => {
  const timeStr = formatTime(hour);
  return schedules.value.find(s => s.jour === day && s.creneau === timeStr);
};

const openModal = (day, hour) => {
  if (getSchedule(day, hour)) return; 
  
  errorMsg.value = '';
  form.value = {
    jour: day,
    creneau: formatTime(hour),
    matiere: '',
    salle: '',
    professeur: null
  };
  assignedProfName.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const onMatiereChange = () => {
    const link = classeMatieres.value.find(cm => cm.matiere._id === form.value.matiere);
    if(link && link.professeur) {
        assignedProfName.value = `${link.professeur.prenom} ${link.professeur.nom}`;
        form.value.professeur = link.professeur._id;
    } else {
        assignedProfName.value = '';
        form.value.professeur = null;
    }
}

const saveSchedule = async () => {
  isSaving.value = true;
  errorMsg.value = '';
  
  try {
    const payload = {
        classe: selectedClasse.value,
        matiere: form.value.matiere,
        jour: form.value.jour,
        creneau: form.value.creneau,
        salle: form.value.salle || 'TBD'
    };
    if(form.value.professeur) payload.professeur = form.value.professeur;

    await api.createSchedule(payload);
    success('Cours programmé avec succès');
    await fetchSchedule(); 
    closeModal();
  } catch(err) {
    console.error(err);
    errorMsg.value = err.response?.data?.error || 'Erreur lors de la création';
  } finally {
    isSaving.value = false;
  }
};

const deleteSchedule = (id) => {
    itemToDelete.value = id;
    confirmTitle.value = 'Supprimer ce cours ?';
    confirmMessage.value = 'Voulez-vous vraiment retirer ce cours de l\'emploi du temps ?';
    showConfirmModal.value = true;
}

const onConfirmDelete = async () => {
    try {
        await api.deleteSchedule(itemToDelete.value);
        success('Cours supprimé');
        schedules.value = schedules.value.filter(s => s._id !== itemToDelete.value);
        closeConfirmModal();
    } catch(err) {
        error('Erreur suppression');
    }
}

const closeConfirmModal = () => {
    showConfirmModal.value = false;
    itemToDelete.value = null;
}
</script>
