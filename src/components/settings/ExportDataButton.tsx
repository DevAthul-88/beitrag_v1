"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getGitHubToken } from "@/lib/github/token"
import { createClient } from "@/lib/supabase/client"
import toast from "react-hot-toast"

interface CommitData {
  sha: string
  message: string
  date: string
  author: string
}

interface PRData {
  number: number
  title: string
  state: string
  created_at: string
  merged_at: string | null
  additions: number
  deletions: number
}

interface RepoData {
  name: string
  full_name: string
  language: string
  stars: number
  forks: number
  commits_count: number
}

export default function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false)

  const fetchAllCommits = async (token: string, username: string) => {
    const commits: CommitData[] = []
    
    // Get user repos
    const reposRes = await fetch("https://api.github.com/user/repos?type=owner&per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    })
    
    if (!reposRes.ok) throw new Error("Failed to fetch repositories")
    const repos = await reposRes.json()

    // Fetch commits from each repo
    for (const repo of repos.slice(0, 10)) { // Limit to 10 repos to avoid rate limiting
      try {
        const commitsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?author=${username}&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        )
        
        if (commitsRes.ok) {
          const repoCommits = await commitsRes.json()
          repoCommits.forEach((commit: any) => {
            commits.push({
              sha: commit.sha,
              message: commit.commit.message.split('\n')[0], // First line only
              date: commit.commit.author.date,
              author: commit.commit.author.name,
            })
          })
        }
      } catch (err) {
        console.error(`Failed to fetch commits for ${repo.name}:`, err)
      }
    }

    return commits
  }

  const fetchAllPullRequests = async (token: string, username: string) => {
    const prs: PRData[] = []
    
    const reposRes = await fetch("https://api.github.com/user/repos?type=owner&per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    })
    
    if (!reposRes.ok) throw new Error("Failed to fetch repositories")
    const repos = await reposRes.json()

    for (const repo of repos.slice(0, 10)) {
      try {
        const prsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        )
        
        if (prsRes.ok) {
          const repoPRs = await prsRes.json()
          repoPRs.forEach((pr: any) => {
            prs.push({
              number: pr.number,
              title: pr.title,
              state: pr.state,
              created_at: pr.created_at,
              merged_at: pr.merged_at,
              additions: pr.additions || 0,
              deletions: pr.deletions || 0,
            })
          })
        }
      } catch (err) {
        console.error(`Failed to fetch PRs for ${repo.name}:`, err)
      }
    }

    return prs
  }

  const fetchRepositories = async (token: string) => {
    const repos: RepoData[] = []
    
    const reposRes = await fetch("https://api.github.com/user/repos?type=owner&per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    })
    
    if (!reposRes.ok) throw new Error("Failed to fetch repositories")
    const reposData = await reposRes.json()

    for (const repo of reposData) {
      try {
        // Get commit count
        const commitsRes = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        )
        
        const commitsLink = commitsRes.headers.get("link")
        const commitsMatch = commitsLink?.match(/&page=(\d+)>; rel="last"/)
        const commits_count = commitsMatch ? parseInt(commitsMatch[1]) : 1

        repos.push({
          name: repo.name,
          full_name: repo.full_name,
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          commits_count,
        })
      } catch (err) {
        repos.push({
          name: repo.name,
          full_name: repo.full_name,
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          commits_count: 0,
        })
      }
    }

    return repos
  }

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvRows = []
    csvRows.push(headers.join(','))
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        const escaped = ('' + value).replace(/"/g, '\\"')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }
    
    return csvRows.join('\n')
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportData = async () => {
    setIsExporting(true)
    
    try {
      const tokenData = await getGitHubToken()
      
      if (!tokenData) {
        toast.error('No GitHub token found. Please reconnect your account.')
        return
      }

      const { token, username } = tokenData

      toast.loading('Fetching your GitHub data...', { id: 'export' })

      // Fetch all data
      const [commits, pullRequests, repositories] = await Promise.all([
        fetchAllCommits(token, username),
        fetchAllPullRequests(token, username),
        fetchRepositories(token),
      ])

      // Generate CSVs
      const commitsCSV = convertToCSV(commits, ['sha', 'message', 'date', 'author'])
      const prsCSV = convertToCSV(pullRequests, ['number', 'title', 'state', 'created_at', 'merged_at', 'additions', 'deletions'])
      const reposCSV = convertToCSV(repositories, ['name', 'full_name', 'language', 'stars', 'forks', 'commits_count'])

      // Download files
      const timestamp = new Date().toISOString().split('T')[0]
      downloadCSV(commitsCSV, `beitrag-commits-${timestamp}.csv`)
      downloadCSV(prsCSV, `beitrag-pull-requests-${timestamp}.csv`)
      downloadCSV(reposCSV, `beitrag-repositories-${timestamp}.csv`)

      toast.success(`Exported ${commits.length} commits, ${pullRequests.length} PRs, and ${repositories.length} repos!`, { id: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data. Please try again.', { id: 'export' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      onClick={handleExportData} 
      disabled={isExporting} 
      variant="outline" 
      className="w-full"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Export Data to CSV
        </>
      )}
    </Button>
  )
}