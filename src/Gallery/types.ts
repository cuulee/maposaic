import { ColorConfig } from 'Colors/types'

export type ApiPicture = {
  pictureName?: string
  filePath?: string
  downloadURL?: string
  placeName?: string | null
  thumbnailDownloadURL?: string
  mapCenter?: [number, number]
  mapZoom?: number
  colorConfig?: ColorConfig
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
}
