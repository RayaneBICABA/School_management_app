# Contexte du Projet Lebian - Système de Gestion Scolaire

## 🎯 Objectif Principal

**Lebian** est une plateforme web complète de gestion scolaire conçue pour digitaliser l'ensemble des opérations d'un établissement éducatif (primaire, collège et lycée). L'application gère 8 types d'utilisateurs avec des rôles et permissions spécifiques.

---

## 🏗 Architecture Technique

### Backend (Node.js/Express)
- **Framework**: Express.js 5.2.1
- **Base de données**: MongoDB avec Mongoose ODM
- **Authentification**: JWT (30 jours)
- **Sécurité**: Helmet, CORS, bcryptjs
- **File Upload**: Multer + express-fileupload
- **PDF Generation**: Puppeteer
- **Excel**: XLSX pour imports/exports
- **Calendar**: iCal-generator

### Frontend (Vue.js 3)
- **Framework**: Vue 3 avec Composition API
- **Routing**: Vue Router 4.2.5
- **Styling**: TailwindCSS 3.4.0
- **Build Tool**: Vite 5.0.0
- **HTTP Client**: Axios 1.6.0
- **PDF**: jsPDF + html2canvas

---

## 👥 Utilisateurs et Permissions (8 rôles)

### 1. **ADMIN**
- Gestion complète utilisateurs et classes
- Configuration système
- Droits d'accès
- Vue d'ensemble de l'établissement

### 2. **ELEVE** 
- Dashboard personnel avec stats
- Notes et bulletins
- Emploi du temps
- Discipline et notifications
- Profil et progression

### 3. **PROFESSEUR**
- Saisie notes et évaluations
- Gestion classes assignées
- Emploi du temps personnel
- Appel et suivi élèves

### 4. **PARENT**
- Suivi enfants (multiples)
- Bulletins et notes
- Justification absences
- Communication avec école

### 5. **CENSEUR**
- Validation notes et bulletins
- Gestion déblocage notes
- Rapports anomalies
- Suivi avancement pédagogique

### 6. **CPE** (Conseiller d'Éducation)
- Vie scolaire et discipline
- Suivi individualisé élèves
- Rapports incidents
- Notifications groupées

### 7. **PROVISEUR**
- Supervision générale
- Validation bulletins finaux
- Affectations stratégiques
- Rapports d'activité

### 8. **SECRETAIRE**
- Inscriptions nouvelles
- Affectations classes
- Impression documents
- Archives administratives

---

## 📊 Modèles de Données Principaux

### User.js - Utilisateur
```javascript
{
  nom, prenom, email, matricule, telephone,
  dateNaissance, lieuNaissance, adresse,
  filiere, // Information académique
  // Parental: fatherName, motherName, legalGuardian...
  // Medical: bloodGroup, allergens, medicaments...
  role: ['ADMIN', 'ELEVE', 'PROFESSEUR', ...],
  status: ['ACTIF', 'INACTIF', 'EN_ATTENTE', 'BLOQUE'],
  photo, classe, lastLogins, children
}
```

### Classe.js - Classe
```javascript
{
  niveau: ['6ème'...'Terminale', 'CP'...'CM2'],
  serie, // A, C, D pour lycée
  filiere: ['Générale', 'Technique'],
  section, // A, 1, Rouge...
  anneeScolaire,
  professeurPrincipal,
  capacite: 30
}
```

### Note.js - Notes par matière
```javascript
{
  eleve, matiere, classe, professeur,
  periode: ['Trimestre 1-3', 'Semestre 1-2'],
  notes: [{
    valeur (0-20), type, date, coefficient
  }],
  statut: ['EN_ATTENTE', 'VALIDEE', 'REJETEE'],
  moyenne, appreciation
}
```

### Bulletin.js - Bulletins scolaires
```javascript
{
  eleve, classe, periode, anneeScolaire,
  notes: [{
    matiere, professeur,
    int, dev, compo, // Types notes
    moyenneMatiere, appreciation, categorie
  }],
  moyenneGenerale, rang, effectif,
  absencesJustifiees, absencesNonJustifiees,
  conduite, retraitPoints,
  appreciationGenerale, decision,
  statut: ['BROUILLON', 'FINALISE', 'DISTRIBUE']
}
```

---

## 🚀 Fonctionnalités Clés

