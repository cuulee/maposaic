import { imagePoint, Size } from 'Canvas/types'
import { MaposaicColors, RGBColor } from 'Colors/types'
import { getAdjacentPoints, getSourcePixelIndexFromTargetPixelIndex } from 'Canvas/utils'
import { getPixelIndexFromPoint, getPointFromPixelIndex } from 'Canvas/utils'
import { createRGB, isColorSimilar, transformInitialColor } from 'Colors/utils'
import { SpecificColorTransforms } from 'Maposaic/types'

const SIMILAR_COLOR_TOLERANCE = 1

export class CanvasDataTransformer {
  sourcePixelArray: Uint8Array | Uint8ClampedArray
  targetPixelArray: Uint8ClampedArray
  sourceSize: Size
  targetSize: Size
  canvassRatio: number
  targetColors: MaposaicColors
  specificColorTransforms: SpecificColorTransforms
  hasAxialTransfo: boolean
  isBrightColor: boolean
  similarColorTolerance: number

  visited: boolean[]

  currentArea = {
    bounds: { min: 0, max: 0 },
    initialTargetPoint: { x: 0, y: 0 },
    initialColor: { r: 0, g: 0, b: 0, a: 0 },
    targetColor: { r: 0, g: 0, b: 0, a: 0 },
  }

  constructor({
    sourcePixelArray,
    targetPixelArray,
    sourceSize,
    targetSize,
    canvassRatio,
    targetColors,
    specificColorTransforms,
    hasAxialTransfo,
    isBrightColor,
    similarColorTolerance,
  }: {
    sourcePixelArray: Uint8Array | Uint8ClampedArray
    targetPixelArray: Uint8ClampedArray
    sourceSize: Size
    targetSize: Size
    canvassRatio: number
    targetColors: MaposaicColors
    specificColorTransforms: SpecificColorTransforms
    hasAxialTransfo?: boolean
    isBrightColor?: boolean
    similarColorTolerance?: number
  }) {
    this.sourcePixelArray = sourcePixelArray
    this.targetPixelArray = targetPixelArray
    this.sourceSize = sourceSize
    this.targetSize = targetSize
    this.canvassRatio = canvassRatio
    this.specificColorTransforms = specificColorTransforms
    this.targetColors = targetColors
    this.hasAxialTransfo = hasAxialTransfo ?? true
    this.isBrightColor = !!isBrightColor
    this.similarColorTolerance = similarColorTolerance ?? SIMILAR_COLOR_TOLERANCE

    const visitedSize = targetSize.h * targetSize.w
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.visited = new Array(visitedSize)
    for (let i = 0; i < visitedSize; ++i) {
      this.visited[i] = false
    }
  }

  paintTargetData() {
    for (let targetPixelIndex = 0; targetPixelIndex < this.visited.length; targetPixelIndex++) {
      if (this.visited[targetPixelIndex]) {
        continue
      }
      const sourcePixelIndex = getSourcePixelIndexFromTargetPixelIndex({
        targetPixelIndex,
        targetSize: this.targetSize,
        sourceSize: this.sourceSize,
        canvassRatio: this.canvassRatio,
        hasAxialTransfo: this.hasAxialTransfo,
      })

      this.currentArea.initialColor = createRGB(
        this.sourcePixelArray[sourcePixelIndex * 4],
        this.sourcePixelArray[sourcePixelIndex * 4 + 1],
        this.sourcePixelArray[sourcePixelIndex * 4 + 2],
        this.sourcePixelArray[sourcePixelIndex * 4 + 3],
      )
      this.currentArea.targetColor = transformInitialColor(
        this.currentArea.initialColor,
        this.targetColors,
        this.specificColorTransforms,
        this.isBrightColor,
      )
      this.currentArea.initialTargetPoint = getPointFromPixelIndex(targetPixelIndex, this.targetSize.w)
      this.currentArea.bounds = { min: sourcePixelIndex, max: sourcePixelIndex }

      this.paintCurrentArea()
    }
  }

