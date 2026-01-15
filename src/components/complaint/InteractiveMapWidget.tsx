'use client'

/**
 * Interactive Map Widget Component
 * Step 4: Location selection with expandable map
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Navigation,
  Search,
  Maximize2,
  Minimize2,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LocationData } from '@/types/complaint.types'

// Dynamically import map to avoid SSR issues
const MapPreview = dynamic(() => import('@/components/shared/MapPreview'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
})

interface InteractiveMapWidgetProps {
  onLocationSelected: (location: LocationData) => void
  initialLocation?: LocationData | null
}

export default function InteractiveMapWidget({
  onLocationSelected,
  initialLocation,
}: InteractiveMapWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation
      ? { lat: initialLocation.latitude, lng: initialLocation.longitude }
      : null
  )
  const [address, setAddress] = useState(initialLocation?.address || '')
  const [landmark, setLandmark] = useState(initialLocation?.landmark || '')
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false)

  // Get current GPS location
  const handleGetGPSLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('GPS not supported by your browser')
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setLocation({ lat, lng })
        setIsLocationConfirmed(false)

        // Reverse geocode
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
          )
          const data = await response.json()
          if (data.display_name) {
            setAddress(data.display_name)
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error)
        }

        setIsGettingLocation(false)
        toast.success('Location detected from GPS')
      },
      (error) => {
        console.error('GPS error:', error)
        setIsGettingLocation(false)
        toast.error('Unable to get GPS location. Please search manually.')
      },
      { enableHighAccuracy: true }
    )
  }, [])

  // Search address
  const handleSearchAddress = useCallback(async () => {
    if (!address.trim()) {
      toast.error('Please enter an address to search')
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        setLocation({ lat, lng })
        setAddress(data[0].display_name)
        setIsLocationConfirmed(false)
        toast.success('Location found!')
      } else {
        toast.error('Address not found. Please try a different search.')
      }
    } catch (error) {
      console.error('Address search error:', error)
      toast.error('Failed to search address')
    } finally {
      setIsSearching(false)
    }
  }, [address])

  // Handle map click
  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      setLocation({ lat, lng })
      setIsLocationConfirmed(false)

      // Reverse geocode
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()
        if (data.display_name) {
          setAddress(data.display_name)
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error)
      }
    },
    []
  )

  // Confirm location
  const handleConfirmLocation = useCallback(() => {
    if (!location) {
      toast.error('Please select a location first')
      return
    }

    const locationData: LocationData = {
      latitude: location.lat,
      longitude: location.lng,
      address: address || 'No address provided',
      landmark: landmark || undefined,
      pinned_manually: true,
    }

    onLocationSelected(locationData)
    setIsLocationConfirmed(true)
    toast.success('Location confirmed!')
  }, [location, address, landmark, onLocationSelected])

  return (
    <>
      {/* Compact Widget (Default State) */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0F4C81]" />
                <h3 className="font-semibold text-gray-900">Add Location</h3>
              </div>
              {location && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(true)}
                  className="text-[#0F4C81]"
                >
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Expand Map
                </Button>
              )}
            </div>

            {/* GPS and Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleGetGPSLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="flex-1"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Use GPS
                  </>
                )}
              </Button>
            </div>

            {/* Address Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Search address or landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                className="flex-1"
              />
              <Button
                onClick={handleSearchAddress}
                disabled={isSearching}
                variant="outline"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Small Map Preview */}
            {location && (
              <div className="space-y-3">
                <div
                  className="h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm cursor-pointer hover:border-[#0F4C81] transition-colors"
                  onClick={() => setIsExpanded(true)}
                >
                  <MapPreview
                    lat={location.lat}
                    lng={location.lng}
                    zoom={15}
                    interactive={false}
                  />
                </div>

                <div className="bg-gray-50 border rounded-lg p-3 space-y-2">
                  <p className="text-sm text-gray-600">{address}</p>
                  <p className="text-xs text-gray-400">
                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  
                  <Input
                    placeholder="Add landmark (optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="text-sm"
                  />

                  <Button
                    onClick={handleConfirmLocation}
                    className={`w-full ${
                      isLocationConfirmed
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-[#0F4C81] hover:bg-[#0B3C5D]'
                    }`}
                    disabled={isLocationConfirmed}
                  >
                    {isLocationConfirmed ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Location Confirmed
                      </>
                    ) : (
                      'Confirm Location'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-[#0B3C5D] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Select Location</h2>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4 mr-1" />
                  Minimize
                </Button>
              </div>

              {/* Search Controls */}
              <div className="p-4 border-b space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search address or landmark..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearchAddress}
                    disabled={isSearching}
                    variant="outline"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleGetGPSLocation}
                    disabled={isGettingLocation}
                    variant="outline"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        GPS
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Click on the map to select a precise location
                </p>
              </div>

              {/* Large Map */}
              <div className="h-96">
                {location ? (
                  <MapPreview
                    lat={location.lat}
                    lng={location.lng}
                    zoom={16}
                    interactive={true}
                    onLocationSelect={handleMapClick}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p>Search or use GPS to see map</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Details */}
              {location && (
                <div className="p-4 border-t space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Selected Location
                    </p>
                    <p className="text-sm text-gray-600">{address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                    </p>
                  </div>

                  <Input
                    placeholder="Add landmark (optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsExpanded(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        handleConfirmLocation()
                        setIsExpanded(false)
                      }}
                      className="flex-1 bg-[#0F4C81] hover:bg-[#0B3C5D]"
                    >
                      Confirm \u0026 Close
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