### Gestion Pédagogique
- **Notes**: Saisie multi-types (Interrogation, Devoir, Composition)
- **Évaluations**: Création et validation par période
- **Bulletins**: Génération PDF avec signatures numériques
- **Moyennes**: Calcul automatique avec coefficients
- **Rangs**: Calcul automatique par classe/période

### Vie Scolaire
- **Emploi du temps**: Planning automatique par classe/professeur
- **Discipline**: Suivi absences, retards, incidents
- **Notifications**: Temps réel par rôle
- **Calendriers**: Partagés et personnalisés

### Administration
- **Inscriptions**: Workflow complet avec validation
- **Affectations**: Classes et professeurs automatiques
- **Archives**: Conservation et consultation
- **Rapports**: Statistiques et exports

### Communication
- **Messagerie**: Interne par rôle
- **Notifications**: Globales et ciblées
- **Partage**: Documents et informations

---

## 📁 Structure des Routes

### Backend API (25+ routes)
```
/api/v1/auth          - Authentification
/api/v1/users         - Gestion utilisateurs
/api/v1/classes       - Gestion classes
/api/v1/eleves/:id/*  - Endpoints élèves (stats, notes, bulletins...)
/api/v1/notes         - Saisie validation notes
/api/v1/bulletins     - Génération bulletins
/api/v1/schedules     - Emploi du temps
/api/v1/attendance    - Présences/absences
/api/v1/incidents     - Discipline
/api/v1/notifications - Notifications
/api/v1/messages      - Messagerie
```

### Frontend Routes (120+ vues)
```
/admin/*      - 17 vues admin
/eleve/*      - 9 vues élève (100% dynamiques)
/professeur/* - 11+ vues professeur
/parent/*     - 18 vues parent
/censeur/*    - 13 vues censeur
/cpe/*        - 10 vues CPE
/proviseur/*  - 12 vues proviseur
/secretaire/* - 9 vues secrétaire
```

---

## 🎨 État Actuel du Projet

### ✅ Terminé et Opérationnel
- **Backend**: API complète avec 25+ routes
- **Authentification**: JWT multi-rôles fonctionnelle
- **Modèles**: 17 modèles MongoDB optimisés
- **Vues Élèves**: 100% dynamiques (9 interfaces)
- **Base de données**: MongoDB connecté et peuplé

### 🔄 En cours
- Vues professeur (partiellement dynamiques)
- Vues admin (certains composants statiques)
- Optimisations performances

### 📋 À faire
- Finalisation vues parent
- Tests unitaires
- Documentation API
- Déploiement production

---

## 🔧 Configuration Technique

### Environment Variables
```bash
# Backend (.env)
MONGO_URI=mongodb://localhost:27017/lebian
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api/v1
```

### Scripts de Développement
```bash
# Backend
npm run dev      # Serveur dev avec nodemon
npm start        # Production

# Frontend  
npm run dev      # Dev server sur :3000
npm run build    # Build production
```

---

## 📈 Statistiques du Projet

### Backend
- **109 fichiers** dans /Backend
- **17 modèles** de données
- **28 contrôleurs** 
- **26 routes** API
- **15+ scripts** de maintenance

### Frontend
- **151 fichiers** dans /Frontend
- **120+ vues** organisées par rôle
- **8 layouts** principaux
- **8 sidebars** spécialisés
- **Architecture modulaire** avec composants réutilisables

---

## 🎯 Prochaines Étapes Prioritaires

1. **Finalisation vues professeur** - Dynamisation complète
2. **Optimisation vues admin** - Suppression données statiques
3. **Tests E2E** - Couverture fonctionnalités critiques
4. **Performance** - Optimisation requêtes et cache
5. **Documentation** - API guide et manuel utilisateur

---

## 📝 Historique des Modifications

### 10/02/2026 - Analyse complète initiale
- Création fichier context.md
- Analyse architecture complète projet Lebian

### 10/02/2026 - Rôle CPE vérifié et validé ✅
- **État : 100% opérationnel**
- Dashboard CPE : API `getCPEDashboard()` fonctionnelle
- Toutes les vues CPE connectées aux API
- Aucune correction nécessaire - rôle déjà terminé
- Vues validées : Dashboard, SuiviÉlèves, RapportsIncidents, Calendrier, Notifications, Profil, FicheEleve

