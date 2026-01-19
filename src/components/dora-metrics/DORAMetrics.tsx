"use client"

import { useEffect, useState } from "react"
import { getGitHubToken } from "@/lib/github/token"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Rocket, Clock, TrendingUp, AlertCircle, CheckCircle2, Zap, RefreshCw, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loader } from "../common/loader"
import { ErrorState } from "../common/error-state"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface Deployment {
  date: string
  count: number
}

interface DORAMetricsData {
  deploymentFrequency: {
    daily: number
    weekly: number
    monthly: number
    rating: "Elite" | "High" | "Medium" | "Low"
    trend: Deployment[]
  }
  leadTimeForChanges: {
    avgHours: number
    median: number
    rating: "Elite" | "High" | "Medium" | "Low"
    distribution: Array<{ range: string; count: number }>
  }
  changeFailureRate: {
    percentage: number
    rating: "Elite" | "High" | "Medium" | "Low"
  }
  totalDeployments: number
  totalPRs: number
  avgCommitsPerPR: number
}

const RATING_COLORS = {
  Elite: "#10b981",
  High: "#3b82f6",
  Medium: "#f59e0b",
  Low: "#ef4444",
}

const RATING_BADGES = {
  Elite: "bg-green-100 text-green-800 border-green-200",
  High: "bg-blue-100 text-blue-800 border-blue-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Low: "bg-red-100 text-red-800 border-red-200",
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function DORAMetrics() {
  const [metrics, setMetrics] = useState<DORAMetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDORAMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const tokenData = await getGitHubToken()

      if (!tokenData) {
        setError("No GitHub authentication found. Please login again.")
        setLoading(false)
        return
      }

      const { token, username } = tokenData

      // Fetch user's repositories
      const reposRes = await fetch("https://api.github.com/user/repos?type=owner&per_page=100&sort=updated", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      })

      if (!reposRes.ok) {
        throw new Error("Failed to fetch repositories")
      }

      const repos = await reposRes.json()

      // Fetch all merged PRs (as proxy for deployments)
      let allPRs: any[] = []
      let allCommits: any[] = []

      await Promise.all(
        repos.slice(0, 20).map(async (repo: any) => {
          try {
            // Fetch merged PRs
            const prsRes = await fetch(
              `https://api.github.com/repos/${repo.full_name}/pulls?state=closed&per_page=100`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github+json",
                },
              },
            )

            if (prsRes.ok) {
              const prs = await prsRes.json()
              const userMergedPRs = prs.filter((pr: any) => pr.user.login === username && pr.merged_at)

              // Fetch detailed PR info for lead time calculation
              const detailedPRs = await Promise.all(
                userMergedPRs.slice(0, 50).map(async (pr: any) => {
                  try {
                    const detailRes = await fetch(`https://api.github.com/repos/${repo.full_name}/pulls/${pr.number}`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/vnd.github+json",
                      },
                    })
                    if (detailRes.ok) {
                      const detail = await detailRes.json()
                      return {
                        ...detail,
                        repo_name: repo.name,
                      }
                    }
                    return pr
                  } catch {
                    return pr
                  }
                }),
              )

              allPRs = [...allPRs, ...detailedPRs]
            }

            // Fetch recent commits for deployment frequency
            const commitsRes = await fetch(
              `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&per_page=100`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github+json",
                },
              },
            )

            if (commitsRes.ok) {
              const commits = await commitsRes.json()
              allCommits = [...allCommits, ...commits]
            }
          } catch (err) {
            console.error(`Failed to fetch data for ${repo.name}:`, err)
          }
        }),
      )

      // Calculate Deployment Frequency
      const now = new Date()
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const deploymentsLast30Days = allPRs.filter((pr) => new Date(pr.merged_at) >= last30Days).length

      const deploymentsLast7Days = allPRs.filter((pr) => new Date(pr.merged_at) >= last7Days).length

      const dailyDeployments = deploymentsLast7Days / 7
      const weeklyDeployments = deploymentsLast30Days / 4.3
      const monthlyDeployments = deploymentsLast30Days

      let deploymentRating: "Elite" | "High" | "Medium" | "Low"
      if (dailyDeployments >= 1) deploymentRating = "Elite"
      else if (weeklyDeployments >= 1) deploymentRating = "High"
      else if (monthlyDeployments >= 1) deploymentRating = "Medium"
      else deploymentRating = "Low"

      // Calculate deployment trend (last 12 weeks)
      const deploymentTrend: Deployment[] = []
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        const weekLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })

        const count = allPRs.filter((pr) => {
          const mergedDate = new Date(pr.merged_at)
          return mergedDate >= weekStart && mergedDate < weekEnd
        }).length

        deploymentTrend.push({ date: weekLabel, count })
      }

      // Calculate Lead Time for Changes
      const leadTimes = allPRs
        .filter((pr) => pr.created_at && pr.merged_at)
        .map((pr) => {
          const created = new Date(pr.created_at).getTime()
          const merged = new Date(pr.merged_at).getTime()
          return (merged - created) / (1000 * 60 * 60) // Convert to hours
        })

      const avgLeadTime = leadTimes.length > 0 ? leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length : 0

      const sortedLeadTimes = [...leadTimes].sort((a, b) => a - b)
      const medianLeadTime = sortedLeadTimes.length > 0 ? sortedLeadTimes[Math.floor(sortedLeadTimes.length / 2)] : 0

      let leadTimeRating: "Elite" | "High" | "Medium" | "Low"
      if (avgLeadTime < 24) leadTimeRating = "Elite"
      else if (avgLeadTime < 168) leadTimeRating = "High"
      else if (avgLeadTime < 720) leadTimeRating = "Medium"
      else leadTimeRating = "Low"

      // Lead time distribution
      const leadTimeDistribution = [
        { range: "< 1 day", count: leadTimes.filter((t) => t < 24).length },
        { range: "1-7 days", count: leadTimes.filter((t) => t >= 24 && t < 168).length },
        { range: "1-4 weeks", count: leadTimes.filter((t) => t >= 168 && t < 672).length },
        { range: "> 4 weeks", count: leadTimes.filter((t) => t >= 672).length },
      ]

      // Calculate Change Failure Rate (PRs closed without merging)
      const allUserPRs = allPRs.length
      const failedPRs = allPRs.filter((pr) => pr.state === "closed" && !pr.merged_at).length
      const changeFailureRate = allUserPRs > 0 ? (failedPRs / allUserPRs) * 100 : 0

      let failureRating: "Elite" | "High" | "Medium" | "Low"
      if (changeFailureRate < 5) failureRating = "Elite"
      else if (changeFailureRate < 10) failureRating = "High"
      else if (changeFailureRate < 15) failureRating = "Medium"
      else failureRating = "Low"

      // Calculate avg commits per PR
      const totalCommits = allPRs.reduce((sum, pr) => sum + (pr.commits || 0), 0)
      const avgCommitsPerPR = allPRs.length > 0 ? totalCommits / allPRs.length : 0

      setMetrics({
        deploymentFrequency: {
          daily: dailyDeployments,
          weekly: weeklyDeployments,
          monthly: monthlyDeployments,
          rating: deploymentRating,
          trend: deploymentTrend,
        },
        leadTimeForChanges: {
          avgHours: avgLeadTime,
          median: medianLeadTime,
          rating: leadTimeRating,
          distribution: leadTimeDistribution,
        },
        changeFailureRate: {
          percentage: changeFailureRate,
          rating: failureRating,
        },
        totalDeployments: allPRs.length,
        totalPRs: allPRs.length,
        avgCommitsPerPR,
      })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      console.error("Error fetching DORA metrics:", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDORAMetrics()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDORAMetrics()
  }

  const formatLeadTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} min`
    if (hours < 24) return `${Math.round(hours)} hrs`
    const days = Math.round(hours / 24)
    return `${days} day${days > 1 ? "s" : ""}`
  }

  if (loading) {
    return <Loader />
  }

  if (error) {
    return <ErrorState message={error} fullScreen onRetry={() => window.location.reload()} />
  }

  if (!metrics || metrics.totalDeployments === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No DORA Metrics Data</CardTitle>
          <CardDescription>No deployments or pull requests found to calculate metrics</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <Rocket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start merging pull requests to see your DORA metrics!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Github className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-balance">DORA Metrics</h1>
              <p className="text-sm text-muted-foreground">DevOps Research and Assessment performance metrics</p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Metrics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Frequency */}
            <Card
              className="border-2 border-l-4"
              style={{
                borderColor: RATING_COLORS[metrics.deploymentFrequency.rating],
                borderLeftColor: RATING_COLORS[metrics.deploymentFrequency.rating],
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Deployment Frequency
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${RATING_BADGES[metrics.deploymentFrequency.rating]}`}
                  >
                    {metrics.deploymentFrequency.rating}
                  </span>
                </div>
                <CardDescription>How often you deploy to production</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Daily</p>
                    <p className="text-2xl font-bold">{metrics.deploymentFrequency.daily.toFixed(1)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Weekly</p>
                    <p className="text-2xl font-bold">{metrics.deploymentFrequency.weekly.toFixed(1)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Monthly</p>
                    <p className="text-2xl font-bold">{metrics.deploymentFrequency.monthly.toFixed(0)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Benchmark Targets</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>Elite: Multiple per day</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${metrics.deploymentFrequency.rating === "Elite" ? "text-green-600" : "text-muted-foreground/40"}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>High: Once per week</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${metrics.deploymentFrequency.rating === "High" ? "text-blue-600" : "text-muted-foreground/40"}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Medium: Once per month</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${metrics.deploymentFrequency.rating === "Medium" ? "text-yellow-600" : "text-muted-foreground/40"}`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lead Time for Changes */}
            <Card
              className="border-2 border-l-4"
              style={{
                borderColor: RATING_COLORS[metrics.leadTimeForChanges.rating],
                borderLeftColor: RATING_COLORS[metrics.leadTimeForChanges.rating],
              }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Lead Time for Changes
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${RATING_BADGES[metrics.leadTimeForChanges.rating]}`}
                  >
                    {metrics.leadTimeForChanges.rating}
                  </span>
                </div>
                <CardDescription>Time from commit to production</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{formatLeadTime(metrics.leadTimeForChanges.avgHours)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Median</p>
                    <p className="text-2xl font-bold">{formatLeadTime(metrics.leadTimeForChanges.median)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Benchmark Targets</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>Elite: Less than 1 day</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${metrics.leadTimeForChanges.rating === "Elite" ? "text-green-600" : "text-muted-foreground/40"}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>High: 1-7 days</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${metrics.leadTimeForChanges.rating === "High" ? "text-blue-600" : "text-muted-foreground/40"}`}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Medium: 1-4 weeks</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${metrics.leadTimeForChanges.rating === "Medium" ? "text-yellow-600" : "text-muted-foreground/40"}`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deployment Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Deployment Trend
                </CardTitle>
                <CardDescription>Last 12 weeks of deployment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Deployments",
                      color: "var(--primary)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.deploymentFrequency.trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border border-border rounded p-2 text-sm">
                                <p className="font-semibold">{payload[0].payload.date}</p>
                                <p className="text-muted-foreground">
                                  {payload[0].payload.count} deployment{payload[0].payload.count !== 1 ? "s" : ""}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="var(--primary)" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Lead Time Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Lead Time Distribution
                </CardTitle>
                <CardDescription>PR resolution time breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Number of PRs",
                      color: "var(--primary)",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.leadTimeForChanges.distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border border-border rounded p-2 text-sm">
                                <p className="font-semibold">{payload[0].payload.range}</p>
                                <p className="text-muted-foreground">{payload[0].payload.count} PRs</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="count" fill="var(--primary)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Change Failure Rate Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Change Failure Rate
              </CardTitle>
              <CardDescription>Percentage of PRs that were closed without merging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="lg:col-span-2">
                  <ChartContainer
                    config={{
                      succeeded: {
                        label: "Successful Merges",
                        color: "#4ade80",
                      },
                      failed: {
                        label: "Failed / Closed PRs",
                        color: "#f87171",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          dataKey="value"
                          data={[
                            {
                              name: "Successful Merges",
                              value: 100 - metrics.changeFailureRate.percentage,
                              fill: "#4ade80",
                            },
                            {
                              name: "Failed / Closed PRs",
                              value: metrics.changeFailureRate.percentage,
                              fill: "#f87171",
                            },
                          ]}

                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
                          outerRadius={80}
                        >
                          <Cell fill="#4ade80" /> {/* Green for success */}
                          <Cell fill="#f87171" /> {/* Red for failure */}

                        </Pie>
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background border border-border rounded p-2 text-sm">
                                  <p className="font-semibold">{payload[0].name}</p>
                                  <p className="text-muted-foreground">
                                    {typeof payload?.[0]?.value === "number" ? payload[0].value.toFixed(1) : payload?.[0]?.value || 0}%
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Stats */}
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Failure Rate</p>
                    <p className="text-4xl font-bold">{metrics.changeFailureRate.percentage.toFixed(1)}%</p>
                  </div>
                  <div
                    className="p-4 rounded-lg border-l-4"
                    style={{
                      borderColor: RATING_COLORS[metrics.changeFailureRate.rating],
                      backgroundColor: RATING_COLORS[metrics.changeFailureRate.rating] + "15",
                    }}
                  >
                    <p className="text-sm font-semibold mb-2">Performance Level</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border inline-block ${RATING_BADGES[metrics.changeFailureRate.rating]}`}
                    >
                      {metrics.changeFailureRate.rating}
                    </span>
                  </div>
                  <div className="pt-4 border-t space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Elite Target</p>
                    <p className="text-sm">Less than 5% failure rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Total Deployments
                </CardDescription>
                <CardTitle className="text-3xl">{metrics.totalDeployments}</CardTitle>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Avg Commits per PR
                </CardDescription>
                <CardTitle className="text-3xl">{metrics.avgCommitsPerPR.toFixed(1)}</CardTitle>
                <p className="text-xs text-muted-foreground">Commits per merge</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Total PRs Analyzed
                </CardDescription>
                <CardTitle className="text-3xl">{metrics.totalPRs}</CardTitle>
                <p className="text-xs text-muted-foreground">Pull requests</p>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
