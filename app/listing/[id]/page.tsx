"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import type { Listing } from "@/types"
import {
  StarIcon,
  MapPinIcon,
  WifiIcon,
  TvIcon,
  HomeIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  CheckIcon,
  CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function ListingDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [checkinDate, setCheckinDate] = useState<Date | undefined>(undefined)
  const [checkoutDate, setCheckoutDate] = useState<Date | undefined>(undefined)
  const [guests, setGuests] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})
  const [isBooking, setIsBooking] = useState(false)
  const { toast } = useToast()
  const [showAllPhotos, setShowAllPhotos] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch listing from mock API
        const data = await api.getListing(id as string)
        setListing(data)
      } catch (error) {
        console.error("Error in fetch operation:", error)
        setError("Failed to load listing details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchListing()
    }
  }, [id])

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [index]: true,
    }))
  }

  const handleFavoriteToggle = async () => {
    setIsFavorite(!isFavorite)

    try {
      // Update favorite status with mock API
      await api.toggleFavorite(Number(id), !isFavorite)

      toast({
        title: isFavorite ? "Removed from wishlist" : "Saved to wishlist",
        description: isFavorite
          ? "This listing has been removed from your wishlist"
          : "This listing has been added to your wishlist",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error toggling favorite status:", error)

      toast({
        title: "Error",
        description: "Failed to update wishlist status. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleReserve = async () => {
    if (!checkinDate || !checkoutDate) {
      toast({
        title: "Please select dates",
        description: "You need to select check-in and check-out dates to make a reservation",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      // Create booking with mock API
      const bookingData = {
        listing_id: Number(id),
        check_in_date: format(checkinDate, "yyyy-MM-dd"),
        check_out_date: format(checkoutDate, "yyyy-MM-dd"),
        guests_count: guests,
        total_price: total,
      }

      const result = await api.createBooking(bookingData)

      toast({
        title: "Booking successful!",
        description: `Your reservation has been confirmed. Booking ID: ${result.booking_id}`,
        duration: 5000,
      })

      // Redirect to home page after successful booking
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Booking failed",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  const calculateNights = () => {
    if (checkinDate && checkoutDate) {
      const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    return 0
  }

  const nights = calculateNights()
  const subtotal = listing ? listing.price_per_night * nights : 0
  const cleaningFee = 60
  const serviceFee = Math.round(subtotal * 0.15)
  const total = subtotal + cleaningFee + serviceFee

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-96 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />

              <div className="grid grid-cols-2 gap-4 mt-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded-md" />
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to home
        </Button>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mb-4">The listing you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to home
        </Button>
      </div>
    )
  }

  // Photo gallery modal
  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="p-4 flex justify-between items-center sticky top-0 bg-white z-10 border-b">
          <button
            onClick={() => setShowAllPhotos(false)}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to listing</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={handleFavoriteToggle}
              className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100"
            >
              <HeartIcon className={cn("h-5 w-5", isFavorite ? "fill-rose-500 text-rose-500" : "")} />
              <span>{isFavorite ? "Saved" : "Save"}</span>
            </button>
            <button className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100">
              <ShareIcon className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">All photos for {listing.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listing.images.map((image, index) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden bg-gray-200">
                <Image
                  src={
                    imageErrors[index]
                      ? `/placeholder.svg?height=600&width=800&text=Image+${index + 1}`
                      : image.image_url
                  }
                  alt={`${listing.title} - image ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {listing.ratings && (
            <div className="flex items-center">
              <StarIcon className="w-5 h-5 text-rose-500 mr-1" />
              <span className="font-medium">{listing.ratings}</span>
              <span className="mx-1">·</span>
              <span className="text-gray-600 underline">{listing.reviews} reviews</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <MapPinIcon className="w-5 h-5 mr-1" />
            <span className="underline">{listing.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-md">
            <ShareIcon className="w-4 h-4" />
            <span className="underline font-medium">Share</span>
          </button>
          <button className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded-md" onClick={handleFavoriteToggle}>
            <HeartIcon className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
            <span className="underline font-medium">Save</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative">
        <div className="relative h-96 rounded-xl overflow-hidden bg-gray-200">
          <Image
            src={
              imageErrors[selectedImageIndex]
                ? `/placeholder.svg?height=600&width=800&text=Listing${listing.id}`
                : listing.images[selectedImageIndex]?.image_url
            }
            alt={listing.title}
            fill
            className="object-cover"
            onError={() => handleImageError(selectedImageIndex)}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {listing.images.slice(0, 4).map((image, index) => (
            <div
              key={index}
              className={`relative h-44 rounded-xl overflow-hidden cursor-pointer bg-gray-200 ${
                selectedImageIndex === index ? "ring-2 ring-black" : ""
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={
                  imageErrors[index]
                    ? `/placeholder.svg?height=300&width=400&text=Listing${listing.id}-${index + 1}`
                    : image.image_url
                }
                alt={`${listing.title} - image ${index + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(index)}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAllPhotos(true)}
          className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md font-medium hover:bg-gray-100 transition-colors"
        >
          Show all photos
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">
                {listing.property_type || "Entire home"} hosted by {listing.host.name}
              </h2>
              <p className="text-gray-600">{listing.address || listing.location}</p>
            </div>

            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden">
                  <Image
                    src={listing.host.image_url || "/placeholder.svg"}
                    alt={listing.host.name}
                    width={56}
                    height={56}
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `/placeholder.svg?height=56&width=56&text=Host`
                    }}
                  />
                </div>
                {listing.host.is_superhost && (
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full">
                    <StarIcon className="w-4 h-4 text-rose-500" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="py-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <HomeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Entire home</h3>
                  <p className="text-gray-500">
                    You'll have the {listing.property_type?.toLowerCase() || "place"} to yourself
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Self check-in</h3>
                  <p className="text-gray-500">Check yourself in with the keypad</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">Free cancellation</h3>
                  <p className="text-gray-500">Cancel before check-in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="py-6 border-b">
            <h3 className="text-xl font-bold mb-4">About this place</h3>
            <p className="text-gray-700 whitespace-pre-line">{listing.description || "No description provided."}</p>
          </div>

          <div className="py-6 border-b">
            <h3 className="text-xl font-bold mb-4">What this place offers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  {amenity.name.toLowerCase().includes("wifi") ? (
                    <WifiIcon className="w-6 h-6 mr-4 text-gray-700" />
                  ) : amenity.name.toLowerCase().includes("tv") ? (
                    <TvIcon className="w-6 h-6 mr-4 text-gray-700" />
                  ) : (
                    <HomeIcon className="w-6 h-6 mr-4 text-gray-700" />
                  )}
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-2xl font-bold">${listing.price_per_night}</span>
                <span className="text-gray-600"> / night</span>
              </div>
              {listing.ratings && (
                <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-rose-500 mr-1" />
                  <span>{listing.ratings}</span>
                </div>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <div className="grid grid-cols-2 divide-x divide-gray-200 border-b cursor-pointer">
                    <div className="p-3 hover:bg-gray-50">
                      <p className="text-xs font-bold">CHECK-IN</p>
                      <p>{checkinDate ? format(checkinDate, "MMM dd, yyyy") : "Add date"}</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <p className="text-xs font-bold">CHECKOUT</p>
                      <p>{checkoutDate ? format(checkoutDate, "MMM dd, yyyy") : "Add date"}</p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="range"
                    selected={{
                      from: checkinDate,
                      to: checkoutDate,
                    }}
                    onSelect={(range) => {
                      setCheckinDate(range?.from)
                      setCheckoutDate(range?.to)
                    }}
                    numberOfMonths={2}
                    initialFocus
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>

              <div className="p-3 border-t hover:bg-gray-50 cursor-pointer">
                <p className="text-xs font-bold">GUESTS</p>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                  className="w-full bg-transparent border-none focus:ring-0 p-0"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={handleReserve}
              disabled={isBooking || !checkinDate || !checkoutDate}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? "Processing..." : checkinDate && checkoutDate ? "Reserve" : "Check availability"}
            </Button>

            {checkinDate && checkoutDate ? (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                  <p className="underline">
                    ${listing.price_per_night} x {nights} nights
                  </p>
                  <p>${subtotal}</p>
                </div>
                <div className="flex justify-between">
                  <p className="underline">Cleaning fee</p>
                  <p>${cleaningFee}</p>
                </div>
                <div className="flex justify-between">
                  <p className="underline">Service fee</p>
                  <p>${serviceFee}</p>
                </div>
                <div className="flex justify-between font-bold pt-4 border-t">
                  <p>Total before taxes</p>
                  <p>${total}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4">You won't be charged yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

