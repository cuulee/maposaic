import { ColorConfig } from 'Colors/types'
import { MapboxStyle } from 'Maposaic/types'

export type ApiPicture = {
  pictureName?: string
  filePath?: string
  downloadURL?: string
  placeName?: string | null
  thumbnailDownloadURL?: string
  mapCenter?: [number, number]
  mapZoom?: number
  colorConfig?: ColorConfig
  mapboxStyle?: MapboxStyle
}

export type Picture = {
  id: string
  pictureName: string | undefined
  placeName: string | undefined | null
  downloadURL: string
  thumbnailDownloadURL?: string
  colorConfig?: ColorConfig
  mapCenter?: mapboxgl.LngLat
  mapZoom?: number
  mapboxStyle?: MapboxStyle
}
