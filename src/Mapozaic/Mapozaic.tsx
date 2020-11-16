import React, { useState, useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button, Tooltip } from 'antd'
import { PictureOutlined, SettingOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'
import { Spin } from 'antd'
import spinner from 'assets/spinner.png'
import dice from 'assets/dice.svg'

import Drawer from './Drawer'

// eslint-disable-next-line
import PaintWorker from 'worker-loader!./paint.worker'

import 'Mapozaic/style.less'
import { MaposaicColors, PresetColorName } from 'Colors/types'
import { getTargetSizeFromSourceSize } from 'Canvas/utils'
import { ROAD_SIMPLE_WHITE, WATER_CYAN } from 'Colors/mapbox'
import { ROAD_WHITE } from 'Colors/colors'
import { OnPosterSizeChangePayload, SpecificColorTransforms } from 'Mapozaic/types'
import { Size } from 'Canvas/types'
import {
  resizeMapsContainer,
  setMapboxArtificialSize,
  setMapboxDisplaySize,
  toggleCanvasOpacity,
} from 'Mapozaic/elementHelpers'
import { CM_PER_INCH, FORMAT_RATIO } from 'constants/dimensions'
import CloudUpload from 'CloudUpload/CloudUpload'
import { TOOLTIP_ENTER_DELAY } from 'constants/ux'
import { MAPBOX_STYLE_URL, MAPBOX_TOKEN } from 'constants/mapbox'
import { fetchGeoRandom, getPlaceNameFromPosition } from 'utils/mapbox'
import PlaceName from 'Mapozaic/PlaceName'

mapboxgl.accessToken = MAPBOX_TOKEN

const INITIAL_SIZE_FACTOR = 1
const DISPLAY_PIXEL_RATIO = 1

let mapboxResolutionRatio: number | null = null
let paintWorker = new PaintWorker()

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

const getRandomZoom = () => {
  // mapbox zoom range : 0 (most zoom out) - 22
  return Math.random() * 13 + 3
}

const MapboxGLMap = (): JSX.Element => {
  const history = useHistory()
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const mapboxContainer = useRef<HTMLDivElement | null>(null)

  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)

  const [mapboxStyleURL, setMapboxStyleURL] = useState(MAPBOX_STYLE_URL.relief)
  const [maposaicColors, setMaposaicColors] = useState<MaposaicColors>(PresetColorName.Random)

  const [isLoading, setIsLoading] = useState(true)
  const [currentCenter, setCurrentCenter] = useState<null | mapboxgl.LngLat>(null)
  const [placeName, setPlaceName] = useState<null | string>(null)
  const [sizeRender, setSizeRender] = useState(0)
  const [sizeFactor, setSizeFactor] = useState(INITIAL_SIZE_FACTOR)
  const [specificColorTransforms, setSpecificColorTransforms] = useState<SpecificColorTransforms>({
    [ROAD_SIMPLE_WHITE]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
    [WATER_CYAN]: { color: null, isEditable: true, name: 'water' },
  })

  const [randomLngLat, setRandomLngLat] = useState<null | mapboxgl.LngLat>(null)
  const [randomZoom, setRandomZoom] = useState(getRandomZoom())
  const [areCoordsRandom, setAreCoordsRandom] = useState(true)
  const [showPlaceNameTrigger, setShowPlaceNameTrigger] = useState(false)
  const [showPlaceNameWhenFetched, setShowPlaceNameWhenFetched] = useState(false)

  const setRandomCoords = async () => {
    setIsLoading(true)
    const coords = await fetchGeoRandom()
    setShowPlaceNameWhenFetched(true)
    setRandomLngLat(coords)
    setRandomZoom(getRandomZoom())
    setAreCoordsRandom(true)
  }

  useEffect(() => {
    setRandomCoords()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const paintMosaic = async (newMap: mapboxgl.Map): Promise<void> => {
      setIsLoading(true)
      toggleCanvasOpacity(true)
      const mapboxCanvas = newMap.getCanvas()
      const gl = mapboxCanvas.getContext('webgl')
      const mapboxWrapper = document.getElementById('mapbox-wrapper')
      const maposaicCanvas = document.getElementById('maposaic-canvas') as HTMLCanvasElement

      if (!gl || !gl.drawingBufferWidth || !maposaicCanvas) {
        console.log('pas de gl')
        return
      }
      const mapboxCanvasSize = { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight }
      const maposaicCanvasSize = getTargetSizeFromSourceSize(mapboxCanvasSize, DISPLAY_PIXEL_RATIO)

      if (null === mapboxResolutionRatio) {
        // mapbox render with *2 resolution on some screens (like retina ones)
        mapboxResolutionRatio = gl.drawingBufferWidth / (mapboxWrapper?.offsetWidth || 1)
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
        const duration = new Date().getTime() - lastStartDate.getTime()
        if (pixelCount >= (computeTime.pixelCount ?? 0)) {
          computeTime.pixelCount = Math.floor(e.data.pixels.length / 4)
          computeTime.milliseconds = duration
        }
        setEstimatedTime(duration)
      }
    }
    if (!randomLngLat) {
      return
    }

    const center = areCoordsRandom ? randomLngLat : map?.getCenter() ?? randomLngLat
    const zoom = areCoordsRandom ? randomZoom : map?.getZoom() ?? randomZoom
    setAreCoordsRandom(false)

    setMapboxArtificialSize(sizeFactor)

    const newMap = new mapboxgl.Map({
      container: mapboxContainer.current ? mapboxContainer.current : '',
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
      if (newMap.getCenter().lat !== currentCenter?.lat && newMap.getCenter().lng !== currentCenter?.lng) {
        setCurrentCenter(newMap.getCenter())
      }
    })
    return () => {
      newMap.remove()
    }
    // eslint-disable-next-line
  }, [mapboxStyleURL, maposaicColors, sizeRender, sizeFactor, specificColorTransforms, randomLngLat])

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

  const onPosterSizeChange = ({
    isLandscape,
    pixelPerInchResolution,
    longerPropertyCMLength,
  }: OnPosterSizeChangePayload) => {
    if (!map) {
      return
    }

    const rootWrapper = document.getElementById('root-wrapper')
    const mapsContainerSize = { w: rootWrapper?.offsetWidth || 0, h: rootWrapper?.offsetHeight || 0 }

    const longerProperty = isLandscape ? 'w' : 'h'
    const smallerProperty = longerProperty === 'h' ? 'w' : 'h'

    const targetSize = {
      [smallerProperty]: Math.floor(mapsContainerSize[longerProperty] / FORMAT_RATIO),
      [longerProperty]: mapsContainerSize[longerProperty],
    } as Size

    if (targetSize[smallerProperty] > mapsContainerSize[smallerProperty]) {
      targetSize[smallerProperty] = mapsContainerSize[smallerProperty]
      targetSize[longerProperty] = Math.floor(mapsContainerSize[smallerProperty] * FORMAT_RATIO)
    }

    setIsLoading(true)
    resizeMapsContainer(targetSize)
    setSizeRender(sizeRender + 1)

    const target1DPixelCount = (longerPropertyCMLength / CM_PER_INCH) * pixelPerInchResolution
    const current1DPixelCount = targetSize[longerProperty] * (mapboxResolutionRatio || 1)
    const newSizeFactor = target1DPixelCount / current1DPixelCount
    setSizeFactor(newSizeFactor)
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

  const onCurrentCenterChange = async () => {
    const placeName = await getPlaceNameFromPosition(currentCenter)
    setPlaceName(placeName)
    if (showPlaceNameWhenFetched) {
      setShowPlaceNameTrigger(true)
      setShowPlaceNameWhenFetched(false)
    }
  }

  useEffect(() => {
    onCurrentCenterChange()
    // eslint-disable-next-line
  }, [currentCenter])

  useEffect(() => {
    setShowPlaceNameTrigger(false)
  }, [showPlaceNameTrigger])

  return (
    <div className="root-wrapper" id="root-wrapper">
      <div className="maps-container" id="maps-container">
        <canvas className="mosaic-canvas" id="maposaic-canvas" />
        <div id="mapbox-wrapper" className="mapbox-wrapper" ref={(el) => (mapboxContainer.current = el)} />
        <Spin spinning={isLoading} indicator={<img className="spinner" src={spinner} alt="spin" />} />
      </div>
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
          specificColorTransforms={specificColorTransforms}
          setNewSpecificColorTransforms={setNewSpecificColorTransforms}
          remainingTime={remainingTime}
          estimatedTime={estimatedTime}
          updateEstimatedTime={updateEstimatedTime}
          onPosterSizeChange={onPosterSizeChange}
        />
        <div className="overmap__actions">
          <Tooltip title="Settings" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
            <Button
              className="overmap__actions__button"
              type="primary"
              shape="circle"
              onClick={() => {
                setDrawerVisible(true)
              }}
              icon={<SettingOutlined />}
            />
          </Tooltip>
          <CloudUpload
            mapZoom={map?.getZoom()}
            mapCenter={map?.getCenter()}
            placeName={placeName}
            className="overmap__actions__button"
            isDisabled={isLoading}
          />
          <Tooltip title="Visit gallery" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
            <Button
              className="overmap__actions__button"
              type="default"
              shape="circle"
              onClick={() => {
                history.push('/gallery')
              }}
              icon={<PictureOutlined />}
            />
          </Tooltip>
          <Tooltip title="Random place" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
            <Button
              className="overmap__actions__button"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              shape="circle"
              onClick={setRandomCoords}
              icon={<img src={dice} width="16px" alt="dice" />}
            />
          </Tooltip>
        </div>
      </div>
      <PlaceName showPlaceNameTrigger={showPlaceNameTrigger} placeName={placeName} />
    </div>
  )
}

export default MapboxGLMap
