import React, { useState } from 'react'
import { Radio, Tabs, Popover, Select, Button, Checkbox } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { ChromePicker, ColorResult as ReactColorResult, ColorResult } from 'react-color'
import { generate } from '@ant-design/colors'

import { THEME_COLOR_PURPLE } from 'constants/colors'
import { AntColors, PRESET_PALETTES } from 'Colors/colors'
import { MaposaicColors, PresetColorName, PaletteOrigin, ShadingColor } from 'Colors/types'
import './colorTabs.style.less'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

const ColorTabs = ({
  setNewMaposaicColors,
  specificWaterColor,
  setSpecificWaterColor,
}: {
  setNewMaposaicColors: (colors: MaposaicColors) => void
  specificWaterColor: MaposaicColors | null
  setSpecificWaterColor: (color: MaposaicColors | null) => void
}) => {
  const [shadingColor, setShadingColor] = useState<ShadingColor>(PresetColorName.Random)
  const [customShadingColor, setCustomShadingColor] = useState('#3C22C3')
  const [presetPaletteIndex, setPresetPaletteIndex] = useState({
    [PaletteOrigin.Coolors]: 0,
    [PaletteOrigin.ColorHunt]: 0,
  })
  const [customPaletteColors, setCustomPaletteColors] = useState<string[]>(['#F3D2A6', '#13DFF6'])
  const [paletteOrigin, setPaletteOrigin] = useState<PaletteOrigin>(PaletteOrigin.Coolors)

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    const color = e.target.value as PresetColorName
    setShadingColor(color)
    setNewMaposaicColors(color === PresetColorName.Random ? PresetColorName.Random : AntColors[color])
  }

  const handleCustomShadingClick = () => {
    setShadingColor('customShading')
    setNewMaposaicColors(generate(customShadingColor))
  }

  const handleCustomShadingColorChangeComplete = (color: ReactColorResult) => {
    setCustomShadingColor(color.hex)
    setShadingColor('customShading')
    setNewMaposaicColors(generate(color.hex))
  }

  const handlePaletteOriginChange = (e: RadioChangeEvent) => {
    const origin = e.target.value as PaletteOrigin
    setPaletteOrigin(origin)
    setNewMaposaicColors(PRESET_PALETTES[origin].palettes[presetPaletteIndex[origin]])
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
      setNewMaposaicColors(PRESET_PALETTES[paletteOrigin].palettes[presetPaletteIndex[paletteOrigin]])
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
    const paletteIndex = { ...presetPaletteIndex }
    paletteIndex[paletteOrigin] = index
    setPresetPaletteIndex(paletteIndex)
    setNewMaposaicColors(PRESET_PALETTES[paletteOrigin].palettes[index])
  }

  const onSameWaterColorChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setSpecificWaterColor('#ff9876')
    } else {
      setSpecificWaterColor(null)
    }
  }

  return (
    <div>
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <Tabs.TabPane key="1" tab={<span className="tab-span">Shading</span>}>
          <Radio.Group name="preset" onChange={handlePresetColorChange} value={shadingColor} style={{ padding: '1px' }}>
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
                onChangeComplete={handleCustomShadingColorChangeComplete}
                disableAlpha
              />
            }
            placement="bottom"
          >
            <Button
              style={
                shadingColor === 'customShading'
                  ? { borderColor: THEME_COLOR_PURPLE, color: THEME_COLOR_PURPLE }
                  : undefined
              }
              onClick={handleCustomShadingClick}
              className="shading-custom-button"
            >
              Custom seed
            </Button>
          </Popover>
        </Tabs.TabPane>
        <Tabs.TabPane
          key="2"
          tab={<span className="tab-span">Palette</span>}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
        >
          <Radio.Group name="paletteOrigin" value={paletteOrigin} onChange={handlePaletteOriginChange}>
            {Object.entries(PRESET_PALETTES).map(([origin, { name }]) => {
              return (
                <Radio key={origin} value={origin}>
                  {name}
                </Radio>
              )
            })}
          </Radio.Group>
          <Select
            className="preset-palette-select"
            value={presetPaletteIndex[paletteOrigin]}
            onChange={onPresetPaletteChange}
          >
            {PRESET_PALETTES[paletteOrigin].palettes.map((palette, index) => {
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
      <Checkbox checked={specificWaterColor !== null} onChange={onSameWaterColorChange} className="water-check">
        Same color for Water
      </Checkbox>
    </div>
  )
}

export default ColorTabs
