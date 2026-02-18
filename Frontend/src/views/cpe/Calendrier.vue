<template>
  <div class="flex-1 overflow-y-auto">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header Section -->
      <div class="flex flex-wrap justify-between items-end gap-6 mb-8">
        <div class="flex flex-col gap-2">
          <p class="text-primary font-bold text-sm tracking-wider uppercase">Planning Académique</p>
          <h2 class="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Calendrier des Événements</h2>
          <p class="text-slate-500 text-base">Gérez les conseils, réunions et sorties scolaires de l'établissement.</p>
        </div>
        <button @click="openAddEventModal" class="flex items-center gap-2 h-12 px-6 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <span class="material-symbols-outlined">add_circle</span>
          <span>Ajouter un événement</span>
        </button>
      </div>

      <!-- Calendar Controls & Filters -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button @click="setViewMode('month')" :class="viewMode === 'month' ? 'bg-white dark:bg-slate-700 text-primary rounded-lg shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'" class="px-4 py-2 text-sm font-bold transition-colors">Mois</button>
            <button @click="setViewMode('week')" :class="viewMode === 'week' ? 'bg-white dark:bg-slate-700 text-primary rounded-lg shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'" class="px-4 py-2 text-sm font-bold transition-colors">Semaine</button>
            <button @click="setViewMode('day')" :class="viewMode === 'day' ? 'bg-white dark:bg-slate-700 text-primary rounded-lg shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'" class="px-4 py-2 text-sm font-bold transition-colors">Jour</button>
          </div>
          <div class="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <div class="flex items-center gap-3">
            <button @click="previousMonth" class="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <h3 class="text-lg font-bold min-w-[140px] text-center">{{ currentMonthYear }}</h3>
            <button @click="nextMonth" class="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div class="flex gap-2">
          <label class="flex items-center gap-2 h-9 px-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 cursor-pointer">
            <input v-model="filters.councils" type="checkbox" class="hidden"/>
            <div class="size-2 rounded-full" :class="filters.councils ? 'bg-blue-500' : 'bg-blue-300'"></div>
            <span class="text-xs font-semibold">Conseils</span>
          </label>
          <label class="flex items-center gap-2 h-9 px-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800 cursor-pointer">
            <input v-model="filters.meetings" type="checkbox" class="hidden"/>
            <div class="size-2 rounded-full" :class="filters.meetings ? 'bg-green-500' : 'bg-green-300'"></div>
            <span class="text-xs font-semibold">Réunions</span>
          </label>
          <label class="flex items-center gap-2 h-9 px-3 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800 cursor-pointer">
            <input v-model="filters.outings" type="checkbox" class="hidden"/>
            <div class="size-2 rounded-full" :class="filters.outings ? 'bg-orange-500' : 'bg-orange-300'"></div>
            <span class="text-xs font-semibold">Sorties</span>
          </label>
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <!-- Day Names -->
        <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Lun</div>
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Mar</div>
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Mer</div>
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Jeu</div>
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Ven</div>
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider text-red-400">Sam</div>
          <div class="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider text-red-400">Dim</div>
        </div>

        <!-- Days Grid -->
        <div class="grid" :class="viewMode === 'month' ? 'grid-cols-7 auto-rows-[140px]' : viewMode === 'week' ? 'grid-cols-7 auto-rows-[200px]' : 'grid-cols-1 auto-rows-[300px]'">
          <!-- Placeholder days from prev month (month view only) -->
          <template v-if="viewMode === 'month'">
            <div v-for="day in previousMonthDays" :key="'prev-' + day" class="p-2 border-r border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 text-slate-300 dark:text-slate-700">
              {{ day }}
            </div>
          </template>

          <!-- Current view days -->
          <div v-for="(day, index) in calendarDays" :key="index" 
               class="p-2 border-r border-b border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
               :class="{ 'bg-primary/10': day.isToday }">
            <div v-if="day.isToday" class="flex justify-between items-start">
              <span class="size-7 flex items-center justify-center rounded-full bg-primary text-white text-sm font-bold">{{ day.number }}</span>
              <span class="text-[10px] text-primary font-bold">Aujourd'hui</span>
            </div>
            <span v-else class="text-sm font-medium" :class="{ 'text-red-400': day.isWeekend }">{{ day.number }}</span>
            <div v-if="day.events.length > 0" class="mt-2 space-y-1">
              <div v-for="event in day.events" :key="event.id" 
                   @click.stop="openEditEvent(event)"
                   class="px-2 py-1 rounded text-[10px] font-bold truncate border-l-2 cursor-pointer hover:brightness-95 transition-all"
                   :class="getEventStyle(event.type)">
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Ajouter/Modifier un événement -->
    <div v-if="showAddEventModal || showEditEventModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ showEditEventModal ? 'Modifier' : 'Nouvel' }} Événement</h3>
          <button @click="showAddEventModal = false; showEditEventModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-900 dark:text-white">Titre de l'événement</label>
            <input v-model="eventForm.title" class="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ex: Conseil de classe 2nde B" type="text"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-900 dark:text-white">Type</label>
              <select v-model="eventForm.type" class="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                <option value="council">Conseil de classe</option>
                <option value="meeting">Réunion parents-profs</option>
                <option value="outing">Sortie scolaire</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-900 dark:text-white">Classe concernée</label>
              <input v-model="eventForm.classe" class="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800" placeholder="Ex: Terminale S" type="text"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-900 dark:text-white">Date</label>
              <input v-model="eventForm.date" class="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800" type="date"/>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-slate-900 dark:text-white">Heure</label>
              <input v-model="eventForm.time" class="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800" type="time"/>
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-slate-900 dark:text-white">Notes additionnelles</label>
            <textarea v-model="eventForm.notes" class="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Salles, documents à prévoir..." rows="3"></textarea>
          </div>
        </div>
        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-between gap-3">
          <button v-if="showEditEventModal" @click="deleteEvent" class="h-11 px-6 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">delete</span>
            Supprimer
          </button>
          <div v-else></div>
          <div class="flex gap-3">
            <button @click="showAddEventModal = false; showEditEventModal = false" class="h-11 px-6 rounded-lg text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Annuler</button>
            <button @click="saveEvent" :disabled="isLoading" class="h-11 px-8 rounded-lg text-sm font-bold text-white bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
              <span v-if="isLoading" class="material-symbols-outlined animate-spin text-sm">sync</span>
              {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// Données réactives
const viewMode = ref('month')
const showAddEventModal = ref(false)
const showEditEventModal = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const currentDate = ref(new Date())
const isLoading = ref(false)

// Fonctions utilitaires (définies avant utilisation)
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}

