// Mock API client for standalone frontend

import type { Listing } from "@/types"

// Mock listing images
const listingImages = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
]

// Generate mock listings
function generateMockListings(count: number, location = ""): Listing[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `${["Cozy", "Luxury", "Modern", "Charming", "Spacious"][i % 5]} ${
      ["Apartment", "House", "Condo", "Villa", "Loft"][i % 5]
    } in ${location || "Popular Location"}`,
    location: location || "New York, USA",
    address: `${100 + i} Main Street, ${location || "New York"}`,
    price_per_night: 75 + i * 25,
    currency: "USD",
    total_price: (75 + i * 25) * 5,
    ratings: 3.5 + (i % 3) * 0.5,
    reviews: 10 + i * 15,
    description: "This is a beautiful property with all the amenities you need for a comfortable stay.",
    property_type: ["Entire home", "Apartment", "Guesthouse", "Hotel room", "Shared room"][i % 5],
    host: {
      id: i + 1,
      name: `Host ${i + 1}`,
      image_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
      is_superhost: i % 3 === 0,
      response_rate: 95,
      joined_date: "2020-01-01",
    },
    amenities: [
      { id: 1, name: "WiFi" },
      { id: 2, name: "Kitchen" },
      { id: 3, name: "Free parking" },
      { id: 4, name: "TV" },
      { id: 5, name: "Air conditioning" },
    ].slice(0, 3 + (i % 3)),
    images: [
      {
        id: i * 4 + 1,
        image_url: listingImages[i % 4],
        is_primary: true,
      },
      {
        id: i * 4 + 2,
        image_url: listingImages[(i + 1) % 4],
        is_primary: false,
      },
      {
        id: i * 4 + 3,
        image_url: listingImages[(i + 2) % 4],
        is_primary: false,
      },
      {
        id: i * 4 + 4,
        image_url: listingImages[(i + 3) % 4],
        is_primary: false,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}

// Generate a detailed mock listing
function generateDetailedMockListing(id: number): Listing {
  return {
    id,
    title: `${["Cozy", "Luxury", "Modern", "Charming", "Spacious"][id % 5]} ${
      ["Apartment", "House", "Condo", "Villa", "Loft"][id % 5]
    } in Popular Location`,
    location: "New York, USA",
    address: `${100 + id} Main Street, New York`,
    price_per_night: 75 + id * 25,
    currency: "USD",
    total_price: (75 + id * 25) * 5,
    ratings: 3.5 + (id % 3) * 0.5,
    reviews: 10 + id * 15,
    description: `This beautiful property offers a comfortable stay with all the amenities you need. Located in a prime area, you'll be close to popular attractions, restaurants, and public transportation. The space features modern furnishings, high-speed WiFi, and a fully equipped kitchen. Perfect for both business travelers and tourists looking to explore the city.

Guests have access to the entire property during their stay. The neighborhood is safe, quiet, and friendly, making it ideal for relaxation after a day of sightseeing or business meetings.`,
    property_type: ["Entire home", "Apartment", "Guesthouse", "Hotel room", "Shared room"][id % 5],
    host: {
      id,
      name: `Host ${id}`,
      image_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80",
      is_superhost: id % 3 === 0,
      response_rate: 95,
      joined_date: "2020-01-01",
    },
    amenities: [
      { id: 1, name: "WiFi" },
      { id: 2, name: "Kitchen" },
      { id: 3, name: "Free parking" },
      { id: 4, name: "TV" },
      { id: 5, name: "Air conditioning" },
      { id: 6, name: "Washer/Dryer" },
      { id: 7, name: "Pool" },
      { id: 8, name: "Hot tub" },
    ].slice(0, 3 + (id % 5)),
    images: [
      { id: id * 4 + 1, image_url: listingImages[id % 4], is_primary: true },
      { id: id * 4 + 2, image_url: listingImages[(id + 1) % 4], is_primary: false },
      { id: id * 4 + 3, image_url: listingImages[(id + 2) % 4], is_primary: false },
      { id: id * 4 + 4, image_url: listingImages[(id + 3) % 4], is_primary: false },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Filter listings based on search parameters
function filterListings(listings: Listing[], params: Record<string, string>): Listing[] {
  return listings.filter((listing) => {
    // Filter by location
    if (params.location && !listing.location.toLowerCase().includes(params.location.toLowerCase())) {
      return false
    }

    // Filter by price range
    if (params.min_price && listing.price_per_night < Number(params.min_price)) {
      return false
    }
    if (params.max_price && listing.price_per_night > Number(params.max_price)) {
      return false
    }

    // Filter by rating
    if (params.min_rating && listing.ratings < Number(params.min_rating)) {
      return false
    }

    // Filter by property type
    if (params.property_type && !listing.property_type.toLowerCase().includes(params.property_type.toLowerCase())) {
      return false
    }

    // Filter by amenities
    if (params.amenities) {
      const requiredAmenities = params.amenities.split(",")
      for (const amenity of requiredAmenities) {
        if (!listing.amenities.some((a) => a.name.toLowerCase().includes(amenity.toLowerCase()))) {
          return false
        }
      }
    }

    return true
  })
}

// Mock API client
export const api = {
  async getListings(params: Record<string, string> = {}) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate mock listings
    const allListings = generateMockListings(20, params.location || "")

    // Filter listings based on params
    const filteredListings = filterListings(allListings, params)

    return filteredListings
  },

  async getListing(id: string | number) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate a detailed mock listing
    return generateDetailedMockListing(Number(id))
  },

  async createBooking(data: any) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Simulate successful booking
    return {
      success: true,
      booking_id: Math.floor(Math.random() * 1000000),
      listing_id: data.listing_id,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      guests_count: data.guests_count,
      total_price: data.total_price,
      status: "confirmed",
    }
  },

  async toggleFavorite(listingId: number, isFavorite: boolean) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simulate successful favorite toggle
    return {
      success: true,
      listing_id: listingId,
      is_favorite: isFavorite,
    }
  },
}