  paintCurrentArea() {
    const { initialTargetPoint, initialColor, targetColor } = this.currentArea
    const toVisitPointStack: imagePoint[] = [initialTargetPoint]

    while (toVisitPointStack.length > 0) {
      const targetPoint = toVisitPointStack.pop()
      if (!targetPoint) {
        continue
      }
      const targetPixelIndex = getPixelIndexFromPoint(targetPoint, this.targetSize.w)

      if (this.visited[targetPixelIndex]) {
        continue
      }

      const sourcePixelIndex = getSourcePixelIndexFromTargetPixelIndex({
        targetPixelIndex,
        targetSize: this.targetSize,
        canvassRatio: this.canvassRatio,
        sourceSize: this.sourceSize,
        hasAxialTransfo: this.hasAxialTransfo,
      })

      const sourcePointColor = createRGB(
        this.sourcePixelArray[sourcePixelIndex * 4],
        this.sourcePixelArray[sourcePixelIndex * 4 + 1],
        this.sourcePixelArray[sourcePixelIndex * 4 + 2],
        this.sourcePixelArray[sourcePixelIndex * 4 + 3],
      )

      const adjacentTargetPoints = getAdjacentPoints({ point: targetPoint, canvasSize: this.targetSize })

      // anti-aliasing
      if (!isColorSimilar(sourcePointColor, initialColor, this.similarColorTolerance)) {
        const similarPointCount = Object.values(adjacentTargetPoints).filter((adjacentTargetPoint) => {
          if (!adjacentTargetPoint) {
            return false
          }
          const adjacentTargetIndex = getPixelIndexFromPoint(adjacentTargetPoint, this.targetSize.w)
          if (this.visited[adjacentTargetIndex]) {
            return false
          }
          const adjSourceIndex = getSourcePixelIndexFromTargetPixelIndex({
            targetPixelIndex: adjacentTargetIndex,
            targetSize: this.targetSize,
            canvassRatio: this.canvassRatio,
            sourceSize: this.sourceSize,
            hasAxialTransfo: this.hasAxialTransfo,
          })

          return isColorSimilar(
            createRGB(
              this.sourcePixelArray[adjSourceIndex * 4],
              this.sourcePixelArray[adjSourceIndex * 4 + 1],
              this.sourcePixelArray[adjSourceIndex * 4 + 2],
              this.sourcePixelArray[adjSourceIndex * 4 + 3],
            ),
            sourcePointColor,
            this.similarColorTolerance,
          )
        }).length

        if (similarPointCount < 2) {
          const colorRatio = initialColor.r ? sourcePointColor.r / initialColor.r : 1
          const antiAliasingColor = createRGB(
            targetColor.r * colorRatio,
            targetColor.g * colorRatio,
            targetColor.b * colorRatio,
            255,
          )

          this.paintTargetPixel({ color: antiAliasingColor, pixelIndex: targetPixelIndex })
        }
        continue
      }

      this.paintTargetPixel({ color: targetColor, pixelIndex: targetPixelIndex, alpha: sourcePointColor.a })

      Object.values(adjacentTargetPoints).forEach((adjacentPoint) => {
        if (!adjacentPoint) {
          return
        }
        const adjacentTargetIndex = getPixelIndexFromPoint(adjacentPoint, this.targetSize.w)
        if (!this.visited[adjacentTargetIndex]) {
          toVisitPointStack.push(adjacentPoint)
        }
      })
    }
  }

  paintTargetPixel = ({ color, pixelIndex, alpha }: { color: RGBColor; pixelIndex: number; alpha?: number }) => {
    this.visited[pixelIndex] = true

    this.targetPixelArray[pixelIndex * 4] = color.r
    this.targetPixelArray[pixelIndex * 4 + 1] = color.g
    this.targetPixelArray[pixelIndex * 4 + 2] = color.b
    this.targetPixelArray[pixelIndex * 4 + 3] = alpha ?? color.a

    if (pixelIndex < this.currentArea.bounds.min) {
      this.currentArea.bounds.min = pixelIndex
    }
    if (pixelIndex > this.currentArea.bounds.max) {
      this.currentArea.bounds.max = pixelIndex
    }
  }
}
