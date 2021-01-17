import { Size } from 'Canvas/types'
import { MaposaicColors } from 'Colors/types'
import { CanvasDataTransformer } from 'Canvas/CanvasDataTransformer'
import { SpecificColorTransforms } from 'Maposaic/types'

const WHITE = 255 * 256 * 256 + 255 * 256 + 255

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
  }
}) => {
  const t1 = new Date()
  let computedPixels: Uint8Array | Uint8ClampedArray = new Uint8Array()

  if (isWasmAvailable) {
    const wasm = await import('map-converter')

    computedPixels = wasm.convert_pixels(sourcePixelArray, wasm.Size.new(sourceSize.w, sourceSize.h), {
      specific_transforms: { [WHITE]: WHITE },
      is_random: false,
      available_colors: [Math.floor(Math.random() * WHITE), Math.floor(Math.random() * WHITE)],
    })
  } else {
    const canvasDataTransformer = new CanvasDataTransformer(
      sourcePixelArray,
      targetPixelArray,
      sourceSize,
      targetSize,
      canvassRatio,
      maposaicColors,
      specificColorTransforms,
    )
    canvasDataTransformer.paintTargetData()
    computedPixels = canvasDataTransformer.targetPixelArray
  }
  const t2 = new Date()
  console.log('fin', t2.getTime() - t1.getTime())
  // eslint-disable-next-line
  // @ts-ignore
  postMessage({ pixels: computedPixels, paintedBoundsMin: 0 })
}
