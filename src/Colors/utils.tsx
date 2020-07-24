import { MaposaicColors, PresetColorName, RGBColor } from 'Colors/types'

export const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

const hexToRgb = (hex: string) => {
  return createRGB(
    parseInt(hex.slice(1, 2), 16) * 16 + parseInt(hex.slice(2, 3), 16),
    parseInt(hex.slice(3, 4), 16) * 16 + parseInt(hex.slice(4, 5), 16),
    parseInt(hex.slice(5, 6), 16) * 16 + parseInt(hex.slice(6, 7), 16),
  )
}

export const createColor = (colors: MaposaicColors) => {
  if (colors === PresetColorName.Random) {
    return createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
  }
  if (typeof colors === 'string') {
    return hexToRgb(colors)
  }
  return hexToRgb(colors[Math.floor(Math.random() * colors.length)])
}

export const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < similarColorTolerance &&
    Math.abs(color1.g - color2.g) < similarColorTolerance &&
    Math.abs(color1.b - color2.b) < similarColorTolerance
  )
}
