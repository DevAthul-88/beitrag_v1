"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState, useMemo } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Github, Stars, GitFork, Code2, TrendingUp } from "lucide-react"
import { Loader } from "../common/loader"
import { ErrorState } from "../common/error-state"
import { RepoFilters } from "./repo-filters"
import { EmptyState } from "../common/empty-state"
import { RepoCard } from "./RepoCard"
import { getGitHubToken } from "@/lib/github/token"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart"

interface GitHubRepo {
  id: number
  name: string
  html_url: string
  description: string | null
  full_name: string
  private: boolean
  updated_at: string
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  created_at: string
  size: number
  topics: string[]
  open_issues_count: number
}

interface ExtendedGitHubRepo extends GitHubRepo {
  commits_count?: number
}

const ITEMS_PER_PAGE = 12
const CHART_COLORS = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"]

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<ExtendedGitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filters
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("updated")
  const [visibility, setVisibility] = useState("all")
  const [language, setLanguage] = useState("")

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()

        const githubToken = await getGitHubToken()

        if (!githubToken) {
          setError("No GitHub token found. Please login again.")
          setLoading(false)
          return
        }

        const res = await fetch("https://api.github.com/user/repos?type=owner&per_page=100&sort=updated", {
          headers: {
            Authorization: `Bearer ${githubToken.token}`,
            Accept: "application/vnd.github+json",
          },
        })

        if (!res.ok) {
          throw new Error("Failed to fetch repositories")
        }

        let reposData: ExtendedGitHubRepo[] = await res.json()

        reposData = await Promise.all(
          reposData.map(async (repo) => {
            try {
              const commitsRes = await fetch(
                `https://api.github.com/repos/${repo.full_name || `${data.session?.user?.user_metadata?.user_name}/${repo.name}`}/commits?per_page=1`,
                {
                  headers: {
                    Authorization: `Bearer ${githubToken.token}`,
                    Accept: "application/vnd.github+json",
                  },
                },
              )
              const commitsLink = commitsRes.headers.get("link")
              const commitsMatch = commitsLink?.match(/&page=(\d+)>; rel="last"/)
              const commits_count = commitsMatch ? Number.parseInt(commitsMatch[1]) : 1
              return { ...repo, commits_count }
            } catch {
              return repo
            }
          }),
        )

        setRepos(reposData)
        setCurrentPage(1)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  // Extract unique languages
  const languages = useMemo(() => {
    return Array.from(new Set(repos.map((r) => r.language).filter(Boolean))) as string[]
  }, [repos])

  const calculateSearchScore = (repo: ExtendedGitHubRepo, query: string): number => {
    const q = query.toLowerCase()
    let score = 0

    if (repo.name.toLowerCase() === q) return 1000
    if (repo.name.toLowerCase().startsWith(q)) return 800
    if (repo.name.toLowerCase().includes(q)) score += 500

    if (repo.description?.toLowerCase().includes(q)) score += 300

    if (repo.topics?.some((t) => t.toLowerCase().includes(q))) score += 200

    if (repo.language?.toLowerCase().includes(q)) score += 100

    return score
  }

  // Filter and sort repos
  const filteredRepos = useMemo(() => {
    let filtered = repos.filter((repo) => {
      const matchesVisibility =
        visibility === "all" || (visibility === "public" && !repo.private) || (visibility === "private" && repo.private)
      const matchesLanguage = !language || repo.language === language

      return matchesVisibility && matchesLanguage
    })

    if (search.trim()) {
      filtered = filtered
        .map((repo) => ({
          repo,
          score: calculateSearchScore(repo, search),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ repo }) => repo)
    }

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "stars":
        filtered.sort((a, b) => b.stargazers_count - a.stargazers_count)
        break
      case "commits":
        filtered.sort((a, b) => (b.commits_count || 0) - (a.commits_count || 0))
        break
      case "size":
        filtered.sort((a, b) => b.size - a.size)
        break
      case "created":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "updated":
      default:
        filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    return filtered
  }, [repos, search, sortBy, visibility, language])

  const statistics = useMemo(() => {
    const totalRepos = repos.length
    const publicRepos = repos.filter((r) => !r.private).length
    const privateRepos = repos.filter((r) => r.private).length
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0)
    const totalIssues = repos.reduce((sum, r) => sum + r.open_issues_count, 0)
    const totalCommits = repos.reduce((sum, r) => sum + (r.commits_count || 0), 0)
    const avgCommits = totalRepos > 0 ? Math.round(totalCommits / totalRepos) : 0

    return { totalRepos, publicRepos, privateRepos, totalStars, totalForks, totalIssues, totalCommits, avgCommits }
  }, [repos])

  const languageData = useMemo(() => {
    const langCount = new Map<string, number>()
    repos.forEach((repo) => {
      if (repo.language) {
        langCount.set(repo.language, (langCount.get(repo.language) || 0) + 1)
      }
    })
    return Array.from(langCount.entries())
      .map(([lang, count]) => ({ name: lang, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [repos])

  const topReposByStars = useMemo(() => {
    return repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 8)
  }, [repos])

  // Pagination
  const totalPages = Math.ceil(filteredRepos.length / ITEMS_PER_PAGE)
  const paginatedRepos = filteredRepos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleReset = () => {
    setSearch("")
    setSortBy("updated")
    setVisibility("all")
    setLanguage("")
    setCurrentPage(1)
  }

  if (loading) return <Loader message="Fetching your repositories..." fullScreen />
  if (error) return <ErrorState message={error} fullScreen onRetry={() => window.location.reload()} />

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Github className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-balance">Your Repositories</h1>
              <p className="text-sm text-muted-foreground">Manage and explore your GitHub repositories</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Total Repositories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalRepos}</div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-foreground font-semibold">{statistics.publicRepos}</span> public,{" "}
                <span className="text-foreground font-semibold">{statistics.privateRepos}</span> private
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Stars className="h-4 w-4" />
                Total Stars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalStars}</div>
              <p className="text-xs text-muted-foreground mt-2">across all repositories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GitFork className="h-4 w-4" />
                Total Forks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalForks}</div>
              <p className="text-xs text-muted-foreground mt-2">repository forks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Commits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statistics.totalCommits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">{statistics.avgCommits} avg per repo</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Language Distribution */}
          {languageData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Language Distribution
                </CardTitle>
                <CardDescription>Top 5 programming languages used</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={languageData.reduce(
                    (acc, item, idx) => ({
                      ...acc,
                      [item.name]: { label: item.name, color: CHART_COLORS[idx % CHART_COLORS.length] },
                    }),
                    {},
                  )}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload?.[0]) {
                            const total = languageData.reduce((sum, item) => sum + item.value, 0)
                            const percentage = (((payload[0].value as number) / total) * 100).toFixed(1)
                            return (
                              <div className="rounded-lg border bg-card p-2 shadow-md">
                                <p className="text-xs font-semibold">{payload[0].name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {payload[0].value} repos ({percentage}%)
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Pie data={languageData} cx="50%" cy="50%" outerRadius={100} paddingAngle={2} dataKey="value">
                        {languageData.map((item, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartLegend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Repos by Stars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stars className="w-5 h-5" />
                Top Repositories by Stars
              </CardTitle>
              <CardDescription>Your most starred repositories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ stars: { label: "Stars", color: "var(--primary)" } }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topReposByStars}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="var(--primary)" style={{ fontSize: "12px" }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="var(--primary)"
                      style={{ fontSize: "11px" }}
                      width={95}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="rounded-lg border bg-card p-2 shadow-md">
                              <p className="text-xs font-semibold">{payload[0].payload.name}</p>
                              <p className="text-xs text-muted-foreground">{payload[0].value} stars</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="stargazers_count" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <RepoFilters
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          language={language}
          onLanguageChange={setLanguage}
          languages={languages}
          onReset={handleReset}
        />

        {/* Results info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{paginatedRepos.length}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredRepos.length}</span> repositories
          </p>
        </div>

        {/* Repository Grid */}
        {paginatedRepos.length === 0 ? (
          <EmptyState
            title="No repositories found"
            message={
              filteredRepos.length === 0
                ? "Try adjusting your filters or search criteria"
                : "No repositories to display"
            }
            icon={<Github className="h-12 w-12 text-muted-foreground" />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedRepos.map((repo) => (
              <RepoCard
                key={repo.id}
                name={repo.name}
                description={repo.description}
                url={repo.html_url}
                language={repo.language}
                stars={repo.stargazers_count}
                forks={repo.forks_count}
                watchers={repo.watchers_count}
                private={repo.private}
                updatedAt={repo.updated_at}
                size={repo.size}
                commits={repo.commits_count || 0}
                topics={repo.topics || []}
                issues={repo.open_issues_count}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1
                  const isNear = Math.abs(page - currentPage) <= 1
                  const isFirst = page === 1
                  const isLast = page === totalPages

                  if (!isNear && !isFirst && !isLast) return null

                  if (!isNear && (isFirst ? i < 2 : page > totalPages - 2)) {
                    if (i === 2 || (isLast && page > currentPage + 3)) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </main>
  )
}
