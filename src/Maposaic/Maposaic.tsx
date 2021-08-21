import React, { useCallback, useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button, Tooltip } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'
import spinner from 'assets/spinner.png'

import Drawer from 'Drawer/Drawer'

import 'Maposaic/maposaic.style.less'
import 'spinner.style.less'

import { ColorConfig } from 'Colors/types'
import { ROAD_SIMPLE_WHITE, WATER_CYAN } from 'Colors/mapbox'
import { RANDOM_CONFIG, ROAD_WHITE } from 'Colors/constants'
import {
  MapboxStyle,
  MAPOSAIC_SCREENSAVER_PARAM_KEY,
  MAPOSAIC_STYLE_URL_PARAM_KEY,
  MaposaicGeoURLParamKey,
  MosaicMode,
  OnPosterSizeChangePayload,
  SpecificColorTransforms,
} from 'Maposaic/types'
import { getPosterTargetSize, resizeMapsContainer, toggleCanvasOpacity } from 'Maposaic/elementHelpers'
import { TOOLTIP_ENTER_DELAY } from 'constants/ux'
import { MAPBOX_TOKEN } from 'constants/mapbox'
import { fetchGeoRandom, getPlaceNameFromPosition, getRandomCityCoords, getRandomZoom } from 'Geo/utils'
import {
  getColorConfigFromURLParams,
  getURLParamsFromColorConfig,
  getURLParamsFromCoords,
  useCheckMobileScreen,
} from 'Maposaic/utils'
import { TRUE_URL_PARAM_VALUE } from 'constants/navigation'
import PlaceName from 'PlaceName/PlaceName'
import { usePaintMosaic } from 'Maposaic/usePaintMosaic'
import Converter, { OUTPUT_CANVAS_ID } from 'Converter/Converter'

mapboxgl.accessToken = MAPBOX_TOKEN

const INITIAL_SIZE_FACTOR = 1

let lastFetchedPlaceNameCenter: mapboxgl.LngLat | null = null

