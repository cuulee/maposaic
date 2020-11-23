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

export enum MapboxStyle {
  Relief = 'relief',
  Road = 'road',
  Water = 'water',
}

export const MAPOSAIC_STYLE_URL_PARAM_KEY = 'style'

export enum MaposaicGeoURLParamKey {
  Lat = 'lat',
  Lng = 'lng',
  Zoom = 'zoom',
}

export enum MaposaicColorURLParamKey {
  Color = 'color',
  Seed = 'seed',
  Origin = 'origin',
  Index = 'index',
  Colors = 'colors',
}
