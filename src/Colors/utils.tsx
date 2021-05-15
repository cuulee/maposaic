import {
  ColorConfig,
  ColorConfigType,
  ColorSettings,
  MaposaicColors,
  PaletteOrigin,
  PaletteType,
  RGBColor,
  ShadingType,
} from 'Colors/types'
import { SpecificColorTransforms } from 'Maposaic/types'
import { generate } from '@ant-design/colors'
import { AntColors, INITIAL_PALETTE_INDEX, PRESET_PALETTES } from 'Colors/constants'

export const createRGB = (r: number, g: number, b: number, a: number): RGBColor => {
  // beware of cheeseNaN
  return { r: r || 0, g: g || 0, b: b || 0, a: a || 0 }
}

const hexToRgb = (hex: string) => {
  return createRGB(parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255)
}

const hexToU32 = (hex: string) => {
  return parseInt(hex.slice(1, 3), 16) * 256 * 256 + parseInt(hex.slice(3, 5), 16) * 256 + parseInt(hex.slice(5, 7), 16)
}

const HEXA = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
const intToHex = (int: number) => {
  return `${HEXA[Math.floor(int / 16)] || 0}${HEXA[int % 16] || 0}`
}

export const rgbToHex = (rgb: RGBColor) => {
  return `#${intToHex(rgb.r)}${intToHex(rgb.g)}${intToHex(rgb.b)}`
}

export const createColor = (colors: MaposaicColors | string, isBrightColor?: boolean) => {
  if (colors === ColorConfigType.Random) {
    if (isBrightColor) {
      return hslToRGB((Math.floor(Math.random() * 240) + 180) % 360, 100, 50)
    }
    return createRGB(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      255,
    )
  }
  if (typeof colors === 'string') {
    return hexToRgb(colors)
  }
  return hexToRgb(colors[Math.floor(Math.random() * colors.length)])
}

export const transformInitialColor = (
  initialColor: RGBColor,
  mainColor: MaposaicColors,
  specificColorTransforms: SpecificColorTransforms,
  isBrightColor: boolean,
) => {
  const initialColorHex = rgbToHex(initialColor)
  if (initialColorHex in specificColorTransforms) {
    const specificColor = specificColorTransforms[initialColorHex].color
    if (specificColor) {
      return createColor(specificColor)
    }
  }

  return createColor(mainColor, isBrightColor)
}

export const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < similarColorTolerance &&
    Math.abs(color1.g - color2.g) < similarColorTolerance &&
    Math.abs(color1.b - color2.b) < similarColorTolerance
  )
}

export const getMaposaicColorsWithoutSpecific = (
  mainColors: MaposaicColors,
  specificColorTransforms: SpecificColorTransforms,
) => {
  if (typeof mainColors !== 'object') {
    return mainColors
  }
  const specificColors = new Set()
  for (const specificColor in specificColorTransforms) {
    if (specificColorTransforms[specificColor].color) {
      specificColors.add(specificColorTransforms[specificColor].color)
    }
  }

  const colors = []

  for (const color of mainColors) {
    if (!specificColors.has(color)) {
      colors.push(color)
    }
  }

  return colors
}

export const getMaposaicColorsFromColorConfig = (colorConfig: ColorConfig, isBrightColor?: boolean) => {
  if (colorConfig.type === ColorConfigType.Random) {
    return ColorConfigType.Random
  }
  if (colorConfig.type === ColorConfigType.Shading) {
    const shadingColors =
      colorConfig.shadingType === ShadingType.Custom
        ? generate(colorConfig.seedColor)
        : AntColors[colorConfig.seedColor]

    return isBrightColor
      ? shadingColors.slice(Math.min(shadingColors.length - 3, 3), shadingColors.length)
      : shadingColors
  }
  if (colorConfig.paletteType === PaletteType.Preset) {
    return PRESET_PALETTES[colorConfig.origin].palettes[colorConfig.paletteIndex]
  }

  return colorConfig.colors
}

export const createMaposaicColors = (
  colorConfig: ColorConfig,
  specificColorTransforms: SpecificColorTransforms,
  isBrightColor?: boolean,
) => {
  return getMaposaicColorsWithoutSpecific(
    getMaposaicColorsFromColorConfig(colorConfig, isBrightColor),
    specificColorTransforms,
  )
}

export const getInitialPresetPaletteIndex = (colorConfig: ColorConfig, origin: PaletteOrigin) => {
  return colorConfig.type === ColorConfigType.Palette &&
    colorConfig.paletteType === PaletteType.Preset &&
    colorConfig.origin === origin
    ? colorConfig.paletteIndex
    : INITIAL_PALETTE_INDEX[origin] ?? 0
}

export const createColorSettings = (
  mainColors: MaposaicColors,
  specificColorTransforms: SpecificColorTransforms,
): ColorSettings => {
  const specific_transforms: Record<number, number> = {}
  for (const [colorHex, transform] of Object.entries(specificColorTransforms)) {
    if (transform.color) {
      specific_transforms[hexToU32(colorHex)] = hexToU32(transform.color ?? '#000000')
    }
  }
  return {
    is_random: mainColors === ColorConfigType.Random,
    specific_transforms,
    available_colors: mainColors === ColorConfigType.Random ? [] : mainColors.map(hexToU32),
  }
}

// from https://css-tricks.com/converting-color-spaces-in-javascript/
const hslToRGB = (h: number, s0: number, l0: number) => {
  const s = s0 / 100
  const l = l0 / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return createRGB(r, g, b, 255)
}
