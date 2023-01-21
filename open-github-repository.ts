// Name: Open GitHub Repository
// Description: Open a specific GitHub repository
// Author: Michael Lyon
// Twitter: @__mlyon

import '@johnlindquist/kit'

const { Octokit } = await npm('octokit')

interface RawRepositoryType {
  id: string
  name: string
  html_url: string
  full_name: string
  visibility: string[]
  description: string
  homepage?: string
  owner: {
    login: string
  }
  open_issues_count: number
}

interface OptionType<ValueType = unknown> {
  name: string
  descritpion?: string
  preview?: string
  value: ValueType
}

const auth = await env(`GITHUB_ACCESS_TOKEN`, 'Enter your GitHub access token')
const octokit = new Octokit({ auth })

const {
  data: { login },
} = await octokit.rest.users.getAuthenticated()

const mapRawRepo = (repo: RawRepositoryType) => ({
  name: repo.full_name,
  description: [
    repo.visibility[0].toUpperCase() + repo.visibility.slice(1),
    repo.description,
    repo.homepage,
  ]
    .filter(Boolean)
    .join('  ·  '),
  value: repo,
})

const mapReposResponse = (response: { data: RawRepositoryType[] }) =>
  (response.data || []).map(mapRawRepo)

async function fetchAllRepos() {
  return await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    { sort: 'updated', per_page: 100 },
    mapReposResponse,
  )
}

async function fetchRecentRepos() {
  const res = await octokit.request('GET /user/repos', {
    sort: 'updated',
    per_page: 50,
  })
  return res.data
}

async function fetchOwnerRepos() {
  const res = await octokit.request('GET /user/repos', {
    sort: 'updated',
    per_page: 50,
    affiliation: 'owner',
  })
  return res.data
}

function getTabHandler(getter: () => Promise<OptionType<RawRepositoryType>[]>) {
  return async function handler() {
    const repos = await getter()
    const repoSelected = await arg(`Hello ${login}. Search for a repo`, repos)

    if (repos.length === 0) {
      await div(`<div class="p-4 bg-white">No repos</div>`)
      await handler()
    }

    await browse(repoSelected.html_url)
    exit()
  }
}

const recentTab = getTabHandler(fetchRecentRepos)
onTab('Recent', recentTab)
onTab('Owner', getTabHandler(fetchOwnerRepos))
onTab('All', getTabHandler(fetchAllRepos))
await recentTab()
