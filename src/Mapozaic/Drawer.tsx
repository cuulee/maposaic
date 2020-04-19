import React, { useState, useRef } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Slider, Popover, Button, Tabs } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MAPBOX_STYLE_URL, INITIAL_ROAD_COLOR_THRESHOLD, INITIAL_SIMILAR_COLOR_TOLERANCE } from './Mapozaic'
import { SliderValue } from 'antd/lib/slider'
import GeoSearch from './GeoSearchInput'
import { MaposaicColors, ChosenColor, PresetColorName, AntColors } from './colors'
import { ChromePicker, ColorResult as ReactColorResult } from 'react-color'
import { generate } from '@ant-design/colors'

import { colorMe } from 'colorLib/colored'
import { getScheme } from 'colorLib/schemer'

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

const ColorTabs = ({ setNewMaposaicColors }: { setNewMaposaicColors: DrawerPropsType['setNewMaposaicColors'] }) => {
  const [chosenColor, setChosenColor] = useState<ChosenColor>(PresetColorName.Random)

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    const color = e.target.value as PresetColorName
    setChosenColor(color)
    setNewMaposaicColors(color === PresetColorName.Random ? PresetColorName.Random : AntColors[color])
  }

  const [customShadingColor, setCustomShadingColor] = useState('#aaaaaa')
  const [customPaletteColor, setCustomPaletteColor] = useState('#aaaaaa')

  const handleCustomColorChangeComplete = (color: ReactColorResult) => {
    setCustomShadingColor(color.hex)
    setChosenColor('custom')
    setNewMaposaicColors(generate(color.hex))
  }

  const handleCustomPaletteColorChangeComplete = async (color: ReactColorResult) => {
    const seed = colorMe(color)
    const scheme = getScheme('triad', 5, seed)
    console.log('color', seed)
    console.log('scheme', scheme)
  }

  return (
    <Tabs defaultActiveKey="3">
      <Tabs.TabPane key="1" tab="Preset Colors">
        <Radio.Group onChange={handlePresetColorChange} value={chosenColor} style={{ padding: '1px' }}>
          {Object.entries(PresetColorName).map(([name, color]) => {
            return (
              <Radio.Button style={{ width: ' 100px' }} key={color} value={color}>
                {name}
              </Radio.Button>
            )
          })}
        </Radio.Group>
      </Tabs.TabPane>
      <Tabs.TabPane
        key="2"
        tab="Custom shading"
        style={{ padding: '1px 1px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <ChromePicker
          color={customShadingColor}
          onChange={(c) => setCustomShadingColor(c.hex)}
          onChangeComplete={handleCustomColorChangeComplete}
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="3"
        tab="Custom palette"
        style={{ padding: '1px 1px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <ChromePicker
          color={customPaletteColor}
          onChange={(c) => setCustomPaletteColor(c.hex)}
          onChangeComplete={handleCustomPaletteColorChangeComplete}
        />
      </Tabs.TabPane>
    </Tabs>
  )
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
