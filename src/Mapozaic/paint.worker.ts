import { imagePoint, RGBColor } from './Mapozaic'
import { MaposaicColors, PresetColorName } from './colors'
import { Size } from './types'

const MAX_SET_SIZE = 16777216
export const ROAD_COLOR_THRESHOLD = 50
export const SIMILAR_COLOR_TOLERANCE = 1

const getPointFromPixelIndex = (pixelIndex: number, canvasWidth: number): imagePoint => {
  return { x: pixelIndex % canvasWidth, y: Math.floor(pixelIndex / canvasWidth) }
}
const getPixelIndexFromPoint = (point: imagePoint, canvasWidth: number): number => {
  return point.y * canvasWidth + point.x
}

const getSourcePointFromTargetPoint = (targetPoint: imagePoint, targetSize: Size, canvassRatio: number) => {
  return {
    x: canvassRatio * targetPoint.x,
    y: canvassRatio * (targetSize.h - 1 - targetPoint.y),
  }
}

type PaintedBounds = { min: number; max: number }

const getSourcePixelIndexFromTargetPixelIndex = ({
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

const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < similarColorTolerance &&
    Math.abs(color1.g - color2.g) < similarColorTolerance &&
    Math.abs(color1.b - color2.b) < similarColorTolerance
  )
}

const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

