<template>
  <div class="flex flex-col gap-6 h-full">
    <!-- Page Heading & Selectors -->
    <div class="flex flex-col gap-4">
      <div class="flex items-end justify-between">
        <div class="flex flex-col gap-1">
          <h2 class="text-2xl font-black tracking-tight text-[#0e141b] dark:text-white">Cours et Emplois du Temps</h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-sm">Gérez les créneaux horaires et les affectations par classe.</p>
        </div>
        <div class="flex gap-2">
          <button @click="exportToPDF" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span class="material-symbols-outlined text-sm">picture_as_pdf</span>
            Exporter PDF
          </button>
        </div>
      </div>
      
      <!-- Filter Bar -->
      <div class="flex items-center justify-between border-b border-[#d0dbe7] dark:border-slate-700">
        <div class="flex gap-8">
          <button 
            @click="switchTab('classe')"
            :class="[
              'pb-3 text-sm font-medium transition-colors',
              activeTab === 'classe' 
                ? 'border-b-2 border-primary text-primary font-bold' 
                : 'text-[#4e7397] hover:text-primary'
            ]"
          >
            Vue par Classe
          </button>
          
          <button 
            @click="switchTab('conflits')"
            :class="[
              'pb-3 text-sm font-medium flex items-center gap-2 transition-colors',
              activeTab === 'conflits' 
                ? 'border-b-2 border-primary text-primary font-bold' 
                : 'text-[#4e7397] hover:text-primary'
            ]"
          >
            Conflits
            <span class="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{{ conflicts.length }}</span>
          </button>
        </div>
        <div class="pb-2 flex items-center gap-4">
          <label v-if="activeTab === 'classe'" class="flex items-center gap-2">
            <span class="text-xs font-semibold text-[#4e7397] dark:text-slate-400">Classe:</span>
            <select 
              v-model="selectedClass"
              @change="onClassChange"
              class="text-sm font-bold bg-white dark:bg-slate-800 border-[#d0dbe7] dark:border-slate-700 rounded-lg px-3 py-1 focus:ring-primary focus:border-primary"
            >
              <option disabled value="">Choisir une classe...</option>
              <option v-for="cls in classes" :key="cls._id" :value="cls._id">
                {{ cls.niveau }} {{ cls.section }}
              </option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- Calendar Work Area -->
    <div class="flex gap-6 h-full min-h-[600px]">
      <!-- Left: Draggable Subjects Palette -->
      <div class="w-64 flex-shrink-0 flex flex-col gap-4">
        <div class="p-4 bg-white dark:bg-[#1a252f] rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm flex flex-col gap-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#4e7397] dark:text-slate-400">Matières à placer</h3>
          <div class="flex flex-col gap-2">
            <div 
              v-for="matiere in matieresAPlacer" 
              :key="matiere.id"
              :class="[
                'p-3 rounded-r-lg cursor-grab hover:shadow-md transition-shadow border-l-4',
                getMatiereColorClass(matiere.couleur)
              ]"
              @dragstart="onDragStart($event, matiere)"
              draggable="true"
            >
              <p :class="['text-xs font-bold', getMatiereTextColor(matiere.couleur)]">{{ matiere.nom }}</p>
              <p :class="['text-[10px]', getMatiereSubTextColor(matiere.couleur)]">{{ matiere.professeur }} • {{ matiere.salle }}</p>
            </div>
            <div class="mt-2 border-t border-dashed border-slate-200 dark:border-slate-700 pt-3">
              <button 
                @click="showAddMatiereModal = true"
                class="w-full py-2 text-xs font-medium text-primary hover:bg-primary/5 rounded border border-primary/20 border-dashed transition-colors"
              >
                + Ajouter une matière
              </button>
            </div>
          </div>
        </div>
        <div v-if="conflicts.length > 0" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 overflow-y-auto max-h-[300px]">
          <div class="flex items-center gap-2 mb-2">
            <span class="material-symbols-outlined text-red-500 text-sm">warning</span>
            <h3 class="text-[10px] font-bold uppercase text-red-700 dark:text-red-400">Conflits Détectés</h3>
          </div>
          <div v-for="(conflict, index) in conflicts" :key="index" class="p-2 mb-2 rounded bg-white dark:bg-slate-800 border-l-2 border-red-500 shadow-sm">
            <p class="text-[10px] font-bold text-red-700 dark:text-red-400">{{ conflict.type }}</p>
            <p class="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5">{{ conflict.message }}</p>
          </div>
        </div>
        <div v-else-if="activeTab === 'conflits'" class="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
           <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>
            <h3 class="text-[10px] font-bold uppercase text-green-700 dark:text-green-400">Aucun Conflit</h3>
          </div>
        </div>
      </div>

      <!-- Right: Calendar Grid -->
      <div class="flex-1 bg-white dark:bg-[#1a252f] rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
        <!-- Grid Header (Days) -->
        <div class="calendar-grid border-b border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div class="p-3"></div>
          <div 
            v-for="(day, index) in days" 
            :key="index"
            :class="[
              'p-3 text-center border-l border-[#d0dbe7] dark:border-slate-700',
              day.isToday ? 'bg-primary/5' : ''
            ]"
          >
            <p :class="['text-xs font-bold', day.isToday ? 'text-primary' : '']">{{ day.name }}</p>
            <p :class="['text-[10px]', day.isToday ? 'text-primary/70' : 'text-[#4e7397]']">{{ day.date }}</p>
          </div>
        </div>

        <!-- Grid Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto">
          <div 
            v-for="(timeSlot, slotIndex) in timeSlots" 
            :key="slotIndex"
            :class="[
              'calendar-grid border-b border-[#d0dbe7]/50 dark:border-slate-700/50',
              timeSlot.isBreak ? 'h-10 bg-slate-50 dark:bg-slate-800/50 italic' : 'h-24'
            ]"
          >
            <!-- Time Column -->
            <div class="p-2 text-right">
              <p class="text-[10px] font-bold text-[#4e7397] dark:text-slate-400">{{ timeSlot.time }}</p>
            </div>

            <!-- Break Row -->
            <template v-if="timeSlot.isBreak">
              <div class="col-span-5 flex items-center justify-center border-l border-[#d0dbe7]/50 dark:border-slate-700/50">
                <span v-if="timeSlot.type === 'lunch'" class="material-symbols-outlined text-[#4e7397] dark:text-slate-400 mr-2 text-sm">restaurant</span>
                <p class="text-[10px] text-[#4e7397] dark:text-slate-400 uppercase tracking-widest font-bold">{{ timeSlot.label }}</p>
              </div>
            </template>

            <!-- Regular Time Slots -->
            <template v-else>
              <div 
                v-for="(day, dayIndex) in days" 
                :key="dayIndex"
                :class="[
                  'border-l border-[#d0dbe7]/50 dark:border-slate-700/50 p-1',
                  getCellClass(dayIndex, slotIndex)
                ]"
                @drop="onDrop($event, dayIndex, slotIndex)"
                @dragover.prevent
                @dragenter.prevent
              >
                <template v-if="getCoursAt(dayIndex, slotIndex)">
                  <div 
                    :class="[
                      'h-full w-full text-white rounded p-2 text-[10px] shadow-sm flex flex-col justify-between',
                      getCoursColorClass(getCoursAt(dayIndex, slotIndex).couleur),
                      getCoursAt(dayIndex, slotIndex).hasConflict ? 'ring-2 ring-red-500 ring-offset-1' : ''
                    ]"
                  >
                    <div>
                        <div class="flex justify-between items-start">
                          <p class="font-black leading-tight truncate pr-1">{{ getCoursAt(dayIndex, slotIndex).matiere }}</p>
                          <button 
                            @click.stop="deleteSlot(getCoursAt(dayIndex, slotIndex).id)" 
                            class="transition-opacity z-20 p-0.5 rounded hover:bg-red-500/20 text-white cursor-pointer"
                            title="Supprimer"
                          >
                             <span class="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                        <p class="opacity-90 font-medium mt-0.5 text-[9px] truncate">{{ getCoursAt(dayIndex, slotIndex).professeur }}</p>
                    </div>
                    <div class="flex justify-between items-end">
                       <p class="bg-white/20 px-1 rounded text-[8px] font-bold">{{ getCoursAt(dayIndex, slotIndex).salle }}</p>
                       <p v-if="activeTab === 'global'" class="font-black text-[8px] uppercase">{{ getCoursAt(dayIndex, slotIndex).classeRef }}</p>
                    </div>
                  </div>
                </template>
                <template v-else-if="timeSlot.time === '14:00' && dayIndex === 0">
                  <div class="h-full w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded flex items-center justify-center">
                    <p class="text-[8px] text-slate-400">Glisser ici</p>
                  </div>
                </template>
                <template v-else>
                  <div 
                    class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-slate-100/50 dark:bg-slate-800/50 cursor-pointer transition-opacity"
                    @click="openAddCoursModal(dayIndex, slotIndex)"
                  >
                    <span class="material-symbols-outlined text-primary text-sm">add_circle</span>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Stats Bar / Legend -->
    <footer class="h-10 bg-white dark:bg-[#1a252f] border-t border-[#d0dbe7] dark:border-slate-700 px-6 flex items-center justify-between text-[10px] font-medium text-[#4e7397] dark:text-slate-400">
      <div class="flex gap-6">
        <span class="flex items-center gap-2"><span class="size-2 rounded-full bg-blue-500"></span> Sciences</span>
        <span class="flex items-center gap-2"><span class="size-2 rounded-full bg-purple-500"></span> Lettres</span>
        <span class="flex items-center gap-2"><span class="size-2 rounded-full bg-orange-500"></span> Sciences Humaines</span>
        <span class="flex items-center gap-2"><span class="size-2 rounded-full bg-slate-500"></span> Langues</span>
      </div>
      <div class="flex gap-4">
        <span>Total Heures: {{ totalHeures }}h / {{ maxHeures }}h</span>
        <span :class="['font-bold', totalHeures >= maxHeures ? 'text-emerald-600' : 'text-orange-600']">
          Statut: {{ totalHeures >= maxHeures ? 'Complet' : 'En cours' }}
        </span>
      </div>
    </footer>

     <!-- Modal pour ajouter une matière -->
    <div v-if="showAddMatiereModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="showAddMatiereModal = false">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">Ajouter une matière</h3>
          <button @click="showAddMatiereModal = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Nom de la matière</label>
            <input v-model="newMatiere.nom" class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" type="text" placeholder="Ex: Mathématiques" required/>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Coefficient</label>
            <input v-model.number="newMatiere.coefficient" class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" type="number" min="1" required/>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Couleur</label>
            <select v-model="newMatiere.couleur" class="form-select rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-10 px-3">
              <option value="blue">Bleu (Sciences)</option>
              <option value="purple">Violet (Lettres)</option>
              <option value="emerald">Vert (Sciences)</option>
              <option value="orange">Orange (Sciences Humaines)</option>
              <option value="slate">Gris (Langues)</option>
            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="showAddMatiereModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              Annuler
            </button>
            <button @click="addMatiere" class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Ajouter
            </button>
          </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

