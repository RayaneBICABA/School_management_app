<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" @click.self="cancel">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3" :class="headerColorClass">
        <div class="p-2 rounded-full" :class="iconBgClass">
            <span class="material-symbols-outlined text-xl">{{ iconName }}</span>
        </div>
        <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{ title }}</h3>
      </div>

      <!-- Body -->
      <div class="p-6">
        <p class="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-line">{{ message }}</p>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
        <button 
          @click="cancel" 
          class="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="confirm" 
          class="px-4 py-2 rounded-lg text-white font-medium shadow-md transition-all transform active:scale-95"
          :class="confirmButtonClass"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: 'Confirmation'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  type: {
    type: String, // 'danger', 'warning', 'info'
    default: 'danger'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => emit('confirm');
const cancel = () => emit('cancel');

const iconName = computed(() => {
    switch (props.type) {
        case 'danger': return 'warning';
        case 'warning': return 'error_outline';
        default: return 'info';
    }
});

const headerColorClass = computed(() => {
    // Optional: add background color to header if desired, currently kept clean
    return '';
});

const iconBgClass = computed(() => {
    switch (props.type) {
        case 'danger': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
        case 'warning': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
        default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    }
});

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500/50';
    case 'warning': return 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500/50';
    default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500/50';
  }
});
</script>
