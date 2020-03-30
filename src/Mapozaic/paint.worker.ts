import { imagePoint, RGBColor } from './Mapozaic'

const WHITE_THRESHOLD = 50
const TOLERANCE = 3

const getPointFromPixelIndex = (pixelIndex: number, W: number): imagePoint => {
  return { x: (pixelIndex / 4) % W, y: Math.floor(pixelIndex / 4 / W) }
}
const getPixelIndexFromPoint = (point: imagePoint, W: number): number => {
  return (point.y * W + point.x) * 4
}
const getPixelIndexFromOppositePoint = (point: imagePoint, W: number, H: number): number => {
  return ((H - point.y - 1) * W + point.x) * 4
}

const isColorSimilar = (color1: RGBColor, color2: RGBColor): boolean => {
  return (
    Math.abs(color1.r - color2.r) < TOLERANCE &&
    Math.abs(color1.g - color2.g) < TOLERANCE &&
    Math.abs(color1.b - color2.b) < TOLERANCE
  )
}

const flipPixels = (data: Uint8ClampedArray, mapboxPixels: Uint8Array, W: number, H: number): void => {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      data[(y * W + x) * 4] = mapboxPixels[((H - y - 1) * W + x) * 4]
      data[(y * W + x) * 4 + 1] = mapboxPixels[((H - y - 1) * W + x) * 4 + 1]
      data[(y * W + x) * 4 + 2] = mapboxPixels[((H - y - 1) * W + x) * 4 + 2]
      data[(y * W + x) * 4 + 3] = mapboxPixels[((H - y - 1) * W + x) * 4 + 3]
    }
  }
}

const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

const paintAdjacentPointsInData = (
  mapozaicData: Uint8ClampedArray,
  mapboxPixels: Uint8Array,
  initialPoint: imagePoint,
  initialColor: RGBColor,
  targetColor: RGBColor,
  visitedPixelSet: Set<number>,
  W: number,
  H: number,
): void => {
  const toVisitPointStack: imagePoint[] = [initialPoint]

  while (toVisitPointStack.length > 0) {
    const point = toVisitPointStack.pop()
    if (!point) {
      continue
    }
    const pixelIndex = getPixelIndexFromPoint(point, W)
    if (visitedPixelSet.has(pixelIndex)) {
      continue
    }
    visitedPixelSet.add(pixelIndex)
    const oppositePixel = getPixelIndexFromOppositePoint(point, W, H)
    mapozaicData[oppositePixel] = targetColor.r
    mapozaicData[oppositePixel + 1] = targetColor.g
    mapozaicData[oppositePixel + 2] = targetColor.b
    mapozaicData[oppositePixel + 3] = 255

    const adjacentPoints = {
      S: point.y < W - 1 ? { x: point.x, y: point.y + 1 } : null,
      E: point.x < W - 1 ? { x: point.x + 1, y: point.y } : null,
      O: point.x > 0 ? { x: point.x - 1, y: point.y } : null,
      N: point.y > 0 ? { x: point.x, y: point.y - 1 } : null,
    }

    Object.values(adjacentPoints).forEach((adjacentPoint) => {
      if (
        !!adjacentPoint &&
        !visitedPixelSet.has(getPixelIndexFromPoint(adjacentPoint, W)) &&
        isColorSimilar(
          createRGB(
            mapboxPixels[getPixelIndexFromPoint(adjacentPoint, W)],
            mapboxPixels[getPixelIndexFromPoint(adjacentPoint, W) + 1],
            mapboxPixels[getPixelIndexFromPoint(adjacentPoint, W) + 2],
          ),
          initialColor,
        )
      ) {
        toVisitPointStack.push(adjacentPoint)
      }
    })
  }
}
// eslint-disable-next-line
onmessage = ({
  data: { mapboxPixels, mapozaicData, W, H },
}: {
  data: { mapboxPixels: Uint8Array; mapozaicData: Uint8ClampedArray; W: number; H: number }
}): void => {
  // flipPixels(mapozaicData, mapboxPixels, W, H)
  const visitedPixelSet = new Set<number>()
  for (let pixelIndex = 0; pixelIndex < mapboxPixels.length; pixelIndex += 4) {
    if (visitedPixelSet.has(pixelIndex)) {
      continue
    }

    const initialColor = createRGB(mapboxPixels[pixelIndex], mapboxPixels[pixelIndex + 1], mapboxPixels[pixelIndex + 2])
    const targetColor: RGBColor =
      mapboxPixels[pixelIndex] < WHITE_THRESHOLD
        ? createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
        : createRGB(255, 255, 255)

    const currentPoint = getPointFromPixelIndex(pixelIndex, W)
    paintAdjacentPointsInData(
      mapozaicData,
      mapboxPixels,
      currentPoint,
      initialColor,
      targetColor,
      visitedPixelSet,
      W,
      H,
    )
  }
  console.log('end data', mapozaicData)
  // eslint-disable-next-line
  // @ts-ignore
  postMessage(mapozaicData)
}
