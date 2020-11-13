export type RGBColor = { r: number; g: number; b: number }

export type MaposaicColors = PresetColorName.Random | string[] | string

export enum PaletteOrigin {
  Coolors = 'coolors',
  ColorHunt = 'colorHunt',
}

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
  Custom = 'custom',
}
