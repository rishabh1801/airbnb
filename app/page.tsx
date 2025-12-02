import { SearchBar } from "@/components/search-bar"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[80vh] w-full">
        <div className="absolute inset-0 bg-gray-200">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
            alt="Airbnb hero image"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-center px-4">Find your next adventure</h1>
          <p className="text-xl md:text-2xl mb-8 text-center px-4">Discover amazing places to stay around the world</p>
          <div className="w-full max-w-4xl px-4">
            <SearchBar isHero />
          </div>
        </div>
      </div>

      {/* Featured Destinations */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Popular destinations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              city: "New York",
              img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            },
            {
              city: "Paris",
              img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            },
            {
              city: "Tokyo",
              img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            },
            {
              city: "London",
              img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=80",
            },
          ].map(({ city, img }) => (
            <Link
              href={`/search?location=${city}`}
              key={city}
              className="group relative h-80 rounded-xl overflow-hidden bg-gray-200"
            >
              <Image
                src={img || "/placeholder.svg"}
                alt={city}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{city}</h3>
                  <p className="text-white/80">Explore stays</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">Experience something new</h2>
              <p className="text-gray-600 mb-6">
                Unique activities hosted by locals, created for the curious. From cooking classes to hiking adventures,
                find experiences that match your interests.
              </p>
              <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                Explore experiences
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              {[
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
                "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
              ].map((img, index) => (
                <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Experience ${index + 1}`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Host Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gray-100 rounded-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">Become a Host</h2>
              <p className="text-gray-600 mb-6">
                Earn extra income and unlock new opportunities by sharing your space.
              </p>
              <div>
                <Button className="bg-black hover:bg-gray-800 text-white">Learn more</Button>
              </div>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto bg-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt="Become a host"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

