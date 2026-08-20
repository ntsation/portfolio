import pt from './data/repos.pt.json'
import en from './data/repos.en.json'
import type { Language } from './i18n'
import type { RepoData, SiteData } from './types'

const data: Record<Language, SiteData> = {
  pt: pt as unknown as SiteData,
  en: en as unknown as SiteData,
}

export function getSite(lang: Language): SiteData {
  return data[lang] ?? data.pt
}

export function findRepoIn(site: SiteData, name: string): RepoData | undefined {
  return site.repos.find((r) => r.name.toLowerCase() === name.toLowerCase())
}
