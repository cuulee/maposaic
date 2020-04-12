import React, { useState } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Slider } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MAPBOX_STYLE_URL, INITIAL_ROAD_COLOR_THRESHOLD, INITIAL_SIMILAR_COLOR_TOLERANCE } from './Mapozaic'
import { SliderValue } from 'antd/lib/slider'

type PropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyleURL: string
  changeMapStyle: (style: string) => void
  setNewRoadColorThreshold: (threshold: number) => void
  setNewSimilarColorTolerance: (tolerance: number) => void
}

const Drawer = ({
  visible,
  setDrawerVisible,
  mapboxStyleURL,
  changeMapStyle,
  setNewRoadColorThreshold,
  setNewSimilarColorTolerance,
}: PropsType) => {
  const onStyleUrlChange = (event: RadioChangeEvent) => {
    changeMapStyle(event.target.value)
  }
  const [localRoadColorThreshold, setLocalRoadColorThreshold] = useState(INITIAL_ROAD_COLOR_THRESHOLD)
  const [localSimilarColorTolerance, setLocalSimilarColorTolerance] = useState(INITIAL_SIMILAR_COLOR_TOLERANCE)

  const onSliderChange = (value: SliderValue, changeCallback: (n: number) => void) => {
    if (typeof value === 'number') {
      changeCallback(value)
    } else {
      changeCallback(value[0])
    }
  }

  return (
    <AntDrawer visible={visible} placement="left" onClose={() => setDrawerVisible(false)}>
      <Radio.Group onChange={onStyleUrlChange} value={mapboxStyleURL}>
        <Radio value={MAPBOX_STYLE_URL.road}>Roads</Radio>
        <Radio value={MAPBOX_STYLE_URL.administrative}>Administrative boundaries</Radio>
      </Radio.Group>
      <Divider />
      <p>Boundary detection threshold</p>
      <Slider
        min={0}
        max={255}
        range={false}
        value={localRoadColorThreshold}
        onAfterChange={() => setNewRoadColorThreshold(localRoadColorThreshold)}
        onChange={(value) => onSliderChange(value, setLocalRoadColorThreshold)}
      />
      <p>Fill Color Tolerance</p>
      <Slider
        min={0}
        max={20}
        range={false}
        value={localSimilarColorTolerance}
        onAfterChange={() => setNewSimilarColorTolerance(localSimilarColorTolerance)}
        onChange={(value) => onSliderChange(value, setLocalSimilarColorTolerance)}
      />
    </AntDrawer>
  )
}

export default Drawer
