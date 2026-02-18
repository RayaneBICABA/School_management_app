<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">folder_open</span>
        Documents Administratifs
      </h3>
      <button v-if="canEdit" @click="uploadDocument" class="text-sm font-bold text-primary hover:underline">
        + Ajouter un document
      </button>
    </div>
    <div class="p-6 space-y-8">
      <!-- Document Categories -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium">Documents Scolaires</span>
            <span class="material-symbols-outlined text-blue-500">school</span>
          </div>
          <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ documents.school.length }}</div>
          <div class="text-xs text-blue-600 dark:text-blue-400 mt-1">Certificats, bulletins</div>
        </div>
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-green-600 dark:text-green-400 text-sm font-medium">Documents Médicaux</span>
            <span class="material-symbols-outlined text-green-500">medical_services</span>
          </div>
          <div class="text-2xl font-bold text-green-700 dark:text-green-300">{{ documents.medical.length }}</div>
          <div class="text-xs text-green-600 dark:text-green-400 mt-1">Certificats, ordonnances</div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-600 dark:text-purple-400 text-sm font-medium">Documents Administratifs</span>
            <span class="material-symbols-outlined text-purple-500">description</span>
          </div>
          <div class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ documents.administrative.length }}</div>
          <div class="text-xs text-purple-600 dark:text-purple-400 mt-1">Autorisations, formulaires</div>
        </div>
      </div>

      <!-- Recent Documents -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Documents Récents</h4>
          <div class="flex gap-2">
            <select v-model="selectedCategory" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <option value="all">Toutes catégories</option>
              <option value="school">Scolaires</option>
              <option value="medical">Médicaux</option>
              <option value="administrative">Administratifs</option>
            </select>
            <select v-model="sortBy" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <option value="date">Date</option>
              <option value="name">Nom</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="filteredDocuments.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
          Aucun document trouvé pour cette catégorie
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="document in filteredDocuments" :key="document.id" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow cursor-pointer group" @click="viewDocument(document)">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-2xl" :class="getDocumentIconColor(document.type)">
                  {{ getDocumentIcon(document.type) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold truncate text-slate-900 dark:text-white">{{ document.name }}</p>
                  <p class="text-xs text-slate-500">{{ formatDate(document.date) }}</p>
                </div>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click.stop="downloadDocument(document)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" title="Télécharger">
                  <span class="material-symbols-outlined text-sm text-slate-600">download</span>
                </button>
                <button v-if="canEdit" @click.stop="deleteDocument(document)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded" title="Supprimer">
                  <span class="material-symbols-outlined text-sm text-red-600">delete</span>
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">Taille</span>
                <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ formatFileSize(document.size) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-slate-500">Catégorie</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="getCategoryClass(document.category)">
                  {{ getCategoryLabel(document.category) }}
                </span>
              </div>
              <div v-if="document.expiryDate" class="flex justify-between items-center">
                <span class="text-xs text-slate-500">Expiration</span>
                <span class="text-xs font-medium" :class="getExpiryClass(document.expiryDate)">
                  {{ formatDate(document.expiryDate) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Required Documents -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Documents Obligatoires</h4>
        <div class="space-y-3">
          <div v-for="required in requiredDocuments" :key="required.id" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined" :class="required.uploaded ? 'text-green-500' : 'text-orange-500'">
                {{ required.uploaded ? 'check_circle' : 'warning' }}
              </span>
              <div>
                <p class="text-sm font-medium text-slate-900 dark:text-white">{{ required.name }}</p>
                <p class="text-xs text-slate-500">{{ required.description }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="required.uploaded" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Déposé</span>
              <span v-else-if="required.expired" class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Expiré</span>
              <span v-else class="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">En attente</span>
              <button v-if="!required.uploaded && canEdit" @click="uploadSpecificDocument(required)" class="text-xs text-primary hover:underline">
                Déposer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Document Sharing -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">share</span>
            Partage de Documents
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Accès parents</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="sharingSettings.parentAccess" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Accès professeurs</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="sharingSettings.teacherAccess" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Notifications</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="sharingSettings.notifications" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 class="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">history</span>
            Activité Récente
          </h4>
          <div class="space-y-2">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center gap-2 text-xs">
              <span class="material-symbols-outlined text-sm text-blue-600">{{ getActivityIcon(activity.type) }}</span>
              <span class="text-blue-800 dark:text-blue-200">{{ activity.description }}</span>
              <span class="text-blue-600 dark:text-blue-400">{{ formatDate(activity.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

defineProps({
  studentId: {
    type: String,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const isLoading = ref(true)
const selectedCategory = ref('all')
const sortBy = ref('date')

const documents = ref({
  school: [],
  medical: [],
  administrative: []
})

const requiredDocuments = ref([
  {
    id: 1,
    name: 'Certificat de scolarité',
    description: 'Certificat de l\'année en cours',
    uploaded: true,
    expired: false
  },
  {
    id: 2,
    name: 'Fiche de santé',
    description: 'Fiche médicale à jour',
    uploaded: false,
    expired: false
  },
  {
    id: 3,
    name: 'Autorisation parentale',
    description: 'Sorties et activités',
    uploaded: true,
    expired: true
  }
])

const sharingSettings = ref({
  parentAccess: true,
  teacherAccess: false,
  notifications: true
})

const recentActivity = ref([
  {
    id: 1,
    type: 'upload',
    description: 'Bulletin du T1 déposé',
    date: '2024-01-15'
  },
  {
    id: 2,
    type: 'view',
    description: 'Certificat médical consulté',
    date: '2024-01-12'
  },
  {
    id: 3,
    type: 'share',
    description: 'Documents partagés avec les parents',
    date: '2024-01-10'
  }
])

const filteredDocuments = computed(() => {
  let allDocs = [...documents.value.school, ...documents.value.medical, ...documents.value.administrative]
  
  if (selectedCategory.value !== 'all') {
    allDocs = documents.value[selectedCategory.value] || []
  }
  
  // Sort documents
  return allDocs.sort((a, b) => {
    switch (sortBy.value) {
      case 'date':
        return new Date(b.date) - new Date(a.date)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'type':
        return a.type.localeCompare(b.type)
      default:
        return 0
    }
  })
})

const fetchDocuments = async () => {
  try {
    isLoading.value = true
    
    // Mock data for demo - replace with actual API call
    documents.value = {
      school: [
        {
          id: 1,
          name: 'Bulletin Trimestre 1',
          type: 'pdf',
          category: 'school',
          date: '2024-01-15',
          size: 245760,
          expiryDate: null
        },
        {
          id: 2,
          name: 'Certificat de scolarité 2023-2024',
          type: 'pdf',
          category: 'school',
          date: '2023-09-10',
          size: 153600,
          expiryDate: '2024-09-10'
        }
      ],
      medical: [
        {
          id: 3,
          name: 'Certificat médical',
          type: 'pdf',
          category: 'medical',
          date: '2023-09-05',
          size: 98304,
          expiryDate: '2024-09-05'
        }
      ],
      administrative: [
        {
          id: 4,
          name: 'Autorisation de sortie',
          type: 'pdf',
          category: 'administrative',
          date: '2023-09-01',
          size: 65536,
          expiryDate: null
        }
      ]
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des documents:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const formatFileSize = (bytes) => {
  if (!bytes) return '--'
  const sizes = ['o', 'Ko', 'Mo', 'Go']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const getDocumentIcon = (type) => {
  const icons = {
    pdf: 'picture_as_pdf',
    doc: 'description',
    docx: 'description',
    xls: 'table_chart',
    xlsx: 'table_chart',
    png: 'image',
    jpg: 'image',
    jpeg: 'image'
  }
  return icons[type] || 'insert_drive_file'
}

const getDocumentIconColor = (type) => {
  const colors = {
    pdf: 'text-red-500',
    doc: 'text-blue-500',
    docx: 'text-blue-500',
    xls: 'text-green-500',
    xlsx: 'text-green-500',
    png: 'text-purple-500',
    jpg: 'text-purple-500',
    jpeg: 'text-purple-500'
  }
  return colors[type] || 'text-slate-500'
}

const getCategoryClass = (category) => {
  const classes = {
    school: 'bg-blue-100 text-blue-700',
    medical: 'bg-green-100 text-green-700',
    administrative: 'bg-purple-100 text-purple-700'
  }
  return classes[category] || 'bg-slate-100 text-slate-700'
}

const getCategoryLabel = (category) => {
  const labels = {
    school: 'Scolaire',
    medical: 'Médical',
    administrative: 'Administratif'
  }
  return labels[category] || 'Autre'
}

const getExpiryClass = (expiryDate) => {
  if (!expiryDate) return 'text-slate-600'
  const today = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) return 'text-red-600 font-bold'
  if (daysUntilExpiry < 30) return 'text-orange-600 font-bold'
  return 'text-slate-600'
}

const getActivityIcon = (type) => {
  const icons = {
    upload: 'upload_file',
    view: 'visibility',
    share: 'share',
    delete: 'delete'
  }
  return icons[type] || 'description'
}

const viewDocument = (document) => {
  console.log('Voir le document:', document)
  alert(`Ouverture du document: ${document.name}`)
}

const downloadDocument = (document) => {
  console.log('Télécharger le document:', document)
  alert(`Téléchargement de: ${document.name}`)
}

const deleteDocument = (document) => {
  if (confirm(`Supprimer le document "${document.name}" ?`)) {
    console.log('Supprimer le document:', document)
    alert('Document supprimé (mode démo)')
  }
}

const uploadDocument = () => {
  console.log('Uploader un document')
  alert('Upload de document en cours (mode démo)')
}

const uploadSpecificDocument = (required) => {
  console.log('Uploader un document spécifique:', required)
  alert(`Upload de: ${required.name} (mode démo)`)
}

onMounted(() => {
  fetchDocuments()
})
</script>
