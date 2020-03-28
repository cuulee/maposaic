import React, { useState, useRef, useEffect, MutableRefObject } from 'react'
import mapboxgl from 'mapbox-gl'

import './style.css'

const token: string = process.env['REACT_APP_MAPBOX_TOKEN'] || ''

const styles = {
  width: '100vw',
  height: 'calc(100vh)',
  position: 'absolute',
} as React.CSSProperties

const flipPixels = (
  data: Uint8ClampedArray,
  pixels: Uint8Array,
  W: number,
  H: number,
  colors: Record<string, number>,
): void => {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      data[(y * W + x) * 4] = pixels[((H - y - 1) * W + x) * 4]
      data[(y * W + x) * 4 + 1] = pixels[((H - y - 1) * W + x) * 4 + 1]
      data[(y * W + x) * 4 + 2] = pixels[((H - y - 1) * W + x) * 4 + 2]
      data[(y * W + x) * 4 + 3] = pixels[((H - y - 1) * W + x) * 4 + 3]
      const color = `${data[(y * W + x) * 4]},${data[(y * W + x) * 4 + 1]},${data[(y * W + x) * 4 + 2]}`
      if (colors[color]) {
        colors[color] = colors[color] + 1
      } else {
        colors[color] = 1
      }
    }
  }
}

const THRESHOLD = 50
const TOLERANCE = 5

type RGBColor = { r: number; g: number; b: number }
type imagePoint = { x: number; y: number }

const getPixelIndexFromPoint = (point: imagePoint, W: number): number => {
  return (point.y * W + point.x) * 4
}

const getPointFromPixelIndex = (pixelIndex: number, W: number): imagePoint => {
  return { x: (pixelIndex / 4) % W, y: Math.floor(pixelIndex / 4 / W) }
}

const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

const isColorSimilar = (color1: RGBColor, color2: RGBColor): boolean => {
  return (
    Math.abs(color1.r - color2.r) < TOLERANCE &&
    Math.abs(color1.g - color2.g) < TOLERANCE &&
    Math.abs(color1.b - color2.b) < TOLERANCE
  )
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
const paint = (data: Uint8ClampedArray, point: imagePoint, W: number) => {
  const pixelIndex = getPixelIndexFromPoint(point, W)
  data[pixelIndex] = 255
  data[pixelIndex + 1] = 0
  data[pixelIndex + 2] = 0
}

const MapboxGLMap = (): JSX.Element => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    mapboxgl.accessToken = token
    const initializeMap = (mapContainer: MutableRefObject<HTMLDivElement | null>): void => {
      const map = new mapboxgl.Map({
        container: mapContainer.current ? mapContainer.current : '',
        style: 'mapbox://styles/cartapuce/ck831v1pi187r1inxwf7np531', // stylesheet location
        // style: 'mapbox://styles/mapbox/streets-v11',
        zoom: 5,
        center: {
          lng: 2.3,
          lat: 48,
        },
      })

      map.on('load', () => {
        setMap(map)
        map.resize()
        const canvas = map.getCanvas()
        const gl = canvas.getContext('webgl')
        if (!gl) {
          console.log('pas de gl')
          return
        }
        console.log('size', gl.drawingBufferWidth, gl.drawingBufferHeight)
        const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4)
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        console.log('pixels', pixels)

        const cvs = document.getElementById('cvs') as HTMLCanvasElement
        if (!cvs) {
          console.log('coucou')
          return
        }
        const W = gl.drawingBufferWidth
        const H = gl.drawingBufferHeight
        cvs.setAttribute('width', W.toString())
        cvs.setAttribute('height', H.toString())
        const ctx = cvs.getContext('2d')
        if (!ctx) {
          return
        }
        const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height)
        const data = imageData.data
        console.log('length', data.length, pixels.length)

        const colors = {}
        flipPixels(data, pixels, W, H, colors)
        console.log('colors', colors)
        const visitedPixelSet = new Set<number>()

        for (let pixelIndex = 0; pixelIndex < data.length; pixelIndex += 4) {
          if (visitedPixelSet.has(pixelIndex)) {
            continue
          }

          const initialColor = createRGB(data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2])
          const targetColor: RGBColor =
            data[pixelIndex] < THRESHOLD
              ? createRGB(
                  Math.floor(Math.random() * 256),
                  Math.floor(Math.random() * 256),
                  Math.floor(Math.random() * 256),
                )
              : createRGB(255, 255, 255)

          const currentPoint = getPointFromPixelIndex(pixelIndex, W)
          if (currentPoint.x < 100 || currentPoint.y < 100) paint(data, currentPoint, W)
          paintAdjacentPointsInData(data, currentPoint, initialColor, targetColor, visitedPixelSet, W, H)
        }
        console.log('visited', visitedPixelSet.size)
        // ctx.translate(W, 0)
        // ctx.scale(10, -1)
        ctx.putImageData(imageData, 0, 0)
      })
    }

    if (!map && mapContainer) initializeMap(mapContainer)
  }, [map])

  return (
    <div>
      <div ref={(el) => (mapContainer.current = el)} style={styles} />
      <canvas className="mozaic" width="300" height="300" id="cvs" />
    </div>
  )
}

export default MapboxGLMap
