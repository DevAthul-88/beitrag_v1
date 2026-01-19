"use client"

import type React from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  Activity,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  Code2,
  Zap,
  Calendar,
  Trophy,
  Building,
} from "lucide-react"
import { getGitHubToken } from "@/lib/github/token"

interface UserData {
  login: string
  public_repos: number
  followers: number
  following: number
  avatar_url: string
  bio?: string
  company?: string
}

interface Repository {
  id: number
  name: string
  full_name: string
  description?: string
  stargazers_count: number
  forks_count: number
  language?: string
  url: string
}

interface PullRequestData {
  total_count: number
  items: Array<{
    id: number
    title: string
    state: "open" | "closed"
    created_at: string
  }>
}

interface ActivityEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    commits?: Array<{ message: string }>
    action?: string
    ref_type?: string
    pull_request?: { title: string }
  }
}

async function fetchUserData(): Promise<UserData> {
  const tokenData = await getGitHubToken()
  if (!tokenData?.token) throw new Error("No GitHub token found")

  const response = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${tokenData.token}` },
  })

  if (!response.ok) throw new Error("Failed to fetch user data")
  return response.json()
}

async function fetchRepositories(): Promise<Repository[]> {
  const tokenData = await getGitHubToken()
  if (!tokenData?.token) throw new Error("No GitHub token found")

  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: { Authorization: `token ${tokenData.token}` },
  })

  if (!response.ok) throw new Error("Failed to fetch repositories")
  return response.json()
}

async function fetchRecentActivity(): Promise<ActivityEvent[]> {
  const tokenData = await getGitHubToken()
  if (!tokenData?.token) throw new Error("No GitHub token found")

  const userResponse = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${tokenData.token}` },
  })
  const user: UserData = await userResponse.json()

  const eventsResponse = await fetch(`https://api.github.com/users/${user.login}/events?per_page=20`, {
    headers: { Authorization: `token ${tokenData.token}` },
  })

  if (!eventsResponse.ok) throw new Error("Failed to fetch activity")
  return eventsResponse.json()
}

async function fetchPullRequests(): Promise<PullRequestData> {
  const tokenData = await getGitHubToken()
  if (!tokenData?.token) throw new Error("No GitHub token found")

  const response = await fetch("https://api.github.com/search/issues?q=is:pr+author:@me+is:open", {
    headers: { Authorization: `token ${tokenData.token}` },
  })

  if (!response.ok) throw new Error("Failed to fetch pull requests")
  return response.json()
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  description?: string
  isLoading: boolean
}

function StatCard({ title, value, icon: Icon, description, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  activity: ActivityEvent
}

function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityDetails = () => {
    const typeMap: Record<string, { icon: React.ComponentType<{ className?: string }>; message: string }> = {
      PushEvent: {
        icon: GitCommit,
        message: `Pushed ${activity.payload.commits?.length || 0} commit(s)`,
      },
      PullRequestEvent: {
        icon: GitPullRequest,
        message: `${activity.payload.action} pull request`,
      },
      CreateEvent: {
        icon: Activity,
        message: `Created ${activity.payload.ref_type}`,
      },
      IssuesEvent: {
        icon: Activity,
        message: `${activity.payload.action} issue`,
      },
    }

    return (
      typeMap[activity.type] || {
        icon: Activity,
        message: activity.type.replace("Event", ""),
      }
    )
  }

  const details = getActivityDetails()
  const Icon = details.icon
  const timeAgo = new Date(activity.created_at).toLocaleDateString()

  return (
    <div className="flex items-start space-x-3 py-3 border-b last:border-0">
      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-sm font-medium leading-none truncate">{details.message}</p>
        <p className="text-xs text-muted-foreground">
          {activity.repo.name} • {timeAgo}
        </p>
      </div>
    </div>
  )
}

interface LanguageStats {
  [key: string]: number
}

interface RepositoryDetails {
  total: number
  public: number
  private: number
  avgStars: number
}

interface UserHeaderProps {
  userData?: UserData
  isLoading: boolean
}