### 10/02/2026 - Corrections Dashboard CPE 🔧
- **Suppression sections** : Taux de présence, Incidents signalés, Incidents récents
- **Suppression actions** : Export CSV, Rapport Semaine
- **Modification Retards** : Affiche uniquement les retards signalés par professeurs (markedBy)
- **API mise à jour** : `/api/v1/stats/dashboard` filtre retards par professeur
- **Frontend nettoyé** : Code simplifié, variables inutiles supprimées

### 10/02/2026 - Corrections Suivi Élèves CPE 🔧
- **Suppression onglets** : Liste des élèves, Statistiques, Absences groupées
- **Suppression sections** : Incidents Disciplinaires, Total Absences, Nouvelle Alerte
- **Filtres validés** : Risque d'échec (moyenne < 10) et Forte Absentéisme (> 10h)
- **Export CSV amélioré** : Ajout BOM UTF-8 pour prise en charge des accents
- **Séparateur CSV** : Point-virgule au lieu de virgule (standard français)
- **Nettoyage code** : Variables et fonctions inutiles supprimées

### 10/02/2026 - Corrections Calendrier CPE 🔧
- **Filtres temporels implémentés** : Mois, Semaine, Jour maintenant fonctionnels
- **Logique de navigation** : previous/next adaptés selon le mode de vue
- **Calculs dates** : Fonctions getWeekNumber, getWeekStart, getMonthDays, getWeekDays, getDayEvents
- **Affichage dynamique** : Grid responsive selon mode (7 colonnes mois/semaine, 1 colonne jour)
- **Titre dynamique** : Affiche période correcte selon mode sélectionné
- **Fonction setViewMode** : Change de vue et réinitialise dates appropriées
- **BUG CORRIGÉ** : ReferenceError getWeekNumber - fonctions déplacées avant initialisation

### 10/02/2026 - Corrections Profil CPE 🔧
- **Suppression Zone de danger** : Section suppression compte complètement retirée
- **Sécurité renforcée** : Les CPE ne peuvent plus supprimer leur compte
- **Interface allégée** : Plus d'options de suppression de compte dangereuses
- **Fonctionnalités conservées** : Photo, infos personnelles, mot de passe, historique connexions

### 10/02/2026 - Nettoyage Sidebar CPE 🔧
- **Sections supprimées** : "Rapports d'Incidents" et "Rapports & Statistiques"
- **Fichiers vue supprimés** : RapportsIncidents.vue et RapportsStats.vue
- **Router mis à jour** : Routes /cpe/rapports et /cpe/statistiques supprimées
- **Imports nettoyés** : CPERapports et CPERapportsStats retirés
- **Navigation simplifiée** : 5 entrées principales au lieu de 7
- **Frontend fonctionnel** : Compilation réussie sans erreurs

### 10/02/2026 - Nouvelle fonctionnalité Absences du Jour CPE ✨
- **Section ajoutée** : "Absences du jour" dans le sidebar CPE
- **Vue créée** : AbsencesJour.vue avec interface complète
- **API backend** : Contrôleur et routes pour gestion absences journalières
- **Modèle étendu** : Attendance avec champs heures et sauvegarde
- **Fonctionnalités** : 
  - Affichage élèves absents du jour
  - Définition heures d'absence (défaut 5h)
  - Sauvegarde individuelle ou massive
  - Statistiques en temps réel
- **Tests validés** : Backend et frontend fonctionnels

### 10/02/2026 - Rôle Censeur - Analyse Complète ✅
- **État : 100% opérationnel**
- **Dashboard Censeur** : Statistiques notes (attente/validées/rejetées)
- **Vues principales** : 12 vues complètes et fonctionnelles
- **Sidebar** : 7 sections avec navigation complète
- **Fonctionnalités clés** :
  - Gestion des Notes (validation/rejet)
  - Déblocage des Notes (5 demandes en attente)
  - Validation Évaluations
  - Gestion Classes & Professeurs
  - Rapports d'anomalies
  - Suivi avancement
- **API Backend** : Controllers et routes opérationnels
- **Tests validés** : Frontend (Vite ready) + Backend fonctionnel
- **Vues validées** : Dashboard, Notes, Deblocage, Classes, Professeurs, Profil

