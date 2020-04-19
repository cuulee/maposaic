import React, { useState } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Slider } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MAPBOX_STYLE_URL, INITIAL_ROAD_COLOR_THRESHOLD, INITIAL_SIMILAR_COLOR_TOLERANCE } from './Mapozaic'
import { SliderValue } from 'antd/lib/slider'
import GeoSearch from './GeoSearchInput'
import { MaposaicColors } from './colors'

import './style.css'
import ColorTabs from './ColorTabs'
import Title from 'antd/lib/typography/Title'

export type DrawerPropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyleURL: string
  changeMapStyle: (style: string) => void
  setNewRoadColorThreshold: (threshold: number) => void
  setNewSimilarColorTolerance: (tolerance: number) => void
  flyTo: (center: [number, number]) => void
  currentCenter: [number, number]
  setNewMaposaicColors: (colors: MaposaicColors) => void
}

const Drawer = ({
  visible,
  setDrawerVisible,
  mapboxStyleURL,
  changeMapStyle,
  setNewRoadColorThreshold,
  setNewSimilarColorTolerance,
  flyTo,
  currentCenter,
  setNewMaposaicColors,
}: DrawerPropsType) => {
  const onStyleUrlChange = (event: RadioChangeEvent) => {
    setDrawerVisible(false)
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

  const handleRoadThresholdAfterChange = () => {
    setNewRoadColorThreshold(localRoadColorThreshold)
    setDrawerVisible(false)
  }
  const handleSimilarColorToleranceAfterChange = () => {
    setNewSimilarColorTolerance(localSimilarColorTolerance)
    setDrawerVisible(false)
  }

  return (
    <AntDrawer
      visible={visible}
      placement="left"
      onClose={() => setDrawerVisible(false)}
      closable={false}
      width="min(75%,333px)"
    >
      <GeoSearch flyTo={flyTo} currentCenter={currentCenter} setDrawerVisible={setDrawerVisible} />
      <Divider />
      <Title level={4}>Colors</Title>
      <ColorTabs setNewMaposaicColors={setNewMaposaicColors} />
      <Divider />
      <Radio.Group onChange={onStyleUrlChange} value={mapboxStyleURL}>
        <Radio value={MAPBOX_STYLE_URL.road}>Road boundaries</Radio>
        <Radio value={MAPBOX_STYLE_URL.water}>Water boundaries</Radio>
        <Radio value={MAPBOX_STYLE_URL.administrative}>Administrative boundaries</Radio>
      </Radio.Group>
      <Divider />
      <p>Boundary detection threshold</p>
      <Slider
        min={0}
        max={255}
        range={false}
        value={localRoadColorThreshold}
        onAfterChange={handleRoadThresholdAfterChange}
        onChange={(value) => onSliderChange(value, setLocalRoadColorThreshold)}
      />
      <p>Fill Color Tolerance</p>
      <Slider
        min={0}
        max={20}
        range={false}
        value={localSimilarColorTolerance}
        onAfterChange={handleSimilarColorToleranceAfterChange}
        onChange={(value) => onSliderChange(value, setLocalSimilarColorTolerance)}
      />
    </AntDrawer>
  )
}

export default Drawer
