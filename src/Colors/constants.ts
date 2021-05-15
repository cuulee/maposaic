import {
  blue,
  cyan,
  geekblue,
  gold,
  green,
  grey,
  lime,
  magenta,
  purple,
  red,
  volcano,
  yellow,
} from '@ant-design/colors'

import { coolors } from 'Colors/palettes/coolors'
import { colorHunt } from 'Colors/palettes/colorHunt'
import {
  ColorConfigType,
  PaletteColorConfig,
  PaletteOrigin,
  PaletteType,
  RandomColorConfig,
  ShadingColorConfig,
  ShadingPresetName,
  ShadingType,
} from 'Colors/types'

export const AntColors = {
  [ShadingPresetName.Blue]: blue,
  [ShadingPresetName.Red]: red,
  [ShadingPresetName.Volcano]: volcano,
  [ShadingPresetName.Gold]: gold,
  [ShadingPresetName.Yellow]: yellow,
  [ShadingPresetName.Lime]: lime,
  [ShadingPresetName.Green]: green,
  [ShadingPresetName.Cyan]: cyan,
  [ShadingPresetName.Geekblue]: geekblue,
  [ShadingPresetName.Purple]: purple,
  [ShadingPresetName.Magenta]: magenta,
  [ShadingPresetName.Grey]: grey,
}

export const PRESET_PALETTES: { [key in PaletteOrigin]: { name: string; palettes: string[][] } } = {
  [PaletteOrigin.Coolors]: { name: 'x5', palettes: coolors },
  [PaletteOrigin.ColorHunt]: { name: 'x4', palettes: colorHunt },
}

export const ROAD_WHITE = '#ffffff'

export const ColorConfigNamesAndImage = {
  [ColorConfigType.Random]: {
    name: 'Random',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Findiana-random.png?alt=media&token=f74a331b-0df8-49c7-8abe-1b9b4b5161e5',
  },
  [ColorConfigType.Shading]: {
    name: 'Shading',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Findiana-shading-blue.png?alt=media&token=9c1acece-2f2b-4daf-bf92-a173a911b318',
  },
  [ColorConfigType.Palette]: {
    name: 'Palette',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Findiana-palette.png?alt=media&token=d50d25e2-e4a0-4adf-9fbb-8c263f33a6ab',
  },
}

export const RANDOM_CONFIG: RandomColorConfig = {
  type: ColorConfigType.Random,
}

export const DEFAULT_SHADING_CONFIG: ShadingColorConfig = {
  type: ColorConfigType.Shading,
  shadingType: ShadingType.Preset,
  seedColor: ShadingPresetName.Blue,
}

export const INITIAL_PALETTE_INDEX = {
  [PaletteOrigin.Coolors]: Math.floor(Math.random() * coolors.length),
  [PaletteOrigin.ColorHunt]: Math.floor(Math.random() * colorHunt.length),
}

export const DEFAULT_PALETTE_CONFIG: PaletteColorConfig = {
  type: ColorConfigType.Palette,
  paletteType: PaletteType.Preset,
  origin: PaletteOrigin.Coolors,
  paletteIndex: INITIAL_PALETTE_INDEX['coolors'],
}
