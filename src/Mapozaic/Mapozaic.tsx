import React, { useState, useRef, useEffect, MutableRefObject } from 'react'
import mapboxgl from 'mapbox-gl'

const token: string = process.env['REACT_APP_MAPBOX_TOKEN'] || ''

const styles = {
    width: '100vw',
    height: 'calc(100vh)',
    position: 'absolute',
} as React.CSSProperties

const MapboxGLMap = (): JSX.Element => {
    const [map, setMap] = useState<mapboxgl.Map | null>(null)
    const mapContainer = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        mapboxgl.accessToken = token
        const initializeMap = (mapContainer: MutableRefObject<HTMLDivElement | null>) => {
            const map = new mapboxgl.Map({
                container: mapContainer.current ? mapContainer.current : '',
                style: 'mapbox://styles/cartapuce/ck831v1pi187r1inxwf7np531', // stylesheet location
                zoom: 5,
            })

            map.on('load', () => {
                setMap(map)
                map.resize()
            })
        }

        if (!map && mapContainer) initializeMap(mapContainer)
    }, [map])

    return <div ref={(el) => (mapContainer.current = el)} style={styles} />
}

export default MapboxGLMap
