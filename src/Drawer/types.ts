import { ColorConfig } from 'Colors/types'
import mapboxgl from 'mapbox-gl'
import { MapboxStyle, MosaicMode, OnPosterSizeChangePayload, SpecificColorTransforms } from 'Maposaic/types'

export type DrawerPropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyle: MapboxStyle
  changeMapStyle: (style: MapboxStyle) => void
  specificColorTransforms: SpecificColorTransforms
  setNewSpecificColorTransforms: (colors: SpecificColorTransforms) => void
  remainingTime: number | null
  estimatedTime: number | null
  onPosterSizeChange: (p: OnPosterSizeChangePayload) => void
  colorConfig: ColorConfig
  setColorConfig: (colorConfig: ColorConfig) => void
  isMobile: boolean
  displayLogo: boolean
  setDisplayLogo: (displayLogo: boolean) => void
  flyTo: (center: mapboxgl.LngLat) => void
  currentCenter: mapboxgl.LngLat | null
  setRandomCoords: ({ setZoom, fetchFromApi }: { setZoom: boolean; fetchFromApi: boolean }) => Promise<void>
  onGeolocationClick: () => void
  download: () => void
  isLoading: boolean
  mapZoom?: number
  mapCenter?: mapboxgl.LngLat
  placeName: string | null
  mosaicMode: MosaicMode
  setMosaicMode: (mode: MosaicMode) => void
  getMosaicElementById: () => HTMLCanvasElement | null
}
