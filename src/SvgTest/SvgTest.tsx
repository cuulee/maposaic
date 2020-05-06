import React, { useEffect, useState } from 'react'
import pixelArray from './pixelArray'

import {
  ImagePoint,
  Adjacent,
  BorderPoint,
  Corner,
  createRGB,
  getPointFromPixelIndex,
  MOVE_OFFSET,
  ADJACENT_PROCESSING_ORDER,
  ADJACENT_PROCESSING,
  getPixelIndexFromPoint,
  isColorSimilar,
  RGBColor,
  PointWithIndex,
  Path,
} from './svgUtils'

import './svgtest.less'

const canvasRatio = 1
const pixelArrayWidth = 10
const canvasWidth = canvasRatio * pixelArrayWidth

const getAdjacentPoint = ({
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

const getAdjacentFromBorder = ({
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

const fillToVisitAreaStackFromBorder = ({
  currentBorder,
  originColor,
  adjacentStartIndex,
  width,
  height,
  toVisitAreaStack,
  addedInToVisitInArea,
  visitedSet,
  toVisitBorderMap,
  data,
}: {
  currentBorder: BorderPoint
  originColor: RGBColor
  adjacentStartIndex: number
  width: number
  height: number
  toVisitAreaStack: PointWithIndex[]
  addedInToVisitInArea: Set<number>
  visitedSet: Set<number>
  data: Uint8ClampedArray
  toVisitBorderMap: Map<number, Corner>
}) => {
  for (let adjacentIndex = adjacentStartIndex; adjacentIndex < 3; adjacentIndex++) {
    const { adjacent, adjacentPoint, adjacentPixel } = getAdjacentFromBorder({
      border: currentBorder,
      index: adjacentIndex,
      width,
      height,
    })

    if (adjacentPixel === null || visitedSet.has(adjacentPixel)) {
      continue
    }

    if (isColorSimilar(originColor, createRGB(data[adjacentPixel], data[adjacentPixel + 1], data[adjacentPixel + 2]))) {
      if (!addedInToVisitInArea.has(adjacentPixel)) {
        toVisitAreaStack.push({ pixelIndex: adjacentPixel, point: adjacentPoint as ImagePoint })
        addedInToVisitInArea.add(adjacentPixel)
      }
      continue
    } else {
      toVisitBorderMap.set(adjacentPixel, adjacent.adjDeptCorner)
    }
  }
}

const getAreaBorderPath = ({
  origin,
  data,
  toVisitBorderMap,
  width,
  height,
  visitedSet,
}: {
  origin: BorderPoint
  data: Uint8ClampedArray
  toVisitBorderMap: Map<number, Corner>
  width: number
  height: number
  visitedSet: Set<number>
}) => {
  const addedInToVisitInArea = new Set<number>()
  const toVisitAreaStack: PointWithIndex[] = []

  const originColor = createRGB(data[origin.pixelIndex], data[origin.pixelIndex + 1], data[origin.pixelIndex + 2])

  const dx = origin.point.x + MOVE_OFFSET[origin.parentCorner].x
  const dy = origin.point.y + MOVE_OFFSET[origin.parentCorner].y
  let path = `M ${dx} ${dy}`

  let currentBorder = origin
  let iter = 0

  pathLoop: while (iter < width * height) {
    iter++
    visitedSet.add(currentBorder.pixelIndex)
    toVisitBorderMap.delete(currentBorder.pixelIndex)

    for (let adjacentIndex = 0; adjacentIndex < 4; adjacentIndex++) {
      const { adjacent, adjacentPoint, adjacentPixel } = getAdjacentFromBorder({
        border: currentBorder,
        index: adjacentIndex,
        width,
        height,
      })

      if (
        adjacentPixel !== null &&
        isColorSimilar(originColor, createRGB(data[adjacentPixel], data[adjacentPixel + 1], data[adjacentPixel + 2]))
      ) {
        fillToVisitAreaStackFromBorder({
          currentBorder,
          originColor,
          adjacentStartIndex: adjacentIndex + 1,
          width,
          height,
          toVisitAreaStack,
          addedInToVisitInArea,
          visitedSet,
          toVisitBorderMap,
          data,
        })

        currentBorder = {
          parentCorner: adjacent.adjDeptCorner,
          pixelIndex: adjacentPixel,
          point: adjacentPoint as ImagePoint,
        }

        break
      }

      path += ` ${adjacent.separation}`

      if (
        currentBorder.pixelIndex === origin.pixelIndex &&
        origin.parentCorner.slice(1, 3) === adjacent.arv.slice(1, 3)
      ) {
        if (origin.parentCorner !== adjacent.arv) {
          throw 'end anomalie'
        }
        break pathLoop
      }
      if (adjacentPixel && !visitedSet.has(adjacentPixel)) {
        toVisitBorderMap.set(adjacentPixel, adjacent.adjDeptCorner)
      }
      if (adjacentIndex === 3) {
        console.log(path)
        throw 'no adjacent found'
      }
    }
  }
  if (iter === height * width) {
    console.log(path)
    throw 'too many iterations'
  }

  while (toVisitAreaStack.length) {
    const toVisitPoint = toVisitAreaStack.pop()
    if (!toVisitPoint || visitedSet.has(toVisitPoint.pixelIndex)) {
      continue
    }
    visitedSet.add(toVisitPoint.pixelIndex)
    Object.values(Adjacent).forEach((adjacent) => {
      const adjacentPoint = getAdjacentPoint({ point: toVisitPoint.point, adjacent, width, height })
      const adjacentPixel = adjacentPoint ? getPixelIndexFromPoint(adjacentPoint, width) : null

      if (adjacentPixel === null || visitedSet.has(adjacentPixel)) {
        return
      }

      if (
        !isColorSimilar(originColor, createRGB(data[adjacentPixel], data[adjacentPixel + 1], data[adjacentPixel + 2]))
      ) {
        if (toVisitBorderMap.has(adjacentPixel)) {
          // throw `pixel id:${adjacentPixel} already in map`
        }
        toVisitBorderMap.set(adjacentPixel, Corner.NNO)
        return
      }
      if (!addedInToVisitInArea.has(adjacentPixel)) {
        toVisitAreaStack.push({ pixelIndex: adjacentPixel, point: getPointFromPixelIndex(adjacentPixel, width) })
        addedInToVisitInArea.add(adjacentPixel)
      }
    })
  }

  return path
}

const getCanvasPaths = ({ data, width, height }: { data: Uint8ClampedArray; width: number; height: number }) => {
  const toVisitBorderMap = new Map<number, Corner>()
  const visitedSet = new Set<number>()
  toVisitBorderMap.set(0, Corner.ONO)

  const paths = []
  let pathId = 0

  while (toVisitBorderMap.size > 0) {
    const originPixelIndex = toVisitBorderMap.keys().next().value
    const originParentCorner = toVisitBorderMap.get(originPixelIndex)

    if (!originParentCorner || visitedSet.has(originPixelIndex)) {
      toVisitBorderMap.delete(originPixelIndex)
      continue
    }

    const origin = {
      pixelIndex: originPixelIndex,
      parentCorner: originParentCorner,
      point: getPointFromPixelIndex(originPixelIndex, width),
    }

    const path = getAreaBorderPath({ data, width, height, origin, toVisitBorderMap, visitedSet })

    paths.push({
      d: path,
      id: pathId,
      color: `#${Math.floor(Math.random() * 256).toString(16)}${Math.floor(Math.random() * 256).toString(
        16,
      )}${Math.floor(Math.random() * 256).toString(16)}`,
    })
    pathId++
  }
  return paths
}

const SvgTest = () => {
  const [paths, setPaths] = useState<Path[]>([])
  useEffect(() => {
    const canvas = document.getElementById('cvs') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')
    canvas.setAttribute('width', canvasWidth.toString())
    canvas.setAttribute('height', canvasWidth.toString())
    // svgElement?.setAttribute('width', canvasWidth.toString())
    // svgElement?.setAttribute('height', canvasWidth.toString())
    const imageData = ctx?.getImageData(0, 0, canvasWidth, canvasWidth)
    if (!imageData) {
      console.log('pas de ctx')
      return
    }
    const data = imageData.data
    const pixelSeenSet = new Set()
    for (let index = 0; index < pixelArray.length; index++) {
      const x = index % pixelArrayWidth
      const y = Math.floor(index / pixelArrayWidth)
      const originCanvasPixel = y * canvasRatio * canvasWidth * 4 + x * canvasRatio * 4

      pixelSeenSet.add(originCanvasPixel)

      for (let dy = 0; dy < canvasRatio; dy++) {
        for (let dx = 0; dx < canvasRatio; dx++) {
          data[originCanvasPixel + dy * canvasWidth * 4 + 4 * dx] = pixelArray[index] === 1 ? 0 : 255
          data[originCanvasPixel + dy * canvasWidth * 4 + 4 * dx + 1] = pixelArray[index] === 1 ? 0 : 255
          data[originCanvasPixel + dy * canvasWidth * 4 + 4 * dx + 2] = pixelArray[index] === 1 ? 0 : 255
          data[originCanvasPixel + dy * canvasWidth * 4 + 4 * dx + 3] = 255
        }
      }
    }
    ctx?.putImageData(imageData, 0, 0)
    const paths = getCanvasPaths({ data, width: canvasWidth, height: canvasWidth })
    setPaths(paths)
    console.log('paths', paths)
  }, [])
  return (
    <div>
      <canvas id="cvs" className="cvs" />
      <svg id="svg" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="400">
        {/* <rect width="100%" height="100%" fill="white" stroke="blue" /> */}

        {paths.map((path) => {
          return <path d={path.d} key={path.id} fill={path.color} strokeWidth="0" stroke="blue" />
        })}
      </svg>
      <svg
        width="100"
        height="100"
        viewBox="0 0 20 20"
        version="1.1"
        baseProfile="full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100%" height="100%" fill="red" />
        <rect width="1" height="1" fill="black" />
        <path d="M 1 1 h 1 v -1 h 1 v 1 h -1 v 1 h -1  Z" fill="blue" strokeWidth="1" stroke="blue" />
      </svg>
    </div>
  )
}

export default SvgTest
