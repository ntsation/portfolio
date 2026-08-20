import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(readFileSync(resolve(root, 'repos.config.json'), 'utf8'))
const outDir = resolve(root, 'src/data')
const ptPath = resolve(outDir, 'repos.pt.json')
const enPath = resolve(outDir, 'repos.en.json')
const MAX_PR_DETAILS = 12

// Content is translated by hand in each repo, never by an LLM. For each
// language we try these filenames in order and use the first one that
// exists; if none of the localized files exist we fall back to whatever
// the repo's default README is (same content shown for both languages).
const ARTICLE_CANDIDATES = {
  pt: ['ARTIGO.pt-br.md', 'ARTIGO.md', 'artigo.pt-br.md', 'artigo.md', 'README.pt-br.md', 'readme.pt-br.md'],
  en: [
    'ARTIGO.en-us.md',
    'ARTICLE.md',
    'ARTICLE.en-us.md',
    'artigo.en-us.md',
    'article.md',
    'README.en-us.md',
    'readme.en-us.md',
  ],
}

if (process.argv.includes('--if-missing') && existsSync(ptPath)) {
  console.log('src/data/repos.pt.json already exists, skipping fetch (rm it to refresh)')
  process.exit(0)
}

const headers = {
  'User-Agent': 'ntsation-readme-blog',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

async function ghJson(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers })
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
  return res.json()
}

async function ghRaw(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { ...headers, Accept: 'application/vnd.github.raw' },
  })
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`)
  return res.text()
}

function mdToText(md) {
  return md
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function excerptOf(text, max = 220) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}

function prettify(name) {
  return name
    .split(/[-_]/)
    .map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

function isBadge(url) {
  return /shields\.io|badgen|badge|travis-ci|codecov|circleci/i.test(url) || /\.svg($|\?)/i.test(url)
}

function collectImages(md) {
  const urls = []
  for (const m of md.matchAll(/!\[[^\]]*\]\(\s*<([^>]+)>|^!\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/gm)) {
    urls.push(m[1] || m[2])
  }
  for (const m of md.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    urls.push(m[1])
  }
  return urls
}

function rewriteImages(md, owner, repo, branch) {
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`
  const toAbsolute = (url) => {
    const clean = url.split('#')[0]
    if (
      !clean ||
      clean.startsWith('http:') ||
      clean.startsWith('https:') ||
      clean.startsWith('//') ||
      clean.startsWith('data:')
    ) {
      return url
    }
    if (clean.startsWith('/')) return base + clean
    const parts = []
    for (const seg of clean.split('/')) {
      if (seg === '.' || seg === '') continue
      if (seg === '..') parts.pop()
      else parts.push(seg)
    }
    return `${base}/${parts.join('/')}`
  }
  return md
    .replace(/(!\[[^\]]*\]\()\s*<([^>]+)>/g, (_m, pre, url) => `${pre}${toAbsolute(url)}`)
    .replace(/(!\[[^\]]*\]\()([^)\s]+)([^)]*\))/g, (_m, pre, url, post) => `${pre}${toAbsolute(url)}${post}`)
    .replace(/(<img[^>]+src=["'])([^"']+)(["'])/gi, (_m, pre, url, post) => `${pre}${toAbsolute(url)}${post}`)
}

