"use client"

import { Calendar, ExternalLink, MapPin, Award, Clock, Star } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { Hackathon, Conference } from "@/components/dashboard"

interface EventGridProps {
  events: Hackathon[] | Conference[]
  type: "hackathon" | "conference"
  isLoading: boolean
  favorites?: string[]
  onToggleFavorite?: (id: string) => void
}

export default function EventGrid({ events, type, isLoading, favorites = [], onToggleFavorite }: EventGridProps) {
  // Function to calculate days left until deadline
  const getDaysLeft = (dateString: string) => {
    const deadline = new Date(dateString)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No events found matching your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => {
        const isHackathon = type === "hackathon"
        const dateField = isHackathon ? (event as Hackathon).deadline : (event as Conference).startDate
        const daysLeft = isHackathon ? getDaysLeft(dateField) : null

        return (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2 flex flex-row justify-between items-start">
              <CardTitle className="line-clamp-2 text-lg">{event.name}</CardTitle>
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mt-1 -mr-2"
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleFavorite(event.name)
                  }}
                  title={favorites?.includes(event.name) ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    className={`h-4 w-4 ${
                      favorites?.includes(event.name) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                  <span className="sr-only">
                    {favorites?.includes(event.name) ? "Remove from favorites" : "Add to favorites"}
                  </span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {isHackathon ? "Deadline" : "Start Date"}: {formatDate(dateField)}
                  </p>
                  {isHackathon && daysLeft && daysLeft > 0 && (
                    <p className="text-xs text-muted-foreground">
                      <Clock className="mr-1 inline-block h-3 w-3" />
                      {daysLeft} days left
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="font-medium">Mode:</span> {event.mode}
                </div>
              </div>

              {event.domain && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/5">
                    {event.domain}
                  </Badge>
                </div>
              )}

              {isHackathon && (event as Hackathon).prize && (
                <div className="flex items-start gap-2">
                  <Award className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">Prize:</span> {(event as Hackathon).prize}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full gap-2">
                <a href={event.link} target="_blank" rel="noopener noreferrer">
                  Visit {isHackathon ? "Hackathon" : "Conference"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
