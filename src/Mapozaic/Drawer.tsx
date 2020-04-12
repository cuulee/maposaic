import React, { useState } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Slider } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MAPBOX_STYLE_URL, INITIAL_ROAD_COLOR_THRESHOLD } from './Mapozaic'
import { SliderValue } from 'antd/lib/slider'

type PropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyleURL: string
  changeMapStyle: (style: string) => void
  setNewRoadColorThreshold: (threshold: number) => void
}

const Drawer = ({ visible, setDrawerVisible, mapboxStyleURL, changeMapStyle, setNewRoadColorThreshold }: PropsType) => {
  const onStyleUrlChange = (event: RadioChangeEvent) => {
    changeMapStyle(event.target.value)
  }
  const [localRoadColorThreshold, setLocalRoadColorThreshold] = useState(INITIAL_ROAD_COLOR_THRESHOLD)
  const onSliderChange = (value: SliderValue) => {
    if (typeof value === 'number') {
      setLocalRoadColorThreshold(value)
    } else {
      setLocalRoadColorThreshold(value[0])
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
        onChange={onSliderChange}
      />
    </AntDrawer>
  )
}

export default Drawer
