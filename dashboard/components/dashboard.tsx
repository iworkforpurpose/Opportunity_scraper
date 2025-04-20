"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeProvider } from "@/components/theme-provider"
import { Calendar, Star } from "lucide-react"
import Papa from "papaparse"
import { ThemeToggle } from "@/components/theme-toggle"
import EventGrid from "@/components/event-grid"
import FilterBar from "@/components/filter-bar"

// Define event types
export type Hackathon = {
  name: string
  deadline: string
  domain: string
  mode: string
  prize: string
  link: string
}

export type Conference = {
  name: string
  startDate: string
  domain: string
  mode: string
  link: string
}

export default function Dashboard() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [conferences, setConferences] = useState<Conference[]>([])
  const [filteredHackathons, setFilteredHackathons] = useState<Hackathon[]>([])
  const [filteredConferences, setFilteredConferences] = useState<Conference[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [domainFilter, setDomainFilter] = useState<string | null>(null)
  const [modeFilter, setModeFilter] = useState<string | null>(null)
  const [monthFilter, setMonthFilter] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [favorites, setFavorites] = useState<{
    hackathons: string[]
    conferences: string[]
  }>(() => {
    // Load favorites from localStorage if available
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("aiEventsFavorites")
      return savedFavorites ? JSON.parse(savedFavorites) : { hackathons: [], conferences: [] }
    }
    return { hackathons: [], conferences: [] }
  })

  // Function to toggle favorite status
  const toggleFavorite = (id: string, eventType: "hackathons" | "conferences") => {
    setFavorites((prev) => {
      const newFavorites = { ...prev }

      if (newFavorites[eventType].includes(id)) {
        // Remove from favorites
        newFavorites[eventType] = newFavorites[eventType].filter((favId) => favId !== id)
      } else {
        // Add to favorites
        newFavorites[eventType] = [...newFavorites[eventType], id]
      }

      // Save to localStorage
      localStorage.setItem("aiEventsFavorites", JSON.stringify(newFavorites))
      return newFavorites
    })
  }

  // Load CSV data
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        // Load hackathons data
        const hackathonsResponse = await fetch("/ml_ai_hackathons_final.csv")
        const hackathonsText = await hackathonsResponse.text()

        Papa.parse(hackathonsText, {
          header: true,
          complete: (results) => {
            const hackathonsData = results.data
              .filter((item: any) => item.name)
              .map((item: any) => ({
                name: item.name || "Unknown",
                deadline: item.deadline || "TBA",
                domain: item.domain || "General",
                mode: item.mode || "Unknown",
                prize: item.prize || "Not specified",
                link: item.link || "#",
              }))
            setHackathons(hackathonsData)
            setFilteredHackathons(hackathonsData)
          },
        })

        // Load conferences data
        const conferencesResponse = await fetch("/ai_conferences_june_2025.csv")
        const conferencesText = await conferencesResponse.text()

        Papa.parse(conferencesText, {
          header: true,
          complete: (results) => {
            const conferencesData = results.data
              .filter((item: any) => item.name)
              .map((item: any) => ({
                name: item.name || "Unknown",
                startDate: item.startDate || "TBA",
                domain: item.domain || "General",
                mode: item.mode || "Unknown",
                link: item.link || "#",
              }))
            setConferences(conferencesData)
            setFilteredConferences(conferencesData)
            setIsLoading(false)
          },
        })
      } catch (error) {
        console.error("Error loading CSV data:", error)
        setIsLoading(false)
      }
    }

    loadCSVData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filteredHackathonResults = hackathons
    let filteredConferenceResults = conferences

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredHackathonResults = filteredHackathonResults.filter(
        (item) => item.name.toLowerCase().includes(query) || item.domain.toLowerCase().includes(query),
      )
      filteredConferenceResults = filteredConferenceResults.filter(
        (item) => item.name.toLowerCase().includes(query) || item.domain.toLowerCase().includes(query),
      )
    }

    // Apply domain filter
    if (domainFilter && domainFilter !== "all") {
      filteredHackathonResults = filteredHackathonResults.filter(
        (item) => item.domain.toLowerCase() === domainFilter.toLowerCase(),
      )
      filteredConferenceResults = filteredConferenceResults.filter(
        (item) => item.domain.toLowerCase() === domainFilter.toLowerCase(),
      )
    }

    // Apply mode filter
    if (modeFilter && modeFilter !== "all") {
      filteredHackathonResults = filteredHackathonResults.filter(
        (item) => item.mode.toLowerCase() === modeFilter.toLowerCase(),
      )
      filteredConferenceResults = filteredConferenceResults.filter(
        (item) => item.mode.toLowerCase() === modeFilter.toLowerCase(),
      )
    }

    // Apply month filter
    if (monthFilter && monthFilter !== "all") {
      filteredHackathonResults = filteredHackathonResults.filter((item) => {
        const date = new Date(item.deadline)
        return date.getMonth() === Number.parseInt(monthFilter) - 1
      })
      filteredConferenceResults = filteredConferenceResults.filter((item) => {
        const date = new Date(item.startDate)
        return date.getMonth() === Number.parseInt(monthFilter) - 1
      })
    }

    setFilteredHackathons(filteredHackathonResults)
    setFilteredConferences(filteredConferenceResults)
  }, [searchQuery, domainFilter, modeFilter, monthFilter, hackathons, conferences])

  // Filter favorites
  const favoriteHackathons = hackathons.filter((item) => favorites.hackathons.includes(item.name))

  const favoriteConferences = conferences.filter((item) => favorites.conferences.includes(item.name))

  // Get unique domains for filter
  const domains = [
    ...new Set([...hackathons.map((item) => item.domain), ...conferences.map((item) => item.domain)]),
  ].filter(Boolean)

  // Get unique modes for filter
  const modes = [...new Set([...hackathons.map((item) => item.mode), ...conferences.map((item) => item.mode)])].filter(
    Boolean,
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <div className="flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 sm:px-6">
              <div className="flex items-center gap-2 font-semibold">
                <Calendar className="h-6 w-6" />
                <span>AI Events Dashboard</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              domainFilter={domainFilter}
              setDomainFilter={setDomainFilter}
              modeFilter={modeFilter}
              setModeFilter={setModeFilter}
              monthFilter={monthFilter}
              setMonthFilter={setMonthFilter}
              domains={domains}
              modes={modes}
            />

            <Tabs defaultValue="hackathons" className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="hackathons">Hackathons</TabsTrigger>
                <TabsTrigger value="conferences">Conferences</TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-1">
                  <Star className="h-4 w-4" /> Favorites
                </TabsTrigger>
              </TabsList>
              <TabsContent value="hackathons">
                <EventGrid
                  events={filteredHackathons}
                  type="hackathon"
                  isLoading={isLoading}
                  favorites={favorites.hackathons}
                  onToggleFavorite={(id) => toggleFavorite(id, "hackathons")}
                />
              </TabsContent>
              <TabsContent value="conferences">
                <EventGrid
                  events={filteredConferences}
                  type="conference"
                  isLoading={isLoading}
                  favorites={favorites.conferences}
                  onToggleFavorite={(id) => toggleFavorite(id, "conferences")}
                />
              </TabsContent>
              <TabsContent value="favorites">
                <div className="space-y-8">
                  {favoriteHackathons.length > 0 || favoriteConferences.length > 0 ? (
                    <>
                      {favoriteHackathons.length > 0 && (
                        <div>
                          <h3 className="mb-4 text-lg font-medium">Favorite Hackathons</h3>
                          <EventGrid
                            events={favoriteHackathons}
                            type="hackathon"
                            isLoading={false}
                            favorites={favorites.hackathons}
                            onToggleFavorite={(id) => toggleFavorite(id, "hackathons")}
                          />
                        </div>
                      )}

                      {favoriteConferences.length > 0 && (
                        <div className="mt-8">
                          <h3 className="mb-4 text-lg font-medium">Favorite Conferences</h3>
                          <EventGrid
                            events={favoriteConferences}
                            type="conference"
                            isLoading={false}
                            favorites={favorites.conferences}
                            onToggleFavorite={(id) => toggleFavorite(id, "conferences")}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-muted-foreground">No favorites added yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
