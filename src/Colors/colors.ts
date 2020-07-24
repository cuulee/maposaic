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

import { coolors } from 'Colors/palettes/coolors'
import { colorHunt } from 'Colors/palettes/colorHunt'
import { PaletteOrigin, PresetColorName } from 'Colors/types'

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

export const PRESET_PALETTES: { [key in PaletteOrigin]: { name: string; palettes: string[][] } } = {
  [PaletteOrigin.Coolors]: { name: 'Coolors', palettes: coolors },
  [PaletteOrigin.ColorHunt]: { name: 'Color Hunt', palettes: colorHunt },
}
