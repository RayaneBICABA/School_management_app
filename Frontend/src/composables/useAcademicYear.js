import { ref, readonly, onMounted } from 'vue';
import api from '@/services/api';

// Singleton state for global synchronization
const academicYear = ref('Chargement...');

/**
 * Fetch the latest academic year configuration from the API
 */
const refreshYear = async () => {
    try {
        const res = await api.getSetting('academic_year_config');
        if (res.data.success && res.data.data?.value?.year) {
            academicYear.value = res.data.data.value.year;
        } else {
            academicYear.value = 'Non configuré';
        }
    } catch (error) {
        console.error('Error fetching academic year for sidebar:', error);
        academicYear.value = '2025-2026'; // Fallback
    }
};

// Initialize once
refreshYear();

/**
 * Composable to use the academic year in any component
 */
export function useAcademicYear() {
    return {
        academicYear: readonly(academicYear),
        refreshYear
    };
}
