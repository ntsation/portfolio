export type Language = 'pt' | 'en'

export const languages: Language[] = ['pt', 'en']

export const strings = {
  pt: {
    nav: { bio: 'Biografia', projects: 'Projetos', opensource: 'Open Source' },
    sidebar: {
      tagline: 'Readmes dos meus projetos e das minhas contribuições open source, contados como histórias.',
      projects: 'projetos',
      contributions: 'contribuições open source',
    },
    feed: {
      featured: 'Destaque',
      latest: 'Últimos posts',
      empty: 'Nada por aqui ainda.',
    },
    card: {
      minRead: 'min de leitura',
      contributionsTo: 'contribuições em',
    },
    state: { open: 'aberto', closed: 'fechado', merged: 'merged' },
    article: {
      contributionsIn: 'Contribuições em',
      minRead: 'min de leitura',
      viewRepo: 'Ver repositório',
      viewOnGithub: 'Ver no GitHub',
      star: 'Dar uma estrela no GitHub',
      homepage: 'Homepage',
      files: 'arquivos',
      noBody: '_Sem descrição._',
      notFound: 'Post não encontrado.',
      back: 'Voltar à home',
    },
    contact: { title: 'Contato' },
    bio: { title: 'Biografia' },
  },
  en: {
    nav: { bio: 'Biography', projects: 'Projects', opensource: 'Open Source' },
    sidebar: {
      tagline: 'Readmes from my projects and open source contributions, told as stories.',
      projects: 'projects',
      contributions: 'open source contributions',
    },
    feed: {
      featured: 'Featured',
      latest: 'Latest posts',
      empty: 'Nothing here yet.',
    },
    card: {
      minRead: 'min read',
      contributionsTo: 'contributions to',
    },
    state: { open: 'open', closed: 'closed', merged: 'merged' },
    article: {
      contributionsIn: 'Contributions to',
      minRead: 'min read',
      viewRepo: 'View repo',
      viewOnGithub: 'View on GitHub',
      star: 'Star on GitHub',
      homepage: 'Homepage',
      files: 'files',
      noBody: '_No description provided._',
      notFound: 'Post not found.',
      back: 'Back to home',
    },
    contact: { title: 'Contact' },
    bio: { title: 'Biography' },
  },
} as const

export type Strings = (typeof strings)['pt']

export function formatDate(iso: string, lang: Language) {
  return new Date(iso).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
