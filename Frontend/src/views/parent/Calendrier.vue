<template>
  <div class="flex-1 flex flex-col overflow-y-auto">
    <!-- Page Header -->
    <header class="p-8 pb-4">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h2 class="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Calendrier Scolaire</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Suivez l'emploi du temps, les examens et les événements de vos enfants.</p>
        </div>
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button @click="viewMode = 'month'" 
                  class="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                  :class="viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'">
            Mois
          </button>
          <button @click="viewMode = 'week'" 
                  class="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                  :class="viewMode === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'">
            Semaine
          </button>
          <button @click="viewMode = 'day'" 
                  class="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                  :class="viewMode === 'day' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'">
            Jour
          </button>
        </div>
      </div>
      <!-- Active Filters / Chips -->
      <div class="flex gap-2 mt-6 overflow-x-auto pb-2">
        <!-- Child Selector -->
        <div v-if="children.length > 0" class="relative">
          <select v-model="selectedChildId" @change="updateSelectedChildren" class="appearance-none bg-primary/10 text-primary border border-primary/20 rounded-lg px-4 py-2 pr-10 font-bold text-sm cursor-pointer">
            <option value="all">Tous les enfants</option>
            <option v-for="child in children" :key="child._id" :value="child._id">
              {{ child.prenom }} {{ child.nom }}
            </option>
          </select>
          <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-lg">expand_more</span>
        </div>
        <div v-for="child in selectedChildren" :key="child.name" class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-[18px]" :class="`text-${child.color}`">circle</span>
          <span class="text-xs font-medium whitespace-nowrap">{{ child.name }}</span>
        </div>
        <div class="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 ml-auto">
          <span class="material-symbols-outlined text-[18px]">event</span>
          <span class="text-xs font-bold whitespace-nowrap">{{ examCount }} examens cette semaine</span>
        </div>
      </div>
    </header>

    <!-- Calendar Section -->
    <div class="px-8 pb-8 flex-1 flex flex-col min-h-0">
      <!-- No Children State -->
      <div v-if="children.length === 0" class="flex-1 flex items-center justify-center">
        <div class="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-4">family_restroom</span>
          <h3 class="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Aucun enfant associé</h3>
          <p class="text-slate-500 dark:text-slate-400 mb-4">Vous devez d'abord associer un enfant à votre compte pour accéder au calendrier scolaire.</p>
          <button @click="attachChild" class="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Associer un enfant
          </button>
        </div>
      </div>

      <!-- Calendar when children exist -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
        <!-- Calendar Toolbar -->
        <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ currentViewLabel }}</h3>
            <div class="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button @click="navigate(-1)" class="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span class="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button @click="goToToday" class="px-3 py-1.5 text-xs font-bold border-x border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Aujourd'hui</button>
              <button @click="navigate(1)" class="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
                <span class="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="exportCalendar" class="flex items-center gap-2 text-xs font-bold px-3 py-2 text-primary border border-primary/30 rounded-lg hover:bg-primary/5">
              <span class="material-symbols-outlined text-[18px]">download</span>
              <span>Exporter (.ics)</span>
            </button>
          </div>
        </div>

        <!-- Month View -->
        <template v-if="viewMode === 'month'">
          <!-- Calendar Grid Header -->
          <div class="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 font-bold">
            <div v-for="day in weekDays" :key="day" class="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days Grid -->
          <div class="flex-1 grid grid-cols-7 grid-rows-5 min-h-0 overflow-y-auto">
            <!-- Empty days for previous month -->
            <div v-for="day in previousMonthDays" :key="'prev-' + day" class="border-b border-r border-slate-100 dark:border-slate-800 p-2 min-h-[120px] bg-slate-50/50 dark:bg-slate-800/20 text-slate-300 dark:text-slate-600">
              {{ day }}
            </div>

            <!-- Current month days -->
            <div v-for="day in calendarDays" :key="day.date" 
                 class="border-b border-r border-slate-100 dark:border-slate-800 p-2 min-h-[120px] relative group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                 :class="{ 'bg-primary/5': day.isToday, 'bg-amber-50/50 dark:bg-amber-900/10': day.isHoliday, 'bg-green-50 dark:bg-green-900/10': day.isHoliday && day.isToday }">
              <div v-if="day.isToday" class="flex items-center justify-between">
                <span class="text-sm font-bold text-primary bg-primary/10 size-7 flex items-center justify-center rounded-full">{{ day.date }}</span>
                <span class="text-[10px] font-black text-primary/60 uppercase">AUJ.</span>
              </div>
              <span v-else class="text-sm font-bold" :class="getDayTextColor(day)">{{ day.date }}</span>
              
              <div v-if="day.events.length > 0" class="mt-1 space-y-1">
                <div v-for="event in day.events" :key="event.id" 
                     class="px-2 py-1 rounded text-[10px] font-bold truncate border-l-4 flex items-center justify-between"
                     :class="getEventClass(event)">
                  <span class="truncate">{{ event.title }}</span>
                  <span v-if="event.type === 'exam'" class="material-symbols-outlined text-[14px]">warning</span>
                  <span v-else-if="event.type === 'course'" class="material-symbols-outlined text-[14px]">edit_note</span>
                </div>
              </div>
            </div>

            <!-- Next month days -->
            <div v-for="day in nextMonthDays" :key="'next-' + day" class="border-r border-slate-100 dark:border-slate-800 p-2 min-h-[120px] bg-slate-50/50 dark:bg-slate-800/20 text-slate-300 dark:text-slate-600">
              {{ day }}
            </div>
          </div>
        </template>

        <!-- Week View -->
        <template v-else-if="viewMode === 'week'">
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <div v-for="day in weekIntervalDays" :key="day.date" class="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <span class="size-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-black text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-600">
                    {{ day.date.getDate() }}
                  </span>
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white capitalize">{{ formatDate(day.date, { weekday: 'long' }) }}</h4>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ formatDate(day.date, { month: 'long', year: 'numeric' }) }}</p>
                  </div>
                </div>
                <span v-if="day.isToday" class="px-2 py-1 bg-primary text-white text-[9px] font-black rounded uppercase tracking-wider">Aujourd'hui</span>
              </div>

              <div v-if="day.events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="event in day.events" :key="event.id" 
                     class="p-3 rounded-xl border-l-4 flex flex-col gap-1 shadow-sm bg-white dark:bg-slate-800"
                     :class="getEventClass(event)">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black uppercase tracking-wider opacity-60">{{ event.type }}</span>
                    <span class="text-[10px] font-bold">{{ event.time || 'Toute la journée' }}</span>
                  </div>
                  <h5 class="text-sm font-bold truncate">{{ event.title }}</h5>
                  <p v-if="event.classe" class="text-[10px] opacity-80">{{ event.classe }}</p>
                </div>
              </div>
              <div v-else class="py-4 text-center">
                <p class="text-xs text-slate-400 font-medium italic">Aucun événement prévu</p>
              </div>
            </div>
          </div>
        </template>

        <!-- Day View -->
        <template v-else-if="viewMode === 'day'">
          <div class="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <div class="flex items-center gap-6 mb-8">
              <div class="text-center">
                <span class="block text-4xl font-black text-primary">{{ focusDate.getDate() }}</span>
                <span class="block text-xs font-black text-slate-400 uppercase tracking-widest">{{ formatDate(focusDate, { month: 'short' }) }}</span>
              </div>
              <div class="h-12 w-px bg-slate-200 dark:bg-slate-700"></div>
              <div>
                <h2 class="text-2xl font-black text-slate-900 dark:text-white capitalize">{{ formatDate(focusDate, { weekday: 'long', year: 'numeric' }) }}</h2>
                <p class="text-slate-500 dark:text-slate-400">Planning détaillé de la journée</p>
              </div>
            </div>

            <div v-if="dayViewEvents.length > 0" class="space-y-4">
              <div v-for="event in dayViewEvents" :key="event.id" 
                   class="flex gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:scale-[1.01] transition-transform cursor-pointer">
                <div class="text-xs font-black text-slate-400 w-16 pt-1">{{ event.time || 'N/A' }}</div>
                <div class="flex-1 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider" :class="getEventClass(event)">{{ event.type }}</span>
                    <h4 class="font-bold text-slate-900 dark:text-white">{{ event.title }}</h4>
                  </div>
                  <p v-if="event.classe" class="text-xs text-slate-500 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">school</span>
                    {{ event.classe }}
                  </p>
                  <p v-if="event.notes" class="text-xs text-slate-400 italic">{{ event.notes }}</p>
                </div>
                <span class="material-symbols-outlined text-slate-300 self-center">chevron_right</span>
              </div>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-20 opacity-50">
              <span class="material-symbols-outlined text-6xl mb-4">event_busy</span>
              <p class="font-bold text-slate-400 tracking-wide uppercase text-xs">Rien de prévu pour ce jour</p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Quick Insights Bottom Bar -->
    <div class="px-8 pb-8 flex gap-6">
      <div v-for="insight in nextClasses" :key="insight.child" class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4">
        <div class="size-12 rounded-full flex items-center justify-center" :class="`${insight.color}/10 text-${insight.color}`">
          <span class="material-symbols-outlined">{{ insight.icon }}</span>
        </div>
        <div>
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">Prochain Cours: {{ insight.child }}</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ insight.subject }} • {{ insight.room }} • {{ insight.time }}</p>
        </div>
        <button @click="viewDetails(insight)" class="ml-auto text-xs font-bold text-primary hover:underline">Voir détails</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// Données réactives
