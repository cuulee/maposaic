import { ColorConfig as ColorConfigType } from 'Colors/types'
import { SpecificColorTransforms } from 'Maposaic/types'
import React, { useState } from 'react'
import spinner from 'assets/spinner.png'

import './converter.less'

import { useConversion } from 'Converter/useConversion'
import { Button, InputNumber, Spin, Upload } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useEffect } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { RcFile } from 'antd/lib/upload/interface'

export const OUTPUT_CANVAS_ID = 'output-canvas-id'
export const INPUT_CANVAS_ID = 'input-canvas-id'

const Uploader = ({ setImageUrl }: { setImageUrl: (url: string) => void }) => {
  const onChange = (file: RcFile): boolean => {
    const reader = new FileReader()

    reader.onload = (e) => {
      if (e.target) {
        setImageUrl(e.target.result as string)
      }
    }
    if (file) {
      reader.readAsDataURL(file)
    }
    return false // prevent upload
  }

  return (
    <Upload accept="image/*" multiple={false} beforeUpload={onChange}>
      <Button icon={<UploadOutlined />}>Chose an image</Button>
    </Upload>
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
  setIsParentLoading?: (isLoading: boolean) => void
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
    if (setIsParentLoading) {
      setIsParentLoading(isLoading)
      return () => setIsParentLoading(false)
    }
  }, [isLoading, setIsParentLoading])

  return (
    <div className="converter">
      <div className="converter__settings">
        <div className="converter__settings__upload">
          <Uploader setImageUrl={setImageUrl} />
          {isLoading && !setIsParentLoading && (
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
