import React, { useState, useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from 'antd'
import { RightCircleFilled } from '@ant-design/icons'
import { Spin } from 'antd'
import spinner from '../assets/spinner.png'

import Drawer from './Drawer'

// eslint-disable-next-line
import PaintWorker from 'worker-loader!./paint.worker'

import './style.css'
import { MaposaicColors, PresetColorName } from 'Colors/types'
import { getTargetSizeFromSourceSize } from 'Canvas/utils'
import { ROAD_SIMPLE_GREY, WATER_BLACK } from 'Colors/mapbox'
import { ROAD_WHITE } from 'Colors/colors'
import { SpecificColorTransforms } from 'Mapozaic/types'

// eslint-disable-next-line
export const MAPBOX_TOKEN: string = process.env['REACT_APP_MAPBOX_TOKEN'] || ''
mapboxgl.accessToken = MAPBOX_TOKEN

export const MAPBOX_STYLE_URL = {
  road: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
  water: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
  administrative: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  // regular: 'mapbox://styles/mapbox/streets-v11',
}

export const INITIAL_SIZE_FACTOR = 1
const DISPLAY_PIXEL_RATIO = 1

// const TARGET_INCH_WIDTH = 10
// const TARGET_DPI = 300
// const TARGET_PIXEL_WIDTH = TARGET_DPI * TARGET_INCH_WIDTH
// const MAPBOX_PIXEL_FACTOR = 2
// const ARTIFICIAL_MAPBOX_WIDTH = TARGET_PIXEL_WIDTH / MAPBOX_PIXEL_FACTOR

let paintWorker = new PaintWorker()
let displayWidth = 0
let displayHeight = 0

const toggleCanvasOpacity = (isMapbox: boolean): void => {
  const mapboxElement = document.getElementById('mapbox-wrapper') as HTMLElement
  const mosaicCanvas = document.getElementById('maposaic-cvs') as HTMLCanvasElement
  mapboxElement.style.opacity = isMapbox ? '1' : '0'
  mosaicCanvas.style.opacity = isMapbox ? '0' : '1'
}

const setMapboxArtificialSize = (sizeFactor: number) => {
  const mapboxWrapper = document.getElementById('mapbox-wrapper') as HTMLElement
  displayWidth = mapboxWrapper.offsetWidth
  displayHeight = mapboxWrapper.offsetHeight
  mapboxWrapper.style.width = (displayWidth * sizeFactor).toString() + 'px'
  mapboxWrapper.style.height = (displayHeight * sizeFactor).toString() + 'px'
}

const setMapboxDisplaySize = () => {
  const mapboxCanvas = document.getElementsByClassName('mapboxgl-canvas')[0] as HTMLCanvasElement
  const mapboxWrapper = document.getElementById('mapbox-wrapper') as HTMLElement
  mapboxCanvas.style.width = displayWidth.toString() + 'px'
  mapboxCanvas.style.height = displayHeight.toString() + 'px'
  mapboxWrapper.style.width = ''
  mapboxWrapper.style.height = ''
}

const getMapboxPixelCount = (map: mapboxgl.Map) => {
  const mapboxCanvas = map.getCanvas()
  const gl = mapboxCanvas.getContext('webgl')
  return (gl?.drawingBufferWidth ?? 0) * (gl?.drawingBufferHeight || 0)
}

const computeTime: { pixelCount: number | null; milliseconds: number | null } = {
  pixelCount: null,
  milliseconds: null,
}

let lastStartDate = new Date()

const MapboxGLMap = (): JSX.Element => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)

  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  const [mapboxStyleURL, setMapboxStyleURL] = useState(MAPBOX_STYLE_URL.road)
  const [maposaicColors, setMaposaicColors] = useState<MaposaicColors>(PresetColorName.Random)

  const [isLoading, setIsLoading] = useState(true)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>([0, 0])
  const [sizeRender, setSizeRender] = useState(0)
  const [sizeFactor, setSizeFactor] = useState(INITIAL_SIZE_FACTOR)
  const [specificColorTransforms, setSpecificColorTransforms] = useState<SpecificColorTransforms>({
    [ROAD_SIMPLE_GREY]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
    [WATER_BLACK]: { color: null, isEditable: true, name: 'water' },
  })

  useEffect(() => {
    const paintMosaic = async (newMap: mapboxgl.Map): Promise<void> => {
      setIsLoading(true)
      toggleCanvasOpacity(true)
      const mapboxCanvas = newMap.getCanvas()
      const gl = mapboxCanvas.getContext('webgl')
      if (!gl || !gl.drawingBufferWidth) {
        console.log('pas de gl')
        return
      }
      const mapboxCanvasSize = { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight }
      const maposaicCanvasSize = getTargetSizeFromSourceSize(mapboxCanvasSize, DISPLAY_PIXEL_RATIO)
      const maposaicCanvas = document.getElementById('maposaic-cvs') as HTMLCanvasElement

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
        maposaicColors,
        specificColorTransforms,
      })

      paintWorker.onmessage = function (e: { data: { pixels: number[]; paintedBoundsMin: number } }): void {
        imageData.data.set(e.data.pixels, e.data.paintedBoundsMin)
        maposaicContext.putImageData(imageData, 0, 0)
        toggleCanvasOpacity(false)
        setIsLoading(false)
        setRemainingTime(0)

        const pixelCount = Math.floor(e.data.pixels.length / 4)

        if (pixelCount >= (computeTime.pixelCount ?? 0)) {
          computeTime.pixelCount = Math.floor(e.data.pixels.length / 4)
          computeTime.milliseconds = new Date().getTime() - lastStartDate.getTime()
        }
        if (estimatedTime === null) {
          setEstimatedTime(computeTime.milliseconds)
        }
      }
    }

    const center = map ? map.getCenter() : new mapboxgl.LngLat(2.338272, 48.858796)
    const zoom = map ? map.getZoom() : 12

    setMapboxArtificialSize(sizeFactor)

    const newMap = new mapboxgl.Map({
      container: mapContainer.current ? mapContainer.current : '',
      style: mapboxStyleURL,
      zoom,
      center,
      maxTileCacheSize: 0,
    })
    newMap.on('load', () => {
      setMap(newMap)
    })

    newMap.on('resize', () => {
      setSizeRender((s) => s + 1)
    })
    newMap.on('dragstart', toggleCanvasOpacity)
    newMap.on('zoomstart', toggleCanvasOpacity)

    newMap.on('render', () => {
      setMapboxDisplaySize()
      if (!newMap.loaded() || newMap.isMoving() || newMap.isZooming()) {
        return
      }
      paintWorker.terminate()

      const pixelCount = getMapboxPixelCount(newMap)
      setRemainingTime(Math.round(((computeTime.milliseconds || 0) * pixelCount) / (computeTime.pixelCount || 1)))

      lastStartDate = new Date()
      paintWorker = new PaintWorker()
      paintMosaic(newMap)
      setCurrentCenter([newMap.getCenter().lng, newMap.getCenter().lat])
    })
    return () => {
      newMap.remove()
    }
    // eslint-disable-next-line
  }, [mapboxStyleURL, maposaicColors, sizeRender, sizeFactor, specificColorTransforms])

  const [drawerVisible, setDrawerVisible] = useState(false)

  const changeMapStyle = (newStyle: string) => {
    toggleCanvasOpacity(true)
    setIsLoading(true)
    setMapboxStyleURL(newStyle)
  }

  const setNewMaposaicColors = (colors: MaposaicColors) => {
    setMaposaicColors(colors)
    setIsLoading(true)
  }
  const setNewSizeFactor = (sizeFactor: number) => {
    setSizeFactor(sizeFactor)
    setIsLoading(true)
  }
  const setNewSpecificColorTransforms = (colorTransforms: SpecificColorTransforms) => {
    setSpecificColorTransforms(colorTransforms)
    setIsLoading(true)
  }

  const flyTo = (center: [number, number]) => {
    if (!map) {
      return
    }
    toggleCanvasOpacity(true)
    setIsLoading(true)
    map.setCenter(center)
  }

  const openCanvasImage = () => {
    const mosaicElement = document.getElementById('maposaic-cvs') as HTMLCanvasElement
    const image = new Image()
    image.src = mosaicElement.toDataURL()
    image.style.width = '100vw'
    const w = window.open('bijour ')
    if (!w) {
      return
    }
    w.document.write(image.outerHTML)
  }

  useEffect(() => {
    if (!remainingTime || remainingTime <= 0) {
      return
    }

    const interval = setInterval(() => {
      setRemainingTime(Math.max(Math.round(remainingTime - 200), 0))
    }, 200)
    return () => clearInterval(interval)
  }, [remainingTime])

  const updateEstimatedTime = (pendingSizeFactor: number) => {
    if (!map) {
      return
    }
    const pixelCount = getMapboxPixelCount(map)
    setEstimatedTime(
      Math.round(((computeTime.milliseconds || 0) * pixelCount) / (computeTime.pixelCount || 1)) *
        Math.pow(pendingSizeFactor / sizeFactor, 2),
    )
  }

  return (
    <div className="container">
      <canvas className="mosaic-canvas" id="maposaic-cvs" />
      <div id="mapbox-wrapper" className="mapbox-canvas" ref={(el) => (mapContainer.current = el)} />
      <Spin spinning={isLoading} indicator={<img className="spinner" src={spinner} alt="spin" />} />
      <div className="overmap">
        <Drawer
          visible={drawerVisible}
          setDrawerVisible={setDrawerVisible}
          changeMapStyle={changeMapStyle}
          mapboxStyleURL={mapboxStyleURL}
          flyTo={flyTo}
          currentCenter={currentCenter}
          maposaicColors={maposaicColors}
          setNewMaposaicColors={setNewMaposaicColors}
          sizeFactor={sizeFactor}
          setNewSizeFactor={setNewSizeFactor}
          openCanvasImage={openCanvasImage}
          specificColorTransforms={specificColorTransforms}
          setNewSpecificColorTransforms={setNewSpecificColorTransforms}
          remainingTime={remainingTime}
          estimatedTime={estimatedTime}
          updateEstimatedTime={updateEstimatedTime}
        />
        <Button
          type="primary"
          shape="circle"
          onClick={() => {
            setDrawerVisible(true)
          }}
          icon={<RightCircleFilled />}
        />
      </div>
    </div>
  )
}

export default MapboxGLMap
