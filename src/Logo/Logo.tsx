import { ROAD_WHITE } from 'Colors/constants'
import { BLACK, ROAD_SIMPLE_WHITE } from 'Colors/mapbox'
import { ColorConfig } from 'Colors/types'
import { useConversion } from 'Converter/hooks'
import React from 'react'

import './logo.less'

const URL = process.env.PUBLIC_URL + '/m-a-p-o-s-a-i-c.png'

const SPECIFIC_COLOR_TRANSFORMS = {
  [ROAD_SIMPLE_WHITE]: { color: ROAD_WHITE, isEditable: true, name: 'roads' },
  [BLACK]: { color: BLACK, isEditable: true, name: 'water' },
}

const Logo = ({ colorConfig }: { colorConfig: ColorConfig }) => {
  useConversion({ imageUrl: URL, colorConfig, specificColorTransforms: SPECIFIC_COLOR_TRANSFORMS })

  return (
    <div className="logo">
      <canvas className="logo__src" id="input-canvas" />
      <canvas className="logo__render" id="output-canvas" />
    </div>
  )
}

export default Logo
