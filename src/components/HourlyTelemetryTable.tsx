import { Download } from 'lucide-react';
import type { HourlyDispatchRow, Language } from '../engine/types';
import { UI_COPY } from '../i18n/translations';

interface HourlyTelemetryTableProps {
  lang: Language;
  hourly: HourlyDispatchRow[];
  inspectedHour: number;
  onInspectHour: (hour: number) => void;
  onDownloadCsv: () => void;
}

export function HourlyTelemetryTable({
  lang,
  hourly,
  inspectedHour,
  onInspectHour,
  onDownloadCsv,
}: HourlyTelemetryTableProps) {
  const t = UI_COPY[lang].table;

  return (
    <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-900">{t.title}</h3>
        <button
          type="button"
          onClick={onDownloadCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>{t.downloadCsv}</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-[340px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2.5">{t.hour}</th>
              <th className="px-3 py-2.5 text-right">{t.irr}</th>
              <th className="px-3 py-2.5 text-right">{t.tCell}</th>
              <th className="px-3 py-2.5 text-right">{t.tFeed}</th>
              <th className="px-3 py-2.5 text-right">{t.pvKw}</th>
              <th className="px-3 py-2.5 text-right">{t.roKw}</th>
              <th className="px-3 py-2.5 text-right">{t.waterM3}</th>
              <th className="px-3 py-2.5 text-right">{t.demandM3}</th>
              <th className="px-3 py-2.5 text-right">{t.gridKw}</th>
              <th className="px-3 py-2.5 text-right">{t.socPct}</th>
              <th className="px-3 py-2.5 text-right">{t.pressBar}</th>
              <th className="px-3 py-2.5 text-right">{t.sec}</th>
              <th className="px-3 py-2.5 text-right">{t.tds}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-xs tabular-nums">
            {hourly.map((row) => {
              const isSelected = row.hour === inspectedHour;
              return (
                <tr
                  key={row.hour}
                  onClick={() => onInspectHour(row.hour)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 text-slate-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="px-3 py-2">{String(row.hour).padStart(2, '0')}:00</td>
                  <td className="px-3 py-2 text-right">{row.irradianceWm2}</td>
                  <td className="px-3 py-2 text-right">{row.cellTempC.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{row.feedTempC.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right text-blue-700">{row.pvPowerKw.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{row.roPowerKw.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-cyan-700">{row.permeateFlowM3h.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{row.demandM3h.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{row.gridImportKw.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right">{row.batterySocPct.toFixed(0)}%</td>
                  <td className="px-3 py-2 text-right">{row.appliedPressureBar.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right">{row.secKwhPerM3.toFixed(2)}</td>
                  <td className={`px-3 py-2 text-right ${row.permeateTdsMgL > 500 ? 'text-rose-700 font-semibold' : 'text-emerald-700'}`}>
                    {row.permeateFlowM3h > 0 ? row.permeateTdsMgL.toFixed(0) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