function UserHeader({ userData, isLoading }: UserHeaderProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userData) return null

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            {userData.avatar_url && (
              <img
                src={userData.avatar_url || "/placeholder.svg"}
                alt={userData.login}
                className="h-20 w-20 rounded-full border-2 border-primary/30"
              />
            )}
            <div className="space-y-1 flex-1">
              <h2 className="text-2xl font-bold leading-none">{userData.login}</h2>
              {userData.bio && <p className="text-sm text-muted-foreground">{userData.bio}</p>}
              {userData.company && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {userData.company}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface LanguageChartProps {
  repositories?: Repository[]
  isLoading: boolean
}

function LanguageChart({ repositories, isLoading }: LanguageChartProps) {
  const getLanguageStats = (): LanguageStats => {
    const stats: LanguageStats = {}
    repositories?.forEach((repo) => {
      if (repo.language) {
        stats[repo.language] = (stats[repo.language] || 0) + 1
      }
    })
    return stats
  }

  const languageStats = getLanguageStats()
  const topLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (topLanguages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Language Distribution
          </CardTitle>
          <CardDescription>Top languages in your repositories</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No language data available</p>
        </CardContent>
      </Card>
    )
  }

  const maxCount = Math.max(...topLanguages.map(([, count]) => count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Language Distribution
        </CardTitle>
        <CardDescription>Top languages in your repositories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topLanguages.map(([language, count]) => (
          <div key={language} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{language}</span>
              <span className="text-xs text-muted-foreground">{count} repos</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface RepositoryStatsProps {
  repositories?: Repository[]
  isLoading: boolean
}

function RepositoryStats({ repositories, isLoading }: RepositoryStatsProps) {
  const getStats = (): RepositoryDetails => {
    const stats = {
      total: repositories?.length || 0,
      public: repositories?.length || 0,
      private: 0,
      avgStars: 0,
    }

    if (repositories && repositories.length > 0) {
      const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)
      stats.avgStars = Math.round(totalStars / repositories.length)
    }

    return stats
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">Public and private</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-amber-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Stars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgStars}</div>
          <p className="text-xs text-muted-foreground mt-1">Per repository</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Public</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.public}</div>
          <p className="text-xs text-muted-foreground mt-1">Public repos</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Trending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-1">
            {repositories?.[0]?.stargazers_count || 0}
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Top repo stars</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Dashboard() {
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery<UserData>({
    queryKey: ["github-user"],
    queryFn: fetchUserData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const { data: repositories, isLoading: isLoadingRepos } = useQuery<Repository[]>({
    queryKey: ["github-repos"],
    queryFn: fetchRepositories,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const { data: activity, isLoading: isLoadingActivity } = useQuery<ActivityEvent[]>({
    queryKey: ["github-activity"],
    queryFn: fetchRecentActivity,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const { data: pullRequests, isLoading: isLoadingPRs } = useQuery<PullRequestData>({
    queryKey: ["github-prs"],
    queryFn: fetchPullRequests,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const isLoading = isLoadingUser || isLoadingRepos || isLoadingActivity || isLoadingPRs

  const totalStars = repositories?.reduce((sum, repo) => sum + repo.stargazers_count, 0) || 0
  const totalForks = repositories?.reduce((sum, repo) => sum + repo.forks_count, 0) || 0
  const openPRs = pullRequests?.total_count || 0

  const topRepos = repositories?.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 4) || []

  const recentCommits = Array.isArray(activity)
    ? activity
      .filter((e) => e.type === "PushEvent")
      .reduce(
        (sum, event) => sum + (event.payload?.commits?.length || 0),
        0
      )
    : 0;

  if (userError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to fetch GitHub data. Please check your authentication and try again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">GitHub Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into your GitHub activity, repositories, and contributions
          </p>
        </div>

        <UserHeader userData={userData} isLoading={isLoadingUser} />

        <RepositoryStats repositories={repositories} isLoading={isLoadingRepos} />

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Activity Metrics
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Public Repositories"
              value={userData?.public_repos || 0}
              icon={GitFork}
              description="Total public repos"
              isLoading={isLoadingUser}
            />
            <StatCard
              title="Open Pull Requests"
              value={openPRs}
              icon={GitPullRequest}
              description="Currently open"
              isLoading={isLoadingPRs}
            />
            <StatCard
              title="Recent Commits"
              value={recentCommits}
              icon={GitCommit}
              description="From recent activity"
              isLoading={isLoadingActivity}
            />
            <StatCard
              title="Followers"
              value={userData?.followers || 0}
              icon={Users}
              description="GitHub followers"
              isLoading={isLoadingUser}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LanguageChart repositories={repositories} isLoading={isLoadingRepos} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest GitHub events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3 py-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity && activity.length > 0 ? (
                <div>
                  {activity.slice(0, 6).map((event) => (
                    <ActivityItem key={event.id} activity={event} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Repositories
          </h2>
          <Card>
            <CardContent className="pt-6">
              {isLoadingRepos ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              ) : topRepos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {topRepos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all"
                    >
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {repo.name}
                        </h3>
                        {repo.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{repo.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-muted-foreground">{repo.language || "No language"}</span>
                          <div className="flex items-center gap-2">
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-sm font-semibold">{repo.stargazers_count}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No repositories found</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Stars</p>
                <p className="text-3xl font-bold">{totalStars}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Forks</p>
                <p className="text-3xl font-bold">{totalForks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Following</p>
                <p className="text-3xl font-bold">{userData?.following || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