const getAdjacentPoints = ({ point, canvasSize }: { point: imagePoint; canvasSize: Size }) => ({
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

const paintArrayPixel = ({
  color,
  pixelIndex,
  pixelArray,
  visitedPixelSets,
  paintedBounds,
}: {
  color: RGBColor
  pixelIndex: number
  pixelArray: Uint8ClampedArray
  visitedPixelSets: Set<number>[]
  paintedBounds: PaintedBounds
}) => {
  visitedPixelSets[Math.floor(pixelIndex / MAX_SET_SIZE)].add(pixelIndex)

  pixelArray[pixelIndex * 4] = color.r
  pixelArray[pixelIndex * 4 + 1] = color.g
  pixelArray[pixelIndex * 4 + 2] = color.b
  pixelArray[pixelIndex * 4 + 3] = 255

  if (pixelIndex < paintedBounds.min) {
    paintedBounds.min = pixelIndex
  }
  if (pixelIndex > paintedBounds.max) {
    paintedBounds.max = pixelIndex
  }
}

const paintAdjacentPointsInTarget = ({
  targetPixelArray,
  sourcePixelArray,
  sourceSize,
  targetSize,
  canvassRatio,
  initialTargetPoint,
  initialColor,
  targetColor,
  visitedPixelSets,
  paintedBounds,
}: {
  targetPixelArray: Uint8ClampedArray
  sourcePixelArray: Uint8Array
  sourceSize: Size
  targetSize: Size
  canvassRatio: number
  initialTargetPoint: imagePoint
  initialColor: RGBColor
  targetColor: RGBColor
  visitedPixelSets: Set<number>[]
  paintedBounds: PaintedBounds
}): void => {
  const toVisitPointStack: imagePoint[] = [initialTargetPoint]

  while (toVisitPointStack.length > 0) {
    const targetPoint = toVisitPointStack.pop()
    if (!targetPoint) {
      continue
    }
    const targetPixelIndex = getPixelIndexFromPoint(targetPoint, targetSize.w)
    if (visitedPixelSets[Math.floor(targetPixelIndex / MAX_SET_SIZE)].has(targetPixelIndex)) {
      continue
    }

    const sourcePixelIndex = getSourcePixelIndexFromTargetPixelIndex({
      targetPixelIndex,
      targetSize,
      canvassRatio,
      sourceSize,
    })

    const targetPointColor = createRGB(
      sourcePixelArray[sourcePixelIndex * 4],
      sourcePixelArray[sourcePixelIndex * 4 + 1],
      sourcePixelArray[sourcePixelIndex * 4 + 2],
    )

    const adjacentTargetPoints = getAdjacentPoints({ point: targetPoint, canvasSize: targetSize })

    // anti-aliasing
    if (!isColorSimilar(targetPointColor, initialColor, SIMILAR_COLOR_TOLERANCE)) {
      const similarPointCount = Object.values(adjacentTargetPoints).filter((adjacentTargetPoint) => {
        if (!adjacentTargetPoint) {
          return false
        }
        const adjacentTargetIndex = getPixelIndexFromPoint(adjacentTargetPoint, targetSize.w)
        if (visitedPixelSets[Math.floor(adjacentTargetIndex / MAX_SET_SIZE)].has(adjacentTargetIndex)) {
          return false
        }
        const adjSourceIndex = getSourcePixelIndexFromTargetPixelIndex({
          targetPixelIndex: adjacentTargetIndex,
          targetSize,
          canvassRatio,
          sourceSize,
        })

        return isColorSimilar(
          createRGB(
            sourcePixelArray[adjSourceIndex * 4],
            sourcePixelArray[adjSourceIndex * 4 + 1],
            sourcePixelArray[adjSourceIndex * 4 + 2],
          ),
          targetPointColor,
          SIMILAR_COLOR_TOLERANCE,
        )
      }).length

      if (similarPointCount < 2) {
        const colorRatio = initialColor.r ? targetPointColor.r / initialColor.r : 1
        const antiAliasingColor = createRGB(
          targetColor.r * colorRatio,
          targetColor.g * colorRatio,
          targetColor.b * colorRatio,
        )
        paintArrayPixel({
          color: antiAliasingColor,
          visitedPixelSets,
          pixelArray: targetPixelArray,
          pixelIndex: targetPixelIndex,
          paintedBounds,
        })
      }
      continue
    }

    paintArrayPixel({
      color: targetColor,
      visitedPixelSets,
      pixelArray: targetPixelArray,
      pixelIndex: targetPixelIndex,
      paintedBounds,
    })

    Object.values(adjacentTargetPoints).forEach((adjacentPoint) => {
      if (!adjacentPoint) {
        return
      }
      const adjacentTargetIndex = getPixelIndexFromPoint(adjacentPoint, targetSize.w)
      if (!visitedPixelSets[Math.floor(adjacentTargetIndex / MAX_SET_SIZE)].has(adjacentTargetIndex)) {
        toVisitPointStack.push(adjacentPoint)
      }
    })
  }
}

const createColor = (colors: MaposaicColors) => {
  if (colors === PresetColorName.Random) {
    return createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
  }
  return hexToRgb(colors[Math.floor(Math.random() * colors.length)])
}

onmessage = ({
  data: { sourcePixelArray, targetPixelArray, sourceSize, targetSize, canvassRatio, maposaicColors },
}: {
  data: {
    sourcePixelArray: Uint8Array
    targetPixelArray: Uint8ClampedArray
    sourceSize: Size
    targetSize: Size
    canvassRatio: number
    maposaicColors: MaposaicColors
  }
}): void => {
  const t1 = new Date()

  const visitedPixelSets = []
  const numberOfSets = Math.floor((targetSize.h * targetSize.w) / MAX_SET_SIZE) + 1
  for (let index = 0; index < numberOfSets; index++) {
    visitedPixelSets.push(new Set<number>()) // because Set size cannot exceed 2^24
  }

  let targetPixelIndex = 0

  for (let i = 0; i < targetSize.h; i += 1) {
    for (let j = 0; j < targetSize.w; j += 1) {
      targetPixelIndex = i * targetSize.w + j

      if (visitedPixelSets[Math.floor(targetPixelIndex / MAX_SET_SIZE)].has(targetPixelIndex)) {
        continue
      }
      const sourcePixelIndex = getSourcePixelIndexFromTargetPixelIndex({
        targetPixelIndex,
        targetSize,
        sourceSize,
        canvassRatio,
      })

      const initialColor = createRGB(
        sourcePixelArray[sourcePixelIndex * 4],
        sourcePixelArray[sourcePixelIndex * 4 + 1],
        sourcePixelArray[sourcePixelIndex * 4 + 2],
      )
      const targetColor = initialColor.r < ROAD_COLOR_THRESHOLD ? createColor(maposaicColors) : createRGB(255, 255, 255)
      const initialTargetPoint = getPointFromPixelIndex(targetPixelIndex, targetSize.w)

      const paintedBounds = { min: sourcePixelIndex, max: sourcePixelIndex }
      paintAdjacentPointsInTarget({
        targetPixelArray,
        sourcePixelArray,
        targetSize,
        sourceSize,
        canvassRatio,
        initialTargetPoint,
        initialColor,
        targetColor,
        visitedPixelSets,
        paintedBounds,
      })

      if (Math.random() > 1) {
        // eslint-disable-next-line
      // @ts-ignore
        postMessage({
          pixels: targetPixelArray.slice(paintedBounds.min, paintedBounds.max + 1),
          paintedBoundsMin: paintedBounds.min,
        })
      }
    }
  }
  const t2 = new Date()
  console.log('fin', t2.getTime() - t1.getTime())

  // eslint-disable-next-line
  // @ts-ignore
  postMessage({ pixels: targetPixelArray, paintedBoundsMin: 0 })
}
