"use client"

import {
  GitFork,
  Star,
  Eye,
  Lock,
  Globe2,
  Calendar,
  HardDrive,
  GitCommit as GitCommit2,
  AlertCircle,
  Tag,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RepoCardProps {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  forks: number
  watchers: number
  private: boolean
  updatedAt: string
  size: number
  commits: number
  topics?: string[]
  issues: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return num.toString()
}

export function RepoCard({
  name,
  description,
  url,
  language,
  stars,
  forks,
  watchers,
  private: isPrivate,
  updatedAt,
  size,
  commits,
  topics = [],
  issues,
}: RepoCardProps) {
  const updatedDate = new Date(updatedAt)
  const daysAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <TooltipProvider>
      <Card className="flex flex-col p-4 transition-all hover:shadow-md">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline break-words"
          >
            {name}
          </a>
          <Badge variant={isPrivate ? "secondary" : "outline"} className="shrink-0">
            {isPrivate ? <Lock className="mr-1 h-3 w-3" /> : <Globe2 className="mr-1 h-3 w-3" />}
            {isPrivate ? "Private" : "Public"}
          </Badge>

                    {language && (
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          )}
          
        </div>

        {description ? (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic opacity-50 mb-2">No description</p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs shrink-0 cursor-help">
                <Star className="h-3 w-3" />
                {formatNumber(stars)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{stars} stargazers</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs shrink-0 cursor-help">
                <GitFork className="h-3 w-3" />
                {formatNumber(forks)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{forks} forks</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs shrink-0 cursor-help">
                <Eye className="h-3 w-3" />
                {formatNumber(watchers)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{watchers} watchers</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs shrink-0 cursor-help">
                <GitCommit2 className="h-3 w-3" />
                {formatNumber(commits)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{commits} total commits</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="gap-1 text-xs shrink-0 cursor-help">
                <HardDrive className="h-3 w-3" />
                {formatBytes(size)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Repository size</p>
            </TooltipContent>
          </Tooltip>

          {issues > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs shrink-0 cursor-help">
                  <AlertCircle className="h-3 w-3" />
                  {formatNumber(issues)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{issues} open issues</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 cursor-help">
                <Calendar className="h-3 w-3" />
                {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated: {updatedDate.toLocaleDateString()}</p>
            </TooltipContent>
          </Tooltip>
          <Button asChild variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs shrink-0">
            <a href={url} target="_blank" rel="noopener noreferrer">
              View GitHub
            </a>
          </Button>
        </div>
      </Card>
    </TooltipProvider>
  )
}