// State
const activeTab = ref('classe')
const selectedClass = ref('')
const selectedProf = ref('')
const classes = ref([])
const professors = ref([])
const showAddMatiereModal = ref(false)
const draggedMatiere = ref(null)

// Confirmation Modal State
const showConfirmModal = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const itemToDelete = ref(null)

// Nouvelle matière pour le modal
const newMatiere = reactive({
  nom: '',
  coefficient: 1,
  couleur: 'blue'
})

// Matières à placer
const matieresAPlacer = ref([])
const emploiDuTemps = reactive({})
const conflicts = ref([])

const fetchData = async () => {
  try {
    const classesRes = await api.getClasses()
    classes.value = Array.isArray(classesRes.data.data) ? classesRes.data.data : []
    
    // Fetch professors
    const profsRes = await api.getUsers({ role: 'PROFESSEUR' })
    professors.value = Array.isArray(profsRes.data.data) ? profsRes.data.data : []

    if (classes.value.length > 0) {
      selectedClass.value = classes.value[0]._id
      await onClassChange()
    }
  } catch (err) {
    console.error('Erreur chargement données initiales:', err)
  }
}

const onClassChange = async () => {
  if (!selectedClass.value) return
  
  // Reset local schedule
  for (const key in emploiDuTemps) delete emploiDuTemps[key]
  
  try {
    // 1. Fetch subjects assigned to this class
    const subjectsRes = await api.getClasseMatieres(selectedClass.value)
    const assignedSubjects = Array.isArray(subjectsRes.data.data) ? subjectsRes.data.data : []
    
    matieresAPlacer.value = assignedSubjects.map(sm => ({
      id: sm.matiere?._id || sm.matiere,
      classeMatiereId: sm._id,
      nom: sm.matiere?.nom || 'Matière',
      professeur: sm.professeur ? `${sm.professeur.prenom} ${sm.professeur.nom}` : 'Non assigné',
      professeurId: sm.professeur?._id || sm.professeur,
      salle: 'TBD',
      couleur: getCouleurByMatiere(sm.matiere?.nom)
    }))

    // 2. Fetch existing schedule slots for this class
    const scheduleRes = await api.getSchedules({ classe: selectedClass.value })
    const slots = Array.isArray(scheduleRes.data.data) ? scheduleRes.data.data : []
    
    slots.forEach(slot => {
      const dayIndex = days.findIndex(d => d.name === slot.jour)
      const slotIndex = timeSlots.findIndex(t => t.time === slot.creneau)
      
      if (dayIndex !== -1 && slotIndex !== -1) {
        emploiDuTemps[`${dayIndex}-${slotIndex}`] = {
            id: slot._id,
            matiere: slot.matiere?.nom || 'Matière',
            professeur: slot.professeur ? `${slot.professeur.prenom} ${slot.professeur.nom}` : 'N/A',
            salle: slot.salle,
            couleur: getCouleurByMatiere(slot.matiere?.nom),
            hasConflict: false
        }
      }
    })

    // 3. Fetch all conflicts (for the conflicts tab)
    // For now, let's keep it simple or implement a backend endpoint for this
    await fetchConflicts()

  } catch (err) {
    console.error('Erreur chargement détails classe:', err)
  }
}

