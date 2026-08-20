import { useEffect } from 'react'
import RepoCard from '../components/RepoCard'
import { useI18n } from '../LanguageContext'
import type { RepoKind } from '../types'

export default function Feed({ kind }: { kind: RepoKind }) {
  const { t, site } = useI18n()
  const label = kind === 'project' ? t.nav.projects : t.nav.opensource
  const repos = site.repos.filter((r) => r.kind === kind)

  useEffect(() => {
    document.title = `${label} · ${site.user.name}`
  }, [label, site.user.name])

  return (
    <main className="feed-page">
      <div className="feed-label">{label}</div>
      {repos.length === 0 ? (
        <p className="empty">{t.feed.empty}</p>
      ) : (
        repos.map((repo) => <RepoCard key={repo.name} repo={repo} />)
      )}
    </main>
  )
}
