import {
  AntColors,
  DEFAULT_PALETTE_CONFIG,
  DEFAULT_SHADING_CONFIG,
  PRESET_PALETTES,
  RANDOM_CONFIG,
} from 'Colors/constants'
import { ColorConfig, ColorConfigType, PaletteOrigin, PaletteType, ShadingPresetName, ShadingType } from 'Colors/types'
import { MaposaicColorURLParamKey, MaposaicGeoURLParamKey } from 'Maposaic/types'
import { useEffect, useState } from 'react'
import screenfull from 'screenfull'

const COLORS_SEPARATOR = ','

export const getURLParamsFromCoords = (center: mapboxgl.LngLat, zoom: number, urlParams: URLSearchParams) => {
  urlParams.set(MaposaicGeoURLParamKey.Lat, roundCoord(center.lat).toString())
  urlParams.set(MaposaicGeoURLParamKey.Lng, roundCoord(center.lng).toString())
  urlParams.set(MaposaicGeoURLParamKey.Zoom, roundZoom(zoom).toString())

  return urlParams
}

export const getURLParamsFromColorConfig = (colorConfig: ColorConfig, urlParams: URLSearchParams) => {
  Object.values(MaposaicColorURLParamKey).forEach((key) => {
    urlParams.delete(key)
  })
  urlParams.set(MaposaicColorURLParamKey.Color, colorConfig.type)
  if (colorConfig.type === ColorConfigType.Random) {
    // no op
  } else if (colorConfig.type === ColorConfigType.Shading) {
    urlParams.set(MaposaicColorURLParamKey.Color, ColorConfigType.Shading)
    urlParams.set(MaposaicColorURLParamKey.Seed, colorConfig.seedColor)
  } else {
    urlParams.set(MaposaicColorURLParamKey.Color, ColorConfigType.Palette)
    if (colorConfig.paletteType === PaletteType.Preset) {
      urlParams.set(MaposaicColorURLParamKey.Origin, colorConfig.origin)
      urlParams.set(MaposaicColorURLParamKey.Index, colorConfig.paletteIndex.toString())
    } else {
      urlParams.set(MaposaicColorURLParamKey.Colors, colorConfig.colors.join(COLORS_SEPARATOR))
    }
  }

  return urlParams
}
/* eslint-disable complexity */
export const getColorConfigFromURLParams = (urlParams: URLSearchParams): null | ColorConfig => {
  const configType = urlParams.get(MaposaicColorURLParamKey.Color)
  if (configType === ColorConfigType.Random) {
    return RANDOM_CONFIG
  }
  if (configType === ColorConfigType.Shading) {
    const seedColor = urlParams.get(MaposaicColorURLParamKey.Seed)
    if (!seedColor) {
      return DEFAULT_SHADING_CONFIG
    }
    if (seedColor.split('#').length > 1) {
      return {
        type: ColorConfigType.Shading,
        shadingType: ShadingType.Custom,
        seedColor,
      }
    }
    if (seedColor in AntColors) {
      return {
        type: ColorConfigType.Shading,
        shadingType: ShadingType.Preset,
        seedColor: seedColor as ShadingPresetName,
      }
    }
    return DEFAULT_SHADING_CONFIG
  }
  if (configType === ColorConfigType.Palette) {
    const origin = urlParams.get(MaposaicColorURLParamKey.Origin)
    if (origin && origin in PRESET_PALETTES) {
      const index = parseInt(urlParams.get(MaposaicColorURLParamKey.Index) ?? '-1')
      return {
        type: ColorConfigType.Palette,
        paletteType: PaletteType.Preset,
        origin: origin as PaletteOrigin,
        paletteIndex: index >= 0 && index < PRESET_PALETTES[origin as PaletteOrigin].palettes.length ? index : 0,
      }
    }
    const colors = urlParams.get(MaposaicColorURLParamKey.Colors)
    if (colors) {
      return {
        type: ColorConfigType.Palette,
        paletteType: PaletteType.Custom,
        colors: colors.split(COLORS_SEPARATOR),
      }
    }
    return DEFAULT_PALETTE_CONFIG
  }

  return null
}

export const roundCoord = (coord: number) => Math.floor(coord * 1000000) / 1000000
export const roundZoom = (zoom: number) => Math.floor(zoom * 1000) / 1000

export const isWasmSuported = async () => {
  try {
    const wasm = await import('map-converter')
    if (wasm.say_wan() === 1) {
      return true
    } else {
      return false
    }
  } catch {
    return false
  }
}

export const useCheckWasmAvailability = () => {
  const [isWasmAvailable, setIsWasmAvailable] = useState<boolean | null>(null)

  const checkWasmAvailability = async () => {
    if (await isWasmSuported()) {
      // eslint-disable-next-line no-console
      console.log('wasm available')
      setIsWasmAvailable(true)
    } else {
      // eslint-disable-next-line no-console
      console.log('wasm not available')
      setIsWasmAvailable(false)
    }
  }

  useEffect(() => {
    void checkWasmAvailability()
    // eslint-disable-next-line
  }, [])

  return { isWasmAvailable: !!isWasmAvailable }
}

export const useCheckMobileScreen = ({ setIsMobile }: { setIsMobile: (isMobile: boolean) => void }) => {
  const setSize = () => setIsMobile(window.innerWidth <= 768)
  useEffect(() => {
    setSize()
    window.addEventListener('resize', setSize)
    return () => {
      window.removeEventListener('resize', setSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useIsFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', () => {
        //eslint-disable-next-line
        // @ts-ignore
        setIsFullScreen(screenfull.isFullscreen)
      })
    }
  }, [])

  return { isFullScreen }
}

export const onFullScreenClick = (isFullScreen: boolean, setDrawerVisible: (visible: boolean) => void) => {
  if (screenfull.isEnabled) {
    if (isFullScreen) {
      void screenfull.exit()
    } else {
      void screenfull.request()
      setDrawerVisible(false)
    }
  }
}
