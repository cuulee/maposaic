import { ColorConfig } from 'Colors/types'
import { createMaposaicColors } from 'Colors/utils'
import { SpecificColorTransforms } from 'Maposaic/types'
import { useEffect } from 'react'

// eslint-disable-next-line
import PaintWorker from 'worker-loader!../Converter/paint.worker'

export const useConversion = ({
  imageUrl,
  colorConfig,
  specificColorTransforms,
}: {
  imageUrl: string | null
  colorConfig: ColorConfig
  specificColorTransforms: SpecificColorTransforms
}) => {
  useEffect(() => {
    if (!imageUrl) {
      return
    }
    const paintWorker = new PaintWorker()
    const image = new Image()
    image.src = imageUrl
    image.onload = () => {
      const inputCanvas = document.getElementById('input-canvas') as HTMLCanvasElement
      const outputCanvas = document.getElementById('output-canvas') as HTMLCanvasElement
      const size = { w: image.width, h: image.height }

      inputCanvas.setAttribute('width', size.w.toString())
      inputCanvas.setAttribute('height', size.h.toString())

      inputCanvas.width = size.w
      inputCanvas.height = size.h
      outputCanvas.width = size.w
      outputCanvas.height = size.h

      const inputCanvasContext = inputCanvas.getContext('2d')
      const outputCanvasContext = outputCanvas.getContext('2d')

      if (!inputCanvasContext || !outputCanvasContext) {
        return
      }

      inputCanvasContext.drawImage(image, 0, 0, size.w, size.h)

      const imageData = inputCanvasContext.getImageData(0, 0, size.w, size.h)
      const outputImageData = outputCanvasContext.getImageData(0, 0, size.w, size.h)

      paintWorker.postMessage({
        sourcePixelArray: imageData.data,
        targetPixelArray: outputImageData.data,
        sourceSize: size,
        targetSize: size,
        canvassRatio: 1,
        maposaicColors: createMaposaicColors(colorConfig, specificColorTransforms),
        specificColorTransforms,
        isWasmAvailable: false,
      })

      paintWorker.onmessage = function (e: { data: { pixels: number[]; paintedBoundsMin: number } }): void {
        outputImageData.data.set(e.data.pixels, e.data.paintedBoundsMin)
        outputCanvasContext.putImageData(outputImageData, 0, 0)
      }
    }
    return () => paintWorker.terminate()
  }, [colorConfig, specificColorTransforms, imageUrl])
}
