"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Compass, Search, Loader2, MapPinOff } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import confetti from "canvas-confetti"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface Location {
  lat: number
  lng: number
  city?: string
  country?: string
}

function MapComponent({ location, onLocationChange }: { 
  location: Location
  onLocationChange: (location: Location) => void 
}) {
  const map = useMap()
  
  useEffect(() => {
    map.setView([location.lat, location.lng], 13)
  }, [location, map])

  useEffect(() => {
    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      
      onLocationChange({
        lat,
        lng,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country
      })
    }

    map.on('click', handleClick)
    return () => map.off('click', handleClick)
  }, [map, onLocationChange])

  return <Marker position={[location.lat, location.lng]} />
}

interface LocationStepProps {
  onNext: () => void
  onBack: () => void
}

export function LocationStep({ onNext, onBack }: LocationStepProps) {
    const router = useRouter()
    const [location, setLocation] = useState<Location>({
      lat: 35.6784,
      lng: 10.0926,
    })
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState<string | null>(null)
  
    const handleGetCurrentLocation = () => {
        // Existing logic for getting current location...
    }

    const handleSearch = async () => {
        // Existing logic for searching location...
    }

    const handleContinue = () => {
        // Existing logic for continuing...
    }
  
    const handleSubmit = async () => {
        // Existing logic for submitting...
    }
  
    const handleContinueWithSubmit = async () => {
        const success = await handleSubmit()
        if (success) {
            onNext()  // Move to the next step
        }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Where in the world are you starting your journey today?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div className="h-[400px] rounded-lg overflow-hidden shadow-xl">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapComponent location={location} onLocationChange={setLocation} />
            </MapContainer>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg"
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Compass className="mr-2 h-5 w-5" />
                )}
                Find My Location
              </Button>

              <div className="flex gap-2">
                <Input
                  placeholder="Search any place..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="text-lg"
                />
                <Button 
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Location Details Component */}
            <div className="space-y-4 bg-primary/5 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Location Details</h3>
                  <p className="text-sm text-muted-foreground">Click anywhere on the map!</p>
                </div>
              </div>
              {/* Location data display logic */}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              onClick={handleContinueWithSubmit}
              disabled={!location.city || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Let's Get Started"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
}