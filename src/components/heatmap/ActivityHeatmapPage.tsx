"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, Filter, RotateCcw, ChevronDown, TrendingUp, Zap, Target } from "lucide-react"
import { Loader } from "@/components/common/loader"
import { ErrorState } from "@/components/common/error-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import { getGitHubToken } from "@/lib/github/token"
import { GitHubCalendar } from "react-github-calendar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"

interface ContributionDay {
  date: string
  count: number
  level: number
  events: GitHubEvent[]
}

interface ContributionWeek {
  days: ContributionDay[]
}

interface GitHubEvent {
  type: string
  repo: { name: string }
  created_at: string
}

const CONTRIBUTION_LEVELS = [
  { level: 0, color: "bg-muted", label: "No contributions" },
  { level: 1, color: "bg-primary/20", label: "1-3 contributions" },
  { level: 2, color: "bg-primary/40", label: "4-6 contributions" },
  { level: 3, color: "bg-primary/60", label: "7-9 contributions" },
  { level: 4, color: "bg-primary", label: "10+ contributions" },
]

const getContributionLevel = (count: number): number => {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

const EVENT_TYPES = [
  { value: "all", label: "All Events" },
  { value: "PushEvent", label: "Pushes" },
  { value: "PullRequestEvent", label: "Pull Requests" },
  { value: "IssuesEvent", label: "Issues" },
  { value: "CreateEvent", label: "Creates" },
  { value: "DeleteEvent", label: "Deletes" },
  { value: "WatchEvent", label: "Stars" },
  { value: "ForkEvent", label: "Forks" },
  { value: "CommitCommentEvent", label: "Commit Comments" },
  { value: "IssueCommentEvent", label: "Issue Comments" },
]

async function fetchGitHubActivity() {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()

  const githubToken = await getGitHubToken()
  const username = data.session?.user?.user_metadata?.user_name

  if (!githubToken || !username) {
    throw new Error("No GitHub authentication found. Please login again.")
  }

  let allFetchedEvents: GitHubEvent[] = []
  for (let page = 1; page <= 3; page++) {
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${githubToken.token}`,
        Accept: "application/vnd.github+json",
      },
    })

    if (!eventsRes.ok) {
      throw new Error("Failed to fetch activity data")
    }

    const events = await eventsRes.json()
    if (events.length === 0) break
    allFetchedEvents = [...allFetchedEvents, ...events]
  }

  return { allFetchedEvents, username }
}

export default function ActivityHeatmapPage() {
  const [selectedYear, setSelectedYear] = useState<string>("current")
  const [eventTypeFilter, setEventTypeFilter] = useState("all")
  const [minContributions, setMinContributions] = useState("0")
  const [searchRepo, setSearchRepo] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ["github-activity"],
    queryFn: fetchGitHubActivity,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  })

  const allEvents = data?.allFetchedEvents || []
  const username = data?.username

  const getDateRange = (year: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (year === "current") {
      return {
        startDate: new Date(today.getFullYear(), 0, 1),
        endDate: today,
        label: `${today.getFullYear()}`,
      }
    }

    const selectedYearNum = Number.parseInt(year)
    return {
      startDate: new Date(selectedYearNum, 0, 1),
      endDate: new Date(selectedYearNum, 11, 31),
      label: year,
    }
  }

  const dateRange = getDateRange(selectedYear)

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const eventDate = new Date(event.created_at)

      if (eventDate < dateRange.startDate || eventDate > dateRange.endDate) {
        return false
      }

      if (eventTypeFilter !== "all" && event.type !== eventTypeFilter) {
        return false
      }

      if (searchRepo && !event.repo.name.toLowerCase().includes(searchRepo.toLowerCase())) {
        return false
      }

      return true
    })
  }, [allEvents, eventTypeFilter, searchRepo, dateRange])

  const { contributions, stats, chartData, heatmapData } = useMemo(() => {
    const weeks: ContributionWeek[] = []
    const contributionMap = new Map<string, GitHubEvent[]>()
    const dayStats: Map<string, number> = new Map()
    const typeStats: Map<string, number> = new Map()

    filteredEvents.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split("T")[0]
      if (!contributionMap.has(date)) {
        contributionMap.set(date, [])
      }
      contributionMap.get(date)!.push(event)
      dayStats.set(date, (dayStats.get(date) || 0) + 1)

      typeStats.set(event.type, (typeStats.get(event.type) || 0) + 1)
    })

    const currentDate = new Date(dateRange.startDate)
    const endDate = new Date(dateRange.endDate)

    const dayOfWeek = currentDate.getDay()
    currentDate.setDate(currentDate.getDate() - dayOfWeek)

    let currentWeek: ContributionDay[] = []

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const events = contributionMap.get(dateStr) || []
      const count = events.length
      const level = getContributionLevel(count)

      if (count >= Number.parseInt(minContributions)) {
        currentWeek.push({
          date: dateStr,
          count,
          level,
          events,
        })
      } else {
        currentWeek.push({
          date: dateStr,
          count: 0,
          level: 0,
          events: [],
        })
      }

      if (currentWeek.length === 7) {
        weeks.push({ days: currentWeek })
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push({ days: currentWeek })
    }

    const allDays = weeks.flatMap((w) => w.days)
    const total = allDays.reduce((sum, day) => sum + day.count, 0)

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].count > 0) {
        tempStreak++
        if (i === allDays.length - 1 || currentStreak > 0) {
          currentStreak = tempStreak
        }
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
        if (i === allDays.length - 1) {
          currentStreak = 0
        }
        tempStreak = 0
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    const chartDataArray = Array.from(dayStats.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-30) // Last 30 days
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        contributions: count,
      }))

    const dayOfWeekStats: Map<string, number> = new Map([
      ["Sunday", 0],
      ["Monday", 0],
      ["Tuesday", 0],
      ["Wednesday", 0],
      ["Thursday", 0],
      ["Friday", 0],
      ["Saturday", 0],
    ])

    filteredEvents.forEach((event) => {
      const dayName = new Date(event.created_at).toLocaleDateString("en-US", { weekday: "long" })
      dayOfWeekStats.set(dayName, (dayOfWeekStats.get(dayName) || 0) + 1)
    })

    const heatmapDataArray = Array.from(dayOfWeekStats.entries()).map(([day, count]) => ({
      day,
      count,
    }))

    const calculatedStats = {
      total,
      currentStreak,
      longestStreak,
      averagePerDay: allDays.length > 0 ? Number.parseFloat((total / allDays.length).toFixed(1)) : 0,
      mostActiveDay: heatmapDataArray.reduce((a, b) => (a.count > b.count ? a : b), heatmapDataArray[0])?.day || "N/A",
      uniqueRepos: new Set(filteredEvents.map((e) => e.repo.name)).size,
    }

    return { contributions: weeks, stats: calculatedStats, chartData: chartDataArray, heatmapData: heatmapDataArray }
  }, [filteredEvents, minContributions, dateRange])

  const handleReset = () => {
    setSelectedYear("current")
    setEventTypeFilter("all")
    setMinContributions("0")
    setSearchRepo("")
  }

  const availableYears = useMemo(() => {
    if (allEvents.length === 0) return []

    const years = new Set<number>()
    allEvents.forEach((event) => {
      years.add(new Date(event.created_at).getFullYear())
    })

    return Array.from(years).sort((a, b) => b - a)
  }, [allEvents])

  if (isLoading) return <Loader message="Loading your activity heatmap..." fullScreen />
  if (error)
    return (
      <ErrorState
        message={(error as Error).message || "Something went wrong"}
        fullScreen
        onRetry={() => window.location.reload()}
      />
    )

  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-balance">Activity Heatmap</h1>
              <p className="text-sm text-muted-foreground">
                Track your GitHub contributions over time with advanced analytics
              </p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle>Filters & Analytics</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-transparent">
                  <span>Filter Options</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger id="year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Year</SelectItem>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-type">Event Type</Label>
                    <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                      <SelectTrigger id="event-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-contributions">Min Contributions</Label>
                    <Select value={minContributions} onValueChange={setMinContributions}>
                      <SelectTrigger id="min-contributions">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No minimum</SelectItem>
                        <SelectItem value="1">At least 1</SelectItem>
                        <SelectItem value="3">At least 3</SelectItem>
                        <SelectItem value="5">At least 5</SelectItem>
                        <SelectItem value="10">At least 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="search-repo">Repository</Label>
                    <Input
                      id="search-repo"
                      placeholder="Search by name..."
                      value={searchRepo}
                      onChange={(e) => setSearchRepo(e.target.value)}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" /> Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">contributions</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Current
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">day streak</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" /> Longest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.longestStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">day streak</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averagePerDay}</div>
              <p className="text-xs text-muted-foreground mt-1">per day</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold truncate">{stats.mostActiveDay}</div>
              <p className="text-xs text-muted-foreground mt-1">of the week</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Repos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.uniqueRepos}</div>
              <p className="text-xs text-muted-foreground mt-1">repositories</p>
            </CardContent>
          </Card>
        </div>

        {/* GitHub Calendar Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Contribution Graph</CardTitle>
            <CardDescription>Visual heatmap for {dateRange.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {username && (
                <GitHubCalendar
                  username={username}
                  showWeekdayLabels
                  showTotalCount
                  showColorLegend
                  showMonthLabels
                  style={{ width: "100%" }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Last 30 days of contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                contributions: {
                  label: "Contributions",
                  color: "var(--primary)", // use ShadCN primary color variable directly
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value} contributions`}
                      />
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    stroke="var(--primary)" // ShadCN primary variable
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Day of Week Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Day of Week</CardTitle>
            <CardDescription>Which days are you most active?</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Contributions",
                  color: "var(--primary)", // ShadCN primary color
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value} contributions`}
                        label={(label: string) => label}
                      />
                    }
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Event Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Event Breakdown</CardTitle>
            <CardDescription>Contribution types for {dateRange.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {EVENT_TYPES.filter((t) => t.value !== "all").map((eventType) => {
                const count = filteredEvents.filter((e) => e.type === eventType.value).length
                if (count === 0) return null

                return (
                  <div
                    key={eventType.value}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <span className="text-sm font-medium">{eventType.label}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contribution Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
            <CardDescription>Understanding contribution levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5">
              {CONTRIBUTION_LEVELS.map((item) => (
                <div key={item.level} className="flex flex-col items-center gap-2">
                  <div className={`h-8 w-8 rounded ${item.color} border`} />
                  <p className="text-xs text-center text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
