import { RANDOM_CONFIG, ROAD_WHITE } from 'Colors/constants'
import { ROAD_SIMPLE_WHITE, WATER_CYAN } from 'Colors/mapbox'
import { ColorConfig } from 'Colors/types'
import { SpecificColorTransforms } from 'Maposaic/types'
import React, { useState } from 'react'

import './converter.less'
// eslint-disable-next-line
import PaintWorker from 'worker-loader!../Converter/paint.worker'
import { useConversion } from 'Converter/hooks'

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

const Converter = () => {
  const [colorConfig] = useState<ColorConfig>(RANDOM_CONFIG)
  const [imageUrl, setImageUrl] = useState<null | string>(null)
  // todo : hook
  const [specificColorTransforms] = useState<SpecificColorTransforms>({
    [ROAD_SIMPLE_WHITE]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
    [WATER_CYAN]: { color: null, isEditable: true, name: 'water' },
  })

  useConversion({ imageUrl, colorConfig, specificColorTransforms })

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