function parseArticleMeta(md) {
  let title = md.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null
  if (title) title = title.replace(/[*_`]/g, '')
  const lines = md.split('\n')
  const h1Index = lines.findIndex((l) => /^#\s+/.test(l))
  let description = null
  if (h1Index !== -1) {
    for (const line of lines.slice(h1Index + 1)) {
      const t = line.trim()
      if (!t) continue
      if (t.startsWith('#') || t.startsWith('!') || t.startsWith('<') || t.startsWith('---')) continue
      description = mdToText(t)
      break
    }
  }
  return { title, description }
}

// The article's own H1 + subtitle (and, if present, a manual pt/en switcher
// link) are already surfaced by the page as title/description and the
// site's own language toggle — strip them from the body so they don't
// repeat inside the rendered content.
function stripArticleHeader(md) {
  const lines = md.split('\n')
  let i = 0
  const skipBlank = () => {
    while (i < lines.length && lines[i].trim() === '') i++
  }
  skipBlank()
  if (i < lines.length && !/^#/.test(lines[i]) && /(🇧🇷|🇺🇸)/.test(lines[i])) {
    i++
    skipBlank()
  }
  if (i < lines.length && /^#\s+/.test(lines[i])) {
    i++
    skipBlank()
    const t = lines[i]?.trim()
    if (t && !t.startsWith('#') && !t.startsWith('!') && !t.startsWith('<') && !t.startsWith('---')) {
      i++
    }
  }
  skipBlank()
  return lines.slice(i).join('\n')
}

let user
try {
  const u = await ghJson(`/users/${config.username}`)
  user = {
    login: u.login,
    name: u.name || u.login,
    bio: u.bio || null,
    avatarUrl: u.avatar_url,
    profileUrl: u.html_url,
  }
} catch (err) {
  console.warn(`could not fetch user: ${err.message}`)
  if (existsSync(ptPath)) {
    user = JSON.parse(readFileSync(ptPath, 'utf8')).user
  } else {
    user = {
      login: config.username,
      name: config.username,
      bio: null,
      avatarUrl: `https://github.com/${config.username}.png`,
      profileUrl: `https://github.com/${config.username}`,
    }
  }
}

async function fetchOpenSource(meta) {
  const upstream = meta.parent
  const pulls = await ghJson(
    `/repos/${upstream.full_name}/pulls?state=all&per_page=100&sort=updated&direction=desc`,
  )
  let mine = pulls.filter(
    (p) => (p.user?.login || '').toLowerCase() === config.username.toLowerCase(),
  )
  if (mine.length === 0) {
    const found = await ghJson(
      `/search/issues?q=repo:${upstream.full_name}+is:pr+author:${config.username}&per_page=100`,
    )
    mine = (found.items || []).map((i) => ({
      number: i.number,
      title: i.title,
      html_url: i.html_url,
      state: i.state,
      merged_at: i.pull_request?.merged_at ?? null,
      updated_at: i.updated_at,
      body: i.body ?? '',
    }))
  }
  if (mine.length === 0) return null

  const prs = []
  for (const p of mine.slice(0, MAX_PR_DETAILS)) {
    let detail = null
    try {
      detail = await ghJson(`/repos/${upstream.full_name}/pulls/${p.number}`)
    } catch {
      // list payload is enough as fallback
    }
    prs.push({
      number: p.number,
      title: p.title,
      url: p.html_url,
      state: p.merged_at ? 'merged' : p.state === 'open' ? 'open' : 'closed',
      mergedAt: p.merged_at ?? null,
      updatedAt: p.updated_at,
      body: detail?.body ?? p.body ?? '',
      additions: detail?.additions ?? null,
      deletions: detail?.deletions ?? null,
      changedFiles: detail?.changed_files ?? null,
    })
  }
  prs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const words = prs
    .map((p) => mdToText(p.body))
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
  const merged = prs.filter((p) => p.state === 'merged').length
  const open = prs.filter((p) => p.state === 'open').length

  return {
    kind: 'opensource',
    name: meta.name,
    title: prettify(meta.name),
    description: upstream.description || null,
    excerpt:
      prs.length === 1
        ? excerptOf(mdToText(prs[0].body) || prs[0].title)
        : `${prs.length} pull requests · ${merged} merged · ${open} open`,
    content: '',
    url: upstream.html_url,
    homepage: upstream.homepage || null,
    language: upstream.language,
    topics: upstream.topics || [],
    stars: upstream.stargazers_count,
    updatedAt: prs[0].updatedAt,
    readingTime: Math.max(1, Math.round(words / 200)),
    thumbnail: null,
    prs,
    upstream: {
      fullName: upstream.full_name,
      url: upstream.html_url,
      stars: upstream.stargazers_count,
    },
  }
}

