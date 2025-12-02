"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GlobeIcon, MenuIcon, UserIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search-bar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const isHomePage = pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-md py-2" : "bg-white py-4",
        isHomePage && !scrolled && !showSearch && "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-rose-500 font-bold text-2xl flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-8 w-8 fill-rose-500">
              <path d="M224 373.12c-25.24-31.67-40.08-59.43-45-83.18-22.55-88 112.61-88 90.06 0-5.45 24.25-20.29 52-45.06 83.18zm138.15 73.23c-42.06 18.31-83.67-10.88-119.3-50.47 103.9-130.07 46.11-200-18.85-200-54.92 0-85.16 46.51-73.28 100.5 6.93 29.19 25.23 62.39 54.43 99.5-32.53 36.05-60.55 52.69-85.15 54.92-50 7.43-89.11-41.06-71.3-91.09 15.1-39.16 111.72-231.18 115.87-241.56 15.75-30.07 25.56-57.4 59.38-57.4 32.34 0 43.4 25.94 60.37 59.87 36 70.62 89.35 177.48 114.84 239.09 13.17 33.07-1.37 71.29-37.01 86.64zm47-136.12C280.27 35.93 273.13 32 224 32c-45.52 0-64.87 31.67-84.66 72.79C33.18 317.1 22.89 347.19 22 349.81-3.22 419.14 48.74 480 111.63 480c21.71 0 60.61-6.06 112.37-62.4 58.68 63.78 101.26 62.4 112.37 62.4 62.89.05 114.85-60.86 89.61-130.19.02-3.89-16.82-38.9-16.82-39.58z" />
            </svg>
            <span
              className={cn(
                "ml-2 hidden sm:inline transition-colors",
                isHomePage && !scrolled && !showSearch ? "text-white" : "text-rose-500",
              )}
            >
              airbnb
            </span>
          </Link>

          {/* Compact search button for mobile */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-300 shadow-sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <SearchIcon className="h-4 w-4 mr-2" />
              <span className="text-sm">Where to?</span>
            </Button>
          </div>

          {/* Desktop search bar */}
          <div
            className={cn(
              "hidden md:flex items-center border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
              showSearch && "ring-2 ring-black",
            )}
            onClick={() => setShowSearch(!showSearch)}
          >
            <span className="font-medium px-3 border-r">Anywhere</span>
            <span className="font-medium px-3 border-r">Any week</span>
            <span className="text-gray-500 px-3">Add guests</span>
            <div className="bg-rose-500 p-2 rounded-full ml-2">
              <SearchIcon className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className={cn(
                "hidden md:flex hover:bg-gray-100 transition-colors",
                isHomePage && !scrolled && !showSearch && "text-white hover:bg-white/20",
              )}
            >
              Airbnb your home
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "rounded-full p-2 hidden md:flex hover:bg-gray-100 transition-colors",
                isHomePage && !scrolled && !showSearch && "text-white hover:bg-white/20",
              )}
            >
              <GlobeIcon className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full flex items-center gap-2 border-gray-300 hover:shadow-md transition-shadow"
                >
                  <MenuIcon className="h-5 w-5" />
                  <div className="bg-gray-500 rounded-full p-1">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="font-semibold">Sign up</DropdownMenuItem>
                <DropdownMenuItem>Log in</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Airbnb your home</DropdownMenuItem>
                <DropdownMenuItem>Host an experience</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Expanded search bar that appears when clicked */}
        {showSearch && (
          <div className="mt-4 pb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <SearchBar />
          </div>
        )}
      </div>
    </header>
  )
}