const viewMode = ref('month')
const focusDate = ref(new Date())
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const isLoading = ref(true)

// Enfants
const children = ref([])
const selectedChildren = ref([])
const selectedChildId = ref('all')

// Update selected children when selection changes
const updateSelectedChildren = () => {
  if (selectedChildId.value === 'all') {
    selectedChildren.value = children.value.map(child => ({
      name: `${child.prenom} ${child.nom}`,
      color: child.prenom === 'Léo' ? 'leo-blue' : (child.prenom === 'Sarah' ? 'sarah-pink' : 'primary'),
      _id: child._id
    }))
  } else {
    const child = children.value.find(c => c._id === selectedChildId.value)
    if (child) {
      selectedChildren.value = [{
        name: `${child.prenom} ${child.nom}`,
        color: child.prenom === 'Léo' ? 'leo-blue' : (child.prenom === 'Sarah' ? 'sarah-pink' : 'primary'),
        _id: child._id
      }]
    }
  }
  // Fetch events for selected children
  fetchCalendarEvents()
}

// Jours de la semaine
const weekDays = ref(['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'])

// Événements du calendrier
const calendarEvents = ref([])
const nextClasses = ref([])

// Fetch children and events
const fetchChildren = async () => {
  try {
    const res = await api.getChildren()
    if (res.data.success) {
      children.value = res.data.data
      // Initialize with all children selected
      updateSelectedChildren()
    }
  } catch (error) {
    console.error('Error fetching children:', error)
  }
}

