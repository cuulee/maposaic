import React, { useState } from 'react'
import Radio, { RadioChangeEvent } from 'antd/lib/radio'
import { ChromePicker, ColorResult } from 'react-color'

import { AntColors, PRESET_PALETTES } from 'Colors/constants'
import {
  ColorConfig,
  ColorConfigType,
  HexColor,
  PaletteColorConfig,
  PaletteOrigin,
  PaletteType,
  ShadingColorConfig,
  ShadingPresetName,
  ShadingType,
} from 'Colors/types'
import 'Colors/colorConfigSettings.style.less'
import { InputNumber, Popover, Select } from 'antd'
import { getInitialPresetPaletteIndex } from 'Colors/utils'

/* eslint-disable complexity */
const ColorConfigSettings = ({
  colorConfig,
  setColorConfig,
  shadingColorConfig,
  setShadingColorConfig,
  paletteColorConfig,
  setPaletteColorConfig,
}: {
  colorConfig: ColorConfig
  setColorConfig: (config: ColorConfig) => void
  shadingColorConfig: ShadingColorConfig
  setShadingColorConfig: (shadingColorConfig: ShadingColorConfig) => void
  paletteColorConfig: PaletteColorConfig
  setPaletteColorConfig: (paletteColorConfig: PaletteColorConfig) => void
}) => {
  const [customShadingColor, setCustomShadingColor] = useState<HexColor>(
    colorConfig.type === ColorConfigType.Shading && colorConfig.shadingType === ShadingType.Custom
      ? colorConfig.seedColor
      : '#3c22c3',
  )
  const [paletteOrigin, setPaletteOrigin] = useState<PaletteOrigin | PaletteType.Custom>(
    colorConfig.type === ColorConfigType.Palette
      ? colorConfig.paletteType === PaletteType.Preset
        ? colorConfig.origin
        : PaletteType.Custom
      : PaletteOrigin.Coolors,
  )
  const [presetPaletteIndex, setPresetPaletteIndex] = useState({
    [PaletteOrigin.Coolors]: getInitialPresetPaletteIndex(colorConfig, PaletteOrigin.Coolors),
    [PaletteOrigin.ColorHunt]: getInitialPresetPaletteIndex(colorConfig, PaletteOrigin.ColorHunt),
  })
  const [customPaletteColors, setCustomPaletteColors] = useState<string[]>(
    colorConfig.type === ColorConfigType.Palette && colorConfig.paletteType === PaletteType.Custom
      ? colorConfig.colors
      : ['#f3d2a6', '#13dff6'],
  )

  const changeColorConfig = (config: ColorConfig) => {
    if (config.type === ColorConfigType.Shading) {
      setShadingColorConfig(config)
    } else if (config.type === ColorConfigType.Palette) {
      setPaletteColorConfig(config)
    }
    setColorConfig(config)
  }

  const changePresetColor = (presetName: ShadingPresetName) => {
    changeColorConfig({ ...shadingColorConfig, shadingType: ShadingType.Preset, seedColor: presetName })
  }

  const setCustomShadingConfig = (color: HexColor) => {
    setCustomShadingColor(color)
    changeColorConfig({
      ...shadingColorConfig,
      shadingType: ShadingType.Custom,
      seedColor: color,
    })
  }
  const changePaletteOrigin = (e: RadioChangeEvent) => {
    const origin = e.target.value as PaletteOrigin | PaletteType.Custom
    setPaletteOrigin(origin)
    if (origin === PaletteType.Custom) {
      changeColorConfig({
        type: ColorConfigType.Palette,
        paletteType: PaletteType.Custom,
        colors: customPaletteColors,
      })
    } else {
      changeColorConfig({
        type: ColorConfigType.Palette,
        paletteType: PaletteType.Preset,
        origin,
        paletteIndex: presetPaletteIndex[origin],
      })
    }
  }
  const changePresetPaletteIndex = (index: number) => {
    if (paletteOrigin === PaletteType.Custom) {
      return
    }
    const paletteIndex = { ...presetPaletteIndex }
    paletteIndex[paletteOrigin] = index
    setPresetPaletteIndex(paletteIndex)
    changeColorConfig({
      type: ColorConfigType.Palette,
      paletteType: PaletteType.Preset,
      origin: paletteOrigin,
      paletteIndex: index,
    })
  }

  const onCustomPalettePickerChange = (color: ColorResult, index: number) => {
    const newPalette = [...customPaletteColors]
    newPalette[index] = color.hex.toLocaleLowerCase()
    setCustomPaletteColors(newPalette)
    return newPalette
  }

  const onCustomPalettePickerChangeComplete = (color: ColorResult, index: number) => {
    const newPalette = onCustomPalettePickerChange(color, index)
    changeColorConfig({ type: ColorConfigType.Palette, paletteType: PaletteType.Custom, colors: newPalette })
  }

  const onPaletteSizeChange = (value: number | undefined | string) => {
    if (!value || typeof value === 'string') {
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
    changeColorConfig({ type: ColorConfigType.Palette, paletteType: PaletteType.Custom, colors: newPalette })
  }

  if (colorConfig.type === ColorConfigType.Shading) {
    return (
      <div className="settings">
        <div className="shading-settings__type">
          <div className="shading-settings__type__name">Preset</div>
          <div className="shading-settings__type__presets">
            {Object.entries(ShadingPresetName).map(([name, color]) => {
              return (
                <div
                  className={`shading-color${
                    shadingColorConfig.shadingType === ShadingType.Preset && shadingColorConfig.seedColor === color
                      ? ' shading-color--selected'
                      : ''
                  }`}
                  key={name}
                  onClick={() => changePresetColor(color)}
                >
                  <div className="shading-color__fill" style={{ backgroundColor: AntColors[color].primary }} />
                </div>
              )
            })}
          </div>
        </div>
        <div className="shading-settings__type">
          <div className="shading-settings__type__name">Custom</div>
          <div className="shading-settings__type__custom">
            <div
              className={`shading-color${
                shadingColorConfig.shadingType === ShadingType.Custom ? ' shading-color--selected' : ''
              }`}
              onClick={() => setCustomShadingConfig(customShadingColor)}
            >
              <Popover
                content={
                  <ChromePicker
                    color={customShadingColor}
                    onChange={(c) => setCustomShadingColor(c.hex)}
                    onChangeComplete={(color) => setCustomShadingConfig(color.hex.toLocaleLowerCase())}
                    disableAlpha
                  />
                }
                placement="bottom"
              >
                <div className="shading-color__fill" style={{ backgroundColor: customShadingColor }} />
              </Popover>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (colorConfig.type === ColorConfigType.Palette) {
    return (
      <div className="settings palette-settings">
        <Radio.Group name="paletteOrigin" value={paletteOrigin} onChange={changePaletteOrigin}>
          {Object.entries(PRESET_PALETTES).map(([origin, { name }]) => {
            return (
              <Radio key={origin} value={origin}>
                {name}
              </Radio>
            )
          })}
          <Radio value={PaletteType.Custom}>Custom</Radio>
        </Radio.Group>
        <div>
          {paletteOrigin === PaletteType.Custom ? (
            <div className="palette-settings__custom-palette">
              <InputNumber min={1} onChange={onPaletteSizeChange} size="large" value={customPaletteColors.length} />
              <div className="palette-settings__custom-palette__colors palette-colors">
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
                    // eslint-disable-next-line
                    key={paletteIndex}
                    placement="bottom"
                  >
                    <div className="palette-colors__color">
                      <div className="palette-colors__color__fill" style={{ backgroundColor: color }} />
                    </div>
                  </Popover>
                ))}
              </div>
            </div>
          ) : (
            <Select
              className="palette-settings__preset"
              value={presetPaletteIndex[paletteOrigin]}
              onChange={changePresetPaletteIndex}
            >
              {PRESET_PALETTES[paletteOrigin].palettes.map((palette, index) => {
                return (
                  <Select.Option
                    value={index}
                    key={palette.join('')}
                    dropdownStyle={{ display: 'flex', alignItems: 'center' }}
                  >
                    <div className="palette-colors">
                      {palette.map((hexColor) => {
                        return (
                          <div key={hexColor} className="palette-colors__color">
                            <div className="palette-colors__color__fill" style={{ backgroundColor: hexColor }} />
                          </div>
                        )
                      })}
                    </div>
                  </Select.Option>
                )
              })}
            </Select>
          )}
        </div>
      </div>
    )
  }
  return null
}

export default ColorConfigSettings
