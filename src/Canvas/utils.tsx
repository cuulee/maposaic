import { imagePoint, RGBColor, Size } from 'Canvas/types'
import { MaposaicColors, PresetColorName } from 'Colors/types'

export const getPointFromPixelIndex = (pixelIndex: number, canvasWidth: number): imagePoint => {
  return { x: pixelIndex % canvasWidth, y: Math.floor(pixelIndex / canvasWidth) }
}
export const getPixelIndexFromPoint = (point: imagePoint, canvasWidth: number): number => {
  return point.y * canvasWidth + point.x
}

export const getSourcePointFromTargetPoint = (targetPoint: imagePoint, targetSize: Size, canvassRatio: number) => {
  return {
    x: canvassRatio * targetPoint.x,
    y: canvassRatio * (targetSize.h - 1 - targetPoint.y),
  }
}

export const getSourcePixelIndexFromTargetPixelIndex = ({
  targetPixelIndex,
  targetSize,
  sourceSize,
  canvassRatio,
}: {
  targetPixelIndex: number
  targetSize: Size
  sourceSize: Size
  canvassRatio: number
}) => {
  const targetPoint = getPointFromPixelIndex(targetPixelIndex, targetSize.w)
  const sourcePoint = getSourcePointFromTargetPoint(targetPoint, targetSize, canvassRatio)
  return getPixelIndexFromPoint(sourcePoint, sourceSize.w)
}

export const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < similarColorTolerance &&
    Math.abs(color1.g - color2.g) < similarColorTolerance &&
    Math.abs(color1.b - color2.b) < similarColorTolerance
  )
}

export const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

export const getAdjacentPoints = ({ point, canvasSize }: { point: imagePoint; canvasSize: Size }) => ({
  S: point.y < canvasSize.h - 1 ? { x: point.x, y: point.y + 1 } : null,
  E: point.x < canvasSize.w - 1 ? { x: point.x + 1, y: point.y } : null,
  O: point.x > 0 ? { x: point.x - 1, y: point.y } : null,
  N: point.y > 0 ? { x: point.x, y: point.y - 1 } : null,
  // NE: point.y > 0 && point.x < maposaicWidth - 1 ? { x: point.x + 1, y: point.y - 1 } : null,
  // NO: point.y > 0 && point.x > 0 ? { x: point.x - 1, y: point.y - 1 } : null,
  // SE: point.y < maposaicHeight - 1 && point.x < maposaicWidth - 1 ? { x: point.x + 1, y: point.y + 1 } : null,
  // SO: point.y < maposaicHeight - 1 && point.x > 0 ? { x: point.x - 1, y: point.y + 1 } : null,
})

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
  return hexToRgb(colors[Math.floor(Math.random() * colors.length)])
}

export const getTargetSizeFromSourceSize = (sourceSize: Size, canvassRatio: number) => {
  return {
    w: Math.ceil(sourceSize.w / canvassRatio),
    h: Math.ceil(sourceSize.h / canvassRatio),
  }
}