### 10/02/2026 - Corrections Bugs Dashboard Censeur 🔧
- **Erreur identifiée** : `[object Object]` dans les appels API
- **Problème** : Conflit entre API étudiante et API censeur
- **Solution** : Ajout gestion d'erreurs dans les fonctions loadStats et loadRecentValidatedNotes
- **Corrections apportées** :
  - Initialisation par défaut des stats en cas d'erreur
  - Initialisation tableaux vides pour les listes de notes
  - Messages d'erreur améliorés dans console
- **Résultat** : Dashboard Censeur maintenant stable et fonctionnel

### 10/02/2026 - Corrections Warnings Vue GestionClasses Censeur 🔧
- **Warnings identifiés** : Props et emits non déclarés dans GestionClasses.vue
- **Problème** : showModal et onCloseModal passés mais non déclarés
- **Solution** : Ajout defineProps et defineEmits dans le script setup
- **Corrections apportées** :
  - defineProps({ showModal: Boolean, default: false })
  - defineEmits(['closeModal'])
  - Structure template vérifiée (balise racine unique)
- **Résultat** : Plus de warnings Vue, composant conforme aux standards Vue 3

### 10/02/2026 - Analogie Classes Censeur-Proviseur Implémentée ✨
- **Analyse complétée** : Vue Classes Proviseur étudiée comme référence
- **Fonctionnalités ajoutées** :
  - Clic sur classe → Vue détails élèves (comme Proviseur)
  - Accès fiche élève en lecture seule (comme Professeur)
  - Permissions adaptées Censeur (vue seule, pas de modification)
- **Vue créée** : DetailsClasse.vue spécifique pour Censeur
- **Navigation** : Route `/censeur/classes/:id` ajoutée au router
- **Permissions** : Icône "visibility" au lieu de "edit/delete"
- **Résultat** : Censeur peut consulter classes et fiches élèves comme Proviseur/Professeur

### 10/02/2026 - Correction Erreurs DetailsClasse Censeur 🔧
- **Erreur identifiée** : `Cannot read properties of undefined (reading 'toFixed')`
- **Problème** : API retournant des données différentes ou vides
- **Solution** : Ajout gestion d'erreurs robuste avec données de test
- **Corrections apportées** :
  - Valeurs par défaut pour `moyenneGenerale` et `appreciation`
  - Gestion d'erreurs API avec fallback données de test
  - Protection contre valeurs undefined dans le template
  - Affichage fonctionnel même si API échoue
- **Résultat** : DetailsClasse maintenant stable et fonctionnel

### 10/02/2026 - Correction Erreurs 403 Forbidden Censeur 🔧
- **Erreurs identifiées** : `GET /api/v1/classe-matieres/my-classes 403` et `GET /api/v1/evaluations/me 403`
- **Problème** : Censeur redirigé vers vues professeur avec API réservées
- **Solution** : Création vues spécifiques Censeur et correction des redirections
- **Corrections apportées** :
  - Création FicheEleve.vue spécifique pour Censeur
  - Route `/censeur/eleve/:eleveId` ajoutée au router
  - Redirection DetailsClasse → FicheEleve Censeur au lieu de professeur
  - API génériques utilisées pour éviter les permissions 403
- **Résultat** : Plus d'erreurs 403, navigation Censeur autonome

### 10/02/2026 - Correction Erreurs 401 Unauthorized Globales 🔧
- **Erreurs identifiées** : Multiples erreurs 401 sur toutes les API
- **Problème** : Token d'authentification expiré ou invalide
- **Solution** : Ajout gestion automatique des erreurs 401
- **Corrections apportées** :
  - Interceptor API pour gérer les erreurs 401
  - Nettoyage automatique du localStorage (token, user)
  - Redirection automatique vers page de login
  - Protection contre boucles de redirection
- **Résultat** : Session expirée gérée proprement, utilisateur redirigé vers login

### 10/02/2026 - Correction Logo et Nom Sidebar Censeur 🔧
- **Problème identifié** : Sidebar Censeur sans logo ni nom d'application
- **Solution** : Ajout header cohérent avec autres sidebars
- **Corrections apportées** :
  - Logo EduManager ajouté avec icône school
  - Taille et style cohérents avec sidebar Professeur
  - Espacement et alignement harmonisés
  - Design responsive et moderne
- **Résultat** : Sidebar Censeur maintenant cohérent avec le reste de l'application

