import { Size } from 'Canvas/types'
import { MaposaicColors } from 'Colors/types'
import { CanvasDataTransformer } from 'Canvas/CanvasDataTransformer'
import { SpecificColorTransforms } from 'Maposaic/types'
import { createColorSettings } from 'Colors/utils'

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
  },
}: {
  data: {
    sourcePixelArray: Uint8Array
    targetPixelArray: Uint8ClampedArray
    sourceSize: Size
    targetSize: Size
    canvassRatio: number
    maposaicColors: MaposaicColors
    specificColorTransforms: SpecificColorTransforms
    isWasmAvailable: boolean
    hasAxialTransfo?: boolean
    isBrightColor?: boolean
  }
}) => {
  let computedPixels: Uint8Array | Uint8ClampedArray = new Uint8Array()

  if (isWasmAvailable) {
    const wasm = await import('map-converter')

    computedPixels = wasm.convert_pixels(
      sourcePixelArray,
      wasm.Size.new(sourceSize.w, sourceSize.h),
      createColorSettings(maposaicColors, specificColorTransforms),
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
    })
    canvasDataTransformer.paintTargetData()
    computedPixels = canvasDataTransformer.targetPixelArray
  }

  // eslint-disable-next-line
  // @ts-ignore
  postMessage({ pixels: computedPixels, paintedBoundsMin: 0 })
}
