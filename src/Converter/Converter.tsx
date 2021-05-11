import { RANDOM_CONFIG, ROAD_WHITE } from 'Colors/constants'
import { ROAD_SIMPLE_WHITE, WATER_CYAN } from 'Colors/mapbox'
import { ColorConfig } from 'Colors/types'
import { SpecificColorTransforms } from 'Maposaic/types'
import React, { useEffect, useState } from 'react'
import { createMaposaicColors } from 'Colors/utils'

import './converter.less'
// eslint-disable-next-line
import PaintWorker from 'worker-loader!../Converter/paint.worker'
const paintWorker = new PaintWorker()

const Uploader = ({ setImageUrl }: { setImageUrl: (url: string) => void }) => {
  const handleChange = (fileList: FileList | null) => {
    if (!fileList) {
      return
    }
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target) {
        setImageUrl(e.target.result as string)
      }
    }

    reader.readAsDataURL(fileList[0])
  }

  return (
    <div>
      <input accept="image/png, image/jpeg, image/svg+xml" type="file" onChange={(e) => handleChange(e.target.files)} />
    </div>
  )
}
const image = new Image()

const Converter = () => {
  const [colorConfig] = useState<ColorConfig>(RANDOM_CONFIG)
  const [imageUrl, setImageUrl] = useState<null | string>(null)
  // todo : hook
  const [specificColorTransforms] = useState<SpecificColorTransforms>({
    [ROAD_SIMPLE_WHITE]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
    [WATER_CYAN]: { color: null, isEditable: true, name: 'water' },
  })

  useEffect(() => {
    if (!imageUrl) {
      return
    }
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
      const imageData2 = outputCanvasContext.getImageData(0, 0, size.w, size.h)
      const inputImageData = imageData.data
      const outputImageData = imageData2.data

      paintWorker.postMessage({
        sourcePixelArray: inputImageData,
        targetPixelArray: outputImageData,
        sourceSize: size,
        targetSize: size,
        canvassRatio: 1,
        maposaicColors: createMaposaicColors(colorConfig, specificColorTransforms),
        specificColorTransforms,
        isWasmAvailable: false,
      })

      paintWorker.onmessage = function (e: { data: { pixels: number[]; paintedBoundsMin: number } }): void {
        imageData2.data.set(e.data.pixels, e.data.paintedBoundsMin)
        outputCanvasContext.putImageData(imageData2, 0, 0)
      }
    }
  }, [colorConfig, specificColorTransforms, imageUrl])

  return (
    <div className="converter">
      <Uploader setImageUrl={setImageUrl} />
      <div className="converter__item">
        <canvas className="converter__item__image" id="input-canvas" />
      </div>
      <div className="converter__image">
        <canvas className="converter__item__image" id="output-canvas" />
      </div>
    </div>
  )
}

export default Converter