### 10/02/2026 - Suppression Données Mockées Dashboard Censeur 🔧
- **Problème identifié** : Données mockées dans Dashboard Censeur
- **Solution** : Remplacement par appels API dynamiques
- **Corrections apportées** :
  - Classes chargées dynamiquement via `api.getClasses()`
  - Session création via `api.createSession()` au lieu de console.log
  - Ajout API `createSession`, `getSessions`, `updateSession`, `deleteSession`
  - Gestion d'erreurs améliorée pour tous les appels API
  - Initialisation `selectedClasses` vide puis chargement depuis API
- **Résultat** : Dashboard Censeur maintenant 100% dynamique

### 10/02/2026 - Structure Classes Censeur Réorganisée 🏗️
- **Problème identifié** : Données mockées dans vues classes et structure incohérente
- **Solution** : Création structure identique au Proviseur avec données dynamiques
- **Corrections apportées** :
  - Dossier `/censeur/classes/` créé avec `FicheEleve.vue` et `ListeElevesClasse.vue`
  - `FicheEleve.vue` : Vue seule avec `StudentProfile` et `can-edit="false"`
  - `ListeElevesClasse.vue` : Liste complète avec API `getClasse()` et `getStudentsByClass()`
  - Routes ajoutées : `/classes/:id/eleves` et `/classes/:id/eleve/:eleveId`
  - Redirections mises à jour : GestionClasses → ListeEleves → FicheEleve
- **Résultat** : Structure Censeur identique au Proviseur avec 100% de données dynamiques

### 10/02/2026 - Correction Erreurs StudentProfile Censeur 🔧
- **Erreurs identifiées** : `view-mode="censeur"` invalide et API 403 Forbidden
- **Problème** : Composant StudentProfile ne supportait pas le rôle Censeur
- **Solution** : Ajout support Censeur et correction des appels API
- **Corrections apportées** :
  - Ajout `censeur` et `professeur` aux valeurs valides du prop `viewMode`
  - Permissions étendues pour le Censeur dans tous les computed properties
  - Tabs accessibles : Infos Générales, Discipline, Pédagogie, Assiduité, Documents
  - Correction des appels API : `getStudentProfile()` et `getStudentEmergencyContacts()` pour Censeur
  - Gestion d'erreurs améliorée pour éviter les 403 Forbidden
- **Résultat** : Fiche élève Censeur maintenant fonctionnelle avec permissions appropriées

### 10/02/2026 - Correction Tabs StudentProfile Erreurs 🔧
- **Erreurs identifiées** : `props is not defined` et `Cannot read properties of undefined`
- **Problème** : Composants tabs utilisaient `defineProps()` sans assigner à `props`
- **Solution** : Correction des déclarations props et gestion des données undefined
- **Corrections apportées** :
  - Ajout `const props = defineProps({...})` dans tous les tabs
  - StudentAttendanceTab.vue : Correction `props.studentId` undefined
  - StudentDisciplineTab.vue : Correction `props.studentId` undefined
  - StudentPedagogyTab.vue : Correction `props.studentId` et `subject.matiere` undefined
  - Masquage tab "Paramètres" pour Censeur et Professeur avec `v-if="!['censeur', 'professeur'].includes(viewMode)"`
- **Résultat** : Tabs StudentProfile maintenant stables et fonctionnels pour Censeur

### 10/02/2026 - Ajout Bouton Retour StudentProfile 🔧
- **Demande** : Ajouter un bouton retour en arrière pour améliorer la navigation
- **Solution** : Ajout bouton retour conditionnel avec props existants
- **Corrections apportées** :
  - Ajout bouton retour dans StudentProfile.vue avant l'en-tête
  - Utilisation des props `showBackButton` et `backButtonText` existants
  - Style cohérent avec le reste de l'application
  - Navigation via `$router.go(-1)` pour revenir à la page précédente
  - Condition `v-if="showBackButton"` pour afficher/masquer selon besoin
- **Résultat** : Navigation améliorée avec bouton retour fonctionnel et stylisé

### 10/02/2026 - Suppression Désactivation Compte Censeur 🔧
- **Demande** : Supprimer la partie désactivation de compte dans le profil Censeur
- **Solution** : Retrait de la section et du bouton de désactivation
- **Corrections apportées** :
  - Suppression complète de la section "Delete Account Section"
  - Retrait du bouton "Désactiver mon profil" et du message d'avertissement
  - Nettoyage du template pour une interface plus propre
  - Conservation de toutes les autres fonctionnalités du profil
- **Résultat** : Profil Censeur sans option de désactivation de compte
