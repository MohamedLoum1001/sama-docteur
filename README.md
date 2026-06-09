# Sama Docteur – Plateforme de Santé Connectée

![CI Status](https://github.com/MohamedLoum1001/sama-docteur/actions/workflows/deploy.yml/badge.svg)

**Sama Docteur** est une plateforme de télémédecine complète permettant la mise en relation sécurisée entre patients et professionnels de santé.
Le projet met en œuvre une architecture **Fullstack moderne**, avec intégration de services cloud, communication temps réel et une stratégie de tests automatisés.

---
## Fonctionnalités
### Gestion des utilisateurs
- Authentification sécurisée (Firebase Auth)
- Gestion des rôles : Patient / Médecin / Administrateur
- Profils utilisateurs avec données médicales structurées
### Téléconsultation
- Visioconférence en temps réel (Agora RTC)
- Appels vidéo HD stables et sécurisés
- Génération automatique d’ordonnances PDF (jsPDF)
### Paiement & services cloud
- Paiement en ligne (Stripe)
- Traitement asynchrone via Azure Functions / Service Bus
- Gestion des documents médicaux côté cloud

---

## Stack technique
### Frontend
- React 19
- React Router 7
- Tailwind CSS + Bootstrap

### Backend
- Node.js / Express (API REST)
- Firebase (Auth + données temps réel)
- Azure (traitements asynchrones & services cloud)
---

## Tests & Qualité (CI/CD)
Une stratégie de test complète est mise en place pour garantir la stabilité du projet.
### Frontend (Jest + React Testing Library)
- Tests unitaires des composants critiques (Login, Sidebar, Dashboard)
- Tests d’intégration (routing, navigation)
- Mocks des services externes (Firebase, Agora, Azure)
### Backend (Jest)
- Tests des endpoints API
- Validation des flux d’authentification et de paiement
- Vérification de la sécurité des entrées (regex & validation)
```bash
# Lancer tous les tests
npm test -- --watchAll=false
```

---
## Installation
### 1. Prérequis
- Node.js ≥ 18
- Fichier `.env` configuré (Firebase, Stripe, Agora, etc.)
### 2. Installation des dépendances
```bash
# Frontend
cd frontend
npm install
# Backend
cd ../api
npm install
```
---
## Lancement du projet
### Frontend
```bash
npm start
```
---

## Docker (Déploiement)
Le projet est conteneurisé pour garantir la cohérence entre les environnements.
```bash
# Build de l’image
docker build -t sama-docteur .
# Lancement du container
docker run -p 3000:80 sama-docteur
```
---
## CI / CD
- Intégration continue via GitHub Actions
- Tests automatisés avant chaque déploiement
- Pipeline de build et validation
---

## Auteur
**Mohamed Loum**
Étudiant Développeur Fullstack
