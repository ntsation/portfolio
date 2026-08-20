import { useEffect } from 'react'
import Markdown from '../components/Markdown'
import { GithubIcon, LinkedinIcon, MailIcon } from '../components/icons'
import { useI18n } from '../LanguageContext'
import { contacts } from '../contacts'
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
      <div className="bio-hero">
        <img className="bio-avatar" src={site.user.avatarUrl} alt={site.user.name} />
        <h1 className="bio-name">{site.user.name}</h1>
        {site.user.bio && <p className="bio-tagline">{site.user.bio}</p>}
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
      <div className="article-inner">
        <div className="article-body">
          <Markdown>{bioMd}</Markdown>
        </div>
        <section className="contact-section">
          <h2 className="contact-title">{t.contact.title}</h2>
          <a className="contact-item" href={contacts.linkedin} target="_blank" rel="noreferrer">
            <span className="contact-icon">
              <LinkedinIcon />
            </span>
            <span className="contact-text">
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">{contacts.linkedin.replace('https://www.', '').replace('https://', '')}</span>
            </span>
          </a>
          <a className="contact-item" href={contacts.github} target="_blank" rel="noreferrer">
            <span className="contact-icon">
              <GithubIcon />
            </span>
            <span className="contact-text">
              <span className="contact-label">GitHub</span>
              <span className="contact-value">{contacts.github.replace('https://', '')}</span>
            </span>
          </a>
          <a className="contact-item" href={`mailto:${contacts.email}`}>
            <span className="contact-icon">
              <MailIcon />
            </span>
            <span className="contact-text">
              <span className="contact-label">Email</span>
              <span className="contact-value">{contacts.email}</span>
            </span>
          </a>
        </section>
      </div>
    </main>
  )
}
