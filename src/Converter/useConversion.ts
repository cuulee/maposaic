import { ColorConfig } from 'Colors/types'
import { createMaposaicColors } from 'Colors/utils'
import { INPUT_CANVAS_ID, OUTPUT_CANVAS_ID } from 'Converter/Converter'
import { PaintWorkerPayload } from 'Converter/paint.worker'
import { SpecificColorTransforms } from 'Maposaic/types'
import { useEffect, useState } from 'react'

// eslint-disable-next-line
import PaintWorker from 'worker-loader!../Converter/paint.worker'

export const useConversion = ({
  imageUrl,
  colorConfig,
  specificColorTransforms,
  imageWidth,
  isBrightColor,
  canvasElementsIds,
  similarColorTolerance,
  compareWithCIELAB,
  isWasmAvailable,
}: {
  imageUrl: string | null
  colorConfig: ColorConfig
  specificColorTransforms: SpecificColorTransforms
  imageWidth?: number
  isBrightColor?: boolean
  canvasElementsIds?: {
    input?: string
    output?: string
  }
  similarColorTolerance?: number
  compareWithCIELAB?: boolean
  isWasmAvailable: boolean
}) => {
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    if (!imageUrl) {
      return
    }
    setIsLoading(true)
    const paintWorker = new PaintWorker()
    const image = new Image()
    image.src = imageUrl
    image.onload = () => {
      if (imageWidth) {
        const old_width = image.width
        image.width = imageWidth
        image.height = (imageWidth * image.height) / old_width
      }
      const inputCanvas = document.getElementById(
        canvasElementsIds?.input ?? INPUT_CANVAS_ID,
      ) as HTMLCanvasElement | null
      const outputCanvas = document.getElementById(
        canvasElementsIds?.output ?? OUTPUT_CANVAS_ID,
      ) as HTMLCanvasElement | null
      const size = { w: image.width, h: image.height }

      if (!inputCanvas || !outputCanvas) {
        return
      }

      inputCanvas.width = size.w
      inputCanvas.height = size.h
      if (outputCanvas.width !== size.w || outputCanvas.height !== size.h) {
        outputCanvas.width = size.w
        outputCanvas.height = size.h
      }

      const inputCanvasContext = inputCanvas.getContext('2d')
      const outputCanvasContext = outputCanvas.getContext('2d')

      if (!inputCanvasContext || !outputCanvasContext) {
        setIsLoading(false)
        return
      }

      inputCanvasContext.drawImage(image, 0, 0, size.w, size.h)

      const inputImageData = inputCanvasContext.getImageData(0, 0, size.w, size.h)
      const outputImageData = outputCanvasContext.getImageData(0, 0, size.w, size.h)

      const workerPayload: PaintWorkerPayload = {
        sourcePixelArray: inputImageData.data,
        targetPixelArray: outputImageData.data,
        sourceSize: size,
        targetSize: size,
        canvassRatio: 1,
        maposaicColors: createMaposaicColors(colorConfig, specificColorTransforms, isBrightColor),
        specificColorTransforms,
        isWasmAvailable: compareWithCIELAB ? false : isWasmAvailable,
        hasAxialTransfo: false,
        isBrightColor,
        similarColorTolerance,
        compareWithCIELAB,
      }

      paintWorker.postMessage(workerPayload)

      paintWorker.onmessage = function (e: { data: { pixels: number[]; paintedBoundsMin: number } }): void {
        setIsLoading(false)
        outputImageData.data.set(e.data.pixels, e.data.paintedBoundsMin)
        outputCanvasContext.putImageData(outputImageData, 0, 0)
      }
    }
    return () => {
      paintWorker.terminate()
      setIsLoading(false)
    }
  }, [
    colorConfig,
    specificColorTransforms,
    imageUrl,
    imageWidth,
    isBrightColor,
    canvasElementsIds,
    similarColorTolerance,
    compareWithCIELAB,
    isWasmAvailable,
  ])

  return { isLoading }
}
