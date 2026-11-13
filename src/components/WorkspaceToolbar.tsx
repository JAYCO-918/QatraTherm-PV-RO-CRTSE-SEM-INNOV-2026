import { useRef } from 'react';
import { FileDown, RotateCcw, Upload } from 'lucide-react';
import { ALGERIAN_SITE_PRESETS } from '../engine/presets';
import type { AlgerianSitePreset, Language } from '../engine/types';
import { UI_COPY } from '../i18n/translations';

interface WorkspaceToolbarProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  selectedSite: AlgerianSitePreset;
  onSelectSite: (siteId: string) => void;
  customCsvName: string | null;
  csvError: string | null;
  onUploadCsv: (csvText: string, fileName: string) => void;
  onDownloadSampleCsv: () => void;
  onResetSite: () => void;
}

export function WorkspaceToolbar({
  lang,
  onChangeLang,
  selectedSite,
  onSelectSite,
  customCsvName,
  csvError,
  onUploadCsv,
  onDownloadSampleCsv,
  onResetSite,
}: WorkspaceToolbarProps) {
  const t = UI_COPY[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadCsv(reader.result, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 no-print">
      <div className="max-w-[1440px] mx-auto flex flex-wrap xl:flex-nowrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 min-w-0 max-w-full">
          <div className="flex items-center gap-2 min-w-0 max-w-full">
            <label htmlFor="site-preset-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap shrink-0">
              {t.toolbar.siteLabel}
            </label>
            <select
              id="site-preset-select"
              value={selectedSite.id}
              onChange={(e) => onSelectSite(e.target.value)}
              className="text-xs md:text-sm font-medium text-slate-900 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 max-w-[230px] sm:max-w-none truncate focus-visible:outline-2 focus-visible:outline-blue-700"
            >
              {ALGERIAN_SITE_PRESETS.map((site) => (
                <option key={site.id} value={site.id}>
                  {lang === 'fr' ? site.nameFr : site.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden 2xl:flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
            <span>{selectedSite.latitude.toFixed(2)}°N, {selectedSite.longitude.toFixed(2)}°E</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'fr' ? selectedSite.waterSourceFr : selectedSite.waterSourceEn}</span>
            {customCsvName && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-blue-700 font-semibold">{t.toolbar.customCsvActive}: {customCsvName}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
            aria-label={t.toolbar.uploadCsv}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t.toolbar.uploadCsv}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadSampleCsv}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t.toolbar.downloadSampleCsv}</span>
          </button>

          <button
            type="button"
            onClick={onResetSite}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{t.toolbar.resetSite}</span>
          </button>

          <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-md" role="group" aria-label="Language">
            <button
              type="button"
              onClick={() => onChangeLang('fr')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                lang === 'fr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => onChangeLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {csvError && (
        <div role="alert" className="max-w-[1440px] mx-auto mt-2 px-3 py-2 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          {csvError}
        </div>
      )}
    </div>
  );
}
