import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { findRepoIn, getSite } from './data'
import { strings, type Language, type Strings } from './i18n'
import type { RepoData, SiteData } from './types'

interface I18nContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: Strings
  site: SiteData
  findRepo: (name: string) => RepoData | undefined
}

const I18nContext = createContext<I18nContextValue | null>(null)

function initialLang(): Language {
  const saved = localStorage.getItem('lang')
  if (saved === 'pt' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(initialLang)

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US'
  }, [lang])

  const site = getSite(lang)

  const value: I18nContextValue = {
    lang,
    setLang,
    t: strings[lang] as Strings,
    site,
    findRepo: (name: string) => findRepoIn(site, name),
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}
