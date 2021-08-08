import { Size } from 'Canvas/types'
import { MaposaicColors } from 'Colors/types'
import { CanvasDataTransformer } from 'Canvas/CanvasDataTransformer'
import { SpecificColorTransforms } from 'Maposaic/types'
import { createColorSettings } from 'Colors/utils'

export type PaintWorkerPayload = {
  sourcePixelArray: Uint8Array | Uint8ClampedArray
  targetPixelArray: Uint8ClampedArray
  sourceSize: Size
  targetSize: Size
  canvassRatio: number
  maposaicColors: MaposaicColors
  specificColorTransforms: SpecificColorTransforms
  isWasmAvailable: boolean
  hasAxialTransfo?: boolean
  isBrightColor?: boolean
  similarColorTolerance?: number
  compareWithCIELAB?: boolean
}

onmessage = async ({
  data: {
    sourcePixelArray,
    targetPixelArray,
    sourceSize,
    targetSize,
    canvassRatio,
    maposaicColors,
    specificColorTransforms,
    isWasmAvailable,
    hasAxialTransfo,
    isBrightColor,
    similarColorTolerance,
    compareWithCIELAB,
  },
}: {
  data: PaintWorkerPayload
}) => {
  let computedPixels: Uint8Array | Uint8ClampedArray = new Uint8Array()
  const tStart = performance.now()

  if (isWasmAvailable) {
    const wasm = await import('map-converter')

    computedPixels = wasm.convert_pixels(
      sourcePixelArray as Uint8Array,
      wasm.Size.new(sourceSize.w, sourceSize.h),
      createColorSettings(maposaicColors, specificColorTransforms, similarColorTolerance),
    )
  } else {
    const canvasDataTransformer = new CanvasDataTransformer({
      sourcePixelArray,
      targetPixelArray,
      sourceSize,
      targetSize,
      canvassRatio,
      targetColors: maposaicColors,
      specificColorTransforms,
      hasAxialTransfo,
      isBrightColor,
      similarColorTolerance,
      compareWithCIELAB,
    })
    canvasDataTransformer.paintTargetData()
    computedPixels = canvasDataTransformer.targetPixelArray
  }
  const tEnd = performance.now()
  // eslint-disable-next-line
  console.log('compute time: ' + Math.round(tEnd - tStart).toString() + ' ms')

  // eslint-disable-next-line
  // @ts-ignore
  postMessage({ pixels: computedPixels, paintedBoundsMin: 0 })
}
