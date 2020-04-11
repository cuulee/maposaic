import React, { useState, useRef, useEffect } from 'react'
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

const showMapboxCanvas = (isMapbox: boolean): void => {
  const mapboxElement = document.getElementById('mapbox-cvs') as HTMLCanvasElement
  const mosaicElement = document.getElementById('maposaic-cvs') as HTMLCanvasElement
  mapboxElement.style.opacity = isMapbox ? '1' : '0'
  mosaicElement.style.opacity = isMapbox ? '0' : '1'
}

const MapboxGLMap = (): JSX.Element => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const paintMosaic = async (map: mapboxgl.Map): Promise<void> => {
    setIsLoading(true)
    showMapboxCanvas(true)
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

    const maposaicCanvas = document.getElementById('maposaic-cvs') as HTMLCanvasElement
    maposaicCanvas.setAttribute('width', viewportWidth.toString())
    maposaicCanvas.setAttribute('height', viewportHeight.toString())
    const maposaicContext = maposaicCanvas.getContext('2d')
    if (!maposaicContext) {
      return
    }
    const imageData = maposaicContext.getImageData(0, 0, maposaicCanvas.width, maposaicCanvas.height)
    const maposaicData = imageData.data

    const mapboxPixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
    gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, mapboxPixels)

    paintWorker.onmessage = function (e): void {
      imageData.data.set(e.data)
      maposaicContext.putImageData(imageData, 0, 0)
      showMapboxCanvas(false)
      setIsLoading(false)
    }
    paintWorker.postMessage({ mapboxPixels, maposaicData, webglWidth, webglHeight, viewportHeight, viewportWidth })
  }

  useEffect(() => {
    mapboxgl.accessToken = token

    const newMap = new mapboxgl.Map({
      container: mapContainer.current ? mapContainer.current : '',
      style: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka', // administrative
      // style: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4', // road
      // style: 'mapbox://styles/mapbox/streets-v11',
      zoom: 12,
      center: {
        lng: 2.338272,
        lat: 48.858796,
      },
    })

    newMap.on('load', () => {
      setMap(newMap)
      newMap.resize()
    })
    newMap.on('dragstart', showMapboxCanvas)
    newMap.on('zoomstart', showMapboxCanvas)
    newMap.on('render', () => {
      if (!newMap.loaded() || newMap.isMoving() || newMap.isZooming()) {
        return
      }
      paintWorker.terminate()
      paintWorker = new PaintWorker()
      paintMosaic(newMap)
    })
  }, [])

  return (
    <div className="container">
      <canvas className="mozaic" width="300" height="300" id="maposaic-cvs" />
      <div id="mapbox-cvs" className="mapbox-cvs" ref={(el) => (mapContainer.current = el)} style={styles} />
      {isLoading && <div className="loading">Loading...</div>}
    </div>
  )
}

export default MapboxGLMap
