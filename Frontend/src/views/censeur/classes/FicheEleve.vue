<template>
  <StudentProfile 
    :student-id="eleveId"
    view-mode="censeur"
    :can-edit="false"
    :show-back-button="true"
    back-button-text="Retour à la liste des élèves"
  />
</template>

<script setup>
import { useRoute } from 'vue-router'
import StudentProfile from '@/components/common/StudentProfile.vue'

const route = useRoute()
const classeId = route.params.id
const eleveId = route.params.eleveId
</script>
