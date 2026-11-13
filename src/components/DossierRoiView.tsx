import { Download, Printer } from 'lucide-react';
import type {
  DossierMetadata,
  EconomicParams,
  EconomicSummary,
  Language,
  SimulationSummary,
} from '../engine/types';

interface DossierRoiViewProps {
  lang: Language;
  econParams: EconomicParams;
  onChangeEconParams: (patch: Partial<EconomicParams>) => void;
  econ: EconomicSummary;
  sim: SimulationSummary;
  meta: DossierMetadata;
  onChangeMeta: (patch: Partial<DossierMetadata>) => void;
  onExportDossier: () => void;
}

export function DossierRoiView({
  lang,
  econParams,
  onChangeEconParams,
  econ,
  sim,
  meta,
  onChangeMeta,
  onExportDossier,
}: DossierRoiViewProps) {
  const isFr = lang === 'fr';
  const fmtDzd = (val: number) => `${val.toLocaleString('fr-FR')} DZD`;

  const criteriaRows = [
    {
      num: '01',
      titleFr: 'Pertinence et adéquation au challenge',
      titleEn: 'Relevance & Alignment to Challenge',
      proofFr: `Couvre les 3 axes CRTSE : refroidissement silicium PV-T (Axe 01), pilotage prédictif MPC (Axe 02), dessalement éco-énergétique & valorisation saumure (Axe 03).`,
      proofEn: `Addresses all 3 CRTSE axes: Silicon PV-T cooling (Axis 01), predictive MPC dispatch (Axis 02), eco-energy desalination & brine valorization (Axis 03).`,
    },
    {
      num: '02',
      titleFr: 'Maturité et faisabilité technique (TRL)',
      titleEn: 'Technical Maturity & Feasibility (TRL)',
      proofFr: `Niveau TRL ${meta.trlLevel}/9 : modèle numérique couplé fonctionnel sans données simulées, architecture matérielle standard (PERC Si + membranes TFC + pompe VFD + ERD).`,
      proofEn: `TRL ${meta.trlLevel}/9: working coupled physics & optimization engine using real equations and standard industrial hardware (PERC Si + TFC RO + VFD + ERD).`,
    },
    {
      num: '03',
      titleFr: 'Rentabilité économique',
      titleEn: 'Economic Viability & ROI',
      proofFr: `LCOW calculé à ${econ.lcowDzdPerM3} DZD/m³ (${econ.lcowUsdPerM3} USD/m³) contre ${econ.baselineLcowDzdPerM3} DZD/m³ référence ; retour sur investissement en ${econ.simplePaybackYears} ans (TRI ${econ.irrApproxPct}%).`,
      proofEn: `Computed LCOW of ${econ.lcowDzdPerM3} DZD/m³ (${econ.lcowUsdPerM3} USD/m³) vs ${econ.baselineLcowDzdPerM3} DZD/m³ baseline; ${econ.simplePaybackYears}-year payback (${econ.irrApproxPct}% IRR).`,
    },
    {
      num: '04',
      titleFr: 'Équipe et compétences',
      titleEn: 'Team & Competencies',
      proofFr: `Porteur : ${meta.teamLead} (${meta.institution}) · Équipe : ${meta.teamMembers}.`,
      proofEn: `Lead: ${meta.teamLead} (${meta.institution}) · Team: ${meta.teamMembers}.`,
    },
    {
      num: '05',
      titleFr: 'Valeur ajoutée et positionnement',
      titleEn: 'Added Value & Positioning',
      proofFr: `Synergie bidirectionnelle : +${sim.gains.pvYieldGainPct}% d’énergie PV et -${sim.gains.secReductionPct}% de SEC membranaire sur un seul skid compact.`,
      proofEn: `Bidirectional synergy: +${sim.gains.pvYieldGainPct}% PV electrical yield and -${sim.gains.secReductionPct}% membrane SEC inside one compact skid.`,
    },
    {
      num: '06',
      titleFr: 'Ressources et plan de mise en œuvre',
      titleEn: 'Resources & Implementation Plan',
      proofFr: `Phase 1 (M1-M3 CRTSE) : Banc pilote PV-T 2 kWc + skid RO ; Phase 2 (M4-M6) : Calibration capteurs & validation terrain à ${meta.wilaya}.`,
      proofEn: `Phase 1 (M1-M3 at CRTSE): 2 kWp PV-T + RO bench prototype; Phase 2 (M4-M6): sensor calibration & field validation in ${meta.wilaya}.`,
    },
    {
      num: '07',
      titleFr: 'Impact attendu',
      titleEn: 'Expected Impact',
      proofFr: `${econ.annualWaterM3.toLocaleString('fr-FR')} m³/an d’eau conforme OMS (<500 mg/L), ${sim.gains.co2AvoidedTonnesYear} tCO₂/an évitées et ${sim.optimizedSystem.recoverableSaltKgDay} kg/j de sels valorisables.`,
      proofEn: `${econ.annualWaterM3.toLocaleString('en-US')} m³/yr WHO-compliant potable water, ${sim.gains.co2AvoidedTonnesYear} tCO₂/yr avoided, and ${sim.optimizedSystem.recoverableSaltKgDay} kg/day recoverable salts.`,
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isFr ? 'Modèle Économique & Dossier SEM’INNOV 2026' : 'Techno-Economics & SEM’INNOV 2026 Dossier'}
          </h1>
          <p className="text-sm text-slate-600">
            {isFr
              ? 'Calcul de rentabilité réel en Dinar Algérien (DZD) et préparation directe des pièces pour hackathon.dz.'
              : 'Real Algerian Dinar (DZD) financial model and direct submission dossier builder for hackathon.dz.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            <span>{isFr ? 'Imprimer / PDF' : 'Print / PDF'}</span>
          </button>
          <button
            type="button"
            onClick={onExportDossier}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>{isFr ? 'Télécharger Dossier (.md)' : 'Download Dossier (.md)'}</span>
          </button>
        </div>
      </div>

      {/* 4-column financial summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isFr ? 'Coût actualisé eau (LCOW)' : 'Levelized Water Cost (LCOW)'}
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {econ.lcowDzdPerM3} <span className="text-xs font-normal text-slate-400">DZD/m³</span>
          </div>
          <div className="text-xs font-mono text-emerald-700 tabular-nums">
            {econ.lcowUsdPerM3} USD/m³ · {isFr ? 'Réf' : 'Base'}: {econ.baselineLcowDzdPerM3} DZD
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isFr ? 'CAPEX Net (après subvention)' : 'Net CAPEX (Post-Grant)'}
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums">
            {(econ.netCapexDzd / 1e6).toFixed(2)} <span className="text-xs font-normal text-slate-400">M DZD</span>
          </div>
          <div className="text-xs font-mono text-slate-500 tabular-nums">
            {isFr ? 'Brut' : 'Gross'}: {(econ.grossCapexDzd / 1e6).toFixed(2)} M DZD
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isFr ? 'Temps de retour simple' : 'Simple Payback'}
          </div>
          <div className="text-2xl font-mono font-bold text-blue-700 tabular-nums">
            {econ.simplePaybackYears} <span className="text-xs font-normal text-slate-400">{isFr ? 'ans' : 'yrs'}</span>
          </div>
          <div className="text-xs font-mono text-slate-600 tabular-nums">
            IRR: {econ.irrApproxPct}% · OPEX: {(econ.annualOpexDzd / 1e3).toFixed(0)}k DZD/{isFr ? 'an' : 'yr'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isFr ? 'VAN (15 ans) & Impact CO₂' : '15-Yr NPV & CO₂ Avoided'}
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700 tabular-nums">
            {(econ.npv15YearsDzd / 1e6).toFixed(2)} <span className="text-xs font-normal text-slate-400">M DZD</span>
          </div>
          <div className="text-xs font-mono text-slate-600 tabular-nums">
            {sim.gains.co2AvoidedTonnesYear} tCO₂/{isFr ? 'an' : 'yr'} · {econ.annualWaterM3.toLocaleString('fr-FR')} m³/{isFr ? 'an' : 'yr'}
          </div>
        </div>
      </div>

      {/* Economic Sliders + CAPEX BOM Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isFr ? 'Hypothèses financières (Algérie 2026)' : 'Financial Assumptions (Algeria 2026)'}
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="econ-water-bench" className="font-medium text-slate-700">
                  {isFr ? 'Coût alternatif eau (citerne / réseau)' : 'Alternative water benchmark'}
                </label>
                <span className="font-mono font-semibold tabular-nums">{econParams.waterBenchmarkDzdPerM3} DZD/m³</span>
              </div>
              <input
                id="econ-water-bench"
                type="range"
                min={60}
                max={400}
                step={5}
                value={econParams.waterBenchmarkDzdPerM3}
                onChange={(e) => onChangeEconParams({ waterBenchmarkDzdPerM3: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="econ-grid-tariff" className="font-medium text-slate-700">
                  {isFr ? 'Tarif électricité réseau backup' : 'Backup grid electricity tariff'}
                </label>
                <span className="font-mono font-semibold tabular-nums">{econParams.gridTariffDzdPerKwh.toFixed(1)} DZD/kWh</span>
              </div>
              <input
                id="econ-grid-tariff"
                type="range"
                min={2}
                max={25}
                step={0.5}
                value={econParams.gridTariffDzdPerKwh}
                onChange={(e) => onChangeEconParams({ gridTariffDzdPerKwh: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="econ-subsidy" className="font-medium text-slate-700">
                  {isFr ? 'Appui ANVREDET / Label Startup' : 'ANVREDET / Startup Grant Share'}
                </label>
                <span className="font-mono font-semibold tabular-nums">{Math.round(econParams.subsidyRate * 100)}%</span>
              </div>
              <input
                id="econ-subsidy"
                type="range"
                min={0}
                max={50}
                step={5}
                value={Math.round(econParams.subsidyRate * 100)}
                onChange={(e) => onChangeEconParams({ subsidyRate: Number(e.target.value) / 100 })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="econ-discount" className="font-medium text-slate-700">
                  {isFr ? 'Taux d’actualisation' : 'Discount rate'}
                </label>
                <span className="font-mono font-semibold tabular-nums">{Math.round(econParams.discountRate * 100)}%</span>
              </div>
              <input
                id="econ-discount"
                type="range"
                min={3}
                max={12}
                step={1}
                value={Math.round(econParams.discountRate * 100)}
                onChange={(e) => onChangeEconParams({ discountRate: Number(e.target.value) / 100 })}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-mono tabular-nums">
            <div className="flex justify-between text-slate-600">
              <span>{isFr ? 'Valeur eau produite / an' : 'Annual potable water value'}</span>
              <span className="text-slate-900 font-semibold">{fmtDzd(econ.annualWaterValueDzd)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isFr ? 'Valorisation saumure / an' : 'Annual brine mineral credit'}</span>
              <span className="text-slate-900 font-semibold">{fmtDzd(econ.annualBrineValorizationDzd)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isFr ? 'OPEX total / an' : 'Annual total OPEX'}</span>
              <span className="text-rose-700">-{fmtDzd(econ.annualOpexDzd)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1.5">
              <span>{isFr ? 'Flux de trésorerie net / an' : 'Annual net cashflow'}</span>
              <span className="text-emerald-700">{fmtDzd(econ.annualNetBenefitDzd)}</span>
            </div>
          </div>
        </section>

        {/* BOM Table */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-base font-semibold text-slate-900">
              {isFr ? 'Décomposition CAPEX (Nomenclature Matériel)' : 'CAPEX Bill of Materials Breakdown'}
            </h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-2.5">{isFr ? 'Sous-système' : 'Subsystem'}</th>
                <th className="px-5 py-2.5 text-right">{isFr ? 'Coût estimé (DZD)' : 'Estimated Cost (DZD)'}</th>
                <th className="px-5 py-2.5 text-right">{isFr ? 'Part' : 'Share'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {econ.capexBreakdown.map((item) => (
                <tr key={item.itemEn}>
                  <td className="px-5 py-3 text-slate-800">{isFr ? item.itemFr : item.itemEn}</td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-900">{fmtDzd(item.costDzd)}</td>
                  <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-500">
                    {((item.costDzd / econ.grossCapexDzd) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold">
                <td className="px-5 py-3 text-slate-900">{isFr ? 'Total CAPEX Brut' : 'Total Gross CAPEX'}</td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-900">{fmtDzd(econ.grossCapexDzd)}</td>
                <td className="px-5 py-3 text-right font-mono tabular-nums text-slate-700">100.0%</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {/* Editable CRTSE Dossier Metadata + 7 Evaluation Criteria */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isFr ? 'Fiche de Renseignements (hackathon.dz)' : 'Project Submission Details (hackathon.dz)'}
          </h2>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <label htmlFor="meta-proj" className="block text-xs font-medium text-slate-600 mb-1">
                {isFr ? 'Nom du projet' : 'Project Name'}
              </label>
              <input
                id="meta-proj"
                type="text"
                value={meta.projectName}
                onChange={(e) => onChangeMeta({ projectName: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="meta-axis" className="block text-xs font-medium text-slate-600 mb-1">
                  {isFr ? 'Axe du challenge' : 'Challenge Axis'}
                </label>
                <select
                  id="meta-axis"
                  value={meta.axis}
                  onChange={(e) => onChangeMeta({ axis: e.target.value as '01' | '02' | '03' })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900 bg-white"
                >
                  <option value="01">Axe 01 — Énergie</option>
                  <option value="02">Axe 02 — IA & Efficacité</option>
                  <option value="03">Axe 03 — Eau & Dessalement</option>
                </select>
              </div>
              <div>
                <label htmlFor="meta-trl" className="block text-xs font-medium text-slate-600 mb-1">
                  {isFr ? 'Niveau TRL (1–9)' : 'TRL Level (1–9)'}
                </label>
                <input
                  id="meta-trl"
                  type="number"
                  min={1}
                  max={9}
                  value={meta.trlLevel}
                  onChange={(e) => onChangeMeta({ trlLevel: Math.min(9, Math.max(1, Number(e.target.value))) })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900 font-mono"
                />
              </div>
            </div>
            <div>
              <label htmlFor="meta-lead" className="block text-xs font-medium text-slate-600 mb-1">
                {isFr ? 'Porteur de projet' : 'Project Lead'}
              </label>
              <input
                id="meta-lead"
                type="text"
                value={meta.teamLead}
                onChange={(e) => onChangeMeta({ teamLead: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label htmlFor="meta-members" className="block text-xs font-medium text-slate-600 mb-1">
                {isFr ? 'Membres de l’équipe (max 2 coéquipiers)' : 'Team Members (up to 2)'}
              </label>
              <input
                id="meta-members"
                type="text"
                value={meta.teamMembers}
                onChange={(e) => onChangeMeta({ teamMembers: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="meta-inst" className="block text-xs font-medium text-slate-600 mb-1">
                  {isFr ? 'Établissement' : 'Institution'}
                </label>
                <input
                  id="meta-inst"
                  type="text"
                  value={meta.institution}
                  onChange={(e) => onChangeMeta({ institution: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900"
                />
              </div>
              <div>
                <label htmlFor="meta-email" className="block text-xs font-medium text-slate-600 mb-1">
                  Email
                </label>
                <input
                  id="meta-email"
                  type="email"
                  value={meta.email}
                  onChange={(e) => onChangeMeta({ email: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-slate-900"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            {isFr
              ? 'Alignement sur les 7 Critères Officiels du Jury CRTSE'
              : 'Alignment with the 7 Official CRTSE Jury Criteria'}
          </h2>
          <div className="divide-y divide-slate-200">
            {criteriaRows.map((c) => (
              <div key={c.num} className="py-3 first:pt-0 last:pb-0 space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  {c.num}. {isFr ? c.titleFr : c.titleEn}
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{isFr ? c.proofFr : c.proofEn}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
