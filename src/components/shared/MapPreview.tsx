'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'

// Fix for default Leaflet icon not showing in Next.js
// Using CDN URLs since static imports don't work properly with Next.js bundling
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPreviewProps {
    lat: number
    lng: number
    zoom?: number
    interactive?: boolean
    onLocationSelect?: (lat: number, lng: number) => void
}

function LocationMarker({
    position,
    onLocationSelect,
    interactive
}: {
    position: [number, number],
    onLocationSelect?: (lat: number, lng: number) => void,
    interactive?: boolean
}) {
    const map = useMapEvents({
        click(e) {
            if (interactive && onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng)
            }
        },
    })

    useEffect(() => {
        if (position[0] && position[1]) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    if (!position[0] || !position[1]) return null

    return <Marker position={position} icon={DefaultIcon} />
}

export default function MapPreview({
    lat,
    lng,
    zoom = 13,
    interactive = false,
    onLocationSelect
}: MapPreviewProps) {
    // Memoize the position to prevent unnecessary re-renders
    const position = useMemo(() => [lat, lng] as [number, number], [lat, lng])

    if (!lat || !lng) {
        return (
            <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                No location data
            </div>
        )
    }

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={interactive}
            dragging={interactive}
            className="h-full w-full z-0"
            key={`${lat}-${lng}`} // Force remount when coordinates change significantly
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
                position={position}
                onLocationSelect={onLocationSelect}
                interactive={interactive}
            />
        </MapContainer>
    )
}
