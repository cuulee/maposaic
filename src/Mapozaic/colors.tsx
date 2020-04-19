import {
  red,
  volcano,
  gold,
  yellow,
  lime,
  green,
  cyan,
  blue,
  geekblue,
  purple,
  magenta,
  grey,
} from '@ant-design/colors'

export enum PresetColorName {
  Random = 'random',
  Red = 'red',
  Volcano = 'volcano',
  Gold = 'gold',
  Yellow = 'yellow',
  Lime = 'lime',
  Green = 'green',
  Cyan = 'cyan',
  Blue = 'blue',
  Geekblue = 'geekblue',
  Purple = 'purple',
  Magenta = 'magenta',
  Grey = 'grey',
}

export const AntColors = {
  [PresetColorName.Red]: red,
  [PresetColorName.Volcano]: volcano,
  [PresetColorName.Gold]: gold,
  [PresetColorName.Yellow]: yellow,
  [PresetColorName.Lime]: lime,
  [PresetColorName.Green]: green,
  [PresetColorName.Cyan]: cyan,
  [PresetColorName.Blue]: blue,
  [PresetColorName.Geekblue]: geekblue,
  [PresetColorName.Purple]: purple,
  [PresetColorName.Magenta]: magenta,
  [PresetColorName.Grey]: grey,
}

export type CustomShadingColor = 'customShading'
export type CustomPalette = 'palette'

export type MaposaicColors = PresetColorName.Random | string[]
