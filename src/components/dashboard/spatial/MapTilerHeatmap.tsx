'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import { GeocodingControl } from '@maptiler/geocoding-control/maptilersdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import '@maptiler/geocoding-control/style.css'
import { 
    Box, 
    Drawer, 
    Typography, 
    IconButton, 
    Card, 
    CardContent, 
    Chip, 
    Stack,
    Divider,
    Paper
} from '@mui/material'
import { 
    X as CloseIcon, 
    MapPin, 
    Calendar, 
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react'
import { Complaint } from '@/types/database.types'

// MapTiler API Key - Use environment variable or placeholder
const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'YOUR_MAPTILER_API_KEY'

maptilersdk.config.apiKey = MAPTILER_API_KEY

interface MapTilerHeatmapProps {
    complaints: Complaint[]
}

export function MapTilerHeatmap({ complaints }: MapTilerHeatmapProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maptilersdk.Map | null>(null)
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    // Center on Imphal
    const center: [number, number] = [93.9368, 24.8170]

    // Convert complaints to GeoJSON
    const geoJsonData = useMemo(() => {
        return {
            type: 'FeatureCollection',
            features: complaints
                .filter(c => c.location_lat && c.location_lng)
                .map(c => ({
                    type: 'Feature',
                    properties: { ...c },
                    geometry: {
                        type: 'Point',
                        coordinates: [c.location_lng, c.location_lat]
                    }
                }))
        }
    }, [complaints])

    useEffect(() => {
        if (map.current) return
        if (!mapContainer.current) return

        map.current = new maptilersdk.Map({
            container: mapContainer.current,
            style: maptilersdk.MapStyle.STREETS,
            center: center,
            zoom: 12
        })

        const gc = new GeocodingControl()
        map.current.addControl(gc, 'top-left')

        map.current.on('load', () => {
            if (!map.current) return

            // Add Source
            map.current.addSource('complaints', {
                type: 'geojson',
                data: geoJsonData as any
            })

            // Add Heatmap Layer
            map.current.addLayer({
                id: 'complaints-heat',
                type: 'heatmap',
                source: 'complaints',
                maxzoom: 15,
                paint: {
                    // Increase weight based on confidence
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'ai_confidence'],
                        0, 0,
                        1, 1
                    ],
                    // Increase intensity as zoom increases
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        11, 1,
                        15, 3
                    ],
                    // Color ramp for heatmap
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(33,102,172,0)',
                        0.2, 'rgb(103,169,207)',
                        0.4, 'rgb(209,229,240)',
                        0.6, 'rgb(253,219,199)',
                        0.8, 'rgb(239,138,98)',
                        1, 'rgb(178,24,43)'
                    ],
                    // Radius by zoom
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        11, 15,
                        15, 20
                    ],
                    // Transition to circles
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        14, 1,
                        15, 0
                    ]
                }
            })

            // Add Circle Layer for individual points at high zoom
            map.current.addLayer({
                id: 'complaints-point',
                type: 'circle',
                source: 'complaints',
                minzoom: 14,
                paint: {
                    'circle-radius': 6,
                    'circle-color': [
                        'match',
                        ['get', 'ai_priority'],
                        'high', '#ef4444',
                        'medium', '#f59e0b',
                        'low', '#3b82f6',
                        '#ccc'
                    ],
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            })

            // Handle Clicks
            map.current.on('click', 'complaints-point', (e) => {
                if (!e.features || e.features.length === 0) return
                const props = e.features[0].properties as Complaint
                const coordinates = (e.features[0].geometry as any).coordinates.slice()

                // Ensure coordinates are correct if map is zoomed out
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
                }

                new maptilersdk.Popup()
                    .setLngLat(coordinates)
                    .setHTML(`
                        <div style="padding: 10px; font-family: sans-serif;">
                            <strong style="color: #1e293b; display: block; margin-bottom: 4px;">${props.ai_issue_type}</strong>
                            <div style="display: flex; gap: 4px;">
                                <span style="background: ${props.ai_priority === 'high' ? '#fee2e2' : props.ai_priority === 'medium' ? '#fef3c7' : '#dbeafe'}; 
                                             color: ${props.ai_priority === 'high' ? '#991b1b' : props.ai_priority === 'medium' ? '#92400e' : '#1e40af'}; 
                                             font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
                                    ${props.ai_priority.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    `)
                    .addTo(map.current!)

                setSelectedComplaint(props)
                setDrawerOpen(true)
            })

            // Change cursor on hover
            map.current.on('mouseenter', 'complaints-point', () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer'
            })
            map.current.on('mouseleave', 'complaints-point', () => {
                if (map.current) map.current.getCanvas().style.cursor = ''
            })
        })

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [])

    // Update data when props change
    useEffect(() => {
        if (map.current && map.current.isStyleLoaded()) {
            const source = map.current.getSource('complaints') as maptilersdk.GeoJSONSource
            if (source) {
                source.setData(geoJsonData as any)
            }
        }
    }, [geoJsonData])

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock size={16} className="text-amber-500" />
            case 'in_progress': return <AlertTriangle size={16} className="text-blue-500" />
            case 'resolved': return <CheckCircle size={16} className="text-emerald-500" />
            default: return null
        }
    }

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '500px', borderRadius: '16px', overflow: 'hidden', boxShadow: 3 }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* MUI Sidebar */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 }, p: 3, borderLeft: '1px solid #e2e8f0' }
                }}
            >
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                        Complaint Intelligence
                    </Typography>
                    <IconButton onClick={() => setDrawerOpen(false)} sx={{ ml: 'auto' }}>
                        <CloseIcon size={20} />
                    </IconButton>
                </Box>

                {selectedComplaint && (
                    <Stack spacing={3}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                                AI SUMMARY
                            </Typography>
                            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                                {selectedComplaint.ai_summary}
                            </Typography>
                        </Paper>

                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
                                METADATA
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MapPin size={14} className="text-slate-400" />
                                    <Typography variant="body2" color="text.secondary">{selectedComplaint.ai_department}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Calendar size={14} className="text-slate-400" />
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(selectedComplaint.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1}>
                            <Chip 
                                icon={getStatusIcon(selectedComplaint.status) as any}
                                label={selectedComplaint.status.toUpperCase()} 
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 'bold', fontSize: '10px' }}
                            />
                            <Chip 
                                label={selectedComplaint.ai_priority.toUpperCase()} 
                                color={selectedComplaint.ai_priority === 'high' ? 'error' : selectedComplaint.ai_priority === 'medium' ? 'warning' : 'primary'}
                                size="small"
                                sx={{ fontWeight: 'bold', fontSize: '10px' }}
                            />
                        </Stack>

                        <Divider />

                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1.5, display: 'block' }}>
                                VISUAL EVIDENCE
                            </Typography>
                            {selectedComplaint.citizen_image_urls && selectedComplaint.citizen_image_urls.length > 0 ? (
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                    {selectedComplaint.citizen_image_urls.map((url, i) => (
                                        <Box 
                                            key={i} 
                                            component="img" 
                                            src={url} 
                                            sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '8px' }} 
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="caption" color="text.disabled italic">No visual evidence provided</Typography>
                            )}
                        </Box>

                        <Box sx={{ mt: 'auto', pt: 4 }}>
                            <Card sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white' }}>
                                <CardContent sx={{ p: '16px !important' }}>
                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>AI Confidence</Typography>
                                    <Typography variant="h4" fontWeight="black">{(selectedComplaint.ai_confidence * 100).toFixed(1)}%</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Stack>
                )}
            </Drawer>
        </Box>
    )
}
