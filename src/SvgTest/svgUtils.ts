export type ImagePoint = { x: number; y: number }
export type RGBColor = { r: number; g: number; b: number }

export const getPointFromPixelIndex = (pixelIndex: number, width: number): ImagePoint => {
  return { x: (pixelIndex / 4) % width, y: Math.floor(pixelIndex / 4 / width) }
}
export const getPixelIndexFromPoint = (point: ImagePoint, width: number): number => {
  return (point.y * width + point.x) * 4
}

export enum Corner {
  ONO = 'ONO',
  NNO = 'NNO',
  NNE = 'NNE',
  ENE = 'ENE',
  SSO = 'SSO',
  OSO = 'OSO',
  SSE = 'SSE',
  ESE = 'ESE',
}

export enum Adjacent {
  N = 'N',
  E = 'E',
  O = 'O',
  S = 'S',
}

export enum Border {
  NOtoNE,
  NEtoNO,
  SOtoSE,
  SEtoSO,
  NEtoSE,
  SEtoNE,
  SOtoNO,
  NOtoSO,
}

export enum Draw {
  Right = 'h 1',
  Left = 'h -1',
  Up = 'v -1',
  Down = 'v 1',
}

export const ADJACENT_PROCESSING = {
  [Border.NOtoNE]: { adjacent: Adjacent.N, separation: Draw.Right, adjDeptCorner: Corner.SSO, arv: Corner.NNE },
  [Border.NEtoNO]: { adjacent: Adjacent.N, separation: Draw.Left, adjDeptCorner: Corner.SSE, arv: Corner.NNO },
  [Border.SOtoSE]: { adjacent: Adjacent.S, separation: Draw.Right, adjDeptCorner: Corner.NNO, arv: Corner.SSE },
  [Border.SEtoSO]: { adjacent: Adjacent.S, separation: Draw.Left, adjDeptCorner: Corner.NNE, arv: Corner.SSO },
  [Border.NEtoSE]: { adjacent: Adjacent.E, separation: Draw.Down, adjDeptCorner: Corner.ONO, arv: Corner.ESE },
  [Border.SEtoNE]: { adjacent: Adjacent.E, separation: Draw.Up, adjDeptCorner: Corner.OSO, arv: Corner.ESE },
  [Border.SOtoNO]: { adjacent: Adjacent.O, separation: Draw.Up, adjDeptCorner: Corner.ESE, arv: Corner.ONO },
  [Border.NOtoSO]: { adjacent: Adjacent.O, separation: Draw.Down, adjDeptCorner: Corner.ENE, arv: Corner.OSO },
}

export const ADJACENT_PROCESSING_ORDER = {
  [Corner.ONO]: [Border.NOtoNE, Border.NEtoSE, Border.SEtoSO, Border.SOtoNO],
  [Corner.NNO]: [Border.NOtoSO, Border.SOtoSE, Border.SEtoNE, Border.NEtoNO],
  [Corner.OSO]: [Border.SOtoSE, Border.SEtoNE, Border.NEtoNO, Border.NOtoSO],
  [Corner.SSO]: [Border.SOtoNO, Border.NOtoNE, Border.NEtoSE, Border.SEtoSO],
  [Corner.NNE]: [Border.NEtoSE, Border.SEtoSO, Border.SOtoNO, Border.NOtoNE],
  [Corner.ENE]: [Border.NEtoNO, Border.NOtoSO, Border.SOtoSE, Border.SEtoNE],
  [Corner.SSE]: [Border.SEtoNE, Border.NEtoNO, Border.NOtoSO, Border.SOtoSE],
  [Corner.ESE]: [Border.SEtoSO, Border.SOtoNO, Border.NOtoNE, Border.NEtoSE],
}

export const MOVE_OFFSET = {
  [Corner.ONO]: { x: 0, y: 0 },
  [Corner.NNO]: { x: 0, y: 0 },
  [Corner.OSO]: { x: 0, y: 1 },
  [Corner.SSO]: { x: 0, y: 1 },
  [Corner.NNE]: { x: 1, y: 0 },
  [Corner.ENE]: { x: 1, y: 0 },
  [Corner.SSE]: { x: 1, y: 1 },
  [Corner.ESE]: { x: 1, y: 1 },
}

export type PointWithIndex = {
  point: ImagePoint
  pixelIndex: number
}

export type BorderPoint = {
  parentCorner: Corner
  pixelIndex: number
  point: ImagePoint
}

export type Path = {
  d: string
  id: number
  color: string
}

export const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance?: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < (similarColorTolerance || 1) &&
    Math.abs(color1.g - color2.g) < (similarColorTolerance || 1) &&
    Math.abs(color1.b - color2.b) < (similarColorTolerance || 1)
  )
}

export const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

export const getAdjacentPoint = ({
  point,
  adjacent,
  width,
  height,
}: {
  point: ImagePoint
  adjacent: Adjacent
  width: number
  height: number
}) => {
  switch (adjacent) {
    case Adjacent.N:
      return point.y > 0 ? { x: point.x, y: point.y - 1 } : null
    case Adjacent.S:
      return point.y < height - 1 ? { x: point.x, y: point.y + 1 } : null
    case Adjacent.E:
      return point.x < width - 1 ? { x: point.x + 1, y: point.y } : null
    case Adjacent.O:
      return point.x > 0 ? { x: point.x - 1, y: point.y } : null
    default:
      return null
  }
}

export const getAdjacentFromBorder = ({
  border,
  index,
  width,
  height,
}: {
  border: BorderPoint
  index: number
  width: number
  height: number
}) => {
  const borderName = ADJACENT_PROCESSING_ORDER[border.parentCorner][index]
  const adjacent = ADJACENT_PROCESSING[borderName]
  const adjacentPoint = getAdjacentPoint({
    point: border.point,
    adjacent: adjacent.adjacent,
    width,
    height,
  })
  const adjacentPixel = adjacentPoint ? getPixelIndexFromPoint(adjacentPoint, width) : null
  return { adjacent, adjacentPoint, adjacentPixel }
}
