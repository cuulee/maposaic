import React, { useState, useEffect } from 'react'
import { Radio, Tabs, Popover, Select, Checkbox } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { ChromePicker, ColorResult as ReactColorResult, ColorResult } from 'react-color'
import { generate } from '@ant-design/colors'

import { AntColors, PRESET_PALETTES } from 'Colors/colors'
import { MaposaicColors, PresetColorName, PaletteOrigin } from 'Colors/types'
import './colorTabs.style.less'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { SpecificColorTransforms } from 'Mapozaic/types'
import { createColor, rgbToHex } from 'Colors/utils'

const ColorTabs = ({
  maposaicColors,
  setNewMaposaicColors,
  specificColorTransforms,
  setNewSpecificColorTransforms,
}: {
  maposaicColors: MaposaicColors
  setNewMaposaicColors: (colors: MaposaicColors) => void
  specificColorTransforms: SpecificColorTransforms
  setNewSpecificColorTransforms: (colors: SpecificColorTransforms) => void
}) => {
  const [shadingColor, setShadingColor] = useState<PresetColorName>(PresetColorName.Random)
  const [customShadingColor, setCustomShadingColor] = useState('#3c22c3')
  const [presetPaletteIndex, setPresetPaletteIndex] = useState({
    [PaletteOrigin.Coolors]: 0,
    [PaletteOrigin.ColorHunt]: 0,
  })
  const [customPaletteColors, setCustomPaletteColors] = useState<string[]>(['#f3d2a6', '#13dff6'])
  const [paletteOrigin, setPaletteOrigin] = useState<PaletteOrigin>(PaletteOrigin.Coolors)
  const [specificColorPicks, setSpecificColorPicks] = useState<Record<string, string>>({})

  useEffect(() => {
    const newPicks: Record<string, string> = {}
    for (const colorKey in specificColorTransforms) {
      const transform = specificColorTransforms[colorKey]
      newPicks[colorKey] = transform.color ? transform.color : ''
    }
    setSpecificColorPicks(newPicks)
  }, [specificColorTransforms])

  const handlePresetColorChange = (e: RadioChangeEvent) => {
    console.log('change', e.target.value)
    const color = e.target.value as PresetColorName
    setShadingColor(color)
    if (color === PresetColorName.Custom) {
      setNewMaposaicColors(generate(customShadingColor))
    } else if (color === PresetColorName.Random) {
      setNewMaposaicColors(PresetColorName.Random)
    } else {
      setNewMaposaicColors(AntColors[color])
    }
  }

  const handleCustomShadingColorChangeComplete = (color: ReactColorResult) => {
    setCustomShadingColor(color.hex.toLocaleLowerCase())
    setShadingColor(PresetColorName.Custom)
    setNewMaposaicColors(generate(color.hex.toLocaleLowerCase()))
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
        () => customPaletteColors[customPaletteColors.length - 1] || '#aaaaaa',
      ),
    ]

    setCustomPaletteColors(newPalette)
    setNewMaposaicColors(newPalette)
  }

  const onTabChange = (activeKey: string) => {
    if (activeKey === '1') {
      if (shadingColor === PresetColorName.Custom) {
        setNewMaposaicColors(generate(customShadingColor))
        return
      } else {
        setNewMaposaicColors(shadingColor === PresetColorName.Random ? PresetColorName.Random : AntColors[shadingColor])
      }
    } else if (activeKey === '2') {
      setNewMaposaicColors(PRESET_PALETTES[paletteOrigin].palettes[presetPaletteIndex[paletteOrigin]])
    } else if (activeKey === '3') {
      setNewMaposaicColors(customPaletteColors)
    }
  }

  const onCustomPalettePickerChange = (color: ColorResult, index: number) => {
    const newPalette = [...customPaletteColors]
    newPalette[index] = color.hex.toLocaleLowerCase()
    setCustomPaletteColors(newPalette)
  }

  const onCustomPalettePickerChangeComplete = (color: ColorResult, index: number) => {
    onCustomPalettePickerChange(color, index)
    setNewMaposaicColors(customPaletteColors)
  }

  const onPresetPaletteChange = (index: number) => {
    const paletteIndex = { ...presetPaletteIndex }
    paletteIndex[paletteOrigin] = index
    setPresetPaletteIndex(paletteIndex)
    setNewMaposaicColors(PRESET_PALETTES[paletteOrigin].palettes[index])
  }

  const onColorTransformChange = (colorKey: string, e: CheckboxChangeEvent) => {
    const newColorTransform = { ...specificColorTransforms }
    newColorTransform[colorKey].color = e.target.checked ? rgbToHex(createColor(maposaicColors)) : null
    setNewSpecificColorTransforms(newColorTransform)
  }

  const onSpecificColorPickerChange = (color: ColorResult, colorKey: string) => {
    const newSpecificColorPicks = { ...specificColorPicks }
    newSpecificColorPicks[colorKey] = color.hex.toLocaleLowerCase()
    setSpecificColorPicks(newSpecificColorPicks)
  }

  const onSpecificColorPickerChangeComplete = (color: ColorResult, colorKey: string) => {
    onSpecificColorPickerChange(color, colorKey)
    const newColorTransform = { ...specificColorTransforms }
    newColorTransform[colorKey].color = color.hex.toLocaleLowerCase()
    setNewSpecificColorTransforms(newColorTransform)
  }

  return (
    <div>
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <Tabs.TabPane key="1" tab={<span className="tab-span">Shading</span>}>
          <Radio.Group name="preset" onChange={handlePresetColorChange} value={shadingColor} style={{ padding: '1px' }}>
            <React.Fragment>
              {Object.entries(PresetColorName).map(([name, color]) => {
                if (color === PresetColorName.Custom) {
                  return (
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
                      <Radio.Button style={{ width: ' 100px' }} value={color}>
                        Custom
                      </Radio.Button>
                    </Popover>
                  )
                }
                return (
                  <Radio.Button style={{ width: ' 100px' }} key={color} value={color}>
                    {name}
                  </Radio.Button>
                )
              })}
            </React.Fragment>
          </Radio.Group>
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
                        <div key={hexColor} className="custom-palette-color-container">
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
      <div className="specific-colors">
        {Object.entries(specificColorTransforms).map(([colorKey, transform]) => (
          <div key={colorKey} className="specific-colors__color">
            <Checkbox
              checked={transform.color !== null}
              onChange={(e) => onColorTransformChange(colorKey, e)}
              className="specific-color-checks__check"
            >
              {`Same color for ${transform.name}`}
            </Checkbox>
            {transform.color && (
              <Popover
                content={
                  <ChromePicker
                    color={specificColorPicks[colorKey]}
                    onChange={(c) => {
                      onSpecificColorPickerChange(c, colorKey)
                    }}
                    onChangeComplete={(c) => {
                      onSpecificColorPickerChangeComplete(c, colorKey)
                    }}
                    disableAlpha
                  />
                }
              >
                <div className="custom-palette-color-container">
                  <div className="custom-palette-color" style={{ backgroundColor: specificColorPicks[colorKey] }} />
                </div>
              </Popover>
            )}
            <br />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ColorTabs
