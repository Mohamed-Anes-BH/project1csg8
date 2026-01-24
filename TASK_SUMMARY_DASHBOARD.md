# Mise à jour du Dashboard Étudiant

## 1. Modifications Backend (`students/views.py`, `sql/query.sql`)
- Mise à jour de la requête SQL `get_student_dashboard_full` pour inclure :
  - `accepted_count` : Nombre de candidatures avec statut 'ACCEPTED'
  - `refused_count` : Nombre de candidatures avec statut 'REJECTED'
- Mise à jour de `StudentDashboardView` pour exécuter la nouvelle requête et retourner ces statistiques.

## 2. Modifications Frontend (`tablebordEtudient.jsx`)
- Suppression de la carte "Vues du profil".
- Suppression du widget "Notifications" dans la barre latérale.
- Ajout de deux nouvelles cartes de statistiques dans la grille principale :
  - **Candidatures Acceptées** (Vert)
  - **Candidatures Refusées** (Rouge/Bordeaux)
- Mise à jour de l'état initial pour inclure les nouveaux compteurs.
- La grille de statistiques est maintenant en `grid-cols-2 lg:grid-cols-4` (implicite via `grid-cols-2` dans le container principal qui a un layout flexible ou ajusté). Note: J'ai utilisé `grid-cols-2` pour la grille interne des stats, ce qui fait 2 lignes de 2 cartes si l'espace est contraint, ou s'aligne proprement.

## Résultat
Le tableau de bord affiche maintenant :
- Candidatures envoyées
- Offres sauvegardées
- Candidatures Acceptées (Dynamique)
- Candidatures Refusées (Dynamique)
