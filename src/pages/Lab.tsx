import { useEffect } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import InteractiveThumb, { langHues } from '../components/InteractiveThumb'
import type { ThumbVariant } from '../components/InteractiveThumb'
import RepoCard from '../components/RepoCard'
import { useI18n } from '../LanguageContext'
import { formatDate } from '../i18n'

const VARIANTS: { id: ThumbVariant; label: string; note: string }[] = [
  { id: 'flow', label: 'Flow field', note: 'atual, agora com paleta por linguagem' },
  { id: 'constellation', label: 'Constellation', note: 'nós conectados que acendem perto do cursor' },
  { id: 'dots', label: 'Dot grid', note: 'grade que acende e se afasta do mouse' },
  { id: 'ribbons', label: 'Ribbons', note: 'fitas contínuas serpenteando' },
]

type DemoRepo = { name: string; title: string; excerpt: string; language: string | null }

export default function Lab() {
  const { site } = useI18n()

  useEffect(() => {
    document.title = 'Lab · ntsation'
  }, [])

  const repos: DemoRepo[] = site.repos.map((r) => ({
    name: r.name,
    title: r.title,
    excerpt: r.excerpt,
    language: r.language ?? null,
  }))
  const fallback: DemoRepo[] = VARIANTS.map((v) => ({
    name: `demo-${v.id}`,
    title: v.label,
    excerpt: v.note,
    language: null,
  }))
  const demo = repos.length >= 4 ? repos : [...repos, ...fallback].slice(0, 4)
  const [featured, hoverCard] = demo
  const sa = site.repos.find((r) => r.name === 'sentiment-analysis-api') ?? site.repos[0]

  const onCardMove = (e: RPointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  const thumb = (repo: DemoRepo, variant: ThumbVariant) => (
    <div className="lab-thumb">
      <InteractiveThumb seed={repo.name} variant={variant} hues={langHues(repo.language)} hoverBoost />
    </div>
  )

  return (
    <main className="lab">
      <h1 className="lab-title">Lab</h1>
      <p className="lab-sub">Testes de design — nada aqui afeta as páginas principais.</p>

      <h2 className="lab-h2">Thumbnails</h2>
      <div className="lab-grid">
        {VARIANTS.map((v, i) => {
          const repo = demo[i % demo.length]
          return (
            <div className="lab-card" key={v.id} onPointerMove={onCardMove}>
              <div className="lab-card-body">
                <div className="lab-variant-name">{v.label}</div>
                <p className="lab-note">{v.note}</p>
                <p className="lab-note lab-note-lang">
                  {repo.name}
                  {repo.language ? ` · ${repo.language}` : ''}
                </p>
              </div>
              {thumb(repo, v.id)}
            </div>
          )
        })}
      </div>

      <h2 className="lab-h2">Card com spotlight + underline animado</h2>
      <p className="lab-note">
        Passe o mouse: glow segue o cursor na borda e no fundo, título ganha underline crescente e o
        thumb acelera.
      </p>
      <article className="lab-card" onPointerMove={onCardMove}>
        <div className="lab-card-body">
          <span className="lab-variant-name">{hoverCard.name}</span>
          <h3 className="lab-link-underline">{hoverCard.title}</h3>
          <p className="lab-note">{hoverCard.excerpt}</p>
        </div>
        {thumb(hoverCard, 'flow')}
      </article>

      <h2 className="lab-h2">Featured com painel</h2>
      <p className="lab-note">Card destacado com fundo accent-soft e os mesmos efeitos de hover.</p>
      <div className="lab-card lab-featured" onPointerMove={onCardMove}>
        <div className="lab-card-body">
          <div className="feed-label">Destaque</div>
          <h3 className="lab-link-underline">{featured.title}</h3>
          <p className="lab-note">{featured.excerpt}</p>
        </div>
        {thumb(featured, 'flow')}
      </div>

      <h2 className="lab-h2">Card do sentiment-analysis-api</h2>
      <p className="lab-note">O card real, como aparece no feed, usando o repo como exemplo.</p>
      <RepoCard repo={sa} />

      <h2 className="lab-h2">Texto em painel</h2>
      <p className="lab-note">
        O mesmo conteúdo do artigo, mas dentro de um painel sólido para o dot grid do fundo não se
        misturar com a leitura.
      </p>
      <div className="lab-article-panel">
        <div className="card-author">
          <span className="card-author-name">{sa.name}</span>
          <span className="card-sep">·</span>
          <span>{formatDate(sa.updatedAt, 'pt')}</span>
        </div>
        <h1 className="lab-article-title">{sa.title}</h1>
        <p className="lab-article-sub">{sa.description}</p>
        <div className="card-meta">
          <span>
            {sa.readingTime} min de leitura
          </span>
          {sa.language && <span className="chip chip-lang">{sa.language}</span>}
          {sa.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="chip">
              {topic}
            </span>
          ))}
        </div>
        <p className="lab-article-body">
          {sa.excerpt} O painel usa fundo opaco, borda e sombra sutil, então o dot grid da página
          continua visível ao redor sem invadir o texto.
        </p>
      </div>
    </main>
  )
}
