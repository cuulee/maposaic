import { RANDOM_CONFIG, ROAD_WHITE } from 'Colors/constants'
import { ROAD_SIMPLE_WHITE, WATER_CYAN } from 'Colors/mapbox'
import { ColorConfig } from 'Colors/types'
import { SpecificColorTransforms } from 'Maposaic/types'
import React, { useState } from 'react'
import spinner from 'assets/spinner.png'

import './converter.less'

import { useConversion } from 'Converter/useConversion'
import { InputNumber, Spin } from 'antd'

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
    if (fileList[0]) {
      reader.readAsDataURL(fileList[0])
    }
  }

  return (
    <div className="uploader">
      <input accept="image/png, image/jpeg, image/svg+xml" type="file" onChange={(e) => handleChange(e.target.files)} />
    </div>
  )
}

const Converter = () => {
  const [colorConfig] = useState<ColorConfig>(RANDOM_CONFIG)
  const [imageUrl, setImageUrl] = useState<null | string>(null)
  const [similarColorTolerance, setSimilarColorTolerance] = useState(10)

  const [specificColorTransforms] = useState<SpecificColorTransforms>({
    [ROAD_SIMPLE_WHITE]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
    [WATER_CYAN]: { color: null, isEditable: true, name: 'water' },
  })

  const { isLoading } = useConversion({ imageUrl, colorConfig, specificColorTransforms, similarColorTolerance })

  return (
    <div className="converter">
      <div className="converter__settings">
        <Uploader setImageUrl={setImageUrl} />
        <div className="converter__settings__tolerance">
          <div>Tolerance</div>
          <InputNumber
            className="converter__settings__tolerance__input"
            type="number"
            value={similarColorTolerance}
            onChange={(value) => setSimilarColorTolerance(value as number)}
          />
        </div>
        {isLoading && (
          <Spin
            className="converter__settings__loader"
            spinning={true}
            indicator={<img className="spinner" src={spinner} alt="spin" />}
          />
        )}
      </div>
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
