import { imagePoint, RGBColor } from './Mapozaic'
import { ColorName, AntColors } from './colors'

const getPointFromPixelIndex = (pixelIndex: number, webglWidth: number): imagePoint => {
  return { x: (pixelIndex / 4) % webglWidth, y: Math.floor(pixelIndex / 4 / webglWidth) }
}
const getMapboxPixelIndexFromPoint = (point: imagePoint, webglWidth: number): number => {
  return (point.y * webglWidth + point.x) * 4
}
const getMosaicPixelIndexFromPoint = (point: imagePoint, viewportWidth: number, viewportHeight: number): number => {
  return ((viewportHeight - point.y - 1) * viewportWidth + point.x) * 4
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

const getAdjacentPoints = ({
  point,
  viewportWidth,
  viewportHeight,
}: {
  point: imagePoint
  viewportWidth: number
  viewportHeight: number
}) => ({
  S: point.y < viewportHeight - 1 ? { x: point.x, y: point.y + 1 } : null,
  E: point.x < viewportWidth - 1 ? { x: point.x + 1, y: point.y } : null,
  O: point.x > 0 ? { x: point.x - 1, y: point.y } : null,
  N: point.y > 0 ? { x: point.x, y: point.y - 1 } : null,
  // NE: point.y > 0 && point.x < viewportWidth - 1 ? { x: point.x + 1, y: point.y - 1 } : null,
  // NO: point.y > 0 && point.x > 0 ? { x: point.x - 1, y: point.y - 1 } : null,
  // SE: point.y < viewportHeight - 1 && point.x < viewportWidth - 1 ? { x: point.x + 1, y: point.y + 1 } : null,
  // SO: point.y < viewportHeight - 1 && point.x > 0 ? { x: point.x - 1, y: point.y + 1 } : null,
})
const blues = [
  '#E6F7FF',
  '#BAE7FF',
  '#91D5FF',
  '#69C0FF',
  '#40A9FF',
  '#1890FF',
  '#096DD9',
  '#0050B3',
  '#003A8C',
  '#002766',
]
const hexToRgb = (hex: string) => {
  return createRGB(
    parseInt(hex.slice(1, 2), 16) * 16 + parseInt(hex.slice(2, 3), 16),
    parseInt(hex.slice(3, 4), 16) * 16 + parseInt(hex.slice(4, 5), 16),
    parseInt(hex.slice(5, 6), 16) * 16 + parseInt(hex.slice(6, 7), 16),
  )
}

const paintAdjacentPointsInData = ({
  maposaicData,
  mapboxPixels,
  initialPoint,
  initialColor,
  targetColor,
  visitedPixelSet,
  webglWidth,
  viewportHeight,
  viewportWidth,
  similarColorTolerance,
}: {
  maposaicData: Uint8ClampedArray
  mapboxPixels: Uint8Array
  initialPoint: imagePoint
  initialColor: RGBColor
  targetColor: RGBColor
  visitedPixelSet: Set<number>
  webglWidth: number
  webglHeight: number
  viewportHeight: number
  viewportWidth: number
  similarColorTolerance: number
}): void => {
  const toVisitPointStack: imagePoint[] = [initialPoint]

  while (toVisitPointStack.length > 0) {
    const point = toVisitPointStack.pop()
    if (!point) {
      continue
    }
    const pixelIndex = getMapboxPixelIndexFromPoint(point, webglWidth)
    if (visitedPixelSet.has(pixelIndex)) {
      continue
    }
    const paintPoint = (color: RGBColor) => {
      visitedPixelSet.add(pixelIndex)
      const mosaicPixel = getMosaicPixelIndexFromPoint(point, viewportWidth, viewportHeight)
      maposaicData[mosaicPixel] = color.r
      maposaicData[mosaicPixel + 1] = color.g
      maposaicData[mosaicPixel + 2] = color.b
      maposaicData[mosaicPixel + 3] = 255
    }

    const pointColor = createRGB(mapboxPixels[pixelIndex], mapboxPixels[pixelIndex + 1], mapboxPixels[pixelIndex + 2])

    const adjacentPoints = getAdjacentPoints({ point, viewportHeight, viewportWidth })
    if (!isColorSimilar(pointColor, initialColor, similarColorTolerance)) {
      const similarPointCount = Object.values(adjacentPoints).filter((adjacentPoint) => {
        return (
          !!adjacentPoint &&
          !visitedPixelSet.has(getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth)) &&
          isColorSimilar(
            createRGB(
              mapboxPixels[getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth)],
              mapboxPixels[getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth) + 1],
              mapboxPixels[getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth) + 2],
            ),
            pointColor,
            similarColorTolerance,
          )
        )
      }).length

      if (similarPointCount < 2) {
        const colorRatio = initialColor.r ? pointColor.r / initialColor.r : 1
        const antiAliasingColor = createRGB(
          targetColor.r * colorRatio,
          targetColor.g * colorRatio,
          targetColor.b * colorRatio,
        )
        paintPoint(antiAliasingColor)
      }
      continue
    }

    paintPoint(targetColor)

    Object.values(adjacentPoints).forEach((adjacentPoint) => {
      if (adjacentPoint && !visitedPixelSet.has(getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth))) {
        toVisitPointStack.push(adjacentPoint)
      }
    })
  }
}

const createColor = (colorName: ColorName) => {
  if (colorName === ColorName.Random) {
    return createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
  }
  return hexToRgb(AntColors[colorName][Math.floor(Math.random() * AntColors[colorName].length)])
}

// eslint-disable-next-line
onmessage = ({
  data: {
    mapboxPixels,
    maposaicData,
    webglWidth,
    webglHeight,
    viewportWidth,
    viewportHeight,
    maposaicColor,
    roadColorThreshold,
    similarColorTolerance,
  },
}: {
  data: {
    mapboxPixels: Uint8Array
    maposaicData: Uint8ClampedArray
    webglWidth: number
    webglHeight: number
    viewportWidth: number
    viewportHeight: number
    maposaicColor: ColorName
    roadColorThreshold: number
    similarColorTolerance: number
  }
}): void => {
  const visitedPixelSet = new Set<number>()

  let pixelIndex = 0

  for (let i = 0; i < viewportHeight; i += 1) {
    pixelIndex = i * webglWidth * 4

    for (let j = 0; j < viewportWidth; j += 1) {
      if (j > 0) {
        pixelIndex += 4
      }
      if (visitedPixelSet.has(pixelIndex)) {
        continue
      }

      const initialColor = createRGB(
        mapboxPixels[pixelIndex],
        mapboxPixels[pixelIndex + 1],
        mapboxPixels[pixelIndex + 2],
      )
      const targetColor: RGBColor =
        mapboxPixels[pixelIndex] < roadColorThreshold
          ? // ? createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
            createColor(maposaicColor)
          : createRGB(255, 255, 255)

      const initialPoint = getPointFromPixelIndex(pixelIndex, webglWidth)
      paintAdjacentPointsInData({
        maposaicData,
        mapboxPixels,
        initialPoint,
        initialColor,
        targetColor,
        visitedPixelSet,
        webglWidth,
        webglHeight,
        viewportHeight,
        viewportWidth,
        similarColorTolerance,
      })
    }
  }

  // eslint-disable-next-line
  // @ts-ignore
  postMessage(maposaicData)
}
