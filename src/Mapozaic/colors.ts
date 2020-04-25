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

import { coloors } from 'palettes/coloors'
import { colorHunt } from 'palettes/colorHunt'

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

export type ShadingColor = PresetColorName | CustomShadingColor

export type MaposaicColors = PresetColorName.Random | string[]

export enum PaletteOrigin {
  Coolors = 'coolors',
  ColorHunt = 'colorHunt',
}

export const PRESET_PALETTES: { [key in PaletteOrigin]: { name: string; palettes: string[][] } } = {
  [PaletteOrigin.Coolors]: { name: 'Coloors', palettes: coloors },
  [PaletteOrigin.ColorHunt]: { name: 'Color Hunt', palettes: colorHunt },
}
