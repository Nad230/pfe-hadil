"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
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

export default function LocationPage() {
    const router = useRouter()
    const [location, setLocation] = useState<Location>({
      lat: 35.6784,
      lng: 10.0926,
    })

    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false) // Add submitting state
    const [searchQuery, setSearchQuery] = useState("")
    const [error, setError] = useState<string | null>(null)
  
  const handleGetCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          
          const newLocation = {
            lat: latitude,
            lng: longitude,
            city: data.address?.city || data.address?.town || data.address?.village,
            country: data.address?.country
          }
          
          setLocation(newLocation)
          // Save location for other pages
          localStorage.setItem("selectedLocation", JSON.stringify(newLocation))
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
          
          toast.success("📍 Location found successfully!")
        } catch (error) {
          toast.error("Couldn't get location details")
        }
        
        setIsLoading(false)
      },
      (error) => {
        setError("Could not get your location. Please try again or enter it manually.")
        setIsLoading(false)
        toast.error("Location access denied")
      }
    )
  }    
  const [isCheckingNearby, setIsCheckingNearby] = useState(false)


  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0]
        const locationParts = display_name.split(", ")
        const newLocation = {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          city: locationParts[0],
          country: locationParts[locationParts.length - 1]
        }
        
        setLocation(newLocation)
        // Save location for other pages
        localStorage.setItem("selectedLocation", JSON.stringify(newLocation))
        
        toast.success("🎯 Location found!")
      } else {
        toast.error("Location not found")
      }
    } catch (error) {
      setError("Could not find this location. Please try again.")
      toast.error("Search failed")
    }
    
    setIsLoading(false)
  }

  const handleContinue = () => {
    if (location.city && location.country) {
      router.push("/location/distance-selection")
    } else {
      toast.error("Please select a valid location first")
    }
  }
  
  // Add this new submit handler
  const handleSubmit = async () => {
    const token = Cookies.get("token")
    
    if (!token) {
      toast.error("Please log in to save your location")
      return false
    }
  
    if (!location.city || !location.country) {
      toast.error("Please select a valid location")
      return false
    }
  
    setIsSubmitting(true)
  
    try {
      const response = await fetch('http://localhost:3000/userlocation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          latitude: location.lat,
          longitude: location.lng,
          city: location.city,
          country: location.country
        })
      })
  
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to save location')
      
      toast.success("Location saved successfully!")
      return true
    } catch (error: any) {
      toast.error(error.message || "Failed to save location")
      return false
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Create a combined handler for the button

// Modified handleContinueWithSubmit function
// In LocationPage.tsx - modified handleContinueWithSubmit
const handleContinueWithSubmit = async () => {
  const token = Cookies.get("token");
  if (!token) {
    toast.error("Please log in to save your location");
    return;
  }

  if (!location.city || !location.country) {
    toast.error("Please select a valid location");
    return;
  }

  try {
    setIsSubmitting(true);
    
    // 1. Save location first
    const saveSuccess = await handleSubmit();
    if (!saveSuccess) return;

    // 2. Redirect to suggestions page
    router.push("location/distance-selection");
    
  } catch (error: any) {
    toast.error(error.message || "Failed to save location");
  } finally {
    setIsSubmitting(false);
  }
}

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl space-y-8"
        >
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center"
            >
              <MapPin className="h-10 w-10 text-primary" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Let's Begin Your Adventure! 🚀
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Where in the world are you starting your journey today?
            </motion.p>
          </div>

          <Card className="backdrop-blur-md bg-white/90 dark:bg-black/90">
            <CardContent className="p-6 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-[400px] rounded-lg overflow-hidden shadow-xl"
              >
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
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
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
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 bg-primary/5 p-6 rounded-xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Location Details</h3>
                      <p className="text-sm text-muted-foreground">Click anywhere on the map!</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Coordinates</span>
                      <p className="font-mono text-sm">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </p>
                    </div>
                    
                    <AnimatePresence>
                      {location.city && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <span className="text-sm text-muted-foreground">City</span>
                          <p className="font-medium">{location.city}</p>
                        </motion.div>
                      )}
                      
                      {location.country && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <span className="text-sm text-muted-foreground">Country</span>
                          <p className="font-medium">{location.country}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!location.city && !location.country && (
                      <div className="text-center py-4">
                        <MapPinOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Select a location to see more details
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/50 p-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
               <Button
  size="lg"
  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg"
  onClick={handleContinueWithSubmit}
  disabled={!location.city || isSubmitting || isCheckingNearby}
>
  {isSubmitting || isCheckingNearby ? (
    <>
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {isSubmitting ? "Saving..." : "Checking nearby..."}
    </>
  ) : (
    "Let's Get Started"
  )}
</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}