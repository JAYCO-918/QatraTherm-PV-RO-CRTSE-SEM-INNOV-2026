import { useState } from 'react';
import type { HourlyDispatchRow, Language } from '../engine/types';
import { UI_COPY } from '../i18n/translations';

export type ChartMode = 'dispatch' | 'thermal' | 'storage';

interface DispatchCurvesSvgProps {
  lang: Language;
  hourly: HourlyDispatchRow[];
  inspectedHour: number;
  onInspectHour: (hour: number) => void;
}

export function DispatchCurvesSvg({
  lang,
  hourly,
  inspectedHour,
  onInspectHour,
}: DispatchCurvesSvgProps) {
  const t = UI_COPY[lang];
  const [mode, setMode] = useState<ChartMode>('dispatch');

  const W = 860;
  const H = 260;
  const padL = 52;
  const padR = 52;
  const padT = 20;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xAt = (h: number) => padL + (h / 23) * plotW;

  const buildPath = (values: number[], maxVal: number, minVal = 0) => {
    const span = Math.max(1e-6, maxVal - minVal);
    return values
      .map((v, i) => {
        const x = xAt(i).toFixed(1);
        const y = (padT + plotH - ((v - minVal) / span) * plotH).toFixed(1);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const activeRow = hourly[inspectedHour] ?? hourly[12];

  // Scales per mode
  const maxPowerKw = Math.max(8, ...hourly.map((r) => Math.max(r.pvPowerKw, r.roPowerKw, r.gridImportKw))) * 1.15;
  const maxWaterM3h = Math.max(3, ...hourly.map((r) => Math.max(r.permeateFlowM3h, r.demandM3h))) * 1.15;

  const maxTempC = Math.max(55, ...hourly.map((r) => Math.max(r.cellTempC, r.feedTempC, r.ambientTempC))) * 1.08;
  const minTempC = Math.min(10, ...hourly.map((r) => Math.min(r.feedTempC, r.ambientTempC))) - 2;

  const maxPressBar = Math.max(25, ...hourly.map((r) => r.appliedPressureBar)) * 1.15;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    const clamped = Math.max(padL, Math.min(W - padR, relX));
    const hour = Math.round(((clamped - padL) / plotW) * 23);
    if (hour >= 0 && hour <= 23) {
      onInspectHour(hour);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-slate-100 rounded-md gap-1" role="tablist" aria-label="Chart Modes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'dispatch'}
            onClick={() => setMode('dispatch')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'dispatch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabs.dispatchChart}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'thermal'}
            onClick={() => setMode('thermal')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'thermal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabs.thermalChart}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'storage'}
            onClick={() => setMode('storage')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              mode === 'storage' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.tabs.storageChart}
          </button>
        </div>

        {/* Live Crosshair Coordinate Readout */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 rounded px-3 py-1">
          <span className="font-semibold text-slate-900">{String(activeRow.hour).padStart(2, '0')}:00</span>
          {mode === 'dispatch' && (
            <>
              <span className="text-blue-700">PV: {activeRow.pvPowerKw.toFixed(2)} kW</span>
              <span className="text-slate-700">RO: {activeRow.roPowerKw.toFixed(2)} kW</span>
              <span className="text-cyan-700">Eau: {activeRow.permeateFlowM3h.toFixed(2)} m³/h</span>
              <span className="text-rose-700">Grid: {activeRow.gridImportKw.toFixed(2)} kW</span>
            </>
          )}
          {mode === 'thermal' && (
            <>
              <span className="text-amber-700">T_cell: {activeRow.cellTempC.toFixed(1)} °C</span>
              <span className="text-cyan-700">T_feed: {activeRow.feedTempC.toFixed(1)} °C</span>
              <span className="text-slate-600">T_amb: {activeRow.ambientTempC.toFixed(1)} °C</span>
              <span className="text-emerald-700">Q_th: {activeRow.thermalRecoveredKw.toFixed(2)} kW</span>
            </>
          )}
          {mode === 'storage' && (
            <>
              <span className="text-blue-700">SOC: {activeRow.batterySocPct.toFixed(1)}%</span>
              <span className="text-cyan-700">Tank: {activeRow.tankLevelM3.toFixed(1)} m³</span>
              <span className="text-amber-700">P_RO: {activeRow.appliedPressureBar.toFixed(1)} bar</span>
            </>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          onMouseMove={handleMouseMove}
          onClick={handleMouseMove}
          className="w-full min-w-[640px] h-auto cursor-crosshair select-none"
          role="img"
          aria-label="24-Hour Coupled Engineering Chart"
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padT + plotH * (1 - frac);
            const leftVal =
              mode === 'dispatch'
                ? (maxPowerKw * frac).toFixed(0)
                : mode === 'thermal'
                ? (minTempC + (maxTempC - minTempC) * frac).toFixed(0)
                : (100 * frac).toFixed(0);
            const rightVal =
              mode === 'dispatch'
                ? (maxWaterM3h * frac).toFixed(1)
                : mode === 'thermal'
                ? (maxPowerKw * 2.5 * frac).toFixed(0)
                : (maxPressBar * frac).toFixed(0);

            return (
              <g key={frac}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-slate-400 font-mono text-[10px]">
                  {leftVal}
                </text>
                <text x={W - padR + 8} y={y + 4} textAnchor="start" className="fill-slate-400 font-mono text-[10px]">
                  {rightVal}
                </text>
              </g>
            );
          })}

          {/* Axis unit headers */}
          <text x={padL} y={12} textAnchor="start" className="fill-slate-500 font-mono text-[10px] font-semibold">
            {mode === 'dispatch' ? 'kW' : mode === 'thermal' ? '°C' : 'SOC %'}
          </text>
          <text x={W - padR} y={12} textAnchor="end" className="fill-slate-500 font-mono text-[10px] font-semibold">
            {mode === 'dispatch' ? 'm³/h' : mode === 'thermal' ? 'kW_th' : 'bar / m³'}
          </text>

          {/* X-axis ticks (00h..23h every 3h) */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
            <text
              key={h}
              x={xAt(h)}
              y={H - 10}
              textAnchor="middle"
              className="fill-slate-500 font-mono text-[10px]"
            >
              {String(h).padStart(2, '0')}h
            </text>
          ))}

          {/* Curves */}
          {mode === 'dispatch' && (
            <>
              <path
                d={buildPath(hourly.map((r) => r.pvPowerKw), maxPowerKw)}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2.4"
              />
              <path
                d={buildPath(hourly.map((r) => r.roPowerKw), maxPowerKw)}
                fill="none"
                stroke="#334155"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <path
                d={buildPath(hourly.map((r) => r.gridImportKw), maxPowerKw)}
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.6"
              />
              <path
                d={buildPath(hourly.map((r) => r.permeateFlowM3h), maxWaterM3h)}
                fill="none"
                stroke="#0891b2"
                strokeWidth="2.4"
              />
            </>
          )}

          {mode === 'thermal' && (
            <>
              <path
                d={buildPath(hourly.map((r) => r.cellTempC), maxTempC, minTempC)}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.4"
              />
              <path
                d={buildPath(hourly.map((r) => r.feedTempC), maxTempC, minTempC)}
                fill="none"
                stroke="#0891b2"
                strokeWidth="2.4"
              />
              <path
                d={buildPath(hourly.map((r) => r.ambientTempC), maxTempC, minTempC)}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.6"
                strokeDasharray="4 4"
              />
              <path
                d={buildPath(hourly.map((r) => r.thermalRecoveredKw), maxPowerKw * 2.5)}
                fill="none"
                stroke="#059669"
                strokeWidth="1.8"
              />
            </>
          )}

          {mode === 'storage' && (
            <>
              <path
                d={buildPath(hourly.map((r) => r.batterySocPct), 100)}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2.4"
              />
              <path
                d={buildPath(hourly.map((r) => r.appliedPressureBar), maxPressBar)}
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <path
                d={buildPath(
                  hourly.map((r) => r.tankLevelM3),
                  Math.max(...hourly.map((r) => r.tankLevelM3), 20) * 1.15
                )}
                fill="none"
                stroke="#0891b2"
                strokeWidth="2.2"
              />
            </>
          )}

          {/* Crosshair probe line */}
          <line
            x1={xAt(inspectedHour)}
            y1={padT}
            x2={xAt(inspectedHour)}
            y2={padT + plotH}
            stroke="#0f172a"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </svg>
      </div>

      {/* Compact legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 pt-1">
        {mode === 'dispatch' && (
          <>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-700 inline-block" /> PV (kW)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-700 border-b border-dashed inline-block" /> RO Load (kW)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-cyan-600 inline-block" /> Permeate (m³/h)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-600 inline-block" /> Grid Import (kW)</span>
          </>
        )}
        {mode === 'thermal' && (
          <>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-600 inline-block" /> T_cell Si (°C)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-cyan-600 inline-block" /> T_feed RO (°C)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-500 inline-block" /> T_ambient (°C)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-600 inline-block" /> Heat Recovered (kW_th)</span>
          </>
        )}
        {mode === 'storage' && (
          <>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-700 inline-block" /> Battery SOC (%)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-cyan-600 inline-block" /> Buffer Tank (m³)</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-600 inline-block" /> RO Pressure (bar)</span>
          </>
        )}
      </div>
    </section>
  );
}
