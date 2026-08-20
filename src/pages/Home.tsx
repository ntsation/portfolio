import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import RepoCard from '../components/RepoCard'
import { GithubIcon, LinkedinIcon, MailIcon } from '../components/icons'
import { useI18n } from '../LanguageContext'
import { contacts } from '../contacts'

export default function Home() {
  const { t, site } = useI18n()

  useEffect(() => {
    document.title = site.user.name
  }, [site.user.name])

  const repos = site.repos
  const projects = repos.filter((r) => r.kind === 'project')
  const opensource = repos.filter((r) => r.kind === 'opensource')
  const prCount = opensource.reduce((s, r) => s + (r.prs?.length ?? 0), 0)
  const featured = repos.find((r) => r.thumbnail) ?? null
  const rest = repos.filter((r) => r !== featured)

  return (
    <main className="home">
      <aside className="sidebar">
        <img className="sidebar-avatar" src={site.user.avatarUrl} alt={site.user.name} />
        <h2 className="sidebar-name">{site.user.name}</h2>
        {site.user.bio && <p className="sidebar-bio">{site.user.bio}</p>}
        <p className="sidebar-tagline">{t.sidebar.tagline}</p>
        <div className="sidebar-actions">
          <Link to="/biografia" className="btn btn-outline">
            {t.nav.bio}
          </Link>
          <a className="btn btn-accent" href={site.user.profileUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <div className="sidebar-stats">
          <span>
            {projects.length} {t.sidebar.projects}
          </span>
          <span className="card-sep">·</span>
          <span>
            {prCount} {t.sidebar.contributions}
          </span>
        </div>
        <div className="social-row">
          <a className="social-icon-btn" href={contacts.github} target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub">
            <GithubIcon />
          </a>
          <a className="social-icon-btn" href={contacts.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
            <LinkedinIcon />
          </a>
          <a className="social-icon-btn" href={`mailto:${contacts.email}`} aria-label="Email" title={contacts.email}>
            <MailIcon />
          </a>
        </div>
      </aside>
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