const fetchConflicts = async () => {
  // Mock conflict fetching or logic for now
  // In a real app, the backend might return these
  conflicts.value = []
}

const getCouleurByMatiere = (nom) => {
    if (!nom) return 'blue'
    const lower = nom.toLowerCase()
    if (lower.includes('math') || lower.includes('phys')) return 'blue'
    if (lower.includes('fran') || lower.includes('phil')) return 'purple'
    if (lower.includes('svt') || lower.includes('chim')) return 'emerald'
    if (lower.includes('hist') || lower.includes('géo')) return 'orange'
    if (lower.includes('angl') || lower.includes('esp')) return 'slate'
    return 'slate'
}

onMounted(() => {
  fetchData()
})

// Jours de la semaine
const days = reactive([
  { name: 'Lundi', date: 'Lun', isToday: new Date().getDay() === 1 },
  { name: 'Mardi', date: 'Mar', isToday: new Date().getDay() === 2 },
  { name: 'Mercredi', date: 'Mer', isToday: new Date().getDay() === 3 },
  { name: 'Jeudi', date: 'Jeu', isToday: new Date().getDay() === 4 },
  { name: 'Vendredi', date: 'Ven', isToday: new Date().getDay() === 5 },
  { name: 'Samedi', date: 'Sam', isToday: new Date().getDay() === 6 }
])

