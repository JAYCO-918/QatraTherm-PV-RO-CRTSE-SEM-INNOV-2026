import { Download } from 'lucide-react';
import type { Language } from '../engine/types';
import { UI_COPY } from '../i18n/translations';

export type AppView = 'lab' | 'physics' | 'dossier' | 'guide';

interface TopBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  lang: Language;
  onExportDossier: () => void;
}

export function TopBar({ activeView, onSelectView, lang, onExportDossier }: TopBarProps) {
  const t = UI_COPY[lang];

  const navItems: { id: AppView; label: string }[] = [
    { id: 'lab', label: t.nav.lab },
    { id: 'physics', label: t.nav.physics },
    { id: 'dossier', label: t.nav.dossier },
    { id: 'guide', label: t.nav.guide },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-3 md:gap-8">
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectView('lab');
        }}
        className="text-base md:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
      >
        {t.brand}
      </a>

      <nav aria-label="Primary Navigation" className="flex items-center gap-3 md:gap-6 min-w-0 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`py-2 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                isActive
                  ? 'border-blue-700 text-blue-700 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 hidden sm:block">
        <button
          type="button"
          onClick={onExportDossier}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>{t.exportDossier}</span>
        </button>
      </div>
    </header>
  );
}
