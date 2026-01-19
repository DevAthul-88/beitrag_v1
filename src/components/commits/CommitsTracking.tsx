"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader } from "@/components/common/loader"
import { getGitHubToken } from "@/lib/github/token"
import { RotateCw, Code2, TrendingUp, BarChart3, PieChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Pie,
  PieChart as RechartsPieChart,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Repository {
  name: string
  full_name: string
  commits_url: string
}

interface CommitData {
  repo: string
  totalCommits: number
}

interface GitHubCommitsData {
  commits: CommitData[]
  totalCommits: number
  repoCount: number
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{message}</span>
            <Button onClick={onRetry} variant="outline" size="sm">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )
}

async function fetchGitHubCommits(): Promise<GitHubCommitsData> {
  const tokenData = await getGitHubToken()
  if (!tokenData) throw new Error("No GitHub authentication found. Please login again.")

  const { token } = tokenData

  // Fetch repos
  const reposRes = await fetch("https://api.github.com/user/repos", {
    headers: { Authorization: `token ${token}` },
  })
  const repos: Repository[] = await reposRes.json()
  if (!Array.isArray(repos)) throw new Error("GitHub repos response is not an array")

  const commitsData: CommitData[] = []

  // Fetch commits count per repo
  for (const repo of repos) {
    const commitsRes = await fetch(`${repo.commits_url.replace("{/sha}", "")}?per_page=1`, {
      headers: { Authorization: `token ${token}` },
    })
    const linkHeader = commitsRes.headers.get("Link")
    let totalCommits = 0

    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/)
      totalCommits = match ? Number.parseInt(match[1], 10) : 1
    } else {
      const commits = await commitsRes.json()
      totalCommits = Array.isArray(commits) ? commits.length : 0
    }

    commitsData.push({ repo: repo.name, totalCommits })
  }

  const totalCommits = commitsData.reduce((sum, c) => sum + c.totalCommits, 0)

  return {
    commits: commitsData.sort((a, b) => b.totalCommits - a.totalCommits),
    totalCommits,
    repoCount: repos.length,
  }
}

export default function CommitsTracking() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["github-commits"],
    queryFn: fetchGitHubCommits,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  if (isLoading) return <Loader />
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  const commits = data?.commits || []
  const totalCommits = data?.totalCommits || 0
  const repoCount = data?.repoCount || 0
  const topRepo = commits[0]
  const averageCommits = totalCommits > 0 ? Math.round(totalCommits / repoCount) : 0

  const pieData = commits.slice(0, 5).map((repo) => ({
    name: repo.repo,
    value: repo.totalCommits,
  }))

  const chartColors = ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"]

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Code2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Commits Tracking</h1>
              <p className="text-sm text-muted-foreground">Monitor commits across your repositories</p>
            </div>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching} className="gap-2 w-fit">
            <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Repositories</CardDescription>
              <CardTitle className="text-3xl font-bold">{repoCount}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">repositories tracked</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Commits</CardDescription>
              <CardTitle className="text-3xl font-bold">{totalCommits.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">all time commits</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Average Commits</CardDescription>
              <CardTitle className="text-3xl font-bold">{averageCommits}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">per repository</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Most Active Repo</CardDescription>
              <CardTitle className="text-lg font-bold truncate">{topRepo?.repo || "-"}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{topRepo?.totalCommits || 0} commits</p>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Top 10 Repositories by Commits
            </CardTitle>
            <CardDescription>Visual comparison of commit counts across your most active repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                commits: {
                  label: "Commits",
                  color: "var(--primary)",
                },
              }}
              className="h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commits.slice(0, 10)} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="repo" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="totalCommits" radius={[8, 8, 0, 0]} fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Repository Distribution (Top 5)
            </CardTitle>
            <CardDescription>Percentage distribution of commits in your top 5 active repositories</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer
              config={{
                commits: {
                  label: "Commits",
                },
              }}
              className="h-[350px] w-full flex items-center justify-center"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="40%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        const percentage = ((data.value / totalCommits) * 100).toFixed(1)
                        return (
                          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-foreground">{data.name}</p>
                            <p className="text-sm text-muted-foreground">{data.value} commits</p>
                            <p className="text-sm font-medium text-chart-1">{percentage}% of total</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                    formatter={(value, entry) => {
                      const data = entry.payload as any
                      const percentage = ((data.value / totalCommits) * 100).toFixed(1)
                      return (
                        <span className="text-sm text-foreground">
                          {data.name}: {data.value} ({percentage}%)
                        </span>
                      )
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repository Commits Details</CardTitle>
            <CardDescription>Detailed breakdown of all repositories ranked by commit count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commits.map((repo, idx) => {
                const percentage = topRepo ? (repo.totalCommits / topRepo.totalCommits) * 100 : 0
                return (
                  <div key={repo.repo} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-muted-foreground text-sm font-mono w-6">#{idx + 1}</span>
                        <span className="font-medium flex-1">{repo.repo}</span>
                        <Badge variant={percentage === 100 ? "default" : "secondary"}>
                          {repo.totalCommits} commits
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Repository
            </CardTitle>
            <CardDescription>Your most active repository with detailed metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {topRepo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-chart-1 text-white flex items-center justify-center font-bold text-2xl">
                    {topRepo.repo.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{topRepo.repo}</h3>
                    <p className="text-muted-foreground mt-1">{topRepo.totalCommits} total commits</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {((topRepo.totalCommits / totalCommits) * 100).toFixed(1)}% of all commits
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
