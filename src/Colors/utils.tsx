import { MaposaicColors, PresetColorName, RGBColor } from 'Colors/types'
import { SpecificColorTransforms } from 'Mapozaic/types'

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

const HEXA = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
const intToHex = (int: number) => {
  return `${HEXA[Math.floor(int / 16)] || 0}${HEXA[int % 16] || 0}`
}

export const rgbToHex = (rgb: RGBColor) => {
  return `#${intToHex(rgb.r)}${intToHex(rgb.g)}${intToHex(rgb.b)}`
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

export const transformInitialColor = (
  initialColor: RGBColor,
  colors: MaposaicColors,
  specificColorTransforms: SpecificColorTransforms,
) => {
  const initialColorHex = rgbToHex(initialColor)
  if (initialColorHex in specificColorTransforms) {
    const transform = specificColorTransforms[initialColorHex].color
    if (transform) {
      return createColor(transform)
    }
  }

  return createColor(colors)
}

export const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < similarColorTolerance &&
    Math.abs(color1.g - color2.g) < similarColorTolerance &&
    Math.abs(color1.b - color2.b) < similarColorTolerance
  )
}
