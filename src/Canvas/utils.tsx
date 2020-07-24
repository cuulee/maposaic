import { imagePoint, Size } from 'Canvas/types'

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

export const getTargetSizeFromSourceSize = (sourceSize: Size, canvassRatio: number) => {
  return {
    w: Math.ceil(sourceSize.w / canvassRatio),
    h: Math.ceil(sourceSize.h / canvassRatio),
  }
}
