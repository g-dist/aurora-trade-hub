import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Portal = 'buyer' | 'supplier' | 'admin';

interface Props {
  portal: Portal;
}

const PORTAL_DEFAULTS: Record<Portal, string> = {
  buyer: 'zh',
  supplier: 'no',
  admin: 'no',
};

const PORTAL_LANGS: Record<Portal, string[]> = {
  buyer: ['zh', 'en'],
  supplier: ['no', 'en'],
  admin: ['no', 'en', 'zh'],
};

const LABELS: Record<string, string> = {
  en: 'EN',
  no: 'NO',
  zh: 'CN',
};

const storageKey = (portal: Portal) => `lang_${portal}`;

const LanguageSwitcher = ({ portal }: Props) => {
  const { i18n } = useTranslation();
  const langs = PORTAL_LANGS[portal];

  const [active, setActive] = useState<string>(() => {
    return localStorage.getItem(storageKey(portal)) ?? PORTAL_DEFAULTS[portal];
  });

  // Sync i18n on mount and whenever portal changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey(portal)) ?? PORTAL_DEFAULTS[portal];
    setActive(saved);
    i18n.changeLanguage(saved);
  }, [portal, i18n]);

  const switchTo = (lang: string) => {
    setActive(lang);
    localStorage.setItem(storageKey(portal), lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="fixed right-4 top-3.5 z-50 flex items-center gap-0 text-[11px] font-medium text-muted-foreground select-none">
      {langs.map((lang, i) => (
        <span key={lang} className="flex items-center">
          {i > 0 && <span className="mx-1 opacity-30">|</span>}
          <button
            onClick={() => switchTo(lang)}
            className={`transition-colors duration-150 ${
              active === lang
                ? 'text-foreground'
                : 'hover:text-foreground/70'
            }`}
          >
            {LABELS[lang]}
          </button>
        </span>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