// Fetch calendar events
const fetchCalendarEvents = async () => {
  try {
    const res = await api.getParentCalendarEvents()
    if (res.data.success) {
      // Map API events to calendar format
      const events = res.data.data.map(event => ({
        id: event._id,
        date: new Date(event.date).getDate(),
        month: new Date(event.date).getMonth(),
        year: new Date(event.date).getFullYear(),
        title: event.title,
        type: event.type === 'meeting' ? 'meeting' : (event.type === 'exam' ? 'exam' : 'activity'),
        color: 'primary', // Default
        classe: event.classe
      }))

      // Filter by selected children if not 'all'
      if (selectedChildId.value !== 'all') {
        const selectedChild = children.value.find(c => c._id === selectedChildId.value)
        const className = `${selectedChild.classe.niveau} ${selectedChild.classe.section}`
        calendarEvents.value = events.filter(e => !e.classe || e.classe === className)
      } else {
        calendarEvents.value = events
      }
    }
  } catch (error) {
    console.error('Error fetching calendar events:', error)
  }
}

// Fetch next classes
const fetchNextClasses = async () => {
  try {
    const res = await api.getParentNextClasses()
    if (res.data.success) {
      nextClasses.value = res.data.data.map(item => ({
        child: item.childName,
        subject: item.nextClass.subject,
        room: item.nextClass.room,
        time: item.nextClass.time,
        day: item.nextClass.day,
        color: item.childName.includes('Léo') ? 'leo-blue' : (item.childName.includes('Sarah') ? 'sarah-pink' : 'primary'),
        icon: 'menu_book'
      }))
    }
  } catch (error) {
    console.error('Error fetching next classes:', error)
  }
}

// Computed properties
const currentViewLabel = computed(() => {
  if (viewMode.value === 'month') {
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    return `${monthNames[currentMonth.value]} ${currentYear.value}`
  } else if (viewMode.value === 'week') {
    const start = new Date(focusDate.value)
    start.setDate(start.getDate() - start.getDay() + 1) // Monday
    const end = new Date(start)
    end.setDate(end.getDate() + 6) // Sunday
    return `${formatDate(start, { day: 'numeric', month: 'short' })} - ${formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' })}`
  } else {
    return formatDate(focusDate.value, { day: 'numeric', month: 'long', year: 'numeric' })
  }
})

const previousMonthDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDayOfPrevMonth = new Date(currentYear.value, currentMonth.value, 0)
  const startDay = firstDay.getDay()
  const days = []
  
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(lastDayOfPrevMonth.getDate() - i)
  }
  
  return days
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const days = []
  const today = new Date()
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const currentDate = new Date(currentYear.value, currentMonth.value, i)
    const dayEvents = calendarEvents.value.filter(event => 
      event.date === i && 
      event.month === currentMonth.value && 
      event.year === currentYear.value
    )
    const isToday = currentDate.toDateString() === today.toDateString()
    const isHoliday = dayEvents.some(event => event.type === 'holiday')
    
    days.push({
      date: i,
      isToday,
      isHoliday,
      events: dayEvents
    })
  }
  
  return days
})

