import type { Language, SystemConfig } from '../engine/types';
import { UI_COPY } from '../i18n/translations';

interface ControlSidebarProps {
  lang: Language;
  config: SystemConfig;
  onChange: (patch: Partial<SystemConfig>) => void;
}

interface SliderRowProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  displayValue?: string;
  onChange: (val: number) => void;
}

function SliderRow({
  id,
  label,
  value,
  unit,
  min,
  max,
  step,
  displayValue,
  onChange,
}: SliderRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-xs font-medium text-slate-700">
          {label}
        </label>
        <span className="text-xs font-mono font-semibold text-slate-900 tabular-nums shrink-0">
          {displayValue ?? value} <span className="text-slate-400 font-normal">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700 focus-visible:outline-2 focus-visible:outline-blue-700"
      />
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start justify-between gap-3 py-2.5 cursor-pointer border-b border-slate-100 last:border-b-0"
    >
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-slate-800">{label}</div>
        <div className="text-[11px] leading-snug text-slate-500">{description}</div>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700 cursor-pointer shrink-0"
      />
    </label>
  );
}

export function ControlSidebar({ lang, config, onChange }: ControlSidebarProps) {
  const t = UI_COPY[lang];

  return (
    <aside className="w-full lg:w-[340px] shrink-0 bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
      <div className="px-4 py-3 bg-slate-50 rounded-t-lg">
        <h2 className="text-sm font-semibold text-slate-900">{t.sidebar.title}</h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t.sidebar.subsystems}
        </div>
        <div>
          <ToggleRow
            id="toggle-cooling"
            label={t.sidebar.coolingToggle}
            description={t.sidebar.coolingDesc}
            checked={config.coolingEnabled}
            onChange={(coolingEnabled) => onChange({ coolingEnabled })}
          />
          <ToggleRow
            id="toggle-erd"
            label={t.sidebar.erdToggle}
            description={t.sidebar.erdDesc}
            checked={config.erdEnabled}
            onChange={(erdEnabled) => onChange({ erdEnabled })}
          />
          <ToggleRow
            id="toggle-mpc"
            label={t.sidebar.mpcToggle}
            description={t.sidebar.mpcDesc}
            checked={config.mpcEnabled}
            onChange={(mpcEnabled) => onChange({ mpcEnabled })}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t.sidebar.waterAndSite}
        </div>
        <SliderRow
          id="slider-salinity"
          label={t.sidebar.feedSalinity}
          value={config.feedSalinityMgL}
          displayValue={config.feedSalinityMgL.toLocaleString('fr-FR')}
          unit="mg/L"
          min={1000}
          max={42000}
          step={250}
          onChange={(feedSalinityMgL) => onChange({ feedSalinityMgL })}
        />
        <SliderRow
          id="slider-recovery"
          label={t.sidebar.recoveryRatio}
          value={Math.round(config.recoveryRatio * 100)}
          unit="%"
          min={25}
          max={80}
          step={1}
          onChange={(pct) => onChange({ recoveryRatio: pct / 100 })}
        />
        <SliderRow
          id="slider-demand"
          label={t.sidebar.dailyDemand}
          value={config.nominalDailyDemandM3}
          unit="m³/j"
          min={10}
          max={60}
          step={1}
          onChange={(nominalDailyDemandM3) => onChange({ nominalDailyDemandM3 })}
        />
      </div>

      <div className="p-4 space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t.sidebar.solarArray}
        </div>
        <SliderRow
          id="slider-area"
          label={t.sidebar.arrayArea}
          value={config.arrayAreaM2}
          unit="m²"
          min={30}
          max={160}
          step={2}
          onChange={(arrayAreaM2) => onChange({ arrayAreaM2 })}
        />
        <SliderRow
          id="slider-pv-eff"
          label={t.sidebar.pvEfficiency}
          value={Number((config.pvNominalEfficiency * 100).toFixed(1))}
          unit="%"
          min={16}
          max={25}
          step={0.2}
          onChange={(pct) => onChange({ pvNominalEfficiency: pct / 100 })}
        />
        <SliderRow
          id="slider-temp-coeff"
          label={t.sidebar.tempCoeff}
          value={Number((config.tempCoeffPower * 100).toFixed(2))}
          unit="%/°C"
          min={-0.5}
          max={-0.25}
          step={0.01}
          onChange={(pct) => onChange({ tempCoeffPower: pct / 100 })}
        />
      </div>

      <div className="p-4 space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t.sidebar.sizing}
        </div>
        <SliderRow
          id="slider-membrane"
          label={t.sidebar.membraneArea}
          value={config.membraneAreaM2}
          unit="m²"
          min={74}
          max={296}
          step={37}
          onChange={(membraneAreaM2) => onChange({ membraneAreaM2 })}
        />
        <SliderRow
          id="slider-battery"
          label={t.sidebar.batteryCap}
          value={config.batteryCapacityKwh}
          unit="kWh"
          min={5}
          max={80}
          step={1}
          onChange={(batteryCapacityKwh) => onChange({ batteryCapacityKwh })}
        />
        <SliderRow
          id="slider-tank"
          label={t.sidebar.tankCap}
          value={config.tankCapacityM3}
          unit="m³"
          min={12}
          max={80}
          step={2}
          onChange={(tankCapacityM3) => onChange({ tankCapacityM3 })}
        />
      </div>
    </aside>
  );
}
