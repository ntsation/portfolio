import { useEffect } from 'react'
import Markdown from '../components/Markdown'
import { useI18n } from '../LanguageContext'
import bioPt from '../bio.pt.md?raw'
import bioEn from '../bio.en.md?raw'

export default function Bio() {
  const { lang, t, site } = useI18n()
  const bioMd = lang === 'pt' ? bioPt : bioEn

  useEffect(() => {
    document.title = `${t.bio.title} · ${site.user.name}`
  }, [t.bio.title, site.user.name])

  return (
    <main className="article">
      <div className="article-inner">
        <div className="article-body bio-body">
          <Markdown>{bioMd}</Markdown>
        </div>
      </div>
    </main>
  )
}