// Créneaux horaires 07h-18h
const timeSlots = reactive(
    Array.from({ length: 12 }, (_, i) => ({
        time: `${(7 + i).toString().padStart(2, '0')}:00`,
        isBreak: false
    }))
)

const totalHeures = computed(() => {
  return Object.keys(emploiDuTemps).length
})

const maxHeures = 32

// Fonctions de couleur
const getMatiereColorClass = (couleur) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-500',
    purple: 'bg-purple-50 dark:bg-purple-900/30 border-purple-500',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500',
    orange: 'bg-orange-50 dark:bg-orange-900/30 border-orange-500',
    slate: 'bg-slate-50 dark:bg-slate-800 border-slate-400'
  }
  return colors[couleur] || colors.blue
}

const getMatiereTextColor = (couleur) => {
  const colors = {
    blue: 'text-blue-700 dark:text-blue-300',
    purple: 'text-purple-700 dark:text-purple-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    orange: 'text-orange-700 dark:text-orange-300',
    slate: 'text-slate-700 dark:text-slate-300'
  }
  return colors[couleur] || colors.blue
}

const getMatiereSubTextColor = (couleur) => {
  const colors = {
    blue: 'text-blue-600/80 dark:text-blue-400',
    purple: 'text-purple-600/80 dark:text-purple-400',
    emerald: 'text-emerald-600/80 dark:text-emerald-400',
    orange: 'text-orange-600/80 dark:text-orange-400',
    slate: 'text-slate-600/80 dark:text-slate-400'
  }
  return colors[couleur] || colors.blue
}

