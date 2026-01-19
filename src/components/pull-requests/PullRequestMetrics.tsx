'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { GitPullRequest, CheckCircle2, Clock, GitMerge, TrendingUp, Calendar, RefreshCw, AlertCircle, Github, Activity, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getGitHubToken } from '@/lib/github/token'
import { Loader } from '../common/loader'
import { ErrorState } from '../common/error-state'

interface PullRequest {
  id: number
  number: number
  title: string
  state: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  additions: number
  deletions: number
  changed_files: number
  user: {
    login: string
  }
}

interface PRMetrics {
  totalPRs: number
  openPRs: number
  mergedPRs: number
  closedPRs: number
  avgMergeTime: number
  avgSize: number
  sizeDistribution: {
    small: number
    medium: number
    large: number
    xlarge: number
  }
  monthlyActivity: Array<{
    month: string
    opened: number
    merged: number
  }>
  mergeTimeDistribution: Array<{
    range: string
    count: number
  }>
  activityRadar: Array<{
    metric: string
    value: number
  }>
}

const SIZE_COLORS = {
  small: '#10b981',
  medium: '#3b82f6',
  large: '#f59e0b',
  xlarge: '#ef4444',
}

async function fetchPRMetrics(): Promise<PRMetrics> {
  const tokenData = await getGitHubToken()

  if (!tokenData) {
    throw new Error('No GitHub authentication found. Please login again.')
  }

  const { token, username } = tokenData

  const reposRes = await fetch(
    'https://api.github.com/user/repos?type=owner&per_page=100&sort=updated',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  )

  if (!reposRes.ok) {
    throw new Error('Failed to fetch repositories')
  }

  const repos = await reposRes.json()

  let allPRs: PullRequest[] = []

  await Promise.all(
    repos.slice(0, 20).map(async (repo: any) => {
      try {
        const prsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
            },
          }
        )

        if (prsRes.ok) {
          const prs = await prsRes.json()
          const userPRs = prs.filter((pr: PullRequest) => pr.user.login === username)
          
          const detailedPRs = await Promise.all(
            userPRs.map(async (pr: PullRequest) => {
              try {
                const detailRes = await fetch(
                  `https://api.github.com/repos/${repo.full_name}/pulls/${pr.number}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      Accept: 'application/vnd.github+json',
                    },
                  }
                )
                if (detailRes.ok) {
                  return await detailRes.json()
                }
                return pr
              } catch {
                return pr
              }
            })
          )
          
          allPRs = [...allPRs, ...detailedPRs]
        }
      } catch (err) {
        console.error(`Failed to fetch PRs for ${repo.name}:`, err)
      }
    })
  )

  const totalPRs = allPRs.length
  const openPRs = allPRs.filter((pr) => pr.state === 'open').length
  const mergedPRs = allPRs.filter((pr) => pr.merged_at !== null).length
  const closedPRs = allPRs.filter((pr) => pr.state === 'closed' && pr.merged_at === null).length

  const mergedPRsWithTime = allPRs.filter((pr) => pr.merged_at && pr.created_at)
  const totalMergeTime = mergedPRsWithTime.reduce((sum, pr) => {
    const created = new Date(pr.created_at).getTime()
    const merged = new Date(pr.merged_at!).getTime()
    return sum + (merged - created)
  }, 0)
  const avgMergeTime = mergedPRsWithTime.length > 0 
    ? totalMergeTime / mergedPRsWithTime.length / (1000 * 60 * 60)
    : 0

  const totalSize = allPRs.reduce((sum, pr) => {
    const additions = pr.additions || 0
    const deletions = pr.deletions || 0
    return sum + additions + deletions
  }, 0)
  const avgSize = totalPRs > 0 ? totalSize / totalPRs : 0

  const sizeDistribution = {
    small: 0,
    medium: 0,
    large: 0,
    xlarge: 0,
  }

  allPRs.forEach((pr) => {
    const additions = pr.additions || 0
    const deletions = pr.deletions || 0
    const size = additions + deletions
    if (size < 100) sizeDistribution.small++
    else if (size < 500) sizeDistribution.medium++
    else if (size < 1000) sizeDistribution.large++
    else sizeDistribution.xlarge++
  })

  const monthlyMap = new Map<string, { opened: number; merged: number }>()
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    monthlyMap.set(monthKey, { opened: 0, merged: 0 })
  }

  allPRs.forEach((pr) => {
    const created = new Date(pr.created_at)
    const monthKey = created.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    
    if (monthlyMap.has(monthKey)) {
      const month = monthlyMap.get(monthKey)!
      month.opened++
      if (pr.merged_at) {
        month.merged++
      }
    }
  })

  const monthlyActivity = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    opened: data.opened,
    merged: data.merged,
  }))

  // New: Merge time distribution
  const mergeTimeDistribution = [
    { range: '< 1 day', count: 0 },
    { range: '1-3 days', count: 0 },
    { range: '3-7 days', count: 0 },
    { range: '1-2 weeks', count: 0 },
    { range: '> 2 weeks', count: 0 },
  ]

  mergedPRsWithTime.forEach((pr) => {
    const created = new Date(pr.created_at).getTime()
    const merged = new Date(pr.merged_at!).getTime()
    const hours = (merged - created) / (1000 * 60 * 60)
    
    if (hours < 24) mergeTimeDistribution[0].count++
    else if (hours < 72) mergeTimeDistribution[1].count++
    else if (hours < 168) mergeTimeDistribution[2].count++
    else if (hours < 336) mergeTimeDistribution[3].count++
    else mergeTimeDistribution[4].count++
  })

  // New: Activity radar chart data
  const totalAdditions = allPRs.reduce((sum, pr) => sum + (pr.additions || 0), 0)
  const totalDeletions = allPRs.reduce((sum, pr) => sum + (pr.deletions || 0), 0)
  const totalFiles = allPRs.reduce((sum, pr) => sum + (pr.changed_files || 0), 0)
  
  const activityRadar = [
    { metric: 'Total PRs', value: Math.min(totalPRs / 10, 100) },
    { metric: 'Merge Rate', value: totalPRs > 0 ? (mergedPRs / totalPRs) * 100 : 0 },
    { metric: 'Activity', value: Math.min(monthlyActivity.reduce((sum, m) => sum + m.opened, 0) / 2, 100) },
    { metric: 'Code Volume', value: Math.min(avgSize / 10, 100) },
    { metric: 'Speed', value: avgMergeTime > 0 ? Math.max(0, 100 - (avgMergeTime / 24) * 10) : 0 },
  ]

  return {
    totalPRs,
    openPRs,
    mergedPRs,
    closedPRs,
    avgMergeTime,
    avgSize,
    sizeDistribution,
    monthlyActivity,
    mergeTimeDistribution,
    activityRadar,
  }
}

export default function PullRequestMetrics() {
  const { data: metrics, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['pr-metrics'],
    queryFn: fetchPRMetrics,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const formatMergeTime = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} min`
    if (hours < 24) return `${Math.round(hours)} hrs`
    const days = Math.round(hours / 24)
    return `${days} day${days > 1 ? 's' : ''}`
  }

  if (isLoading) {
    return <Loader message="Fetching your pull request metrics..." fullScreen />
  }

  if (error) {
    return <ErrorState message={(error as Error).message} fullScreen onRetry={() => refetch()} />
  }

  if (!metrics || metrics.totalPRs === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Pull Request Data</CardTitle>
          <CardDescription>No pull requests found in your repositories</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center">
            <GitPullRequest className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Create your first pull request to see metrics!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sizeData = [
    { name: 'Small (<100)', value: metrics.sizeDistribution.small, color: SIZE_COLORS.small },
    { name: 'Medium (100-500)', value: metrics.sizeDistribution.medium, color: SIZE_COLORS.medium },
    { name: 'Large (500-1000)', value: metrics.sizeDistribution.large, color: SIZE_COLORS.large },
    { name: 'XLarge (1000+)', value: metrics.sizeDistribution.xlarge, color: SIZE_COLORS.xlarge },
  ].filter((item) => item.value > 0)

  // Chart configs for shadcn
  const barChartConfig = {
    opened: { label: 'Opened', color: '#3b82f6' },
    merged: { label: 'Merged', color: '#10b981' },
  }

  const pieChartConfig = sizeData.reduce((config, item) => {
    config[item.name] = { label: item.name, color: item.color }
    return config
  }, {} as Record<string, { label: string; color: string }>)

  const mergeTimeConfig = {
    count: { label: 'PRs', color: 'hsl(var(--chart-1))' },
  }

  const radarConfig = {
    value: { label: 'Score', color: 'hsl(var(--chart-2))' },
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
              <h1 className="text-3xl font-bold text-balance">Pull Request Metrics</h1>
              <p className="text-sm text-muted-foreground">Comprehensive analytics for your pull requests</p>
            </div>
            <Button
              onClick={() => refetch()}
              disabled={isFetching}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>About Pull Request Metrics</AlertTitle>
            <AlertDescription>
              These metrics provide insights into your pull request activity, merge times, and code change patterns across your repositories.
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" />
                  Total PRs
                </CardDescription>
                <CardTitle className="text-3xl">{metrics.totalPRs}</CardTitle>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Merged PRs
                </CardDescription>
                <CardTitle className="text-3xl">{metrics.mergedPRs}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalPRs > 0 ? ((metrics.mergedPRs / metrics.totalPRs) * 100).toFixed(1) : 0}% merge rate
                </p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Avg Merge Time
                </CardDescription>
                <CardTitle className="text-3xl">{formatMergeTime(metrics.avgMergeTime)}</CardTitle>
                <p className="text-xs text-muted-foreground">From open to merge</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Avg PR Size
                </CardDescription>
                <CardTitle className="text-3xl">
                  {metrics.avgSize > 0 ? Math.round(metrics.avgSize) : 0}
                </CardTitle>
                <p className="text-xs text-muted-foreground">lines changed</p>
              </CardHeader>
            </Card>
          </div>

          {/* PR Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardDescription>Open PRs</CardDescription>
                <CardTitle className="text-2xl">{metrics.openPRs}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalPRs > 0 ? ((metrics.openPRs / metrics.totalPRs) * 100).toFixed(1) : 0}% of total
                </p>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardDescription>Merged PRs</CardDescription>
                <CardTitle className="text-2xl">{metrics.mergedPRs}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalPRs > 0 ? ((metrics.mergedPRs / metrics.totalPRs) * 100).toFixed(1) : 0}% of total
                </p>
              </CardHeader>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <CardDescription>Closed (Not Merged)</CardDescription>
                <CardTitle className="text-2xl">{metrics.closedPRs}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalPRs > 0 ? ((metrics.closedPRs / metrics.totalPRs) * 100).toFixed(1) : 0}% of total
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Activity Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Monthly PR Activity
                </CardTitle>
                <CardDescription>Pull requests opened and merged over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer config={barChartConfig} className="h-[300px] w-full">
                  <BarChart data={metrics.monthlyActivity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="opened"  fill="var(--primary)"  name="Opened" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="merged" fill="var(--color-merged)" name="Merged" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* PR Size Distribution - Pie Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5" />
                  PR Size Distribution
                </CardTitle>
                <CardDescription>Breakdown of pull request sizes by lines changed</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                  <PieChart>
                    <Pie
                      data={sizeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="var(--primary)" 
                      dataKey="value"
                    >
                      {sizeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* NEW: Merge Time Distribution */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Merge Time Distribution
                </CardTitle>
                <CardDescription>How quickly your PRs get merged</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer config={mergeTimeConfig} className="h-[300px] w-full">
                  <BarChart data={metrics.mergeTimeDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="range" tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* NEW: Activity Radar Chart */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  PR Activity Profile
                </CardTitle>
                <CardDescription>Overall performance metrics visualization</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer config={radarConfig} className="h-[300px] w-full">
                  <RadarChart data={metrics.activityRadar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Score" dataKey="value" stroke="var(--primary)"   fill="var(--primary)"  fillOpacity={0.6} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Size Breakdown Details */}
          <Card>
            <CardHeader>
              <CardTitle>PR Size Breakdown</CardTitle>
              <CardDescription>Detailed view of pull request size distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sizeData.map((item) => {
                  const percentage = (item.value / metrics.totalPRs) * 100
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.value}</p>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}