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
