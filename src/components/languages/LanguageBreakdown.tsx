"use client"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Code2, TrendingUp, RotateCw, PieChart, BarChart3, GitBranch, Zap, Award, GitFork } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getGitHubToken } from "@/lib/github/token"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart as RechartsPieChart, XAxis, YAxis } from "recharts"
import { ErrorState } from "../common/error-state"
import { Loader } from "../common/loader"

interface LanguageData {
  name: string
  bytes: number
  percentage: number
  color: string
}

interface Repository {
  name: string
  full_name: string
  languages_url: string
}

interface GitHubData {
  languages: LanguageData[]
  totalBytes: number
  repoCount: number
}

const LANGUAGE_COLORS: { [key: string]: string } = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
}

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || `hsl(${Math.random() * 360}, 70%, 50%)`
}

async function fetchGitHubLanguages(): Promise<GitHubData> {
  const tokenData = await getGitHubToken()

  if (!tokenData) {
    throw new Error("No GitHub authentication found. Please login again.")
  }

  const { token } = tokenData

  const response = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${token}`,
    },
  })

  const repos: Repository[] = await response.json()

  if (!Array.isArray(repos)) {
    throw new Error("GitHub repos response is not an array")
  }

  const languageMap: { [key: string]: number } = {}

  for (const repo of repos) {
    const languagesResponse = await fetch(repo.languages_url, {
      headers: {
        Authorization: `token ${token}`,
      },
    })

    const repoLanguages: { [key: string]: number } = await languagesResponse.json()

    for (const [language, bytes] of Object.entries(repoLanguages)) {
      languageMap[language] = (languageMap[language] || 0) + bytes
    }
  }

  const total = Object.values(languageMap).reduce((sum, bytes) => sum + bytes, 0)

  const languageData: LanguageData[] = Object.entries(languageMap).map(([name, bytes]) => ({
    name,
    bytes,
    percentage: (bytes / total) * 100,
    color: getLanguageColor(name),
  }))

  languageData.sort((a, b) => b.percentage - a.percentage)

  return {
    languages: languageData,
    totalBytes: total,
    repoCount: repos.length,
  }
}

export default function LanguageBreakdown() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["github-languages"],
    queryFn: fetchGitHubLanguages,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (isLoading) return <Loader/>
  if (error) return <ErrorState message={(error as Error).message} onRetry={() => refetch()} />

  const languages = data?.languages || []
  const totalBytes = data?.totalBytes || 0
  const repoCount = data?.repoCount || 0

  if (languages.length === 0) {
    return (
      <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Language Breakdown</h1>
                <p className="text-base text-muted-foreground">
                  Discover programming languages across your repositories
                </p>
              </div>
            </div>
          </div>
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No Language Data</CardTitle>
              <CardDescription>No programming languages found in your repositories</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[300px]">
              <div className="text-center">
                <Code2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Start coding to see your language breakdown!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const topLanguage = languages[0]
  const top10Languages = languages.slice(0, 10)
  const diversityScore = (languages.length / 20) * 100

  const barChartConfig = top10Languages.reduce(
    (config, lang) => {
      config[lang.name] = {
        label: lang.name,
        color: lang.color,
      }
      return config
    },
    {} as Record<string, { label: string; color: string }>,
  )

  const pieChartConfig = top10Languages.reduce(
    (config, lang) => {
      config[lang.name] = {
        label: lang.name,
        color: lang.color,
      }
      return config
    },
    {} as Record<string, { label: string; color: string }>,
  )

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Code2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Language Breakdown</h1>
                <p className="text-base text-muted-foreground">
                  Your programming language portfolio across all repositories
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
            className="gap-2 whitespace-nowrap"
          >
            <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Total Repositories</CardDescription>
                <GitFork className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">{repoCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Active repositories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Languages Used</CardDescription>
                <Code2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">{languages.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Distinct languages</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Total Code</CardDescription>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">{formatBytes(totalBytes)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Across all repositories</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Diversity Score</CardDescription>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold">{diversityScore.toFixed(0)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(diversityScore, 100)} className="h-1" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PieChart className="w-5 h-5 text-primary" />
              Language Distribution
            </CardTitle>
            <CardDescription>Top languages by code volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {top10Languages.map((lang) => (
                  <Badge
                    key={lang.name}
                    variant="secondary"
                    className="gap-2 px-3 py-1.5"
                    style={{
                      backgroundColor: `${lang.color}15`,
                      borderColor: lang.color,
                      color: lang.color,
                    }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lang.color }} />
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-xs opacity-75">{lang.percentage.toFixed(1)}%</span>
                  </Badge>
                ))}
              </div>
              <div className="h-10 w-full rounded-lg overflow-hidden flex shadow-sm">
                {languages.map((lang) => (
                  <div
                    key={lang.name}
                    className="h-full transition-all hover:brightness-110 hover:shadow-md group relative"
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: lang.color,
                    }}
                    title={`${lang.name}: ${lang.percentage.toFixed(2)}%`}
                  >
                    {lang.percentage > 5 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                        <span className="text-xs font-semibold text-white">{lang.percentage.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top 10 Languages by Volume
              </CardTitle>
              <CardDescription>Code size distribution (bytes)</CardDescription>
            </CardHeader>

            <CardContent>
              <ChartContainer
                config={barChartConfig}
                className="h-[350px] w-full"
                aria-label="Top 10 programming languages by code volume"
              >
                <BarChart
                  data={top10Languages}
                  margin={{ top: 16, right: 16, bottom: 0, left: 16 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />

                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    tickFormatter={formatBytes}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />

                  <ChartTooltip
                    cursor={{ fill: "hsl(var(--accent) / 0.08)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatBytes(value as number)}
                      />
                    }
                  />

                  <Bar
                    dataKey="bytes"
                    radius={[8, 8, 2, 2]}
                    animationDuration={600}
                  >
                    {top10Languages.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>


          {/* Pie Chart */}
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <GitBranch className="w-5 h-5 text-primary" />
                Language Portfolio
              </CardTitle>
              <CardDescription>Proportional code distribution</CardDescription>
            </CardHeader>

            <CardContent>
              <ChartContainer
                config={pieChartConfig}
                className="h-[350px] w-full"
                aria-label="Programming language distribution pie chart"
              >
                <RechartsPieChart>
                  <Pie
                    data={top10Languages}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="bytes"
                    labelLine={false}
                    isAnimationActive
                    animationDuration={600}
                    label={({ name, percent }) =>
                      percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : ""
                    }
                  >
                    {top10Languages.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="transition-opacity hover:opacity-80"
                      />
                    ))}
                  </Pie>

                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatBytes(value as number)}
                      />
                    }
                  />
                </RechartsPieChart>
              </ChartContainer>
            </CardContent>
          </Card>

        </div>

        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-primary" />
              Primary Language
            </CardTitle>
            <CardDescription>Your most-used programming language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0"
                style={{ backgroundColor: topLanguage.color }}
              >
                {topLanguage.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-2xl font-bold">{topLanguage.name}</h3>
                  <p className="text-sm text-muted-foreground">{topLanguage.percentage.toFixed(2)}% of total code</p>
                </div>
                <Progress value={topLanguage.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{formatBytes(topLanguage.bytes)} of code written</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All Languages</CardTitle>
            <CardDescription>Complete breakdown of all programming languages by usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languages.map((lang, index) => (
                <div
                  key={lang.name}
                  className="group space-y-2 rounded-lg border border-transparent transition-colors hover:border-border hover:bg-muted/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-semibold text-muted-foreground w-6 text-center flex-shrink-0">
                        #{index + 1}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="font-medium truncate">{lang.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-base">{lang.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(lang.bytes)}</p>
                    </div>
                  </div>
                  <Progress value={lang.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
