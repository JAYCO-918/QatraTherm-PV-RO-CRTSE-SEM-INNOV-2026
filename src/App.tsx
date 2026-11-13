import { useEffect, useMemo, useState } from 'react';
import { DossierRoiView } from './components/DossierRoiView';
import { PhysicsAuditView } from './components/PhysicsAuditView';
import { PresenterGuideView } from './components/PresenterGuideView';
import { SimulationLabView } from './components/SimulationLabView';
import { TopBar, type AppView } from './components/TopBar';
import { WorkspaceToolbar } from './components/WorkspaceToolbar';
import {
  exportSimulationResultsCsv,
  exportWeatherProfileCsv,
  generateSubmissionMarkdown,
  parseHourlyWeatherCsv,
} from './engine/csvTelemetry';
import { computeEconomics } from './engine/economics';
import { runFullSimulation } from './engine/mpcOptimizer';
import {
  ALGERIAN_SITE_PRESETS,
  DEFAULT_ECONOMIC_PARAMS,
  DEFAULT_SYSTEM_CONFIG,
} from './engine/presets';
import type {
  DossierMetadata,
  EconomicParams,
  HourlyWeatherPoint,
  Language,
  SystemConfig,
} from './engine/types';

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const STORAGE_KEY = 'qatratherm_crtse_2026_state_v1';