async function fetchArticle(owner, repo, lang) {
  for (const file of ARTICLE_CANDIDATES[lang]) {
    try {
      const md = await ghRaw(`/repos/${owner}/${repo}/contents/${file}`)
      console.log(`  [${lang}] using ${file}`)
      return { md, source: 'artigo' }
    } catch (err) {
      if (!/-> 404$/.test(err.message)) throw err
    }
  }
  const md = await ghRaw(`/repos/${owner}/${repo}/readme`)
  console.log(`  [${lang}] no localized file, using default README`)
  return { md, source: 'readme' }
}

async function fetchProject(meta, lang) {
  const { md, source } = await fetchArticle(config.username, meta.name, lang)
  const branch = meta.default_branch || 'main'
  const rawContent = rewriteImages(md, config.username, meta.name, branch)
  const text = mdToText(rawContent)
  const words = text.split(/\s+/).filter(Boolean).length
  const images = collectImages(rawContent).filter((u) => !isBadge(u))

  let title = prettify(meta.name)
  let description = meta.description || null
  let content = rawContent
  if (source === 'artigo') {
    const parsed = parseArticleMeta(rawContent)
    title = parsed.title || title
    description = parsed.description || description
    content = stripArticleHeader(rawContent)
  }

  return {
    kind: 'project',
    name: meta.name,
    title,
    description,
    excerpt: description || excerptOf(text),
    content,
    url: meta.html_url,
    homepage: meta.homepage || null,
    language: meta.language,
    topics: meta.topics || [],
    stars: meta.stargazers_count,
    updatedAt: meta.updated_at,
    readingTime: Math.max(1, Math.round(words / 200)),
    thumbnail: images[0] || null,
    prs: null,
    upstream: null,
  }
}

async function listRepos() {
  const all = []
  let page = 1
  while (true) {
    const batch = await ghJson(
      `/users/${config.username}/repos?per_page=100&type=owner&sort=pushed&page=${page}`,
    )
    all.push(...batch)
    if (batch.length < 100) break
    page++
  }
  return all
}

const ptRepos = []
const enRepos = []
const exclude = new Set(config.exclude ?? [])

let allRepos
try {
  allRepos = await listRepos()
} catch (err) {
  if (existsSync(ptPath)) {
    console.warn(`could not list repos (${err.message}); keeping existing src/data/repos.pt.json`)
    process.exit(0)
  }
  console.error(`could not list repos and no cached data exists: ${err.message}`)
  process.exit(1)
}

for (const meta of allRepos) {
  if (exclude.has(meta.name)) {
    console.log(`${meta.name}: excluded by config`)
    continue
  }
  try {
    if (meta.fork) {
      const full = await ghJson(`/repos/${config.username}/${meta.name}`)
      if (!full.parent) continue
      const entry = await fetchOpenSource(full)
      if (!entry) {
        console.warn(`${meta.name}: fork without PRs, skipping`)
        continue
      }
      // PR content lives in someone else's repo, so there's no localized
      // file to pick per language; show it as written for both locales.
      ptRepos.push(entry)
      enRepos.push(entry)
      console.log(
        `fetched ${meta.name}: ${entry.prs.length} PR(s) into ${entry.upstream.fullName}`,
      )
    } else {
      const [ptEntry, enEntry] = await Promise.all([
        fetchProject(meta, 'pt'),
        fetchProject(meta, 'en'),
      ])
      ptRepos.push(ptEntry)
      enRepos.push(enEntry)
      console.log(`fetched ${meta.name}`)
    }
  } catch (err) {
    console.warn(`skipping ${meta.name}: ${err.message}`)
  }
}

ptRepos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
enRepos.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

mkdirSync(outDir, { recursive: true })
rmSync(resolve(outDir, 'repos.json'), { force: true })

writeFileSync(ptPath, `${JSON.stringify({ user, repos: ptRepos }, null, 2)}\n`)
writeFileSync(enPath, `${JSON.stringify({ user, repos: enRepos }, null, 2)}\n`)
console.log(`wrote ${ptRepos.length} repos (pt-BR + en-US, each fetched from its own localized file)`)
