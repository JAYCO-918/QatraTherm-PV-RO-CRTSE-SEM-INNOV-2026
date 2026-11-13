import type { Language } from '../engine/types';

export const UI_COPY: Record<
  Language,
  {
    brand: string;
    nav: {
      lab: string;
      physics: string;
      dossier: string;
      guide: string;
    };
    exportDossier: string;
    toolbar: {
      siteLabel: string;
      salinityTag: string;
      uploadCsv: string;
      downloadSampleCsv: string;
      customCsvActive: string;
      resetSite: string;
    };
    sidebar: {
      title: string;
      waterAndSite: string;
      feedSalinity: string;
      recoveryRatio: string;
      dailyDemand: string;
      solarArray: string;
      arrayArea: string;
      pvEfficiency: string;
      tempCoeff: string;
      subsystems: string;
      coolingToggle: string;
      coolingDesc: string;
      erdToggle: string;
      erdDesc: string;
      mpcToggle: string;
      mpcDesc: string;
      sizing: string;
      membraneArea: string;
      batteryCap: string;
      tankCap: string;
    };
    kpis: {
      pvYield: string;
      sec: string;
      waterOutput: string;
      gridAndTemp: string;
      vsUncooled: string;
      whoOk: string;
      whoAlert: string;
      peakCell: string;
    };
    tabs: {
      dispatchChart: string;
      thermalChart: string;
      storageChart: string;
    };
    schematic: {
      title: string;
      hourInspect: string;
      irradiance: string;
      cellTemp: string;
      pvPower: string;
      heatRecovered: string;
      rawIntake: string;
      warmFeed: string;
      hpPump: string;
      erdUnit: string;
      permeate: string;
      brine: string;
      tank: string;
    };
    table: {
      title: string;
      downloadCsv: string;
      hour: string;
      irr: string;
      tCell: string;
      tFeed: string;
      pvKw: string;
      roKw: string;
      waterM3: string;
      demandM3: string;
      gridKw: string;
      socPct: string;
      pressBar: string;
      sec: string;
      tds: string;
    };
  }
