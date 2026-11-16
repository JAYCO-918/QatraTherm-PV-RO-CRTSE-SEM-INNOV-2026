# QatraTherm — Jumeau numérique exploratoire

**Projet candidat au challenge SEM'INNOV 2026 · CRTSE / Incubateur MATENG**

> **État du projet.** QatraTherm est actuellement un concept en cours d'étude accompagné d'un prototype logiciel. Aucun pilote intégré n'a été construit ou validé sur site. Les résultats affichés par les simulateurs sont des résultats de modèles dépendant des paramètres saisis ; ils ne constituent pas des mesures expérimentales.

## 1. Référence actuelle du projet

Le dossier français de référence décrit l'architecture actuellement étudiée :

1. Captage et prétraitement de l'eau souterraine.
2. Récupération thermique et refroidissement de panneaux photovoltaïques compatibles (PV/T).
3. Réservoir tampon et alimentation régulée de l'osmose inverse (RO).
4. Séparation du perméat et du concentrat.
5. Traitement final et contrôle qualité de l'eau destinée à l'usage potable.
6. Étude d'une seconde branche du perméat vers un collecteur solaire à concentration, une production de vapeur et une turbine-génératrice.
7. Étude de la gestion du concentrat par bassins d'évaporation solaire et de la nature des sels potentiellement récupérables.
8. Supervision intelligente des flux, avec protections et interverrouillages indépendants.

**Dossier technique de référence :** [QatraTherm — Dossier de projet | SEM'INNOV 2026](https://app.notion.com/p/41af1da33a6d81d698daeb5bee1f6231?pvs=204)

## 2. À propos du code de ce dépôt

Ce dépôt contient une application exploratoire construite avec React, TypeScript et Vite. Le prototype logiciel comprend des écrans de simulation, des paramètres modifiables, des calculs de scénarios et des visualisations autour du couplage PV/T–RO.

**Important :** certaines fonctions et hypothèses présentes dans le code proviennent d'une version exploratoire antérieure (notamment ERD, batterie et MPC). Elles ne doivent pas être considérées comme des éléments validés de l'architecture actuelle décrite dans le dossier français. Le code ne représente pas encore un jumeau numérique validé de l'ensemble du procédé actuel, en particulier de la branche solaire thermique avec turbine et de la filière d'évaporation du concentrat.

## 3. Statut des résultats

- Les valeurs issues des profils prédéfinis sont des **scénarios simulés** ; leurs données d'entrée doivent être documentées et vérifiées.
- Les gains de production PV, économies d'énergie, volumes d'eau, coûts, temps de retour et indicateurs économiques ne sont **pas des performances mesurées**.
- Aucune conformité à une norme de potabilité n'est garantie par le seul résultat de simulation.
- Le dimensionnement réel nécessite au minimum les fiches des panneaux et membranes retenus, une analyse complète de l'eau, un essai de pompage, les données météorologiques du site et les devis fournisseurs.

Ne pas présenter des résultats de scénarios comme des mesures de terrain ou comme des performances garanties.

## 4. Lancer le prototype localement

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Vite affiche ensuite l'adresse locale à ouvrir dans le navigateur. Pour générer la version de production :

```bash
npm run build
npm run preview
```

## 5. Ressources de candidature

- **Dossier technique français :** [ouvrir le dossier Notion](https://app.notion.com/p/41af1da33a6d81d698daeb5bee1f6231?pvs=204)
- **Dossier technique de calcul :** fichier Excel séparé, avec équations, unités, références et statut des données.
- **Business plan :** document PDF séparé pour la candidature.
- **Application :** ce dépôt contient le code source du prototype exploratoire.

## 6. Accessibilité avant évaluation

À la date de préparation du dossier, le dépôt GitHub est configuré en **privé**. Il ne sera pas consultable par le jury via un lien public tant que son propriétaire ne l'aura pas rendu public ou n'aura pas accordé l'accès aux évaluateurs. Le dossier Notion doit également être partagé avec les évaluateurs avant diffusion.

---

**Principe de rigueur :** distinguer systématiquement les données vérifiées, les calculs reproductibles, les hypothèses et les données manquantes. Toute performance annoncée doit être accompagnée de ses entrées, de son équation et de sa source.
