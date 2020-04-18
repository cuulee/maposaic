import React, { useState, useEffect, useRef } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Slider, Popover, Button } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MAPBOX_STYLE_URL, INITIAL_ROAD_COLOR_THRESHOLD, INITIAL_SIMILAR_COLOR_TOLERANCE } from './Mapozaic'
import { SliderValue } from 'antd/lib/slider'
import GeoSearch from './GeoSearchInput'
import { MaposaicColors, ChosenColor, PresetColorName, AntColors } from './colors'
import { ChromePicker, ColorResult as ReactColorResult } from 'react-color'
import { generate } from '@ant-design/colors'

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

  const [chosenColor, setChosenColor] = useState<ChosenColor>(PresetColorName.Random)

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    const color = e.target.value as PresetColorName
    setChosenColor(color)
    setNewMaposaicColors(color === PresetColorName.Random ? PresetColorName.Random : AntColors[color])
  }
  const handleRoadThresholdAfterChange = () => {
    setNewRoadColorThreshold(localRoadColorThreshold)
    setDrawerVisible(false)
  }
  const handleSimilarColorToleranceAfterChange = () => {
    setNewSimilarColorTolerance(localSimilarColorTolerance)
    setDrawerVisible(false)
  }

  const [pickerVisible, setPickerVisible] = useState(false)
  const [customColor, setCustomColor] = useState('#aaaaaa')

  const customButton = useRef<Button>(null)

  const handleCustomColorChangeComplete = (color: ReactColorResult) => {
    setCustomColor(color.hex)
    if (customButton.current) {
      // customButton.current
    }
    setChosenColor('custom')
    setNewMaposaicColors(generate(color.hex))
  }

  return (
    <AntDrawer visible={visible} placement="left" onClose={() => setDrawerVisible(false)} closable={false}>
      <GeoSearch flyTo={flyTo} currentCenter={currentCenter} setDrawerVisible={setDrawerVisible} />
      <Divider />
      <Radio.Group onChange={handlePresetColorChange} value={chosenColor}>
        {Object.entries(PresetColorName).map(([name, color]) => {
          return (
            <Radio.Button style={{ width: ' 100px' }} key={color} value={color}>
              {name}
            </Radio.Button>
          )
        })}
      </Radio.Group>
      <Popover
        content={
          <ChromePicker
            color={customColor}
            onChange={(c) => setCustomColor(c.hex)}
            onChangeComplete={handleCustomColorChangeComplete}
          />
        }
        title="Chose a color"
        visible={pickerVisible}
        onVisibleChange={setPickerVisible}
      >
        <Button style={{ marginTop: '16px' }} id="goulo" ref={customButton}>
          Custom color
        </Button>
      </Popover>
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