const MapboxGLMap = ({ isWasmAvailable }: { isWasmAvailable: boolean | null }): JSX.Element => {
  const [isMobile, setIsMobile] = useState(false)
  const [mosaicMode, setMosaicMode] = useState(MosaicMode.Map)
  const [isInitialUrlParamsParsed, setIsInitialUrlParamsParsed] = useState(false)
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const mapboxContainer = useRef<HTMLDivElement | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [displayLogo, setDisplayLogo] = useState(true)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [mapboxStyle, setMapboxStyle] = useState(MapboxStyle.Road)
  const [colorConfig, setColorConfig] = useState<ColorConfig>(RANDOM_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [currentCenter, setCurrentCenter] = useState<null | mapboxgl.LngLat>(null)
  const [placeName, setPlaceName] = useState<null | string>(null)
  const [hidePlaceName, setHidePlaceName] = useState(false)
  const [sizeRender, setSizeRender] = useState(0)
  const [sizeFactor, setSizeFactor] = useState(INITIAL_SIZE_FACTOR)
  const [initialCenter, setInitialCenter] = useState<null | mapboxgl.LngLat>(null)
  const [initialZoom, setInitialZoom] = useState<number>(getRandomZoom())
  const [showPlaceNameTrigger, setShowPlaceNameTrigger] = useState(0)
  const [specificColorTransforms, setSpecificColorTransforms] = useState<SpecificColorTransforms>({
    [ROAD_SIMPLE_WHITE]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
    [WATER_CYAN]: { color: null, isEditable: true, name: 'water' },
  })

  useCheckMobileScreen({ setIsMobile })
  useEffect(() => {
    if (!currentCenter || !map) {
      return
    }
    const urlParams = getURLParamsFromCoords(currentCenter, map.getZoom(), new URLSearchParams(window.location.search))
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
  }, [currentCenter, map])

  useEffect(() => {
    if (!isInitialUrlParamsParsed) {
      return
    }
    const urlParams = getURLParamsFromColorConfig(colorConfig, new URLSearchParams(window.location.search))
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
  }, [colorConfig, isInitialUrlParamsParsed])

  useEffect(() => {
    if (!isInitialUrlParamsParsed) {
      return
    }
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set(MAPOSAIC_STYLE_URL_PARAM_KEY, mapboxStyle)
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`)
  }, [mapboxStyle, isInitialUrlParamsParsed])

  const setRandomCoords = useCallback(
    async ({ setZoom, fetchFromApi }: { setZoom: boolean; fetchFromApi: boolean }) => {
      setIsLoading(true)
      const randomCenter = fetchFromApi ? await fetchGeoRandom() : getRandomCityCoords()
      void fetchAndSetPlaceName({ showPlaceName: true, center: randomCenter })

      if (initialZoom === null && setZoom) {
        setInitialZoom(getRandomZoom())
      }
      if (!initialCenter) {
        setInitialCenter(randomCenter)
        return
      }
      if (!map) {
        return
      }
      map.setCenter(randomCenter)
      if (setZoom) {
        map.setZoom(getRandomZoom())
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map],
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const lat = urlParams.get(MaposaicGeoURLParamKey.Lat)
    const lng = urlParams.get(MaposaicGeoURLParamKey.Lng)
    const zoom = urlParams.get(MaposaicGeoURLParamKey.Zoom)
    if (lat && lng) {
      const center = new mapboxgl.LngLat(parseFloat(lng), parseFloat(lat))
      void fetchAndSetPlaceName({ showPlaceName: true, center })
      setInitialCenter(center)
    } else {
      void setRandomCoords({ setZoom: !zoom, fetchFromApi: false })
    }
    if (zoom) {
      setInitialZoom(parseFloat(zoom))
    }
    const colorConfig = getColorConfigFromURLParams(new URLSearchParams(window.location.search))
    if (colorConfig) {
      setColorConfig(colorConfig)
    }
    const style = urlParams.get(MAPOSAIC_STYLE_URL_PARAM_KEY)
    if (style && Object.values(MapboxStyle).includes(style as MapboxStyle)) {
      setMapboxStyle(style as MapboxStyle)
    }
    setIsInitialUrlParamsParsed(true)
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    setSizeRender((sizeRender) => sizeRender + 1)
    if (mosaicMode === MosaicMode.Image) {
      setDrawerVisible(false)
      setHidePlaceName(true)
    } else {
      setHidePlaceName(false)
    }
  }, [mosaicMode])

  const changePlacePeriodically = useCallback(() => {
    void setRandomCoords({ setZoom: true, fetchFromApi: false })
    setTimeout(changePlacePeriodically, 55555)
  }, [setRandomCoords])

  useEffect(() => {
    if (new URLSearchParams(window.location.search)?.get(MAPOSAIC_SCREENSAVER_PARAM_KEY) === TRUE_URL_PARAM_VALUE) {
      const changePlace = setTimeout(changePlacePeriodically, 55555)
      return () => clearTimeout(changePlace)
    }
  }, [changePlacePeriodically])

  const { mapboxResolutionRatio } = usePaintMosaic({
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
    displayLogo,
  })

  const changeMapStyle = (newStyle: MapboxStyle) => {
    toggleCanvasOpacity(true)
    setIsLoading(true)
    setMapboxStyle(newStyle)
  }

  const setNewColorConfig = (colorConfig: ColorConfig) => {
    setColorConfig(colorConfig)
    setIsLoading(true)
  }

  const setNewSpecificColorTransforms = (colorTransforms: SpecificColorTransforms) => {
    setSpecificColorTransforms(colorTransforms)
    setIsLoading(true)
  }

  const flyTo = (center: mapboxgl.LngLat) => {
    if (!map) {
      return
    }
    toggleCanvasOpacity(true)
    setIsLoading(true)
    map.setCenter(center)
  }

  const onPosterSizeChange = (payload: OnPosterSizeChangePayload) => {
    const { targetSize, newSizeFactor } = getPosterTargetSize({ mapboxResolutionRatio, ...payload })
    if (!targetSize) {
      return
    }
    setIsLoading(true)
    resizeMapsContainer(targetSize)
    setSizeRender(sizeRender + 1)

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

  const fetchAndSetPlaceName = async ({
    showPlaceName,
    center,
  }: {
    showPlaceName: boolean
    center: mapboxgl.LngLat | null
  }) => {
    if (
      !center ||
      (lastFetchedPlaceNameCenter &&
        Math.abs(lastFetchedPlaceNameCenter.lat - (center?.lat || 0)) < 0.0001 &&
        Math.abs(lastFetchedPlaceNameCenter.lng - (center?.lng || 0)) < 0.0001)
    ) {
      return
    }
    lastFetchedPlaceNameCenter = center
    const placeName = await getPlaceNameFromPosition(center)
    setPlaceName(placeName)
    if (showPlaceName) {
      setShowPlaceNameTrigger(showPlaceNameTrigger + 1)
    }
  }

  useEffect(() => {
    void fetchAndSetPlaceName({ showPlaceName: false, center: currentCenter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCenter])

  const getMosaicElementById = () => {
    return mosaicMode === MosaicMode.Map
      ? (document.getElementById('maposaic-canvas') as HTMLCanvasElement | null)
      : (document.getElementById(OUTPUT_CANVAS_ID) as HTMLCanvasElement | null)
  }

  const download = () => {
    const mosaicElement = getMosaicElementById()
    if (!mosaicElement) {
      return
    }
    mosaicElement.toBlob((blob) => {
      const link = document.createElement('a')
      let fileName = placeName ? `maposaic - ${placeName}` : 'maposaic'
      if (mosaicMode === MosaicMode.Image) {
        fileName = 'painted image'
      }
      link.download = fileName
      link.href = URL.createObjectURL(blob)
      link.click()
    })
  }

  const onGeolocationClick = () => {
    if (!map) {
      return
    }
    setIsLoading(true)
    if (!navigator.geolocation) {
      setIsLoading(false)
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.setCenter(new mapboxgl.LngLat(position.coords.longitude, position.coords.latitude))
          map.setZoom(14)
        },
        () => setIsLoading(false),
      )
    }
  }

  return (
    <div className="root-wrapper" id="root-wrapper">
      {mosaicMode === MosaicMode.Map ? (
        <div className="maps-container" id="maps-container">
          <canvas className="mosaic-canvas" id="maposaic-canvas" />
          <div id="mapbox-wrapper" className="mapbox-wrapper" ref={(el) => (mapboxContainer.current = el)} />
          <Spin
            className="maps-container__spin"
            spinning={isLoading}
            indicator={<img className="spinner" src={spinner} alt="spin" />}
          />
        </div>
      ) : (
        <div className="image-converter">
          <Converter
            isWasmAvailable={!!isWasmAvailable}
            specificColorTransforms={specificColorTransforms}
            colorConfig={colorConfig}
            setIsParentLoading={setIsLoading}
          />
        </div>
      )}
      <Drawer
        visible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
        changeMapStyle={changeMapStyle}
        mapboxStyle={mapboxStyle}
        colorConfig={colorConfig}
        setColorConfig={setNewColorConfig}
        specificColorTransforms={specificColorTransforms}
        setNewSpecificColorTransforms={setNewSpecificColorTransforms}
        remainingTime={remainingTime}
        estimatedTime={estimatedTime}
        onPosterSizeChange={onPosterSizeChange}
        isMobile={isMobile}
        displayLogo={displayLogo}
        setDisplayLogo={setDisplayLogo}
        flyTo={flyTo}
        currentCenter={currentCenter}
        setRandomCoords={setRandomCoords}
        onGeolocationClick={onGeolocationClick}
        isLoading={isLoading}
        download={download}
        mapZoom={map?.getZoom()}
        mapCenter={map?.getCenter()}
        placeName={placeName}
        mosaicMode={mosaicMode}
        setMosaicMode={setMosaicMode}
        getMosaicElementById={getMosaicElementById}
      />
      <div className="overmap">
        <div className="overmap__actions">
          <Tooltip title="Settings" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
            <Button
              className="overmap__actions__button"
              type="primary"
              shape="circle"
              onClick={() => setDrawerVisible(true)}
              icon={<SettingOutlined />}
            />
          </Tooltip>
        </div>
      </div>
      <PlaceName hidePlaceName={hidePlaceName} showPlaceNameTrigger={showPlaceNameTrigger} placeName={placeName} />
    </div>
  )
}

export default MapboxGLMap
