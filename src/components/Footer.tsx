import { GithubIcon, LinkedinIcon, MailIcon } from './icons'
import { useI18n } from '../LanguageContext'
import { contacts } from '../contacts'

export default function Footer() {
  const { t, site } = useI18n()
  const projects = site.repos.filter((r) => r.kind === 'project')
  const prCount = site.repos
    .filter((r) => r.kind === 'opensource')
    .reduce((s, r) => s + (r.prs?.length ?? 0), 0)

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-id">
          <img className="footer-avatar" src={site.user.avatarUrl} alt={site.user.name} />
          <div className="footer-id-text">
            <h3 className="footer-name">{site.user.name}</h3>
            <p className="footer-role">Data/ML Engineer</p>
            <p className="footer-tagline">{t.sidebar.tagline}</p>
          </div>
        </div>
        <div className="footer-actions">
          <div className="social-row social-row-center">
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
        </div>
        <div className="footer-stats">
          <span>
            {projects.length} {t.sidebar.projects}
          </span>
          <span className="card-sep">·</span>
          <span>
            {prCount} {t.sidebar.contributions}
          </span>
        </div>
      </div>
    </footer>
  )
}
