"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { StarIcon, HeartIcon } from "lucide-react"
import type { Listing } from "@/types"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  // Find primary image or use the first one
  const primaryImage = listing.images.find((img) => img.is_primary) || listing.images[0]
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const { toast } = useToast()

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)

    try {
      // Update favorite status with mock API
      await api.toggleFavorite(listing.id, newFavoriteState)

      toast({
        title: newFavoriteState ? "Saved to wishlist" : "Removed from wishlist",
        description: newFavoriteState
          ? "This listing has been added to your wishlist"
          : "This listing has been removed from your wishlist",
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

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  return (
    <div className="group relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
          <div
            className={cn("absolute inset-0 transition-opacity duration-300", isHovering ? "opacity-100" : "opacity-0")}
          >
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {listing.images.length > 1 &&
              listing.images.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 rounded-full bg-white/80 transition-all",
                    idx === currentImageIndex ? "w-6" : "w-1.5",
                  )}
                />
              ))}
          </div>

          <Image
            src={
              imageError
                ? "/placeholder.svg?height=500&width=500&text=Listing"
                : listing.images[currentImageIndex]?.image_url || primaryImage?.image_url
            }
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <HeartIcon
              className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600")}
            />
          </button>
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg truncate">{listing.title}</h3>
            {listing.ratings && (
              <div className="flex items-center ml-2 flex-shrink-0">
                <StarIcon className="h-4 w-4 text-rose-500 mr-1" />
                <span>{listing.ratings}</span>
              </div>
            )}
          </div>

          <p className="text-gray-500 truncate">{listing.location}</p>
          <p className="mt-2">
            <span className="font-bold">${listing.price_per_night}</span>
            <span className="text-gray-500"> night</span>
          </p>
        </div>
      </Link>
    </div>
  )
}

