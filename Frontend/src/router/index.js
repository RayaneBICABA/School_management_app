import { createRouter, createWebHistory } from 'vue-router'

// Pages communes
import Login from '@/views/commun/Login.vue'
import Inscription from '@/views/commun/Inscription.vue'

// Pages Admin
import AdminDashboard from '@/views/admin/Dashboard.vue'
import AdminUsers from '@/views/admin/GestionUtilisateurs.vue'
import AdminAjouterUtilisateur from '@/views/admin/AjouterUtilisateur.vue'
import AdminClasses from '@/views/admin/GestionClasses.vue'
import AdminValidation from '@/views/admin/ValidationBulletins.vue'
import AdminValidationDetails from '@/views/admin/ValidationDetailsClasse.vue'
import AdminDetailNotesMatiere from '@/views/admin/DetailNotesMatiere.vue'
import AdminCours from '@/views/admin/CoursEmploiTemps.vue'
import AdminExamens from '@/views/admin/GestionExamens.vue'
import AdminAffectations from '@/views/admin/Affectations.vue'
import AdminAffecterProfesseur from '@/views/admin/AffecterProfesseur.vue'
import AdminGestionVacances from '@/views/admin/GestionVacances.vue'
import AdminClotureAdministrative from '@/views/admin/ClotureAdministrative.vue'
import AdminNotes from '@/views/admin/GestionNotes.vue'
import AdminConfig from '@/views/admin/ConfigurationAnnee.vue'
import AdminDroits from '@/views/admin/DroitsAcces.vue'
import AdminProfil from '@/views/admin/Profil.vue'
import AdminFicheEleve from '@/views/admin/FicheEleve.vue'

// Pages Élève
import EleveDashboard from '@/views/eleve/Dashboard.vue'
import EleveProgression from '@/views/eleve/Progression.vue'
import EleveNotes from '@/views/eleve/HistoriqueNotes.vue'
import EleveBulletins from '@/views/eleve/Bulletins.vue'
import EleveDiscipline from '@/views/eleve/Discipline.vue'
import EleveCalendrier from '@/views/eleve/Calendrier.vue'
import EleveNotifications from '@/views/eleve/Notifications.vue'
import EleveProfil from '@/views/eleve/Profil.vue'

// Pages Professeur
import ProfesseurDashboard from '@/views/professeur/Dashboard.vue'
import ProfesseurEmploiTemps from '@/views/professeur/EmploiTemps.vue'
import ProfesseurSaisieNotes from '@/views/professeur/SaisieNotes.vue'
import ProfesseurClasses from '@/views/professeur/MesClasses.vue'
import ProfesseurAnnuaire from '@/views/professeur/Annuaire.vue'
import ProfesseurProfil from '@/views/professeur/Profil.vue'

// Pages Parent
import ParentDashboard from '@/views/parent/Dashboard.vue'
import ParentBulletins from '@/views/parent/Bulletins.vue'
import ParentNotes from '@/views/parent/HistoriqueNotes.vue'
import ParentDiscipline from '@/views/parent/Discipline.vue'
import ParentCalendrier from '@/views/parent/Calendrier.vue'
import ParentNotifications from '@/views/parent/Notifications.vue'
import ParentJustifierAbsence from '@/views/parent/JustifierAbsence.vue'
import ParentProfil from '@/views/parent/Profil.vue'
import ParentMessages from '@/views/parent/Messages.vue'
import ParentProfilEnfant from '@/views/parent/ProfilEnfant.vue'

// Pages Censeur
import CenseurDashboard from '@/views/censeur/Dashboard.vue'
import CenseurNotes from '@/views/censeur/GestionNotes.vue'
import CenseurDeblocage from '@/views/censeur/DeblocageNotes.vue'
import CenseurRapports from '@/views/censeur/RapportsAnomalies.vue'
import CenseurSuivi from '@/views/censeur/SuiviAvancement.vue'
import CenseurClasses from '@/views/censeur/GestionClasses.vue'
import CenseurProfesseurs from '@/views/censeur/GestionProfesseurs.vue'
import CenseurDetailsClasse from '@/views/censeur/DetailsClasse.vue'
import CenseurFicheEleve from '@/views/censeur/FicheEleve.vue'
import CenseurClassesListeEleves from '@/views/censeur/classes/ListeElevesClasse.vue'
import CenseurClassesFicheEleve from '@/views/censeur/classes/FicheEleve.vue'
import CenseurProfil from '@/views/censeur/Profil.vue'

