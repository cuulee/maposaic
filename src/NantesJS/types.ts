export type Size = {
  w: number
  h: number
}

export type imagePoint = { x: number; y: number }

export type RGBColor = { r: number; g: number; b: number }

export type WorkerResponse = Uint8ClampedArray

export type WorkerPayload = {
  sourcePixelArray: Uint8Array
  targetPixelArray: Uint8ClampedArray
  size: Size
}
