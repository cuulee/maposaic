export type RGBColor = { r: number; g: number; b: number }
export type HexColor = string

export type MaposaicColors = ColorConfigType.Random | string[]

export enum PaletteOrigin {
  Coolors = 'coolors',
  ColorHunt = 'colorHunt',
}

export enum ShadingPresetName {
  Blue = 'blue',
  Red = 'red',
  Volcano = 'volcano',
  Gold = 'gold',
  Yellow = 'yellow',
  Lime = 'lime',
  Green = 'green',
  Cyan = 'cyan',
  Geekblue = 'geekblue',
  Purple = 'purple',
  Magenta = 'magenta',
  Grey = 'grey',
}

export enum ColorConfigType {
  Random = 'random',
  Shading = 'shading',
  Palette = 'palette',
}

export type ColorConfig = RandomColorConfig | ShadingColorConfig | PaletteColorConfig

export type RandomColorConfig = { type: ColorConfigType.Random }

export type PaletteColorConfig =
  | {
      type: ColorConfigType.Palette
      paletteType: PaletteType.Preset
      origin: PaletteOrigin
      paletteIndex: number
    }
  | {
      type: ColorConfigType.Palette
      paletteType: PaletteType.Custom
      colors: string[]
    }

export type ShadingColorConfig =
  | {
      type: ColorConfigType.Shading
      shadingType: ShadingType.Preset
      seedColor: ShadingPresetName
    }
  | {
      type: ColorConfigType.Shading
      shadingType: ShadingType.Custom
      seedColor: HexColor
    }

export enum PaletteType {
  Preset = 'preset',
  Custom = 'custom',
}

export enum ShadingType {
  Preset = 'preset',
  Custom = 'custom',
}

export type ColorSettings = {
  specific_transforms: Record<number, number>
  is_random: boolean
  available_colors: number[]
}
