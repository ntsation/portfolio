import { Link } from 'react-router-dom'
import { useI18n } from '../LanguageContext'
import { formatDate } from '../i18n'
import type { RepoData } from '../types'

function formatStars(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`
}

export default function RepoCard({ repo }: { repo: RepoData }) {
  const { lang, t, site } = useI18n()
  const isOpenSource = repo.kind === 'opensource'
  const prs = repo.prs ?? []
  const title = isOpenSource && prs.length === 1 ? prs[0].title : repo.title
  const authorLine = isOpenSource && repo.upstream
    ? `${t.card.contributionsTo} ${repo.upstream.fullName}`
    : repo.name
  const adds = prs.reduce((s, p) => s + (p.additions || 0), 0)
  const dels = prs.reduce((s, p) => s + (p.deletions || 0), 0)
  const stateCount = (s: string) => prs.filter((p) => p.state === s).length

  return (
    <article className="card">
      <div className="card-body">
        <div className="card-author">
          <img className="card-author-avatar" src={site.user.avatarUrl} alt="" />
          <span className="card-author-name">{authorLine}</span>
          <span className="card-sep">·</span>
          <span>{formatDate(repo.updatedAt, lang)}</span>
        </div>
        <Link to={`/r/${repo.name}`} className="card-title">
          {title}
        </Link>
        <p className="card-excerpt">{repo.excerpt}</p>
        <div className="card-meta">
          <span>
            {repo.readingTime} {t.card.minRead}
          </span>
          {repo.language && <span className="chip chip-lang">{repo.language}</span>}
          {repo.topics.slice(0, 3).map((topic) => (
            <span key={topic} className="chip">
              {topic}
            </span>
          ))}
          {isOpenSource &&
            (['merged', 'open', 'closed'] as const).map((s) => {
              const n = stateCount(s)
              return n > 0 ? (
                <span key={s} className={`chip chip-pr chip-${s}`}>
                  {n} {t.state[s]}
                </span>
              ) : null
            })}
          {isOpenSource && (adds > 0 || dels > 0) && (
            <span className="card-diff">
              <span className="diff-add">+{adds}</span> <span className="diff-del">−{dels}</span>
            </span>
          )}
          {repo.stars > 0 && <span className="card-stars">★ {formatStars(repo.stars)}</span>}
        </div>
      </div>
      {repo.thumbnail && (
        <Link to={`/r/${repo.name}`} className="card-thumb-link">
          <img className="card-thumb" src={repo.thumbnail} alt="" />
        </Link>
      )}
    </article>
  )
}
