import { getTargetSizeFromSourceSize } from 'Canvas/utils'
import { ColorConfig } from 'Colors/types'
import { createMaposaicColors } from 'Colors/utils'
import { TRUE_URL_PARAM_VALUE } from 'constants/navigation'
import { OUTPUT_CANVAS_ID } from 'Logo/Logo'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_STYLES } from 'Maposaic/constants'
import { setMapboxArtificialSize, setMapboxDisplaySize, toggleCanvasOpacity } from 'Maposaic/elementHelpers'
import {
  MapboxStyle,
  MAPOSAIC_HIDE_DRAWER_PARAM_KEY,
  MAPOSAIC_SCREENSAVER_PARAM_KEY,
  SpecificColorTransforms,
} from 'Maposaic/types'
import { useEffect, useState } from 'react'

// eslint-disable-next-line
import PaintWorker from 'worker-loader!../Converter/paint.worker'
let paintWorker = new PaintWorker()

const DISPLAY_PIXEL_RATIO = 1

let lastStartDate = new Date()
let isFirstRender = true

const computeTime: { pixelCount: number | null; milliseconds: number | null } = {
  pixelCount: null,
  milliseconds: null,
}

const getMapboxPixelCount = (map: mapboxgl.Map) => {
  const mapboxCanvas = map.getCanvas()
  const gl = mapboxCanvas.getContext('webgl')
  return (gl?.drawingBufferWidth ?? 0) * (gl?.drawingBufferHeight ?? 0)
}

