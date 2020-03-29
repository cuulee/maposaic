import { imagePoint, RGBColor } from './Mapozaic'

const THRESHOLD = 50
const TOLERANCE = 5

const getPointFromPixelIndex = (pixelIndex: number, W: number): imagePoint => {
  return { x: (pixelIndex / 4) % W, y: Math.floor(pixelIndex / 4 / W) }
}
const getPixelIndexFromPoint = (point: imagePoint, W: number): number => {
  return (point.y * W + point.x) * 4
}

const isColorSimilar = (color1: RGBColor, color2: RGBColor): boolean => {
  return (
    Math.abs(color1.r - color2.r) < TOLERANCE &&
    Math.abs(color1.g - color2.g) < TOLERANCE &&
    Math.abs(color1.b - color2.b) < TOLERANCE
  )
}

const flipPixels = (
  data: Uint8ClampedArray,
  mapboxPixels: Uint8Array,
  W: number,
  H: number,
  colors: Record<string, number>,
): void => {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      data[(y * W + x) * 4] = mapboxPixels[((H - y - 1) * W + x) * 4]
      data[(y * W + x) * 4 + 1] = mapboxPixels[((H - y - 1) * W + x) * 4 + 1]
      data[(y * W + x) * 4 + 2] = mapboxPixels[((H - y - 1) * W + x) * 4 + 2]
      data[(y * W + x) * 4 + 3] = mapboxPixels[((H - y - 1) * W + x) * 4 + 3]
      const color = `${data[(y * W + x) * 4]},${data[(y * W + x) * 4 + 1]},${data[(y * W + x) * 4 + 2]}`
      if (colors[color]) {
        colors[color] = colors[color] + 1
      } else {
        colors[color] = 1
      }
    }
  }
}

const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

const paintAdjacentPointsInData = (
  data: Uint8ClampedArray,
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
      break
    }
    const pixelIndex = getPixelIndexFromPoint(point, W)
    if (visitedPixelSet.has(pixelIndex)) {
      break
    }

    visitedPixelSet.add(pixelIndex)
    data[pixelIndex] = targetColor.r
    data[pixelIndex + 1] = targetColor.g
    data[pixelIndex + 2] = targetColor.b

    const adjacentPoints = {
      NO: point.x > 0 && point.y > 0 ? { x: point.x - 1, y: point.y - 1 } : null,
      N: point.y > 0 ? { x: point.x, y: point.y - 1 } : null,
      NE: point.x < W - 1 && point.y > 0 ? { x: point.x + 1, y: point.y - 1 } : null,
      O: point.x > 0 ? { x: point.x - 1, y: point.y } : null,
      E: point.x < W - 1 ? { x: point.x + 1, y: point.y } : null,
      SO: point.x > 0 && point.y < H - 1 ? { x: point.x - 1, y: point.y + 1 } : null,
      S: point.y < W - 1 ? { x: point.x, y: point.y + 1 } : null,
      SE: point.x < W - 1 && point.y < H - 1 ? { x: point.x + 1, y: point.y + 1 } : null,
    }

    Object.values(adjacentPoints).forEach((adjacentPoint) => {
      if (
        !adjacentPoint ||
        !isColorSimilar(
          createRGB(
            data[getPixelIndexFromPoint(adjacentPoint, W)],
            data[getPixelIndexFromPoint(adjacentPoint, W) + 1],
            data[getPixelIndexFromPoint(adjacentPoint, W) + 2],
          ),
          initialColor,
        )
      ) {
        return
      }
      toVisitPointStack.push(adjacentPoint)
    })
  }
}
// eslint-disable-next-line
onmessage = ({
  data: { mapboxPixels, mapozaicData, W, H },
}: {
  data: { mapboxPixels: Uint8Array; mapozaicData: Uint8ClampedArray; W: number; H: number }
}): void => {
  const colors = {}
  flipPixels(mapozaicData, mapboxPixels, W, H, colors)
  const visitedPixelSet = new Set<number>()

  for (let pixelIndex = 0; pixelIndex < mapozaicData.length; pixelIndex += 4) {
    if (visitedPixelSet.has(pixelIndex)) {
      continue
    }

    const initialColor = createRGB(mapozaicData[pixelIndex], mapozaicData[pixelIndex + 1], mapozaicData[pixelIndex + 2])
    const targetColor: RGBColor =
      mapozaicData[pixelIndex] < THRESHOLD
        ? createRGB(Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256))
        : createRGB(255, 255, 255)

    const currentPoint = getPointFromPixelIndex(pixelIndex, W)
    paintAdjacentPointsInData(mapozaicData, currentPoint, initialColor, targetColor, visitedPixelSet, W, H)
  }

  // eslint-disable-next-line
  // @ts-ignore
  postMessage(mapozaicData)
}
