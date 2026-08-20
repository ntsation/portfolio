import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../LanguageContext'
import { languages, type Language } from '../i18n'
import { applyTheme, getInitialTheme, getStoredTheme, getSystemTheme, storeTheme, type Theme } from '../theme'

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function Header() {
  const { lang, setLang, t, site } = useI18n()
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (getStoredTheme()) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme(getSystemTheme())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    storeTheme(next)
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Link to="/" className="logo">
            {site.user.login}
            <span className="logo-dot">.</span>
          </Link>
          <nav className="nav" aria-label="Main navigation">
            <NavLink to="/biografia" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {t.nav.bio}
            </NavLink>
            <NavLink to="/projetos" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {t.nav.projects}
            </NavLink>
            <NavLink to="/open-source" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {t.nav.opensource}
            </NavLink>
          </nav>
        </div>
        <div className="header-actions">
          <div className="lang-toggle" role="group" aria-label="Language">
            {languages.map((l: Language) => (
              <button
                key={l}
                type="button"
                className={`lang-opt${lang === l ? ' active' : ''}`}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
              >
                {l === 'pt' ? 'PT' : 'EN'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}
