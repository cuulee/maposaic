import { MaposaicColors } from 'Colors/types'
import { Size } from 'Canvas/types'

export type PaintWorkerData = {
  sourcePixelArray: Uint8Array
  targetPixelArray: Uint8ClampedArray
  sourceSize: Size
  canvassRatio: number
  maposaicColors: MaposaicColors
  roadColorThreshold: number
  similarColorTolerance: number
}

export type SpecificColorTransforms = Record<string, { color: string | null; name: string; isEditable: boolean }>

export type OnPosterSizeChangePayload = {
  isLandscape: boolean
  pixelPerInchResolution: number
  longerPropertyCMLength: number
}

export type GeoData = {
  geodata: {
    nearest: {
      latt: number[]
      longt: number[]
      elevation: number[]
      timezone: string[]
      city: string[]
      name: string[]
      prov: string[]
    }[]
  }
}
