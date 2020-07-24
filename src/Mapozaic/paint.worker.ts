import { Size } from 'Canvas/types'
import { MaposaicColors } from 'Colors/types'
import { CanvasDataTransformer } from 'Canvas/CanvasDataTransformer'

onmessage = ({
  data: { sourcePixelArray, targetPixelArray, sourceSize, targetSize, canvassRatio, maposaicColors },
}: {
  data: {
    sourcePixelArray: Uint8Array
    targetPixelArray: Uint8ClampedArray
    sourceSize: Size
    targetSize: Size
    canvassRatio: number
    maposaicColors: MaposaicColors
  }
}): void => {
  const t1 = new Date()

  const canvasDataTransformer = new CanvasDataTransformer(
    sourcePixelArray,
    targetPixelArray,
    sourceSize,
    targetSize,
    canvassRatio,
    maposaicColors,
  )
  canvasDataTransformer.paintTargetData()

  const t2 = new Date()
  console.log('fin', t2.getTime() - t1.getTime())

  // eslint-disable-next-line
  // @ts-ignore
  postMessage({ pixels: canvasDataTransformer.targetPixelArray, paintedBoundsMin: 0 })
}
