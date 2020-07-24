import { MaposaicColors } from './colors'
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
