"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ListingCard } from "@/components/listing-card"
import { SearchBar } from "@/components/search-bar"
import { FilterBar } from "@/components/filter-bar"
import type { Listing } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HomeIcon, Building2Icon, UmbrellaIcon, MountainIcon, TreesIcon, TentIcon } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  const location = searchParams.get("location") || ""
  const checkin = searchParams.get("checkin") || ""
  const checkout = searchParams.get("checkout") || ""
  const guests = searchParams.get("guests") || "1"
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const minRating = searchParams.get("minRating") || ""
  const propertyType = searchParams.get("propertyType") || ""
  const amenities = searchParams.get("amenities") || ""

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)
      try {
        // Build query params
        const params: Record<string, string> = {}
        if (location) params.location = location
        if (minPrice) params.min_price = minPrice
        if (maxPrice) params.max_price = maxPrice
        if (minRating) params.min_rating = minRating
        if (propertyType) params.property_type = propertyType
        if (guests) params.guests = guests
        if (amenities) params.amenities = amenities

        // Fetch listings from mock API
        const data = await api.getListings(params)
        setListings(data)
      } catch (error) {
        console.error("Error in fetch operation:", error)
        setError("Failed to load listings. Please try again later.")
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [location, minPrice, maxPrice, minRating, propertyType, guests, amenities])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar
          defaultLocation={location}
          defaultCheckin={checkin}
          defaultCheckout={checkout}
          defaultGuests={Number.parseInt(guests)}
        />
      </div>

      {/* Filter toggle button (mobile) */}
      <div className="md:hidden mb-4">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <span>{showFilters ? "Hide filters" : "Show filters"}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start mb-4 bg-transparent h-auto overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="all"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <HomeIcon className="h-5 w-5" />
              </div>
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger
              value="houses"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <HomeIcon className="h-5 w-5" />
              </div>
              <span>Houses</span>
            </TabsTrigger>
            <TabsTrigger
              value="apartments"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <Building2Icon className="h-5 w-5" />
              </div>
              <span>Apartments</span>
            </TabsTrigger>
            <TabsTrigger
              value="beach"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <UmbrellaIcon className="h-5 w-5" />
              </div>
              <span>Beach</span>
            </TabsTrigger>
            <TabsTrigger
              value="mountains"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <MountainIcon className="h-5 w-5" />
              </div>
              <span>Mountains</span>
            </TabsTrigger>
            <TabsTrigger
              value="countryside"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <TreesIcon className="h-5 w-5" />
              </div>
              <span>Countryside</span>
            </TabsTrigger>
            <TabsTrigger
              value="unique"
              className="flex flex-col items-center gap-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none"
            >
              <div className="p-2 rounded-full bg-gray-100">
                <TentIcon className="h-5 w-5" />
              </div>
              <span>Unique stays</span>
            </TabsTrigger>
          </TabsList>

          {/* Show filters on desktop or when toggled on mobile */}
          <div className={`${showFilters || "hidden md:block"}`}>
            <FilterBar />
          </div>

          <TabsContent value="all" className="mt-6">
            <h1 className="text-2xl font-bold mb-4">
              {loading ? "Searching..." : `${listings.length} stays in ${location || "popular destinations"}`}
            </h1>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No listings found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search filters or exploring a different location
                </p>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Go back
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Other tabs would have similar content but filtered */}
          <TabsContent value="houses">
            <h1 className="text-2xl font-bold mb-4">Houses in {location || "popular destinations"}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings
                .filter(
                  (listing) =>
                    listing.property_type?.toLowerCase().includes("house") ||
                    listing.property_type?.toLowerCase().includes("home"),
                )
                .map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="apartments">
            <h1 className="text-2xl font-bold mb-4">Apartments in {location || "popular destinations"}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings
                .filter((listing) => listing.property_type?.toLowerCase().includes("apartment"))
                .map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
          </TabsContent>

          {/* Placeholder content for other tabs */}
          {["beach", "mountains", "countryside", "unique"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <h1 className="text-2xl font-bold mb-4">
                {tab.charAt(0).toUpperCase() + tab.slice(1)} stays in {location || "popular destinations"}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.slice(0, 4).map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