> = {
  fr: {
    brand: 'QatraTherm',
    nav: {
      lab: 'Simulateur PV-RO',
      physics: 'Physique & Audit',
      dossier: 'Dossier & ROI',
      guide: 'Guide Jury',
    },
    exportDossier: 'Exporter le dossier',
    toolbar: {
      siteLabel: 'Site algérien',
      salinityTag: 'TDS eau brute',
      uploadCsv: 'Importer CSV météo 24h',
      downloadSampleCsv: 'Modèle CSV',
      customCsvActive: 'Profil CSV personnalisé actif',
      resetSite: 'Réinitialiser le site',
    },
    sidebar: {
      title: 'Paramètres d’ingénierie',
      waterAndSite: 'Ressource hydrique & demande',
      feedSalinity: 'Salinité eau brute (TDS)',
      recoveryRatio: 'Taux de conversion RO',
      dailyDemand: 'Demande journalière cible',
      solarArray: 'Capteur silicium PV-T',
      arrayArea: 'Surface capteur PV-T',
      pvEfficiency: 'Rendement STC silicium',
      tempCoeff: 'Coeff. thermique puissance',
      subsystems: 'Architecture active',
      coolingToggle: 'Refroidissement PV-T eau brute',
      coolingDesc: 'Récupère la chaleur cellule Si pour préchauffer l’eau RO',
      erdToggle: 'Récupérateur d’énergie (ERD)',
      erdDesc: 'Échangeur de pression isobare sur rejet saumure (94%)',
      mpcToggle: 'Optimisation prédictive (MPC)',
      mpcDesc: 'Pilotage variateur VFD sur pic solaire & stockage tampon',
      sizing: 'Membranes & stockage',
      membraneArea: 'Surface membranaire TFC',
      batteryCap: 'Batterie tampon LiFePO4',
      tankCap: 'Réservoir eau potable',
    },
    kpis: {
      pvYield: 'Production PV nette',
      sec: 'Consommation spécifique (SEC)',
      waterOutput: 'Eau potable produite',
      gridAndTemp: 'Import réseau & pic cellule Si',
      vsUncooled: 'vs référence non refroidie',
      whoOk: 'Conforme OMS (<500 mg/L)',
      whoAlert: 'Dépassement OMS (>500 mg/L)',
      peakCell: 'Pic cellule',
    },
    tabs: {
      dispatchChart: 'Puissance & Production Eau (24h)',
      thermalChart: 'Couplage Thermique Silicium / Eau (24h)',
      storageChart: 'Batterie, Réservoir & Pression RO (24h)',
    },
    schematic: {
      title: 'Synoptique couplé PV-T / Osmose Inverse',
      hourInspect: 'Heure inspectée',
      irradiance: 'Irradiance',
      cellTemp: 'Temp. cellule Si',
      pvPower: 'Puissance PV',
      heatRecovered: 'Chaleur captée',
      rawIntake: 'Eau brute',
      warmFeed: 'Eau préchauffée',
      hpPump: 'Pompe HP VFD',
      erdUnit: 'ERD Isobare',
      permeate: 'Perméat potable',
      brine: 'Saumure concentrée',
      tank: 'Réservoir tampon',
    },
    table: {
      title: 'Télémétrie horaire vérifiable (24 heures)',
      downloadCsv: 'Télécharger CSV 24h',
      hour: 'Heure',
      irr: 'G (W/m²)',
      tCell: 'T_cell (°C)',
      tFeed: 'T_eau (°C)',
      pvKw: 'PV (kW)',
      roKw: 'RO (kW)',
      waterM3: 'Eau (m³)',
      demandM3: 'Dem. (m³)',
      gridKw: 'Réseau (kW)',
      socPct: 'SOC (%)',
      pressBar: 'P (bar)',
      sec: 'SEC (kWh/m³)',
      tds: 'TDS (mg/L)',
    },
  },
  en: {
    brand: 'QatraTherm',
    nav: {
      lab: 'Simulation Lab',
      physics: 'Physics & Audit',
      dossier: 'Dossier & ROI',
      guide: 'Presenter Guide',
    },
    exportDossier: 'Export Dossier',
    toolbar: {
      siteLabel: 'Algerian Site',
      salinityTag: 'Feed TDS',
      uploadCsv: 'Import 24h Weather CSV',
      downloadSampleCsv: 'Sample CSV',
      customCsvActive: 'Custom CSV profile active',
      resetSite: 'Reset Site Defaults',
    },
    sidebar: {
      title: 'Engineering Parameters',
      waterAndSite: 'Water Resource & Demand',
      feedSalinity: 'Feedwater Salinity (TDS)',
      recoveryRatio: 'RO Recovery Ratio',
      dailyDemand: 'Target Daily Demand',
      solarArray: 'Silicon PV-T Collector',
      arrayArea: 'PV-T Array Area',
      pvEfficiency: 'Silicon STC Efficiency',
      tempCoeff: 'Power Temp. Coefficient',
      subsystems: 'Active Subsystems',
      coolingToggle: 'PV-T Feedwater Cooling',
      coolingDesc: 'Harvests Si cell heat to pre-warm RO feedwater',
      erdToggle: 'Energy Recovery Device (ERD)',
      erdDesc: 'Isobaric pressure exchanger on brine reject (94%)',
      mpcToggle: 'Predictive Dispatch (MPC)',
      mpcDesc: 'VFD pump scheduling across solar peak & storage',
      sizing: 'Membranes & Storage',
      membraneArea: 'TFC Membrane Area',
      batteryCap: 'LiFePO4 Buffer Bank',
      tankCap: 'Potable Water Tank',
    },
    kpis: {
      pvYield: 'Net PV Electrical Yield',
      sec: 'Specific Energy (SEC)',
      waterOutput: 'Potable Water Output',
      gridAndTemp: 'Grid Import & Peak Si Temp',
      vsUncooled: 'vs uncooled baseline',
      whoOk: 'WHO Compliant (<500 mg/L)',
      whoAlert: 'Exceeds WHO (>500 mg/L)',
      peakCell: 'Peak cell',
    },
    tabs: {
      dispatchChart: 'Power & Water Dispatch (24h)',
      thermalChart: 'Silicon & Feedwater Thermal Coupling (24h)',
      storageChart: 'Battery SOC, Tank & RO Pressure (24h)',
    },
    schematic: {
      title: 'Coupled PV-T / Reverse Osmosis Process Flow',
      hourInspect: 'Inspected Hour',
      irradiance: 'Irradiance',
      cellTemp: 'Si Cell Temp',
      pvPower: 'PV Power',
      heatRecovered: 'Heat Harvested',
      rawIntake: 'Raw Feed',
      warmFeed: 'Warmed Feed',
      hpPump: 'VFD HP Pump',
      erdUnit: 'Isobaric ERD',
      permeate: 'Potable Permeate',
      brine: 'Concentrate Brine',
      tank: 'Buffer Tank',
    },
    table: {
      title: 'Verifiable Hourly Telemetry (24 Hours)',
      downloadCsv: 'Download 24h CSV',
      hour: 'Hour',
      irr: 'G (W/m²)',
      tCell: 'T_cell (°C)',
      tFeed: 'T_feed (°C)',
      pvKw: 'PV (kW)',
      roKw: 'RO (kW)',
      waterM3: 'Water (m³)',
      demandM3: 'Dem. (m³)',
      gridKw: 'Grid (kW)',
      socPct: 'SOC (%)',
      pressBar: 'P (bar)',
      sec: 'SEC (kWh/m³)',
      tds: 'TDS (mg/L)',
    },
  },
};
