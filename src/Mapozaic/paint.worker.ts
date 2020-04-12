import { imagePoint, RGBColor } from './Mapozaic'

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
    visitedPixelSet.add(pixelIndex)
    const mosaicPixel = getMosaicPixelIndexFromPoint(point, viewportWidth, viewportHeight)
    maposaicData[mosaicPixel] = targetColor.r
    maposaicData[mosaicPixel + 1] = targetColor.g
    maposaicData[mosaicPixel + 2] = targetColor.b
    maposaicData[mosaicPixel + 3] = 255

    const adjacentPoints = {
      S: point.y < viewportHeight - 1 ? { x: point.x, y: point.y + 1 } : null,
      E: point.x < viewportWidth - 1 ? { x: point.x + 1, y: point.y } : null,
      O: point.x > 0 ? { x: point.x - 1, y: point.y } : null,
      N: point.y > 0 ? { x: point.x, y: point.y - 1 } : null,
    }

    Object.values(adjacentPoints).forEach((adjacentPoint) => {
      if (
        !!adjacentPoint &&
        !visitedPixelSet.has(getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth)) &&
        isColorSimilar(
          createRGB(
            mapboxPixels[getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth)],
            mapboxPixels[getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth) + 1],
            mapboxPixels[getMapboxPixelIndexFromPoint(adjacentPoint, webglWidth) + 2],
          ),
          initialColor,
          similarColorTolerance,
        )
      ) {
        toVisitPointStack.push(adjacentPoint)
      }
    })
  }
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
          ? createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
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
