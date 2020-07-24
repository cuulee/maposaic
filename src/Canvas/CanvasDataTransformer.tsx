import { Size, imagePoint, RGBColor } from 'Canvas/types'
import { MaposaicColors } from 'Mapozaic/colors'
import { getSourcePixelIndexFromTargetPixelIndex, createColor, getAdjacentPoints, isColorSimilar } from 'Canvas/utils'
import { createRGB, getPointFromPixelIndex, getPixelIndexFromPoint } from 'Canvas/utils'

const MAX_SET_SIZE = 16777216
const SIMILAR_COLOR_TOLERANCE = 1
const ROAD_COLOR_THRESHOLD = 50

export class CanvasDataTransformer {
  sourcePixelArray: Uint8Array
  targetPixelArray: Uint8ClampedArray
  sourceSize: Size
  targetSize: Size
  canvassRatio: number
  maposaicColors: MaposaicColors

  visitedPixelSets: Set<number>[] = []

  currentArea = {
    bounds: { min: 0, max: 0 },
    initialTargetPoint: { x: 0, y: 0 },
    initialColor: { r: 0, g: 0, b: 0 },
    targetColor: { r: 0, g: 0, b: 0 },
  }

  constructor(
    sourcePixelArray: Uint8Array,
    targetPixelArray: Uint8ClampedArray,
    sourceSize: Size,
    targetSize: Size,
    canvassRatio: number,
    maposaicColors: MaposaicColors,
  ) {
    this.sourcePixelArray = sourcePixelArray
    this.targetPixelArray = targetPixelArray
    this.sourceSize = sourceSize
    this.targetSize = targetSize
    this.canvassRatio = canvassRatio
    this.maposaicColors = maposaicColors

    const numberOfSets = Math.floor((targetSize.h * targetSize.w) / MAX_SET_SIZE) + 1
    for (let index = 0; index < numberOfSets; index++) {
      this.visitedPixelSets.push(new Set<number>()) // because Set size cannot exceed 2^24
    }
  }

  paintTargetData() {
    let targetPixelIndex = 0

    for (let i = 0; i < this.targetSize.h; i += 1) {
      for (let j = 0; j < this.targetSize.w; j += 1) {
        targetPixelIndex = i * this.targetSize.w + j

        if (this.visitedPixelSets[Math.floor(targetPixelIndex / MAX_SET_SIZE)].has(targetPixelIndex)) {
          continue
        }
        const sourcePixelIndex = getSourcePixelIndexFromTargetPixelIndex({
          targetPixelIndex,
          targetSize: this.targetSize,
          sourceSize: this.sourceSize,
          canvassRatio: this.canvassRatio,
        })

        this.currentArea.initialColor = createRGB(
          this.sourcePixelArray[sourcePixelIndex * 4],
          this.sourcePixelArray[sourcePixelIndex * 4 + 1],
          this.sourcePixelArray[sourcePixelIndex * 4 + 2],
        )
        this.currentArea.targetColor =
          this.currentArea.initialColor.r < ROAD_COLOR_THRESHOLD
            ? createColor(this.maposaicColors)
            : createRGB(255, 255, 255)
        this.currentArea.initialTargetPoint = getPointFromPixelIndex(targetPixelIndex, this.targetSize.w)
        this.currentArea.bounds = { min: sourcePixelIndex, max: sourcePixelIndex }

        this.paintCurrentArea()

        //   if (Math.random() > 0.8) {
        //     postMessage({
        //       pixels: targetPixelArray.slice(paintedBounds.min, paintedBounds.max + 1),
        //       paintedBoundsMin: paintedBounds.min,
        //     })
        //   }
      }
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

      if (this.visitedPixelSets[Math.floor(targetPixelIndex / MAX_SET_SIZE)].has(targetPixelIndex)) {
        continue
      }

      const sourcePixelIndex = getSourcePixelIndexFromTargetPixelIndex({
        targetPixelIndex,
        targetSize: this.targetSize,
        canvassRatio: this.canvassRatio,
        sourceSize: this.sourceSize,
      })

      const targetPointColor = createRGB(
        this.sourcePixelArray[sourcePixelIndex * 4],
        this.sourcePixelArray[sourcePixelIndex * 4 + 1],
        this.sourcePixelArray[sourcePixelIndex * 4 + 2],
      )

      const adjacentTargetPoints = getAdjacentPoints({ point: targetPoint, canvasSize: this.targetSize })

      // anti-aliasing
      if (!isColorSimilar(targetPointColor, initialColor, SIMILAR_COLOR_TOLERANCE)) {
        const similarPointCount = Object.values(adjacentTargetPoints).filter((adjacentTargetPoint) => {
          if (!adjacentTargetPoint) {
            return false
          }
          const adjacentTargetIndex = getPixelIndexFromPoint(adjacentTargetPoint, this.targetSize.w)
          if (this.visitedPixelSets[Math.floor(adjacentTargetIndex / MAX_SET_SIZE)].has(adjacentTargetIndex)) {
            return false
          }
          const adjSourceIndex = getSourcePixelIndexFromTargetPixelIndex({
            targetPixelIndex: adjacentTargetIndex,
            targetSize: this.targetSize,
            canvassRatio: this.canvassRatio,
            sourceSize: this.sourceSize,
          })

          return isColorSimilar(
            createRGB(
              this.sourcePixelArray[adjSourceIndex * 4],
              this.sourcePixelArray[adjSourceIndex * 4 + 1],
              this.sourcePixelArray[adjSourceIndex * 4 + 2],
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

          this.paintTargetPixel({ color: antiAliasingColor, pixelIndex: targetPixelIndex })
        }
        continue
      }

      this.paintTargetPixel({ color: targetColor, pixelIndex: targetPixelIndex })

      Object.values(adjacentTargetPoints).forEach((adjacentPoint) => {
        if (!adjacentPoint) {
          return
        }
        const adjacentTargetIndex = getPixelIndexFromPoint(adjacentPoint, this.targetSize.w)
        if (!this.visitedPixelSets[Math.floor(adjacentTargetIndex / MAX_SET_SIZE)].has(adjacentTargetIndex)) {
          toVisitPointStack.push(adjacentPoint)
        }
      })
    }
  }

  paintTargetPixel = ({ color, pixelIndex }: { color: RGBColor; pixelIndex: number }) => {
    this.visitedPixelSets[Math.floor(pixelIndex / MAX_SET_SIZE)].add(pixelIndex)

    this.targetPixelArray[pixelIndex * 4] = color.r
    this.targetPixelArray[pixelIndex * 4 + 1] = color.g
    this.targetPixelArray[pixelIndex * 4 + 2] = color.b
    this.targetPixelArray[pixelIndex * 4 + 3] = 255

    if (pixelIndex < this.currentArea.bounds.min) {
      this.currentArea.bounds.min = pixelIndex
    }
    if (pixelIndex > this.currentArea.bounds.max) {
      this.currentArea.bounds.max = pixelIndex
    }
  }
}