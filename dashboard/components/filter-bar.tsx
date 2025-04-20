"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  domainFilter: string | null
  setDomainFilter: (domain: string | null) => void
  modeFilter: string | null
  setModeFilter: (mode: string | null) => void
  monthFilter: string | null
  setMonthFilter: (month: string | null) => void
  domains: string[]
  modes: string[]
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  domainFilter,
  setDomainFilter,
  modeFilter,
  setModeFilter,
  monthFilter,
  setMonthFilter,
  domains,
  modes,
}: FilterBarProps) {
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  // Predefined domain options
  const domainOptions = [
    "Machine Learning/AI",
    "Data Science",
    "General",
    "Healthcare",
    "Natural Language Processing",
    "Computer Vision",
    "Ethics",
    "Reinforcement Learning",
    "Finance",
    "Education",
    "Robotics",
  ]

  // Predefined mode options
  const modeOptions = ["Online", "Offline", "Hybrid"]

  // Combine predefined options with any unique values from the data
  const allDomains = [...new Set([...domainOptions, ...domains])].filter(Boolean)
  const allModes = modeOptions

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search events..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <Select value={domainFilter || ""} onValueChange={(value) => setDomainFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {allDomains.map((domain) => (
              <SelectItem key={domain} value={domain}>
                {domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={modeFilter || ""} onValueChange={(value) => setModeFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            {allModes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={monthFilter || ""} onValueChange={(value) => setMonthFilter(value === "all" ? null : value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
