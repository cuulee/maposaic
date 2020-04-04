import React, { useState, useRef, useEffect, MutableRefObject } from 'react'
import mapboxgl from 'mapbox-gl'
// eslint-disable-next-line
import PaintWorker from 'worker-loader!./paint.worker'

import './style.css'

// eslint-disable-next-line
const token: string = process.env['REACT_APP_MAPBOX_TOKEN'] || ''

const styles = {
  width: '100vw',
  height: 'calc(100vh)',
  position: 'absolute',
} as React.CSSProperties

export type RGBColor = { r: number; g: number; b: number }
export type imagePoint = { x: number; y: number }

let paintWorker = new PaintWorker()

const showMapboxCanvas = (): void => {
  const mapboxCanvas = document.getElementById('mapbox-cvs') as HTMLCanvasElement
  const cvs = document.getElementById('mapozaic-cvs') as HTMLCanvasElement
  mapboxCanvas.style.opacity = '1'
  cvs.style.opacity = '0'
}

const MapboxGLMap = (): JSX.Element => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const paintMozaic = async (map: mapboxgl.Map): Promise<void> => {
    setIsLoading(true)
    showMapboxCanvas()
    const mapboxCanvas = map.getCanvas()
    const gl = mapboxCanvas.getContext('webgl')
    if (!gl) {
      console.log('pas de gl')
      return
    }
    const webglWidth = gl.drawingBufferWidth
    const webglHeight = gl.drawingBufferHeight
    const viewportWidth = webglWidth
    const viewportHeight = webglHeight

    const mapozaicCanvas = document.getElementById('mapozaic-cvs') as HTMLCanvasElement
    mapozaicCanvas.setAttribute('width', viewportWidth.toString())
    mapozaicCanvas.setAttribute('height', viewportHeight.toString())
    const mapozaicContext = mapozaicCanvas.getContext('2d')
    if (!mapozaicContext) {
      return
    }
    const imageData = mapozaicContext.getImageData(0, 0, mapozaicCanvas.width, mapozaicCanvas.height)
    const mapozaicData = imageData.data

    const mapboxPixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, mapboxPixels)

    paintWorker.onmessage = function (e): void {
      imageData.data.set(e.data)
      mapozaicContext.putImageData(imageData, 0, 0)
      const mapboxElement = document.getElementById('mapbox-cvs') as HTMLCanvasElement
      mapboxElement.style.opacity = '0'
      mapozaicCanvas.style.opacity = '1'
      setIsLoading(false)
    }
    paintWorker.postMessage({ mapboxPixels, mapozaicData, webglWidth, webglHeight, viewportHeight, viewportWidth })
  }

  useEffect(() => {
    mapboxgl.accessToken = token
    const initializeMap = (mapContainer: MutableRefObject<HTMLDivElement | null>): void => {
      const map = new mapboxgl.Map({
        container: mapContainer.current ? mapContainer.current : '',
        style: 'mapbox://styles/cartapuce/ck831v1pi187r1inxwf7np531', // stylesheet location
        // style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 12,
        center: {
          lng: 2.338272,
          lat: 48.858796,
        },
      })

      map.on('load', () => {
        setMap(map)
        map.resize()
      })
      map.on('dragstart', showMapboxCanvas)
      map.on('zoomstart', showMapboxCanvas)
      map.on('render', () => {
        if (!map.loaded() || map.isMoving() || map.isZooming()) {
          return
        }
        paintWorker.terminate()
        paintWorker = new PaintWorker()
        paintMozaic(map)
      })
    }

    if (!map && mapContainer) {
      initializeMap(mapContainer)
    }
  }, [map])

  return (
    <div className="container">
      <canvas className="mozaic" width="300" height="300" id="mapozaic-cvs" />
      <div id="mapbox-cvs" className="mapbox-cvs" ref={(el) => (mapContainer.current = el)} style={styles} />
      {isLoading && <div className="loading">Loading...</div>}
    </div>
  )
}

export default MapboxGLMap
