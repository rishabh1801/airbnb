"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, MapPinIcon, UserIcon, SearchIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  defaultLocation?: string
  defaultCheckin?: string
  defaultCheckout?: string
  defaultGuests?: number
  isHero?: boolean
}

export function SearchBar({
  defaultLocation = "",
  defaultCheckin = "",
  defaultCheckout = "",
  defaultGuests = 1,
  isHero = false,
}: SearchBarProps) {
  const router = useRouter()
  const [location, setLocation] = useState(defaultLocation)
  const [checkinDate, setCheckinDate] = useState<Date | undefined>(
    defaultCheckin ? new Date(defaultCheckin) : undefined,
  )
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(
    defaultCheckout ? new Date(defaultCheckout) : undefined,
  )
  const [guests, setGuests] = useState(defaultGuests)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const searchBarRef = useRef<HTMLDivElement>(null)

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setCheckinOpen(false)
        setCheckoutOpen(false)
        setGuestsOpen(false)
        setActiveTab(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.append("location", location)
    if (checkinDate) params.append("checkin", format(checkinDate, "yyyy-MM-dd"))
    if (checkoutDate) params.append("checkout", format(checkoutDate, "yyyy-MM-dd"))
    params.append("guests", guests.toString())

    router.push(`/search?${params.toString()}`)
  }

  const handleTabClick = (tab: string) => {
    if (activeTab === tab) {
      setActiveTab(null)
      setCheckinOpen(false)
      setCheckoutOpen(false)
      setGuestsOpen(false)
    } else {
      setActiveTab(tab)
      setCheckinOpen(tab === "checkin")
      setCheckoutOpen(tab === "checkout")
      setGuestsOpen(tab === "guests")
    }
  }

  const clearLocation = () => {
    setLocation("")
  }

  return (
    <div
      ref={searchBarRef}
      className={cn(
        "transition-all duration-300",
        activeTab ? "scale-105" : "scale-100",
        isHero ? "shadow-2xl" : "shadow-lg",
      )}
    >
      <div
        className={cn(
          "flex flex-col md:flex-row items-center bg-white rounded-xl p-2",
          activeTab && "ring-2 ring-black",
        )}
      >
        <div
          className={cn(
            "flex-1 min-w-0 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto cursor-pointer",
            activeTab === "location" && "bg-gray-50",
          )}
          onClick={() => handleTabClick("location")}
        >
          <div className="flex items-center">
            <MapPinIcon className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Where are you going?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 p-0 text-base"
                onClick={(e) => e.stopPropagation()}
              />
              {location && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearLocation()
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex-1 min-w-0 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto cursor-pointer",
            activeTab === "checkin" && "bg-gray-50",
          )}
          onClick={() => handleTabClick("checkin")}
        >
          <Popover open={checkinOpen} onOpenChange={setCheckinOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 text-left font-normal">
                <CalendarIcon className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
                {checkinDate ? format(checkinDate, "MMM dd, yyyy") : <span className="text-gray-500">Check-in</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkinDate}
                onSelect={(date) => {
                  setCheckinDate(date)
                  setCheckinOpen(false)
                  if (!checkoutDate && date) {
                    // Automatically open checkout date picker
                    setTimeout(() => {
                      setCheckoutOpen(true)
                      setActiveTab("checkout")
                    }, 100)
                  }
                }}
                initialFocus
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={cn(
            "flex-1 min-w-0 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto cursor-pointer",
            activeTab === "checkout" && "bg-gray-50",
          )}
          onClick={() => handleTabClick("checkout")}
        >
          <Popover open={checkoutOpen} onOpenChange={setCheckoutOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 text-left font-normal">
                <CalendarIcon className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
                {checkoutDate ? format(checkoutDate, "MMM dd, yyyy") : <span className="text-gray-500">Check-out</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkoutDate}
                onSelect={(date) => {
                  setCheckoutDate(date)
                  setCheckoutOpen(false)
                  if (date) {
                    // Automatically open guests selector
                    setTimeout(() => {
                      setGuestsOpen(true)
                      setActiveTab("guests")
                    }, 100)
                  }
                }}
                disabled={(date) => date < (checkinDate || new Date())}
                initialFocus
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div
          className={cn(
            "flex-1 min-w-0 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200 w-full md:w-auto cursor-pointer",
            activeTab === "guests" && "bg-gray-50",
          )}
          onClick={() => handleTabClick("guests")}
        >
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-0 text-left font-normal">
                <UserIcon className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
                <span>
                  {guests} {guests === 1 ? "guest" : "guests"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adults</p>
                    <p className="text-sm text-gray-500">Ages 13 or above</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      disabled={guests <= 1}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{guests}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => setGuests(Math.min(16, guests + 1))}
                      disabled={guests >= 16}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setGuestsOpen(false)}>
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="px-2 py-3 w-full md:w-auto">
          <Button
            onClick={handleSearch}
            className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white rounded-full px-6 transition-all duration-200 hover:scale-105"
          >
            <SearchIcon className="h-5 w-5 mr-2" />
            <span>Search</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

