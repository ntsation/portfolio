export type PRState = 'open' | 'closed' | 'merged'

export interface PullRequest {
  number: number
  title: string
  url: string
  state: PRState
  mergedAt: string | null
  updatedAt: string
  body: string
  additions: number | null
  deletions: number | null
  changedFiles: number | null
}

export interface UpstreamInfo {
  fullName: string
  url: string
  stars: number
}

export type RepoKind = 'project' | 'opensource'

export interface RepoData {
  kind: RepoKind
  name: string
  title: string
  description: string | null
  excerpt: string
  content: string
  url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stars: number
  updatedAt: string
  readingTime: number
  thumbnail: string | null
  prs: PullRequest[] | null
  upstream: UpstreamInfo | null
}

export interface SiteData {
  user: {
    login: string
    name: string
    bio: string | null
    avatarUrl: string
    profileUrl: string
  }
  repos: RepoData[]
}