const getWeekStart = (weekNumber, year) => {
  const firstDayOfYear = new Date(year, 0, 1)
  const daysOffset = (weekNumber - 1) * 7 - firstDayOfYear.getDay() + 1
  const weekStart = new Date(year, 0, daysOffset + 1)
  return weekStart
}

// Initialiser currentWeek après définition de getWeekNumber
const currentWeek = ref(getWeekNumber(new Date()))

// Filtres
const filters = ref({
  councils: true,
  meetings: true,
  outings: true,
  other: true
})

// Modèle d'événement
const eventForm = ref({
  id: null,
  title: '',
  type: 'council',
  classe: '',
  date: '',
  time: '',
  notes: ''
})

const events = ref([])

const fetchEvents = async () => {
  try {
    isLoading.value = true
    const response = await api.getEvents()
    events.value = response.data.data.map(e => ({
      ...e,
      id: e._id,
      date: new Date(e.date)
    }))
  } catch (error) {
    console.error('Erreur chargement événements:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchEvents()
})

const typeMapping = {
  'council': 'Conseil de classe',
  'meeting': 'Réunion parents-profs',
  'outing': 'Sortie scolaire',
  'other': 'Autre'
}

const typeMappingReverse = {
  'Conseil de classe': 'council',
  'Réunion parents-profs': 'meeting',
  'Sortie scolaire': 'outing',
  'Autre': 'other'
}

// Computed properties
const currentMonthYear = computed(() => {
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  
  if (viewMode.value === 'month') {
    return `${monthNames[currentMonth.value]} ${currentYear.value}`
  } else if (viewMode.value === 'week') {
    const weekStart = getWeekStart(currentWeek.value, currentYear.value)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${weekStart.getDate()} ${monthNames[weekStart.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]} ${currentYear.value}`
  } else {
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return `${dayNames[currentDate.value.getDay()]} ${currentDate.value.getDate()} ${monthNames[currentDate.value.getMonth()]} ${currentYear.value}`
  }
})

const previousMonthDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDayOfPrevMonth = new Date(currentYear.value, currentMonth.value, 0)
  const startDay = firstDay.getDay()
  const days = []
  
  // Adjusted for Monday start
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1
  
  for (let i = adjustedStartDay - 1; i >= 0; i--) {
    days.push(lastDayOfPrevMonth.getDate() - i)
  }
  
  return days
})

const calendarDays = computed(() => {
  if (viewMode.value === 'month') {
    return getMonthDays()
  } else if (viewMode.value === 'week') {
    return getWeekDays()
  } else {
    return getDayEvents()
  }
})

const getMonthDays = () => {
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const days = []
  const today = new Date()
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(currentYear.value, currentMonth.value, i)
    const dayEvents = events.value.filter(event => 
      event.date.getUTCDate() === i && 
      event.date.getUTCMonth() === currentMonth.value &&
      event.date.getUTCFullYear() === currentYear.value &&
      shouldShowEvent(event.type)
    )
    
    days.push({
      number: i,
      fullDate: currentDate,
      isToday: currentDate.toDateString() === today.toDateString(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      events: dayEvents
    })
  }
  
  return days
}

const getWeekDays = () => {
  const weekStart = getWeekStart(currentWeek.value, currentYear.value)
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart)
    currentDate.setDate(weekStart.getDate() + i)
    
    const dayEvents = events.value.filter(event => 
      event.date.toDateString() === currentDate.toDateString() &&
      shouldShowEvent(event.type)
    )
    
    days.push({
      number: currentDate.getDate(),
      fullDate: currentDate,
      isToday: currentDate.toDateString() === today.toDateString(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      events: dayEvents
    })
  }
  
  return days
}

const getDayEvents = () => {
  const today = new Date()
  const dayEvents = events.value.filter(event => 
    event.date.toDateString() === currentDate.value.toDateString() &&
    shouldShowEvent(event.type)
  )
  
  return [{
    number: currentDate.value.getDate(),
    fullDate: currentDate.value,
    isToday: currentDate.value.toDateString() === today.toDateString(),
    isWeekend: currentDate.value.getDay() === 0 || currentDate.value.getDay() === 6,
    events: dayEvents
  }]
}

const setViewMode = (mode) => {
  viewMode.value = mode
  if (mode === 'month') {
    // Reset to current month
    const now = new Date()
    currentMonth.value = now.getMonth()
    currentYear.value = now.getFullYear()
  } else if (mode === 'week') {
    currentWeek.value = getWeekNumber(new Date())
  } else {
    currentDate.value = new Date()
  }
}

// Fonctions utilitaires
const shouldShowEvent = (eventType) => {
  switch (eventType) {
    case 'council': return filters.value.councils
    case 'meeting': return filters.value.meetings
    case 'outing': return filters.value.outings
    case 'other': return filters.value.other
    default: return true
  }
}

const getEventStyle = (type) => {
  switch (type) {
    case 'council': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-500'
    case 'meeting': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-500'
    case 'outing': return 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-500'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-500'
  }
}

// Fonctions d'action
const previousMonth = () => {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    } else {
      currentMonth.value--
    }
  } else if (viewMode.value === 'week') {
    currentWeek.value--
    if (currentWeek.value < 1) {
      currentWeek.value = 52
      currentYear.value--
    }
  } else {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() - 1)
    currentDate.value = newDate
  }
}

const nextMonth = () => {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    } else {
      currentMonth.value++
    }
  } else if (viewMode.value === 'week') {
    currentWeek.value++
    if (currentWeek.value > 52) {
      currentWeek.value = 1
      currentYear.value++
    }
  } else {
    const newDate = new Date(currentDate.value)
    newDate.setDate(newDate.getDate() + 1)
    currentDate.value = newDate
  }
}

const openAddEventModal = () => {
  eventForm.value = {
    id: null,
    title: '',
    type: 'council',
    classe: '',
    date: '',
    time: '',
    notes: ''
  }
  showAddEventModal.value = true
}

const openEditEvent = (event) => {
  eventForm.value = {
    id: event.id,
    title: event.title,
    type: event.type,
    classe: event.classe,
    date: event.date.toISOString().split('T')[0],
    time: event.time,
    notes: event.notes
  }
  showEditEventModal.value = true
}

const saveEvent = async () => {
  try {
    isLoading.value = true
    if (eventForm.value.id) {
      await api.updateEvent(eventForm.value.id, eventForm.value)
    } else {
      await api.createEvent(eventForm.value)
    }
    await fetchEvents()
    showAddEventModal.value = false
    showEditEventModal.value = false
  } catch (error) {
    console.error('Erreur sauvegarde événement:', error)
    alert('Erreur lors de la sauvegarde de l\'événement')
  } finally {
    isLoading.value = false
  }
}

const deleteEvent = async () => {
  if (!eventForm.value.id) return
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

  try {
    isLoading.value = true
    await api.deleteEvent(eventForm.value.id)
    await fetchEvents()
    showEditEventModal.value = false
  } catch (error) {
    console.error('Erreur suppression événement:', error)
    alert('Erreur lors de la suppression de l\'événement')
  } finally {
    isLoading.value = false
  }
}
</script>