// Pages CPE
import CPEDashboard from '@/views/cpe/Dashboard.vue'
import CPEAbsencesJour from '@/views/cpe/AbsencesJour.vue'
import CPEAbsences from '@/views/cpe/AbsencesDashboard.vue'
import CPECalendrier from '@/views/cpe/Calendrier.vue'
import CPENotifications from '@/views/cpe/EnvoiNotifications.vue'
import CPEFicheEleve from '@/views/cpe/FicheEleve.vue'
import CPEVueEnsemble from '@/views/cpe/VueEnsemble.vue'
import CPEProfil from '@/views/cpe/Profil.vue'

// Pages Proviseur
import ProviseurDashboard from '@/views/proviseur/Dashboard.vue'
import ProviseurSuivi from '@/views/proviseur/SuiviActivite.vue'
import ProviseurValidation from '@/views/proviseur/ValidationBulletins.vue'
import ProviseurProfil from '@/views/proviseur/Profil.vue'

// Pages Secrétaire
import SecretaireInscription from '@/views/secretaire/InscriptionEleve.vue'
import SecretaireAffectation from '@/views/secretaire/AffectationClasses.vue'
import SecretaireBulletins from '@/views/secretaire/ImpressionBulletins.vue'

import SecretaireArchives from '@/views/secretaire/Archives.vue'
import SecretaireFicheEleve from '@/views/secretaire/FicheEleve.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/inscription',
    name: 'Inscription',
    component: Inscription
  },
  // Routes Admin
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'utilisateurs/:type?', name: 'AdminUsers', component: AdminUsers, props: true },
      { path: 'eleves/:id', name: 'AdminFicheEleve', component: AdminFicheEleve },
      { path: 'ajouter-utilisateur', name: 'AdminAjouterUtilisateur', component: AdminAjouterUtilisateur },
      { path: 'classes', name: 'AdminClasses', component: AdminClasses },
      { path: 'validation-bulletins', name: 'AdminValidation', component: AdminValidation },
      { path: 'validation-bulletins/:id', name: 'AdminValidationDetails', component: AdminValidationDetails },
      { path: 'classes/:id/eleves', name: 'AdminListeElevesClasse', component: () => import('@/views/admin/classes/ListeElevesClasse.vue') },
      { path: 'classes/:id/eleve/:eleveId', name: 'AdminFicheEleveClasse', component: () => import('@/views/admin/classes/FicheEleve.vue') },
      { path: 'cours', name: 'AdminCours', component: AdminCours },
      { path: 'examens', name: 'AdminExamens', component: AdminExamens },
      { path: 'affectations', name: 'AdminAffectations', component: AdminAffectations },
      { path: 'affecter-professeur', name: 'AdminAffecterProfesseur', component: AdminAffecterProfesseur },
      { path: 'gestion-vacances', name: 'AdminGestionVacances', component: AdminGestionVacances },
      { path: 'cloture-administrative', name: 'AdminClotureAdministrative', component: AdminClotureAdministrative },
      { path: 'notes', name: 'AdminNotes', component: AdminNotes },
      { path: 'notes/detail', name: 'AdminDetailNotesMatiere', component: AdminDetailNotesMatiere },
      { path: 'configuration', name: 'AdminConfig', component: AdminConfig },
      { path: 'droits', name: 'AdminDroits', component: AdminDroits },
      { path: 'notifications', name: 'AdminNotifications', component: () => import('@/views/common/GlobalNotifications.vue') },
      { path: 'master-sheet', name: 'AdminMasterSheet', component: () => import('@/views/common/MasterGradeSheet.vue') },
      { path: 'profil', name: 'AdminProfil', component: AdminProfil }
    ]
  },
  // Routes Élève
  {
    path: '/eleve',
    component: () => import('@/layouts/EleveLayout.vue'),
    children: [
      { path: '', name: 'EleveDashboard', component: EleveDashboard },
      { path: 'progression', name: 'EleveProgression', component: EleveProgression },
      { path: 'notes', name: 'EleveNotes', component: EleveNotes },
      { path: 'bulletins', name: 'EleveBulletins', component: EleveBulletins },
      { path: 'discipline', name: 'EleveDiscipline', component: EleveDiscipline },
      { path: 'calendrier', name: 'EleveCalendrier', component: EleveCalendrier },
      { path: 'notifications', name: 'EleveNotifications', component: () => import('@/views/eleve/Notifications.vue') },
      { path: 'profil', name: 'EleveProfil', component: EleveProfil }
    ]
  },
  // Routes Professeur
  {
    path: '/professeur',
    component: () => import('@/layouts/ProfesseurLayout.vue'),
    children: [
      { path: '', name: 'ProfesseurDashboard', component: ProfesseurDashboard },
      { path: 'emploi-temps', name: 'ProfesseurEmploiTemps', component: ProfesseurEmploiTemps },
      { path: 'saisie-notes', name: 'ProfesseurSaisieNotes', component: ProfesseurSaisieNotes },
      { path: 'classes', name: 'ProfesseurClasses', component: ProfesseurClasses },
      { path: 'liste-eleves', name: 'ProfesseurListeEleves', component: () => import('@/views/professeur/ListeEleves.vue') },
      { path: 'profil-eleve/:eleveId', name: 'ProfesseurFicheEleve', component: () => import('@/views/professeur/FicheEleve.vue') },
      { path: 'classes/:id', name: 'ProfesseurDetailsClasse', component: () => import('@/views/professeur/DetailsClasse.vue') },
      { path: 'nouvelle-evaluation', name: 'ProfesseurNouvelleEvaluation', component: () => import('@/views/professeur/NouvelleEvaluation.vue') },
      { path: 'faire-appel', name: 'ProfesseurFaireAppel', component: () => import('@/views/professeur/FaireAppel.vue') },
      { path: 'annuaire', name: 'ProfesseurAnnuaire', component: ProfesseurAnnuaire },
      { path: 'notifications', name: 'ProfesseurNotifications', component: () => import('@/views/common/GlobalNotifications.vue') },
      { path: 'master-sheet', name: 'ProfesseurMasterSheet', component: () => import('@/views/common/MasterGradeSheet.vue') },
      { path: 'profil', name: 'ProfesseurProfil', component: ProfesseurProfil }
    ]
  },
  // Routes Parent
  {
    path: '/parent',
    component: () => import('@/layouts/ParentLayout.vue'),
    children: [
      { path: '', name: 'ParentDashboard', component: ParentDashboard },
      { path: 'enfants/:id', name: 'ParentProfilEnfant', component: ParentProfilEnfant },
      { path: 'enfants/:id/edit', name: 'ParentEditProfilEnfant', component: () => import('@/views/parent/EditProfilEnfant.vue') },
      { path: 'bulletins', name: 'ParentBulletins', component: ParentBulletins },
      { path: 'notes', name: 'ParentNotes', component: ParentNotes },
      { path: 'discipline', name: 'ParentDiscipline', component: ParentDiscipline },
      { path: 'calendrier', name: 'ParentCalendrier', component: ParentCalendrier },
      { path: 'notifications', name: 'ParentNotifications', component: () => import('@/views/parent/Notifications.vue') },
      { path: 'justifier-absence', name: 'ParentJustifierAbsence', component: ParentJustifierAbsence },
      { path: 'messages', name: 'ParentMessages', component: ParentMessages },
      { path: 'profil', name: 'ParentProfil', component: ParentProfil }
    ]
  },
  // Routes Censeur
  {
    path: '/censeur',
    component: () => import('@/layouts/CenseurLayout.vue'),
    children: [
      { path: '', name: 'CenseurDashboard', component: CenseurDashboard },
      { path: 'notes', name: 'CenseurNotes', component: CenseurNotes },
      { path: 'deblocage', name: 'CenseurDeblocage', component: CenseurDeblocage },
      { path: 'rapports', name: 'CenseurRapports', component: CenseurRapports },
      { path: 'suivi', name: 'CenseurSuivi', component: CenseurSuivi },
      { path: 'nouvelle-session', name: 'CenseurNouvelleSession', component: () => import('@/views/censeur/NouvelleSession.vue') },
      { path: 'validation-evaluations', name: 'CenseurValidationEvaluations', component: () => import('@/views/censeur/ValidationEvaluations.vue') },
      { path: 'classes', name: 'CenseurClasses', component: CenseurClasses },
      { path: 'classes/:id', name: 'CenseurDetailsClasse', component: CenseurDetailsClasse },
      { path: 'classes/:id/eleves', name: 'CenseurListeElevesClasse', component: CenseurClassesListeEleves },
      { path: 'classes/:id/eleve/:eleveId', name: 'CenseurFicheEleveClasse', component: CenseurClassesFicheEleve },
      { path: 'eleve/:eleveId', name: 'CenseurFicheEleve', component: CenseurFicheEleve },
      { path: 'professeurs', name: 'CenseurProfesseurs', component: CenseurProfesseurs },
      { path: 'notifications', name: 'CenseurNotifications', component: () => import('@/views/common/GlobalNotifications.vue') },
      { path: 'master-sheet', name: 'CenseurMasterSheet', component: () => import('@/views/common/MasterGradeSheet.vue') },
      { path: 'profil', name: 'CenseurProfil', component: CenseurProfil }
    ]
  },
  // Routes CPE
  {
    path: '/cpe',
    component: () => import('@/layouts/CPELayout.vue'),
    children: [
      { path: '', name: 'CPEDashboard', component: CPEDashboard },
      { path: 'eleves/:id', name: 'CPEFicheEleve', component: CPEFicheEleve },
      { path: 'absences-jour', name: 'CPEAbsencesJour', component: CPEAbsencesJour },
      { path: 'absences', name: 'CPEAbsences', component: CPEAbsences },
      { path: 'calendrier', name: 'CPECalendrier', component: CPECalendrier },
      { path: 'notifications', name: 'CPENotifications', component: () => import('@/views/common/GlobalNotifications.vue') },
      { path: 'vue-ensemble', name: 'CPEVueEnsemble', component: CPEVueEnsemble },
      { path: 'master-sheet', name: 'CPEMasterSheet', component: () => import('@/views/common/MasterGradeSheet.vue') },
      { path: 'profil', name: 'CPEProfil', component: CPEProfil }
    ]
  },
  // Routes Proviseur
  {
    path: '/proviseur',
    component: () => import('@/layouts/ProviseurLayout.vue'),
    children: [
      { path: '', name: 'ProviseurDashboard', component: ProviseurDashboard },
      { path: 'suivi-activite', name: 'ProviseurSuivi', component: ProviseurSuivi },
      { path: 'validation-bulletins', name: 'ProviseurValidation', component: ProviseurValidation },
      { path: 'validation-bulletins/:id', name: 'ProviseurDetailsClasse', component: () => import('@/views/proviseur/DetailsClasse.vue') },
      { path: 'bulletin/:id', name: 'ProviseurBulletinDetails', component: () => import('@/views/proviseur/BulletinDetails.vue') },
      { path: 'nouvelle-evaluation', name: 'ProviseurNouvelleEvaluation', component: () => import('@/views/proviseur/NouvelleEvaluation.vue') },
      { path: 'affectation-eleves', name: 'ProviseurAffectationEleves', component: () => import('@/views/proviseur/AffectationEleves.vue') },
      { path: 'utilisateurs', name: 'ProviseurUtilisateurs', component: () => import('@/views/proviseur/GestionUtilisateurs.vue') },
      { path: 'classes', name: 'ProviseurClasses', component: () => import('@/views/proviseur/GestionClasses.vue') },
      { path: 'classes/:id/eleves', name: 'ProviseurListeElevesClasse', component: () => import('@/views/proviseur/classes/ListeElevesClasse.vue') },
      { path: 'classes/:id/eleve/:eleveId', name: 'ProviseurFicheEleve', component: () => import('@/views/proviseur/classes/FicheEleve.vue') },
      { path: 'emploi-temps', name: 'ProviseurEmploiTemps', component: () => import('@/views/proviseur/GestionEmploiTemps.vue') },
      { path: 'notifications', name: 'ProviseurNotifications', component: () => import('@/views/common/GlobalNotifications.vue') },
      { path: 'master-sheet', name: 'ProviseurMasterSheet', component: () => import('@/views/common/MasterGradeSheet.vue') },
      { path: 'profil', name: 'ProviseurProfil', component: ProviseurProfil }
    ]
  },
  // Routes Secrétaire
  {
    path: '/secretaire',
    component: () => import('@/layouts/SecretaireLayout.vue'),
    children: [
      { path: '', name: 'SecretaireDashboard', component: () => import('@/views/secretaire/Dashboard.vue') },
      { path: 'inscription', name: 'SecretaireInscription', component: SecretaireInscription },
      { path: 'affectation', name: 'SecretaireAffectation', component: SecretaireAffectation },
      { path: 'bulletins', name: 'SecretaireBulletins', component: SecretaireBulletins },

      { path: 'archives', name: 'SecretaireArchives', component: SecretaireArchives },
      { path: 'notifications', name: 'SecretaireNotifications', component: () => import('@/views/common/GlobalNotifications.vue') },

      // User Management Routes
      { path: 'utilisateurs', name: 'SecretaireUtilisateurs', component: () => import('@/views/secretaire/GestionUtilisateurs.vue'), props: { type: 'administration' } },
      { path: 'eleves', name: 'SecretaireEleves', component: () => import('@/views/secretaire/GestionUtilisateurs.vue'), props: { type: 'eleves' } },
      { path: 'ajouter-utilisateur', name: 'SecretaireAjouterUtilisateur', component: () => import('@/views/secretaire/AjouterUtilisateur.vue') },
      { path: 'eleves/:id', name: 'SecretaireFicheEleve', component: SecretaireFicheEleve },
      { path: 'master-sheet', name: 'SecretaireMasterSheet', component: () => import('@/views/common/MasterGradeSheet.vue') },
      { path: 'profil', name: 'SecretaireProfil', component: () => import('@/views/secretaire/Profil.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
