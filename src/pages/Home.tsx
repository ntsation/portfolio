import { useEffect } from 'react'
import RepoCard from '../components/RepoCard'
import { useI18n } from '../LanguageContext'

export default function Home() {
  const { t, site } = useI18n()

  useEffect(() => {
    document.title = site.user.name
  }, [site.user.name])

  const repos = site.repos
  const featured = repos.find((r) => r.thumbnail) ?? null
  const rest = repos.filter((r) => r !== featured)

  return (
    <main className="home">
      <section className="feed">
        {featured && (
          <>
            <div className="feed-label">{t.feed.featured}</div>
            <div className="featured">
              <RepoCard repo={featured} />
            </div>
          </>
        )}
        <div className="feed-label">{t.feed.latest}</div>
        {rest.length === 0 && !featured ? (
          <p className="empty">{t.feed.empty}</p>
        ) : (
          rest.map((repo) => <RepoCard key={repo.name} repo={repo} />)
        )}
      </section>
    </main>
  )
}
