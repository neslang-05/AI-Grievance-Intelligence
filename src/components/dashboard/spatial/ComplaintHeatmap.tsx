'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Badge } from '@/components/ui/badge'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface ComplaintMarker {
  id: string
  lat: number
  lng: number
  type: string
  priority: string
}

export function ComplaintHeatmap({ markers }: { markers: ComplaintMarker[] }) {
  const [isClient, setIsClient] = useState(false)
  const imphalCenter: [number, number] = [24.8170, 93.9368]

  useEffect(() => {
    setIsClient(true)
    
    // Fix leaflet default icon issue in Next.js
    import('leaflet').then((L) => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
    });
  }, [])

  if (!isClient) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl" />

  return (
    <Card className="border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Spatial Intelligence Hotspots</CardTitle>
            <CardDescription>Visualizing high-density grievance zones across the city</CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100">
            Real-time Sync
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 border-t">
        <div className="h-[400px] w-full z-0">
          <MapContainer 
            center={imphalCenter} 
            zoom={13} 
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.filter(m => m.lat && m.lng).map((marker) => (
              <Marker key={marker.id} position={[marker.lat, marker.lng]}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-slate-900 mb-1">{marker.type}</p>
                    <Badge className={`text-[10px] ${
                      marker.priority === 'high' ? 'bg-red-500' : 
                      marker.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {marker.priority.toUpperCase()}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
