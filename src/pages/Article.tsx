import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown'
import { useI18n } from '../LanguageContext'
import { formatDate } from '../i18n'

export default function Article() {
  const { name } = useParams()
  const { lang, t, site, findRepo } = useI18n()
  const repo = name ? findRepo(name) : undefined
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [name])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(1, el.scrollTop / total) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.title = repo ? `${repo.title} · ${site.user.name}` : site.user.name
  }, [repo, site.user.name])

  if (!repo) {
    return (
      <main className="article">
        <p className="not-found">
          {t.article.notFound} <Link to="/">{t.article.back}</Link>
        </p>
      </main>
    )
  }

  const isOpenSource = repo.kind === 'opensource' && repo.prs
  const prs = repo.prs ?? []
  const title = isOpenSource && prs.length === 1 ? prs[0].title : repo.title

  return (
    <>
      <div className="progress" style={{ width: `${progress * 100}%` }} />
      <main className="article">
        <div className="article-inner">
          <div className="article-author">
            <img className="article-avatar" src={site.user.avatarUrl} alt={site.user.name} />
            <div className="article-author-text">
              <span className="article-author-name">
                {isOpenSource && repo.upstream
                  ? `${t.article.contributionsIn} ${repo.upstream.fullName}`
                  : repo.name}
              </span>
              <span className="article-author-sub">
                {formatDate(repo.updatedAt, lang)} · {repo.readingTime} {t.article.minRead}
              </span>
            </div>
            <a className="btn btn-accent" href={repo.url} target="_blank" rel="noreferrer">
              {isOpenSource ? t.article.viewRepo : t.article.viewOnGithub}
            </a>
          </div>
          <h1 className="article-title">{title}</h1>
          {repo.description && <p className="article-subtitle">{repo.description}</p>}
          <div className="article-body">
            {isOpenSource ? (
              <div className="pr-list">
                {prs.map((pr) => (
                  <section key={pr.number} className="pr-block">
                    <h2 className="pr-title">
                      <a href={pr.url} target="_blank" rel="noreferrer">
                        {pr.title}
                      </a>
                    </h2>
                    <p className="pr-meta">
                      <span className={`pr-badge pr-${pr.state}`}>
                        {pr.state === 'merged' ? t.state.merged : pr.state === 'open' ? t.state.open : t.state.closed}
                      </span>
                      <span className="pr-number">#{pr.number}</span>
                      <span>{formatDate(pr.mergedAt ?? pr.updatedAt, lang)}</span>
                      {pr.additions !== null && pr.deletions !== null && (
                        <>
                          <span>
                            <span className="diff-add">+{pr.additions}</span>{' '}
                            <span className="diff-del">−{pr.deletions}</span>
                          </span>
                          {pr.changedFiles !== null && (
                            <span>
                              {pr.changedFiles} {t.article.files}
                            </span>
                          )}
                        </>
                      )}
                    </p>
                    <Markdown>{pr.body || t.article.noBody}</Markdown>
                    <hr />
                  </section>
                ))}
              </div>
            ) : (
              <Markdown>{repo.content}</Markdown>
            )}
          </div>
          <footer className="article-footer">
            <a className="btn btn-accent" href={repo.url} target="_blank" rel="noreferrer">
              {isOpenSource ? t.article.viewRepo : t.article.star}
            </a>
            {repo.homepage && (
              <a className="btn btn-outline" href={repo.homepage} target="_blank" rel="noreferrer">
                {t.article.homepage}
              </a>
            )}
          </footer>
        </div>
      </main>
    </>
  )
}
