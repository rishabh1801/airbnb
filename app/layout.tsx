import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Airbnb Clone",
  description: "A full-stack Airbnb clone built with Next.js, Django, and Scrapy",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <Navbar />
          <main>{children}</main>

          <footer className="bg-gray-100 py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-bold mb-4">Support</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Help Center
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Safety information
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Cancellation options
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-4">Community</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Disaster relief housing
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Support refugees
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Combating discrimination
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-4">Hosting</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Try hosting
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        AirCover for Hosts
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Explore hosting resources
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-4">Airbnb</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Newsroom
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Investors
                      </Link>
                    </li>
                    <li>
                      <Link href="#" className="text-gray-600 hover:underline">
                        Careers
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t mt-8 pt-8 text-center text-gray-600">
                <p>© 2023 Airbnb Clone. This is a demo project.</p>
              </div>
            </div>
          </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

