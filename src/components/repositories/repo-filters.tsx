"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RepoFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    sortBy: string
    onSortChange: (value: string) => void
    visibility: string
    onVisibilityChange: (value: string) => void
    language: string
    onLanguageChange: (value: string) => void
    languages: string[]
    onReset: () => void
}

export function RepoFilters({
    search,
    onSearchChange,
    sortBy,
    onSortChange,
    visibility,
    onVisibilityChange,
    language,
    onLanguageChange,
    languages,
    onReset,
}: RepoFiltersProps) {
    const hasFilters = search || sortBy !== "updated" || visibility !== "all" || language

    return (
        <TooltipProvider>
            <div className="space-y-3 rounded-lg border bg-card p-4">
                <h3 className="text-sm font-semibold">Filters & Sort</h3>

                <div className="grid gap-3 sm:grid-cols-[3fr_auto_auto_auto] sm:gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Input
                                placeholder="Search by name, description, topics..."
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Search across repository name, description, and topics</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Select value={sortBy} onValueChange={onSortChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="updated">Recently Updated</SelectItem>
                                    <SelectItem value="name">Name (A-Z)</SelectItem>
                                    <SelectItem value="stars">Most Stars</SelectItem>
                                    <SelectItem value="commits">Most Commits</SelectItem>
                                    <SelectItem value="size">Largest Size</SelectItem>
                                    <SelectItem value="created">Recently Created</SelectItem>
                                </SelectContent>
                            </Select>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Sort repositories by various metrics</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Select value={visibility} onValueChange={onVisibilityChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Filter by repository visibility</p>
                        </TooltipContent>
                    </Tooltip>

                    {languages.length > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Select value={language} onValueChange={onLanguageChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Languages</SelectItem>
                                        {languages.map((lang) => (
                                            <SelectItem key={lang} value={lang}>
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Filter repositories by programming language</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>


                {hasFilters && (
                    <Button onClick={onReset} variant="outline" size="sm" className="gap-2 w-full sm:w-auto bg-transparent">
                        <X className="h-4 w-4" />
                        Clear filters
                    </Button>
                )}
            </div>
        </TooltipProvider>
    )
}
