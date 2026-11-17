# QatraTherm — Jumeau numérique conceptuel

**Candidature SEM’INNOV 2026 · CRTSE / Incubateur MATENG**

> **Statut :** concept en cours d’étude accompagné d’un prototype interactif. Aucun pilote intégré n’a été construit ou validé sur site. L’application distingue les hypothèses modifiables des résultats simulés ; aucune valeur par défaut ne constitue une mesure de Tendla.

## 1. Architecture de référence

Le dossier français Notion est la source de vérité pour le concept QatraTherm :

1. Captage et prétraitement de l’eau souterraine.
2. Circulation de l’eau prétraitée dans des canaux thermiques à l’arrière de modules photovoltaïques compatibles (PV/T), pour refroidissement et récupération de chaleur.
3. Réservoir tampon pour absorber les variations de débit.
4. Pompe de régulation pour alimenter l’osmose inverse (RO) à débit contrôlé, avec surveillance et correction éventuelle de la température.
5. Séparation du perméat et du concentrat.
6. Répartition du perméat entre une voie eau potable (traitement final, contrôle et stockage) et une voie solaire thermique (collecteur à concentration, vaporisation, turbine-générateur).
7. Acheminement du concentrat vers des bassins d’évaporation solaire pour étudier la cristallisation éventuelle.
8. Supervision intelligente des flux, avec protections et interverrouillages indépendants de l’IA.

**Cas d’étude proposé :** pilote de 1 MWp à Tendla, wilaya d’El Meghaïer. Cette base de dimensionnement n’implique aucune autorisation d’accès ni validation de ressource.

**Dossier de référence :** [QatraTherm — Dossier de projet | SEM’INNOV 2026](https://app.notion.com/p/41af1da33a6d81d698daeb5bee1f6231?pvs=204)

## 2. Application actuelle

Le front-end actif est construit avec React, TypeScript et Vite. L’interface a été réorientée vers l’architecture de référence :

- Vue d’ensemble avec synoptique des flux d’eau et sorties du procédé.
- Répartition du perméat entre eau potable et branche solaire thermique.
- Vue détaillée des étapes de procédé, incluant la gestion du concentrat.
- Paramètres modifiables pour les conditions solaires, PV/T, RO, collecteur solaire, turbine et bassins.
- Visualisation de deux boucles de régulation proposées : débit PV/T et alimentation RO / réservoir tampon.
- Export CSV des paramètres et résultats du scénario.
- Vue de validation qui distingue hypothèses, résultats simulés et données à obtenir.

Le modèle numérique embarqué est une **estimation simplifiée de présélection**. Il ne constitue ni un modèle fournisseur, ni un cycle thermodynamique complet, ni un système de commande industrielle. Le bilan turbine est brut et ne déduit pas les consommations auxiliaires. La cristallisation et la qualité potable ne sont pas validées par l’application.

Des anciens fichiers de prototype restent présents dans l’historique du dépôt et certains répertoires sources ; ils ne sont plus importés par le point d’entrée actuel `src/App.tsx`. Ne pas les utiliser comme description de l’architecture courante.

## 3. Statut des résultats

- Les valeurs initiales sont des hypothèses de démonstration modifiables, pas des données mesurées à Tendla.
- Les résultats sont produits par les équations simplifiées de l’application et dépendent des paramètres choisis.
- La conformité de l’eau potable nécessite le traitement final et des analyses de laboratoire.
- Le dimensionnement réel nécessite au minimum les fiches des modules PV/T et membranes, une analyse complète de l’eau, un essai de pompage, des données météorologiques locales, des courbes fabricant du collecteur et de la turbine, et des devis fournisseurs.
- Les protections, arrêts d’urgence et interverrouillages doivent être conçus séparément ; l’interface ne pilote aucune installation réelle.

## 4. Lancer localement

Prérequis : Node.js et npm.

```bash
npm install
npm run dev
```

Pour construire la version de production :

```bash
npm run build
npm run preview
```

## 5. Ressources

- [Dossier technique français (Notion)](https://app.notion.com/p/41af1da33a6d81d698daeb5bee1f6231?pvs=204)
- Business plan PDF et classeur Excel de calcul : fichiers séparés préparés pour le dossier de candidature.
- Ce dépôt : code source du prototype de jumeau numérique.

---

**Règle de présentation :** distinguer systématiquement données mesurées, hypothèses, résultats simulés et éléments à valider. Aucune performance n’est garantie par le prototype.