const DEFAULT_META: DossierMetadata = {
  projectName: 'QatraTherm PV-RO — Cogénération Silicium PV-T & Dessalement MPC',
  teamLead: 'Porteur de Projet',
  teamMembers: 'Membre 1 (Énergétique / PV), Membre 2 (Traitement des eaux / IA)',
  institution: 'Université / Centre de Recherche — Algérie',
  email: 'contact@qatratherm.dz',
  wilaya: 'Ouargla',
  trlLevel: 4,
  axis: '01',
};

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [activeView, setActiveView] = useState<AppView>('lab');
  const [inspectedHour, setInspectedHour] = useState<number>(12);

  const [config, setConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.config) return { ...DEFAULT_SYSTEM_CONFIG, ...parsed.config };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_SYSTEM_CONFIG;
  });

  const [econParams, setEconParams] = useState<EconomicParams>(DEFAULT_ECONOMIC_PARAMS);
  const [meta, setMeta] = useState<DossierMetadata>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.meta) return { ...DEFAULT_META, ...parsed.meta };
      }
    } catch {
      // Ignore storage errors
    }
    return DEFAULT_META;
  });

  const [customProfile, setCustomProfile] = useState<HourlyWeatherPoint[] | null>(null);
  const [customCsvName, setCustomCsvName] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, meta }));
    } catch {
      // Ignore quota errors
    }
  }, [config, meta]);

  const selectedSite = useMemo(
    () => ALGERIAN_SITE_PRESETS.find((s) => s.id === config.siteId) ?? ALGERIAN_SITE_PRESETS[0],
    [config.siteId]
  );

  const activeProfile = customProfile ?? selectedSite.hourlyProfile;

  const simulation = useMemo(
    () => runFullSimulation(activeProfile, config),
    [activeProfile, config]
  );

  const economics = useMemo(
    () => computeEconomics(config, simulation, econParams),
    [config, simulation, econParams]
  );

  const handleSelectSite = (siteId: string) => {
    const site = ALGERIAN_SITE_PRESETS.find((s) => s.id === siteId);
    if (!site) return;
    setCustomProfile(null);
    setCustomCsvName(null);
    setCsvError(null);
    setConfig((prev) => ({
      ...prev,
      siteId: site.id,
      feedSalinityMgL: site.feedSalinityMgL,
      recoveryRatio: site.defaultRecoveryRatio,
      nominalDailyDemandM3: Math.round(site.hourlyProfile.reduce((a, p) => a + p.waterDemandM3, 0)),
    }));
    setEconParams((prev) => ({
      ...prev,
      waterBenchmarkDzdPerM3: site.waterBenchmarkDzdM3,
    }));
    setMeta((prev) => ({
      ...prev,
      wilaya: site.wilaya,
    }));
  };

  const handleResetSite = () => {
    handleSelectSite(selectedSite.id);
    setConfig((prev) => ({
      ...DEFAULT_SYSTEM_CONFIG,
      siteId: selectedSite.id,
      feedSalinityMgL: selectedSite.feedSalinityMgL,
      recoveryRatio: selectedSite.defaultRecoveryRatio,
      nominalDailyDemandM3: Math.round(selectedSite.hourlyProfile.reduce((a, p) => a + p.waterDemandM3, 0)),
    }));
  };

  const handleUploadCsv = (csvText: string, fileName: string) => {
    const result = parseHourlyWeatherCsv(csvText);
    if (!result.ok || !result.profile) {
      setCsvError(result.error ?? 'CSV invalide');
      return;
    }
    setCsvError(null);
    setCustomProfile(result.profile);
    setCustomCsvName(fileName);
  };

  const handleDownloadSampleCsv = () => {
    const csv = exportWeatherProfileCsv(activeProfile);
    triggerDownload(`qatratherm_weather_${selectedSite.id}.csv`, csv, 'text/csv;charset=utf-8');
  };

  const handleDownloadResultsCsv = () => {
    const csv = exportSimulationResultsCsv(simulation.hourly);
    triggerDownload(`qatratherm_telemetry_${selectedSite.id}.csv`, csv, 'text/csv;charset=utf-8');
  };

  const handleExportDossier = () => {
    const md = generateSubmissionMarkdown({
      meta,
      siteName: lang === 'fr' ? selectedSite.nameFr : selectedSite.nameEn,
      config,
      sim: simulation,
      econ: economics,
    });
    triggerDownload(`Dossier_SEM_INNOV_2026_${selectedSite.wilaya}.md`, md, 'text/markdown;charset=utf-8');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <TopBar
        activeView={activeView}
        onSelectView={setActiveView}
        lang={lang}
        onExportDossier={handleExportDossier}
      />

      <WorkspaceToolbar
        lang={lang}
        onChangeLang={setLang}
        selectedSite={selectedSite}
        onSelectSite={handleSelectSite}
        customCsvName={customCsvName}
        csvError={csvError}
        onUploadCsv={handleUploadCsv}
        onDownloadSampleCsv={handleDownloadSampleCsv}
        onResetSite={handleResetSite}
      />

      <main className="flex-1">
        {activeView === 'lab' && (
          <SimulationLabView
            lang={lang}
            config={config}
            onChangeConfig={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
            profile={activeProfile}
            sim={simulation}
            inspectedHour={inspectedHour}
            onInspectHour={setInspectedHour}
            onDownloadResultsCsv={handleDownloadResultsCsv}
          />
        )}

        {activeView === 'physics' && (
          <PhysicsAuditView
            lang={lang}
            config={config}
            profile={activeProfile}
            sim={simulation}
          />
        )}

        {activeView === 'dossier' && (
          <DossierRoiView
            lang={lang}
            econParams={econParams}
            onChangeEconParams={(patch) => setEconParams((prev) => ({ ...prev, ...patch }))}
            econ={economics}
            sim={simulation}
            meta={meta}
            onChangeMeta={(patch) => setMeta((prev) => ({ ...prev, ...patch }))}
            onExportDossier={handleExportDossier}
          />
        )}

        {activeView === 'guide' && (
          <PresenterGuideView
            lang={lang}
            siteName={lang === 'fr' ? selectedSite.nameFr : selectedSite.nameEn}
            config={config}
            sim={simulation}
            econ={economics}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 no-print">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>
            QatraTherm PV-RO · CRTSE INC-MATENG SEM’INNOV 2026 (Energytech · Sustainable AI · Watertech)
          </span>
          <span>
            {lang === 'fr'
              ? 'Tous les calculs sont exécutés localement par équations physiques déterministes.'
              : 'All metrics computed locally via deterministic physical & financial equations.'}
          </span>
        </div>
      </footer>
    </div>
  );
}
