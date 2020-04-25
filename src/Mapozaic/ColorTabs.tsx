import React, { useState } from 'react'
import { Radio, Tabs, Popover, Select, Button } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MaposaicColors, PresetColorName, AntColors, ShadingColor } from './colors'
import { ChromePicker, ColorResult as ReactColorResult, ColorResult } from 'react-color'
import { generate } from '@ant-design/colors'

import './colorTabs.style.css'
import { coloors } from 'palettes/coloors'

const ColorTabs = ({ setNewMaposaicColors }: { setNewMaposaicColors: (colors: MaposaicColors) => void }) => {
  const [shadingColor, setShadingColor] = useState<ShadingColor>(PresetColorName.Random)

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    const color = e.target.value as PresetColorName
    setShadingColor(color)
    setNewMaposaicColors(color === PresetColorName.Random ? PresetColorName.Random : AntColors[color])
  }

  const [customShadingColor, setCustomShadingColor] = useState('#3C22C3')

  const [presetPaletteIndex, setPresetPaletteIndex] = useState(0)
  const [presetPaletteColors, setPresetPaletteColors] = useState<string[]>(coloors[0])
  const [customPaletteColors, setCustomPaletteColors] = useState<string[]>(['#F3D2A6', '#13DFF6'])

  const handleCustomColorChangeComplete = (color: ReactColorResult) => {
    setCustomShadingColor(color.hex)
    setShadingColor('customShading')
    setNewMaposaicColors(generate(color.hex))
  }

  const onPaletteSizeChange = (value: number | undefined) => {
    if (!value) {
      return
    }
    const newPalette = [
      ...customPaletteColors.slice(0, value),
      ...Array.from(
        { length: value - customPaletteColors.length },
        () => customPaletteColors[customPaletteColors.length - 1] || '#AAAAAA',
      ),
    ]

    setCustomPaletteColors(newPalette)
    setNewMaposaicColors(newPalette)
  }

  const onTabChange = (activeKey: string) => {
    if (activeKey === '1') {
      if (shadingColor === 'customShading') {
        setNewMaposaicColors(generate(customShadingColor))
        return
      }
      setNewMaposaicColors(shadingColor === PresetColorName.Random ? PresetColorName.Random : AntColors[shadingColor])
    } else if (activeKey === '2') {
      setNewMaposaicColors(presetPaletteColors)
    } else if (activeKey === '3') {
      setNewMaposaicColors(customPaletteColors)
    }
  }

  const onCustomPalettePickerChange = (color: ColorResult, index: number) => {
    const newPalette = [...customPaletteColors]
    newPalette[index] = color.hex
    setCustomPaletteColors(newPalette)
  }

  const onCustomPalettePickerChangeComplete = (color: ColorResult, index: number) => {
    const newPalette = [...customPaletteColors]
    newPalette[index] = color.hex
    setCustomPaletteColors(newPalette)
    setNewMaposaicColors(customPaletteColors)
  }

  const onPresetPaletteChange = (index: number) => {
    setPresetPaletteIndex(index)
    setPresetPaletteColors(coloors[index])
    setNewMaposaicColors(coloors[index])
  }

  return (
    <Tabs defaultActiveKey="1" onChange={onTabChange}>
      <Tabs.TabPane key="1" tab={<span className="tab-span">Shading</span>}>
        <Radio.Group onChange={handlePresetColorChange} value={shadingColor} style={{ padding: '1px' }}>
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
              color={customShadingColor}
              onChange={(c) => setCustomShadingColor(c.hex)}
              onChangeComplete={handleCustomColorChangeComplete}
              disableAlpha
            />
          }
          placement="bottom"
        >
          <Button>Custom seed</Button>
        </Popover>
      </Tabs.TabPane>
      <Tabs.TabPane
        key="2"
        tab={<span className="tab-span">Palette</span>}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        <Select value={presetPaletteIndex} onChange={onPresetPaletteChange}>
          {coloors.map((palette, index) => {
            return (
              <Select.Option value={index} key={index} dropdownStyle={{ display: 'flex', alignItems: 'center' }}>
                <div className="custom-palette-colors">
                  {palette.map((hexColor) => {
                    return (
                      <div key="hexColor" className="custom-palette-color-container">
                        <div className="custom-palette-color" style={{ backgroundColor: hexColor }} />
                      </div>
                    )
                  })}
                </div>
              </Select.Option>
            )
          })}
        </Select>
      </Tabs.TabPane>
      <Tabs.TabPane
        key="3"
        tab={<span className="tab-span">Custom</span>}
        style={{ padding: '1px 1px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div className="custom-palette-container">
          <Select
            className="custom-palette-number"
            value={customPaletteColors.length}
            onChange={onPaletteSizeChange}
            style={{ fontSize: '16px' }}
          >
            {Array.from({ length: 10 }, (_, i) => {
              return (
                <Select.Option key={i} value={i + 1} style={{ fontSize: '16px' }}>
                  {i + 1}
                </Select.Option>
              )
            })}
          </Select>
          <div className="custom-palette-colors">
            {customPaletteColors.map((color, paletteIndex) => (
              <Popover
                content={
                  <ChromePicker
                    color={color}
                    onChange={(c) => {
                      onCustomPalettePickerChange(c, paletteIndex)
                    }}
                    onChangeComplete={(c) => {
                      onCustomPalettePickerChangeComplete(c, paletteIndex)
                    }}
                    disableAlpha
                  />
                }
                key={paletteIndex}
                placement="bottom"
              >
                <div className="custom-palette-color-container">
                  <div className="custom-palette-color" style={{ backgroundColor: color }} />
                </div>
              </Popover>
            ))}
          </div>
        </div>
      </Tabs.TabPane>
    </Tabs>
  )
}

export default ColorTabs
