import { ColorConfig as ColorConfigType } from 'Colors/types'
import { SpecificColorTransforms } from 'Maposaic/types'
import React, { useState } from 'react'
import spinner from 'assets/spinner.png'

import './converter.less'

import { useConversion } from 'Converter/useConversion'
import { InputNumber, Spin } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useEffect } from 'react'

export const OUTPUT_CANVAS_ID = 'output-canvas-id'
export const INPUT_CANVAS_ID = 'input-canvas-id'

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

const Converter = ({
  isWasmAvailable,
  colorConfig,
  specificColorTransforms,
  setIsParentLoading,
}: {
  isWasmAvailable: boolean
  colorConfig: ColorConfigType
  specificColorTransforms: SpecificColorTransforms
  setIsParentLoading: (isLoading: boolean) => void
}) => {
  const [compareWithCIELAB, setcompareWithCIELAB] = useState(true)
  const [imageUrl, setImageUrl] = useState<null | string>(null)
  const [similarColorTolerance, setSimilarColorTolerance] = useState(10)

  const { isLoading } = useConversion({
    imageUrl,
    colorConfig,
    specificColorTransforms,
    similarColorTolerance,
    compareWithCIELAB,
    isWasmAvailable,
  })

  useEffect(() => {
    setIsParentLoading(isLoading)
    return () => setIsParentLoading(false)
  }, [isLoading, setIsParentLoading])

  return (
    <div className="converter">
      <div className="converter__settings">
        <div className="converter__settings__upload">
          <Uploader setImageUrl={setImageUrl} />
          {isLoading && (
            <Spin
              className="converter__settings__loader"
              spinning={true}
              indicator={<img className="spinner" src={spinner} alt="spin" />}
            />
          )}
        </div>
        <div>
          <Checkbox checked={compareWithCIELAB} onChange={() => setcompareWithCIELAB(!compareWithCIELAB)}>
            <a href="https://en.wikipedia.org/wiki/CIELAB_color_space" target="blank">
              CIELAB
            </a>
            <span> color comparison (closer to human vision but longer to compute)</span>
          </Checkbox>
        </div>
        <div className="converter__settings__tolerance">
          <div>Tolerance</div>
          <InputNumber
            className="converter__settings__tolerance__input"
            type="number"
            value={similarColorTolerance}
            onChange={(value) => setSimilarColorTolerance(value as number)}
          />
        </div>
      </div>
      <div className="converter__item">
        <canvas className="converter__item__image" id={INPUT_CANVAS_ID} />
      </div>
      <div className="converter__image">
        <canvas className="converter__item__image" id={OUTPUT_CANVAS_ID} />
      </div>
    </div>
  )
}

export default Converter