const getCoursColorClass = (couleur) => {
  const colors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    slate: 'bg-slate-500'
  }
  return colors[couleur] || colors.blue
}

const globalEmploiDuTemps = reactive({})

const switchTab = async (tab) => {
  activeTab.value = tab
  if (tab === 'global' || tab === 'conflits') {
    await fetchGlobalData()
  } else if (tab === 'professeur') {
      if(selectedProf.value) await onProfChange()
      else if(professors.value.length > 0) {
          selectedProf.value = professors.value[0]._id
          await onProfChange()
      }
  } else {
    // Classe view
    await onClassChange()
  }
}

const onProfChange = async () => {
    if (!selectedProf.value) return
    for (const key in emploiDuTemps) delete emploiDuTemps[key]
    
    try {
        // 1. Fetch ALL assignments and filter by this prof
        const allAssignmentsRes = await api.getAllGlobalClasseMatieres()
        const allAssignments = Array.isArray(allAssignmentsRes.data.data) ? allAssignmentsRes.data.data : []
        const profAssignments = allAssignments.filter(sm => (sm.professeur?._id || sm.professeur) === selectedProf.value)
        
        // This prof's subjects to place
        matieresAPlacer.value = profAssignments.map(sm => ({
            id: sm.matiere?._id || sm.matiere,
            classeMatiereId: sm._id,
            nom: `${sm.matiere?.nom || 'Matière'} (${sm.classe.niveau} ${sm.classe.section})`,
            professeur: `${sm.professeur?.prenom} ${sm.professeur?.nom}`,
            professeurId: sm.professeur?._id || sm.professeur,
            classeId: sm.classe?._id || sm.classe,
            classeName: `${sm.classe?.niveau} ${sm.classe?.section}`,
            salle: 'TBD',
            couleur: getCouleurByMatiere(sm.matiere?.nom)
        }))

        // 2. Fetch existing schedule for this prof
        const scheduleRes = await api.getSchedules({ professeur: selectedProf.value })
        const slots = Array.isArray(scheduleRes.data.data) ? scheduleRes.data.data : []
        
        slots.forEach(slot => {
            const dayIndex = days.findIndex(d => d.name === slot.jour)
            const slotIndex = timeSlots.findIndex(t => t.time === slot.creneau)
            
            if (dayIndex !== -1 && slotIndex !== -1) {
                emploiDuTemps[`${dayIndex}-${slotIndex}`] = {
                    id: slot._id,
                    matiere: slot.matiere?.nom || 'Matière',
                    professeur: `${slot.classe?.niveau} ${slot.classe?.section}`, // Display Class Name instead of Prof Name in Prof View
                    salle: slot.salle,
                    couleur: getCouleurByMatiere(slot.matiere?.nom),
                    hasConflict: false
                }
            }
        })

    } catch (err) {
        console.error("Error loading prof schedule", err)
    }
}

