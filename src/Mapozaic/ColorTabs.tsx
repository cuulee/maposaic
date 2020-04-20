import React, { useState } from 'react'
import { Radio, Tabs, Popover, Select } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MaposaicColors, PresetColorName, AntColors } from './colors'
import { ChromePicker, ColorResult as ReactColorResult, ColorResult } from 'react-color'
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
const INITIAL_PALETTE_SEED = '#E8D50D'
const INITIAL_PALETTE_SIZE = 3

const getModeFromCount = (count: number) => {
  if (count > COLOR_API_MODES.length) {
    return 'quad'
  }
  return COLOR_API_MODES[count - 1]
}

const getPalette = ({ seed, count }: { seed: { hex: string }; count: number }): string[] => {
  const seedColor = colorMe(seed)
  const scheme: ColorScheme = getScheme(getModeFromCount(count), count, seedColor)

  return scheme.colors.map((color) => color.hex.value)
}
const ColorTabs = ({ setNewMaposaicColors }: { setNewMaposaicColors: (colors: MaposaicColors) => void }) => {
  const [chosenColor, setChosenColor] = useState<PresetColorName>(PresetColorName.Random)

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    const color = e.target.value as PresetColorName
    setChosenColor(color)
    setNewMaposaicColors(color === PresetColorName.Random ? PresetColorName.Random : AntColors[color])
  }

  const [customShadingColor, setCustomShadingColor] = useState('#3C22C3')

  const [paletteSeed, setPaletteSeed] = useState(INITIAL_PALETTE_SEED)
  const [paletteColors, setPaletteColors] = useState(
    getPalette({ seed: { hex: INITIAL_PALETTE_SEED }, count: INITIAL_PALETTE_SIZE }),
  )
  const [paletteColorSize, setPaletteColorSize] = useState(INITIAL_PALETTE_SIZE)

  const handleCustomColorChangeComplete = (color: ReactColorResult) => {
    setCustomShadingColor(color.hex)
    setNewMaposaicColors(generate(color.hex))
  }

  const handleCustomPaletteColorChangeComplete = async (color: ReactColorResult) => {
    const palette = getPalette({ seed: color, count: paletteColorSize })
    setPaletteColors(palette)
    setNewMaposaicColors(palette)
  }

  const onPaletteColorSizeChange = (value: number | undefined) => {
    if (!value) {
      return
    }
    setPaletteColorSize(value)
    const palette = getPalette({ seed: { hex: paletteSeed }, count: value })
    setPaletteColors(palette)
    setNewMaposaicColors(palette)
  }

  const onTabChange = (activeKey: string) => {
    if (activeKey === '1') {
      setNewMaposaicColors(chosenColor === PresetColorName.Random ? PresetColorName.Random : AntColors[chosenColor])
    } else if (activeKey === '2') {
      setNewMaposaicColors(generate(customShadingColor))
    } else if (activeKey === '3') {
      setNewMaposaicColors(paletteColors)
    }
  }

  const onPaletteIndexChange = (color: ColorResult, index: number) => {
    const newPalette = [...paletteColors]
    newPalette[index] = color.hex
    setPaletteColors(newPalette)
  }

  const onPaletteIndexChangeComplete = (color: ColorResult, index: number) => {
    const newPalette = [...paletteColors]
    newPalette[index] = color.hex
    setPaletteColors(newPalette)
    setNewMaposaicColors(paletteColors)
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
        tab={<span className="tab-span">Shading</span>}
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
          <Select value={paletteColorSize} onChange={onPaletteColorSizeChange} style={{ fontSize: '16px' }}>
            {Array.from({ length: 5 }, (_, i) => {
              return (
                <Select.Option key={i} value={i + 1} style={{ fontSize: '16px' }}>
                  {i + 1}
                </Select.Option>
              )
            })}
          </Select>
          <div className="palette-colors">
            {paletteColors.map((color, paletteIndex) => (
              <Popover
                content={
                  <ChromePicker
                    color={color}
                    onChange={(c) => {
                      onPaletteIndexChange(c, paletteIndex)
                    }}
                    onChangeComplete={(c) => {
                      onPaletteIndexChangeComplete(c, paletteIndex)
                    }}
                    disableAlpha
                  />
                }
                key={paletteIndex}
                placement="bottom"
              >
                <div className="palette-color" style={{ backgroundColor: color }} />
              </Popover>
            ))}
          </div>
        </div>
      </Tabs.TabPane>
    </Tabs>
  )
}

export default ColorTabs
