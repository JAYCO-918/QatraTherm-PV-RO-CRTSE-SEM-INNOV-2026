import type { HourlyDispatchRow, Language, SystemConfig } from '../engine/types';
import { UI_COPY } from '../i18n/translations';

interface SystemSchematicSvgProps {
  lang: Language;
  row: HourlyDispatchRow;
  rawFeedTempC: number;
  config: SystemConfig;
  onChangeHour: (hour: number) => void;
}

export function SystemSchematicSvg({
  lang,
  row,
  rawFeedTempC,
  config,
  onChangeHour,
}: SystemSchematicSvgProps) {
  const t = UI_COPY[lang].schematic;
  const feedFlowM3h = row.permeateFlowM3h > 0 ? row.permeateFlowM3h / config.recoveryRatio : 0;
  const brineFlowM3h = Math.max(0, feedFlowM3h - row.permeateFlowM3h);

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {String(row.hour).padStart(2, '0')}:00
            <span aria-hidden="true"> · </span>
            G = {row.irradianceWm2} W/m²
            <span aria-hidden="true"> · </span>
            T_amb = {row.ambientTempC} °C
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="hour-scrubber" className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {t.hourInspect}
          </label>
          <input
            id="hour-scrubber"
            type="range"
            min={0}
            max={23}
            step={1}
            value={row.hour}
            onChange={(e) => onChangeHour(Number(e.target.value))}
            className="w-36 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
          />
          <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums w-11 text-right">
            {String(row.hour).padStart(2, '0')}:00
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 920 265"
          className="w-full min-w-[680px] h-auto"
          role="img"
          aria-label={t.title}
        >
          <defs>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#0891b2" />
            </marker>
            <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
            </marker>
            <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#1d4ed8" />
            </marker>
            <marker id="arrow-slate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Subtle background grid lines */}
          <rect x="0" y="0" width="920" height="265" fill="#f8fafc" rx="6" />

          {/* Solar rays -> PV-T Module */}
          <text x="42" y="22" className="fill-amber-700 font-mono text-[11px] font-semibold">
            {t.irradiance}: {row.irradianceWm2} W/m²
          </text>
          <line x1="76" y1="29" x2="104" y2="54" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-amber)" />
          <line x1="126" y1="29" x2="154" y2="54" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow-amber)" />

          {/* Node 1: Silicon PV-T Collector */}
          <rect x="42" y="58" width="210" height="84" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="42" y="58" width="210" height="22" rx="6" fill="#eff6ff" />
          <text x="54" y="73" className="fill-slate-900 font-sans text-[11px] font-semibold">
            {config.coolingEnabled ? 'PV-T Silicon Collector' : 'Uncooled Silicon PV'}
          </text>
          <text x="54" y="98" className="fill-slate-600 font-mono text-[11px]">
            {t.cellTemp}: <tspan className="fill-slate-900 font-semibold">{row.cellTempC.toFixed(1)} °C</tspan>
          </text>
          <text x="54" y="116" className="fill-slate-600 font-mono text-[11px]">
            {t.pvPower}: <tspan className="fill-blue-700 font-semibold">{row.pvPowerKw.toFixed(2)} kW</tspan>
          </text>
          <text x="54" y="133" className="fill-slate-600 font-mono text-[11px]">
            {t.heatRecovered}: <tspan className="fill-amber-700 font-semibold">{row.thermalRecoveredKw.toFixed(2)} kW_th</tspan>
          </text>

          {/* Electrical bus from PV-T -> VFD Pump & Battery */}
          <path d="M 252 84 L 440 84 L 440 144" fill="none" stroke="#1d4ed8" strokeWidth="1.8" markerEnd="url(#arrow-blue)" />
          <text x="278" y="77" className="fill-blue-700 font-mono text-[10px] font-medium">
            DC/MPC Bus · Bat {row.batterySocPct.toFixed(0)}% · Grid {row.gridImportKw.toFixed(2)} kW
          </text>

          {/* Node 2: Raw Intake -> PV-T Rear Heat Exchanger */}
          <rect x="42" y="176" width="146" height="62" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <text x="52" y="196" className="fill-slate-900 font-sans text-[11px] font-semibold">
            {t.rawIntake}
          </text>
          <text x="52" y="213" className="fill-slate-600 font-mono text-[11px]">
            {rawFeedTempC.toFixed(1)} °C · {feedFlowM3h.toFixed(2)} m³/h
          </text>
          <text x="52" y="229" className="fill-slate-500 font-mono text-[10px]">
            TDS {config.feedSalinityMgL.toLocaleString('fr-FR')} mg/L
          </text>

          {/* Thermal coupling pipe between Intake -> PV-T rear HX -> Warm Feed */}
          {config.coolingEnabled ? (
            <>
              <path d="M 112 176 L 112 145" fill="none" stroke="#0891b2" strokeWidth="1.8" markerEnd="url(#arrow-cyan)" />
              <path d="M 205 142 L 205 204 L 368 204" fill="none" stroke="#d97706" strokeWidth="2" markerEnd="url(#arrow-amber)" />
              <text x="218" y="196" className="fill-amber-700 font-mono text-[10px] font-semibold">
                {t.warmFeed}: {row.feedTempC.toFixed(1)} °C
              </text>
            </>
          ) : (
            <>
              <path d="M 188 204 L 368 204" fill="none" stroke="#0891b2" strokeWidth="1.8" markerEnd="url(#arrow-cyan)" />
              <text x="218" y="196" className="fill-cyan-700 font-mono text-[10px]">
                Bypass ({row.feedTempC.toFixed(1)} °C)
              </text>
            </>
          )}

          {/* Node 3: VFD High Pressure Pump + Isobaric ERD */}
          <rect x="374" y="148" width="158" height="90" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <rect x="374" y="148" width="158" height="22" rx="6" fill="#ecfeff" />
          <text x="384" y="163" className="fill-slate-900 font-sans text-[11px] font-semibold">
            {t.hpPump} {config.erdEnabled ? '+ ERD' : ''}
          </text>
          <text x="384" y="187" className="fill-slate-600 font-mono text-[11px]">
            P_feed: <tspan className="fill-slate-900 font-semibold">{row.appliedPressureBar.toFixed(1)} bar</tspan>
          </text>
          <text x="384" y="205" className="fill-slate-600 font-mono text-[11px]">
            P_ro: <tspan className="fill-slate-900 font-semibold">{row.roPowerKw.toFixed(2)} kW</tspan>
          </text>
          <text x="384" y="223" className="fill-slate-600 font-mono text-[11px]">
            SEC: <tspan className="fill-cyan-700 font-semibold">{row.secKwhPerM3.toFixed(2)} kWh/m³</tspan>
          </text>

          {/* Feed pipe to RO Membrane */}
          <line x1="532" y1="190" x2="564" y2="190" stroke="#0891b2" strokeWidth="2" markerEnd="url(#arrow-cyan)" />

          {/* Node 4: TFC Membrane Skid */}
          <rect x="570" y="140" width="172" height="98" rx="6" fill="#ffffff" stroke="#0891b2" strokeWidth="1.4" />
          <text x="580" y="160" className="fill-slate-900 font-sans text-[11px] font-semibold">
            RO TFC ({config.membraneAreaM2} m²)
          </text>
          <text x="580" y="180" className="fill-slate-600 font-mono text-[11px]">
            R = {Math.round(config.recoveryRatio * 100)}%
          </text>
          <text x="580" y="198" className="fill-slate-600 font-mono text-[11px]">
            Perméat: <tspan className="fill-cyan-700 font-semibold">{row.permeateFlowM3h.toFixed(2)} m³/h</tspan>
          </text>
          <text x="580" y="216" className="fill-slate-600 font-mono text-[11px]">
            TDS_p: <tspan className={row.permeateTdsMgL <= 500 ? 'fill-emerald-700 font-semibold' : 'fill-rose-700 font-semibold'}>
              {row.permeateTdsMgL.toFixed(0)} mg/L
            </tspan>
          </text>

          {/* Permeate pipe -> Buffer Tank */}
          <line x1="742" y1="168" x2="774" y2="168" stroke="#0891b2" strokeWidth="2" markerEnd="url(#arrow-cyan)" />

          {/* Node 5: Elevated Buffer Tank */}
          <rect x="776" y="128" width="122" height="72" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
          <text x="786" y="148" className="fill-slate-900 font-sans text-[11px] font-semibold">
            {t.tank}
          </text>
          <text x="786" y="168" className="fill-slate-600 font-mono text-[11px]">
            {row.tankLevelM3.toFixed(1)} / {config.tankCapacityM3} m³
          </text>
          <text x="786" y="186" className="fill-slate-500 font-mono text-[10px]">
            Dem: {row.demandM3h.toFixed(2)} m³/h
          </text>

          {/* Brine reject loop back through ERD / Valorization */}
          <path d="M 655 238 L 655 253 L 454 253 L 454 240" fill="none" stroke="#64748b" strokeWidth="1.4" strokeDasharray="4 3" markerEnd="url(#arrow-slate)" />
          <text x="488" y="249" className="fill-slate-600 font-mono text-[10px]">
            {t.brine}: {brineFlowM3h.toFixed(2)} m³/h {config.erdEnabled ? '→ ERD 94%' : '→ Rejet'}
          </text>
        </svg>
      </div>
    </section>
  );
}
