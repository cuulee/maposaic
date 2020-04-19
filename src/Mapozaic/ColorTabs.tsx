import React, { useState } from 'react'
import { Radio, Tabs, InputNumber } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MaposaicColors, PresetColorName, AntColors } from './colors'
import { ChromePicker, ColorResult as ReactColorResult } from 'react-color'
import { generate } from '@ant-design/colors'

import { colorMe } from 'colorLib/colored'
import { getScheme } from 'colorLib/schemer'

import './colorTabs.style.css'

type ApiColor = {
  hex: {
    value: string
  }
  name: {
    value: string
  }
}

type ColorScheme = {
  colors: ApiColor[]
}

const COLOR_API_MODES = ['monochrome', 'complement', 'triad', 'quad']

const getModeFromCount = (count: number) => {
  if (count > COLOR_API_MODES.length) {
    return 'quad'
  }
  return COLOR_API_MODES[count - 1]
}

const getPalette = ({ seed, count }: { seed: { hex: string }; count: number }): ApiColor[] => {
  const seedColor = colorMe(seed)
  const scheme: ColorScheme = getScheme(getModeFromCount(count), count, seedColor)

  return scheme.colors
}

const ColorTabs = ({ setNewMaposaicColors }: { setNewMaposaicColors: (colors: MaposaicColors) => void }) => {
  const [chosenColor, setChosenColor] = useState<PresetColorName>(PresetColorName.Random)

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    const color = e.target.value as PresetColorName
    setChosenColor(color)
    setNewMaposaicColors(color === PresetColorName.Random ? PresetColorName.Random : AntColors[color])
  }

  const [customShadingColor, setCustomShadingColor] = useState<string>('#3C22C3')

  const [paletteSeed, setPaletteSeed] = useState<string>('#CB2476')
  const [paletteColors, setPaletteColors] = useState<ApiColor[]>(getPalette({ seed: { hex: '#CB2476' }, count: 4 }))
  const [paletteColorSize, setPaletteColorSize] = useState(4)

  const handleCustomColorChangeComplete = (color: ReactColorResult) => {
    setCustomShadingColor(color.hex)
    setNewMaposaicColors(generate(color.hex))
  }

  const handleCustomPaletteColorChangeComplete = async (color: ReactColorResult) => {
    const palette = getPalette({ seed: color, count: paletteColorSize })
    setPaletteColors(palette)
    setNewMaposaicColors(palette.map((color) => color.hex.value))
  }

  const onPaletteColorSizeChange = (value: number | undefined) => {
    if (!value) {
      return
    }
    setPaletteColorSize(value)
    const palette = getPalette({ seed: { hex: paletteSeed }, count: value })
    setPaletteColors(palette)
    setNewMaposaicColors(palette.map((color) => color.hex.value))
  }

  const onTabChange = (activeKey: string) => {
    if (activeKey === '1') {
      setNewMaposaicColors(chosenColor === PresetColorName.Random ? PresetColorName.Random : AntColors[chosenColor])
    } else if (activeKey === '2') {
      setNewMaposaicColors(generate(customShadingColor))
    } else if (activeKey === '3') {
      setNewMaposaicColors(paletteColors.map((color) => color.hex.value))
    }
  }

  return (
    <Tabs defaultActiveKey="1" onChange={onTabChange}>
      <Tabs.TabPane key="1" tab={<span className="tab-span">Preset</span>}>
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
        tab={<span className="tab-span">Custom</span>}
        style={{ padding: '1px 1px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <ChromePicker
          color={customShadingColor}
          onChange={(c) => setCustomShadingColor(c.hex)}
          onChangeComplete={handleCustomColorChangeComplete}
          disableAlpha
        />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="3"
        tab={<span className="tab-span">Palette</span>}
        style={{ padding: '1px 1px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <ChromePicker
          color={paletteSeed}
          onChange={(c) => setPaletteSeed(c.hex)}
          onChangeComplete={handleCustomPaletteColorChangeComplete}
          disableAlpha
        />
        <div className="palette-container">
          <InputNumber
            className="palette-number"
            style={{ width: '50px' }}
            size="small"
            value={paletteColorSize}
            min={1}
            max={4}
            onChange={onPaletteColorSizeChange}
          />
          <div className="palette-colors">
            {paletteColors.map((color) => (
              <div key={color.hex.value} className="palette-color" style={{ backgroundColor: color.hex.value }} />
            ))}
          </div>
        </div>
      </Tabs.TabPane>
    </Tabs>
  )
}

export default ColorTabs
