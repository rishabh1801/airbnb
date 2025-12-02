"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { StarIcon, HomeIcon, Building2Icon, HotelIcon, TentIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number.parseInt(searchParams.get("minPrice") || "0"),
    Number.parseInt(searchParams.get("maxPrice") || "1000"),
  ])

  const [minRating, setMinRating] = useState<number>(Number.parseInt(searchParams.get("minRating") || "0"))
  const [propertyType, setPropertyType] = useState<string>(searchParams.get("propertyType") || "")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(searchParams.get("amenities")?.split(",") || [])

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Update price range
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Update rating
    if (minRating > 0) {
      params.set("minRating", minRating.toString())
    } else {
      params.delete("minRating")
    }

    // Update property type
    if (propertyType) {
      params.set("propertyType", propertyType)
    } else {
      params.delete("propertyType")
    }

    // Update amenities
    if (selectedAmenities.length > 0) {
      params.set("amenities", selectedAmenities.join(","))
    } else {
      params.delete("amenities")
    }

    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams()
    const location = searchParams.get("location")
    const checkin = searchParams.get("checkin")
    const checkout = searchParams.get("checkout")
    const guests = searchParams.get("guests")

    if (location) params.set("location", location)
    if (checkin) params.set("checkin", checkin)
    if (checkout) params.set("checkout", checkout)
    if (guests) params.set("guests", guests)

    router.push(`/search?${params.toString()}`)
    setPriceRange([0, 1000])
    setMinRating(0)
    setPropertyType("")
    setSelectedAmenities([])
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-4">Price range</h3>
          <div className="px-2">
            <Slider
              value={priceRange}
              min={0}
              max={1000}
              step={10}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mb-6"
            />
            <div className="flex justify-between">
              <div className="border rounded-md p-3 w-full mr-4 transition-all hover:border-black focus-within:border-black">
                <p className="text-xs text-gray-500 mb-1">min price</p>
                <p className="font-medium">${priceRange[0]}</p>
              </div>
              <div className="border rounded-md p-3 w-full transition-all hover:border-black focus-within:border-black">
                <p className="text-xs text-gray-500 mb-1">max price</p>
                <p className="font-medium">${priceRange[1]}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold mt-8 mb-4">Amenities</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              "WiFi",
              "Kitchen",
              "Free parking",
              "Pool",
              "Hot tub",
              "Air conditioning",
              "Washer/Dryer",
              "TV",
              "Gym",
              "Breakfast",
              "Pets allowed",
              "Smoking allowed",
            ].map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-4">Rating</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {[0, 3, 4, 4.5].map((rating) => (
              <Button
                key={rating}
                variant={minRating === rating ? "default" : "outline"}
                onClick={() => setMinRating(rating)}
                className={cn(
                  "rounded-full transition-all",
                  minRating === rating ? "bg-black hover:bg-black/90" : "hover:border-black",
                )}
              >
                {rating > 0 ? (
                  <>
                    <StarIcon className="h-4 w-4 mr-1 text-amber-500" />
                    {rating}+
                  </>
                ) : (
                  "Any"
                )}
              </Button>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4">Property type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "house", label: "House", icon: HomeIcon },
              { id: "apartment", label: "Apartment", icon: Building2Icon },
              { id: "hotel", label: "Hotel", icon: HotelIcon },
              { id: "unique", label: "Unique stays", icon: TentIcon },
            ].map((type) => {
              const Icon = type.icon
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className={cn(
                    "rounded-lg flex flex-col items-center p-4 h-auto transition-all",
                    propertyType === type.id ? "border-black bg-gray-50" : "hover:border-black",
                  )}
                  onClick={() => setPropertyType(propertyType === type.id ? "" : type.id)}
                >
                  <Icon className="h-6 w-6 mb-2" />
                  <span>{type.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button variant="outline" className="mr-2 hover:border-black transition-all" onClick={clearFilters}>
          Clear all
        </Button>
        <Button onClick={applyFilters} className="bg-black hover:bg-black/90 text-white transition-all">
          Apply filters
        </Button>
      </div>
    </div>
  )
}