const nextMonthDays = computed(() => {
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const totalCells = 42 // 6 rows * 7 days for consistency
  const filledCells = previousMonthDays.value.length + calendarDays.value.length
  const remaining = totalCells - filledCells
  
  const days = []
  for (let i = 1; i <= remaining; i++) {
    days.push(i)
  }
  
  return days
})

const weekIntervalDays = computed(() => {
  const start = new Date(focusDate.value)
  start.setDate(start.getDate() - start.getDay() + 1) // Start Monday
  
  const days = []
  const today = new Date().toDateString()
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    
    // Filter events for this day
    const dayEvents = calendarEvents.value.filter(e => {
      const eDate = new Date(e.year, e.month, e.date).toDateString()
      return eDate === d.toDateString()
    })

    days.push({
      date: d,
      isToday: d.toDateString() === today,
      events: dayEvents
    })
  }
  return days
})

const dayViewEvents = computed(() => {
  return calendarEvents.value.filter(e => {
    const eDate = new Date(e.year, e.month, e.date).toDateString()
    return eDate === focusDate.value.toDateString()
  })
})

const examCount = computed(() => {
  return calendarEvents.value.filter(event => event.type === 'exam').length
})

// Fonctions utilitaires
const formatDate = (date, options) => {
  return new Intl.DateTimeFormat('fr-FR', options).format(date)
}

const getDayTextColor = (day) => {
  if (day.isHoliday) return 'text-amber-500'
  if (day.isToday && day.isHoliday) return 'text-green-500'
  if (day.isToday) return 'text-primary'
  return 'text-slate-400'
}

const getEventClass = (event) => {
  switch (event.type) {
    case 'exam':
      return 'bg-amber-500 border-amber-700 text-white shadow-sm'
    case 'course':
      return event.color === 'leo-blue' ? 'bg-leo-blue border-leo-blue/50 text-white shadow-sm' : 'bg-sarah-pink/10 border-sarah-pink text-sarah-pink'
    case 'activity':
      return event.color === 'sarah-pink' ? 'bg-sarah-pink/10 border-sarah-pink text-sarah-pink' : 'bg-leo-blue/10 border-leo-blue text-leo-blue'
    case 'meeting':
      return 'bg-primary/10 border-primary text-primary'
    case 'holiday':
      return 'bg-green-500 text-white text-center'
    default:
      return 'bg-slate-100 border-slate-400 text-slate-700'
  }
}

// Fonctions d'action
const navigate = (direction) => {
  const newDate = new Date(focusDate.value)
  if (viewMode.value === 'month') {
    newDate.setMonth(newDate.getMonth() + direction)
    currentMonth.value = newDate.getMonth()
    currentYear.value = newDate.getFullYear()
  } else if (viewMode.value === 'week') {
    newDate.setDate(newDate.getDate() + (direction * 7))
  } else {
    newDate.setDate(newDate.getDate() + direction)
  }
  focusDate.value = newDate
  syncMonthYear(newDate)
}

const syncMonthYear = (date) => {
  currentMonth.value = date.getMonth()
  currentYear.value = date.getFullYear()
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  // Sync focus date to 1st of new month
  focusDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  // Sync focus date to 1st of new month
  focusDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

const goToToday = () => {
  const today = new Date()
  focusDate.value = today
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
}

const exportCalendar = async () => {
  try {
    let response;
    
    // Exporter pour l'enfant sélectionné ou pour tous les enfants
    if (selectedChildId.value && selectedChildId.value !== 'all') {
      response = await api.exportStudentCalendar(selectedChildId.value, {
        includeHolidays: true,
        includeWeekends: false
      });
    } else {
      // Exporter le calendrier général de l'école
      response = await api.exportSchoolCalendar({
        includeHolidays: true,
        includeWeekends: false
      });
    }
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Nom du fichier selon le contexte
    let fileName = 'calendrier-ecole.ics';
    if (selectedChildId.value && selectedChildId.value !== 'all') {
      const child = children.value.find(c => c._id === selectedChildId.value);
      fileName = `calendrier-${child?.prenom}-${child?.nom}.ics`;
    }
    
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    console.log('Calendrier exporté avec succès');
  } catch (error) {
    console.error('Error exporting calendar:', error);
  }
}

const viewDetails = (insight) => {
  console.log('Voir détails du cours:', insight)
}

const attachChild = () => {
  console.log('Associer un enfant')
  router.push('/parent/enfants')
}

// Initialize data
onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    fetchChildren(),
    fetchCalendarEvents(),
    fetchNextClasses()
  ])
  isLoading.value = false
})
</script>