const fetchGlobalData = async () => {
  // Clear global data
  for (const key in globalEmploiDuTemps) delete globalEmploiDuTemps[key]
  conflicts.value = []
  
  try {
    const res = await api.getSchedules()
    const allSlots = Array.isArray(res.data.data) ? res.data.data : []
    
    // Track occupied slots for conflict detection
    const profOccupancy = {} // profId-day-time -> [classNames]
    const roomOccupancy = {} // roomId-day-time -> [classNames]

    allSlots.forEach(slot => {
      const dayIndex = days.findIndex(d => d.name === slot.jour)
      const slotIndex = timeSlots.findIndex(t => t.time === slot.creneau)
      
      if (dayIndex !== -1 && slotIndex !== -1) {
        const key = `${dayIndex}-${slotIndex}`
        const profName = slot.professeur ? `${slot.professeur.prenom} ${slot.professeur.nom}` : 'N/A'
        const className = `${slot.classe?.niveau || ''} ${slot.classe?.section || ''}`

        // Local data for global view
        if (!globalEmploiDuTemps[key]) {
             globalEmploiDuTemps[key] = {
                id: slot._id,
                matiere: slot.matiere?.nom || 'Matière',
                professeur: profName,
                salle: slot.salle,
                classeRef: className,
                couleur: getCouleurByMatiere(slot.matiere?.nom),
                hasConflict: false
            }
        }

        // Conflict Detection Logic
        const occKey = `${slot.jour}-${slot.creneau}`
        
        // Professor Conflict
        const profId = slot.professeur?._id || slot.professeur
        if (profId) {
            const pKey = `${profId}-${occKey}`
            if (!profOccupancy[pKey]) profOccupancy[pKey] = []
            profOccupancy[pKey].push(className)
            if (profOccupancy[pKey].length > 1) {
                conflicts.value.push({
                    type: 'Conflit Professeur',
                    message: `${profName} est assigné à plusieurs classes (${profOccupancy[pKey].join(', ')}) le ${slot.jour} à ${slot.creneau}`
                })
                globalEmploiDuTemps[key].hasConflict = true
            }
        }

        // Room Conflict
        if (slot.salle && slot.salle !== 'TBD') {
            const rKey = `${slot.salle}-${occKey}`
            if (!roomOccupancy[rKey]) roomOccupancy[rKey] = []
            roomOccupancy[rKey].push(className)
            if (roomOccupancy[rKey].length > 1) {
                conflicts.value.push({
                    type: 'Conflit Salle',
                    message: `La salle ${slot.salle} est occupée par plusieurs classes (${roomOccupancy[rKey].join(', ')}) le ${slot.jour} à ${slot.creneau}`
                })
                globalEmploiDuTemps[key].hasConflict = true
            }
        }
      }
    })
  } catch (error) {
    console.error('Erreur chargement données globales:', error)
  }
}

const deleteSlot = (id) => {
    itemToDelete.value = id;
    confirmTitle.value = 'Supprimer ce créneau ?';
    confirmMessage.value = 'Voulez-vous vraiment retirer ce cours de l\'emploi du temps ?';
    showConfirmModal.value = true;
}

const onConfirmDelete = async () => {
    const idToDelete = itemToDelete.value;
    try {
        await api.deleteSchedule(idToDelete);
        
        // Optimistic UI Update: Remove from local state immediately
        for (const key in emploiDuTemps) {
            if (emploiDuTemps[key].id === idToDelete) {
                delete emploiDuTemps[key];
            }
        }
        for (const key in globalEmploiDuTemps) {
            if (globalEmploiDuTemps[key].id === idToDelete) {
                delete globalEmploiDuTemps[key];
            }
        }

        if (activeTab.value === 'classe') await onClassChange();
        else if (activeTab.value === 'professeur') await onProfChange();
        else await fetchGlobalData();
        
        success('Cours supprimé');
        closeConfirmModal();
    } catch (err) {
        error('Erreur suppression');
    }
}