export const usePaintMosaic = ({
  setIsLoading,
  colorConfig,
  specificColorTransforms,
  isWasmAvailable,
  setRemainingTime,
  setEstimatedTime,
  initialCenter,
  map,
  initialZoom,
  sizeFactor,
  mapboxContainer,
  mapboxStyle,
  isMobile,
  setDrawerVisible,
  setSizeRender,
  setMap,
  currentCenter,
  setCurrentCenter,
  sizeRender,
}: {
  setIsLoading: (loading: boolean) => void
  colorConfig: ColorConfig
  specificColorTransforms: SpecificColorTransforms
  isWasmAvailable: boolean | null
  setRemainingTime: (time: number) => void
  setEstimatedTime: (time: number) => void
  initialCenter: null | mapboxgl.LngLat
  map: mapboxgl.Map | null
  initialZoom: number
  sizeFactor: number
  mapboxContainer: React.MutableRefObject<HTMLDivElement | null>
  mapboxStyle: MapboxStyle
  isMobile: boolean
  setDrawerVisible: (visible: boolean) => void
  setSizeRender: React.Dispatch<React.SetStateAction<number>>
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | null>>
  currentCenter: null | mapboxgl.LngLat
  setCurrentCenter: React.Dispatch<React.SetStateAction<null | mapboxgl.LngLat>>
  sizeRender: number
}) => {
  const [mapboxResolutionRatio, setmapboxResolutionRatio] = useState<number | null>(null)

  useEffect(() => {
    const paintMosaic = (newMap: mapboxgl.Map): void => {
      setIsLoading(true)
      toggleCanvasOpacity(true)
      const mapboxCanvas = newMap.getCanvas()
      const gl = mapboxCanvas.getContext('webgl')
      const mapboxWrapper = document.getElementById('mapbox-wrapper')
      const maposaicCanvas = document.getElementById('maposaic-canvas') as HTMLCanvasElement

      if (!gl || !gl.drawingBufferWidth || !maposaicCanvas) {
        return
      }
      const mapboxCanvasSize = { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight }
      const maposaicCanvasSize = getTargetSizeFromSourceSize(mapboxCanvasSize, DISPLAY_PIXEL_RATIO)

      if (null === mapboxResolutionRatio) {
        // mapbox render with *2 resolution on some screens (like retina ones)
        setmapboxResolutionRatio(gl.drawingBufferWidth / (mapboxWrapper?.offsetWidth ?? 1))
      }

      maposaicCanvas.setAttribute('width', maposaicCanvasSize.w.toString())
      maposaicCanvas.setAttribute('height', maposaicCanvasSize.h.toString())

      const maposaicContext = maposaicCanvas.getContext('2d')
      if (!maposaicContext) {
        return
      }
      const imageData = maposaicContext.getImageData(0, 0, maposaicCanvasSize.w, maposaicCanvasSize.h)
      const maposaicData = imageData.data

      const mapboxPixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
      gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, mapboxPixels)

      paintWorker.postMessage({
        sourcePixelArray: mapboxPixels,
        targetPixelArray: maposaicData,
        sourceSize: mapboxCanvasSize,
        targetSize: maposaicCanvasSize,
        canvassRatio: DISPLAY_PIXEL_RATIO,
        maposaicColors: createMaposaicColors(colorConfig, specificColorTransforms),
        specificColorTransforms,
        isWasmAvailable,
      })

      paintWorker.onmessage = function (e: { data: { pixels: number[]; paintedBoundsMin: number } }): void {
        imageData.data.set(e.data.pixels, e.data.paintedBoundsMin)
        maposaicContext.putImageData(imageData, 0, 0)
        toggleCanvasOpacity(false)
        setIsLoading(false)
        setRemainingTime(0)

        const outputCanvas = document.getElementById(OUTPUT_CANVAS_ID) as HTMLCanvasElement | null
        if (outputCanvas) {
          maposaicContext.drawImage(outputCanvas, 30, 30, 300, (outputCanvas.height * 300) / outputCanvas.width)
        }

        const pixelCount = Math.floor(e.data.pixels.length / 4)
        const duration = new Date().getTime() - lastStartDate.getTime()
        if (pixelCount >= (computeTime.pixelCount ?? 0)) {
          computeTime.pixelCount = Math.floor(e.data.pixels.length / 4)
          computeTime.milliseconds = duration
        }
        setEstimatedTime(duration)
      }
    }
    if (null === isWasmAvailable) {
      return // avoid flash at initalization
    }
    if (!initialCenter) {
      return
    }

    const center = map?.getCenter() ?? initialCenter
    const zoom = map?.getZoom() ?? initialZoom

    setMapboxArtificialSize(sizeFactor)

    const newMap = new mapboxgl.Map({
      container: mapboxContainer.current ? mapboxContainer.current : '',
      style: MAPBOX_STYLES[mapboxStyle].url,
      zoom,
      center,
      maxTileCacheSize: 0,
    })

    newMap.on('load', () => {
      if (isFirstRender) {
        isFirstRender = false
        const urlParams = new URLSearchParams(window.location.search)
        if (
          !isMobile &&
          urlParams.get(MAPOSAIC_HIDE_DRAWER_PARAM_KEY) !== TRUE_URL_PARAM_VALUE &&
          urlParams.get(MAPOSAIC_SCREENSAVER_PARAM_KEY) !== TRUE_URL_PARAM_VALUE
        ) {
          setDrawerVisible(true)
        }
      }
      setMap(newMap)
    })
    newMap.on('resize', () => setSizeRender((s) => s + 1))
    newMap.on('dragstart', toggleCanvasOpacity)
    newMap.on('zoomstart', toggleCanvasOpacity)

    newMap.on('render', () => {
      setMapboxDisplaySize()
      paintWorker.terminate()

      if (!newMap.loaded() || newMap.isMoving() || newMap.isZooming()) {
        return
      }

      const pixelCount = getMapboxPixelCount(newMap)
      setRemainingTime(Math.round(((computeTime.milliseconds ?? 0) * pixelCount) / (computeTime.pixelCount ?? 1)))

      lastStartDate = new Date()
      paintWorker = new PaintWorker()
      paintMosaic(newMap)
      if (newMap.getCenter().lat !== currentCenter?.lat && newMap.getCenter().lng !== currentCenter?.lng) {
        setCurrentCenter(newMap.getCenter())
      }
    })
    return () => {
      newMap.remove()
    }
    // eslint-disable-next-line
  }, [mapboxStyle, colorConfig, sizeRender, sizeFactor, specificColorTransforms, initialCenter, isWasmAvailable])

  return { mapboxResolutionRatio }
}
