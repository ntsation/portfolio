import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(root, 'dist')
const templatePath = resolve(distDir, 'index.html')

if (!existsSync(templatePath)) {
  console.error('dist/index.html not found — run `vite build` before prerendering')
  process.exit(1)
}

// Matches the VITE_BASE_PATH used by vite.config.ts: "/" for the Docker/nginx
// image, "/portfolio/" for the GitHub Pages build.
const base = process.env.VITE_BASE_PATH || '/'
const siteName = 'ntsation.'
const template = readFileSync(templatePath, 'utf8')

let repos = []
let user = null
try {
  const data = JSON.parse(readFileSync(resolve(root, 'src/data/repos.pt.json'), 'utf8'))
  repos = data.repos
  user = data.user
} catch (err) {
  console.warn(`could not read src/data/repos.pt.json: ${err.message}`)
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderPage({ routePath, title, description, type = 'website' }) {
  const fullTitle = title ? `${title} — ${siteName}` : siteName
  const url = `${base}${routePath.replace(/^\//, '')}`
  const image = `${base}og-image.png`

  const ogTags = `
    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="${siteName}" />
    <meta property="og:title" content="${escapeHtml(fullTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(fullTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="canonical" href="${url}" />`

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*"\s*\/>/,
      `<meta name="description" content="${escapeHtml(description)}" />${ogTags}`,
    )
}

const defaultDescription = 'Personal readmes, told like stories'
const bioDescription = user?.bio || defaultDescription

const staticRoutes = [
  { routePath: '/', title: null, description: defaultDescription },
  { routePath: 'biografia', title: 'Biografia', description: bioDescription },
  {
    routePath: 'projetos',
    title: 'Projetos',
    description: 'Projetos de dados e machine learning de Nathan Souza.',
  },
  {
    routePath: 'open-source',
    title: 'Open Source',
    description: 'Contribuições em open source de Nathan Souza.',
  },
  { routePath: 'lab', title: 'Lab', description: defaultDescription },
]

function writePage(routePath, html) {
  if (routePath === '/') {
    writeFileSync(templatePath, html)
    return
  }
  const dir = resolve(distDir, routePath)
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), html)
}

for (const route of staticRoutes) {
  writePage(route.routePath, renderPage(route))
  console.log(`prerendered ${route.routePath === '/' ? '/' : `/${route.routePath}`}`)
}

for (const repo of repos) {
  const html = renderPage({
    routePath: `r/${repo.name}`,
    title: repo.title || repo.name,
    description: repo.description || repo.excerpt || defaultDescription,
    type: 'article',
  })
  writePage(`r/${repo.name}`, html)
  console.log(`prerendered /r/${repo.name}`)
}

// GitHub Pages / any static host without server-side rewrites: unknown paths
// fall back to this shell so the client-side router can take over.
writeFileSync(resolve(distDir, '404.html'), readFileSync(templatePath, 'utf8'))
console.log('wrote 404.html fallback')