const closeConfirmModal = () => {
    showConfirmModal.value = false;
    itemToDelete.value = null;
}

const getCoursAt = (dayIndex, slotIndex) => {
  const key = `${dayIndex}-${slotIndex}`
  if (activeTab.value === 'global') return globalEmploiDuTemps[key] || null
  return emploiDuTemps[key] || null
}

const getCellClass = (dayIndex, slotIndex) => {
  return 'relative'
}

const onDragStart = (event, matiere) => {
  draggedMatiere.value = matiere
  event.dataTransfer.effectAllowed = 'move'
}

const onDrop = async (event, dayIndex, slotIndex) => {
  event.preventDefault()
  if (!draggedMatiere.value || !selectedClass.value) return
  
  const jour = days[dayIndex].name
  const creneau = timeSlots[slotIndex].time
  
  try {
    const scheduleData = {
      classe: activeTab.value === 'professeur' ? draggedMatiere.value.classeId : selectedClass.value,
      matiere: draggedMatiere.value.id,
      professeur: draggedMatiere.value.professeurId,
      jour,
      creneau,
      salle: draggedMatiere.value.salle
    }
    
    const response = await api.createSchedule(scheduleData)
    const newSlot = response.data.data
    
    emploiDuTemps[`${dayIndex}-${slotIndex}`] = {
      id: newSlot._id,
      matiere: draggedMatiere.value.nom,
      professeur: draggedMatiere.value.professeur,
      salle: draggedMatiere.value.salle,
      couleur: draggedMatiere.value.couleur,
      hasConflict: false
    }
    
    draggedMatiere.value = null
  } catch (err) {
    console.error('Erreur creation créneau:', err)
    error(err.response?.data?.error || 'Erreur lors de la création du créneau')
  }
}

const openAddCoursModal = (dayIndex, slotIndex) => {
  console.log('Ajouter cours à', dayIndex, slotIndex)
}

const exportToPDF = () => {
    window.print()
}

const addMatiere = async () => {
  if (newMatiere.nom && selectedClass.value) {
    try {
      const response = await api.createMatiere({
        nom: newMatiere.nom,
        code: newMatiere.nom.substring(0, 3).toUpperCase(),
        coefficient: newMatiere.coefficient,
        description: 'Matière créée depuis Emploi du Temps'
      })
      
      const newMatiereId = response.data.data._id
      
      // Associer la matière à la classe actuelle
      await api.addMatiereToClasse(selectedClass.value, {
        matiereId: newMatiereId,
        coefficient: newMatiere.coefficient,
        heuresParSemaine: 2
      })

      await onClassChange()
      
      newMatiere.nom = ''
      newMatiere.coefficient = 1
      newMatiere.couleur = 'blue'
      showAddMatiereModal.value = false
    } catch (err) {
       console.error('Erreur création matière:', err)
       error('Erreur lors de la création de la matière et de son association')
    }
  } else if (!selectedClass.value) {
    error('Veuillez d\'abord sélectionner une classe')
  }
}
</script>

<style>
@media print {
  /* Masquer tout ce qui n'est pas l'enfant de router-view */
  aside, 
  header, 
  nav,
  footer,
  button,
  .w-64, /* Sidebar locale palette */
  .material-symbols-outlined,
  .flex.flex-col.gap-4 { /* Titre et sélecteurs */
    display: none !important;
  }

  /* Forcer le contenu à prendre toute la place */
  .flex.h-screen {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
  }

  main {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }

  /* Target accurately the main container */
  .flex-1.overflow-y-auto.p-8 {
    padding: 0 !important;
    overflow: visible !important;
  }

  .flex.flex-col.gap-6.h-full {
    gap: 0 !important;
  }

  .flex.gap-6.h-full {
    display: block !important;
  }

  .flex-1.bg-white {
    border: 1px solid #ddd !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    width: 100% !important;
  }

  .calendar-grid {
    border-collapse: collapse !important;
  }

  .calendar-grid > div {
    border-color: #eee !important;
  }

  /* Forcer les couleurs lors de l'impression */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(6, minmax(0, 1fr));
}
</style>
