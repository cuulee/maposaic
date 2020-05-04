import React, { useEffect, useState } from 'react'
import pixelArray from './pixelArray'

import './svgtest.less'

const canvasRatio = 1
const pixelArrayWidth = 10
const canvasWidth = canvasRatio * pixelArrayWidth

type imagePoint = { x: number; y: number }
export type RGBColor = { r: number; g: number; b: number }

const getPointFromPixelIndex = (pixelIndex: number, width: number): imagePoint => {
  return { x: (pixelIndex / 4) % width, y: Math.floor(pixelIndex / 4 / width) }
}
const getPixelIndexFromPoint = (point: imagePoint, width: number): number => {
  return (point.y * width + point.x) * 4
}

enum Corner {
  ONO = 'ONO',
  NNO = 'NNO',
  NNE = 'NNE',
  ENE = 'ENE',
  SSO = 'SSO',
  OSO = 'OSO',
  SSE = 'SSE',
  ESE = 'ESE',
}

enum Adjacent {
  N = 'N',
  E = 'E',
  O = 'O',
  S = 'S',
}

enum Border {
  NOtoNE,
  NEtoNO,
  SOtoSE,
  SEtoSO,
  NEtoSE,
  SEtoNE,
  SOtoNO,
  NOtoSO,
}

enum Draw {
  Right = 'h 1',
  Left = 'h -1',
  Up = 'v -1',
  Down = 'v 1',
}

const ADJACENT_PROCESSING = {
  [Border.NOtoNE]: { adjacent: Adjacent.N, separation: Draw.Right, adjDeptCorner: Corner.SSO, arv: Corner.NNE },
  [Border.NEtoNO]: { adjacent: Adjacent.N, separation: Draw.Left, adjDeptCorner: Corner.SSE, arv: Corner.NNO },
  [Border.SOtoSE]: { adjacent: Adjacent.S, separation: Draw.Right, adjDeptCorner: Corner.NNO, arv: Corner.SSE },
  [Border.SEtoSO]: { adjacent: Adjacent.S, separation: Draw.Left, adjDeptCorner: Corner.NNE, arv: Corner.SSO },
  [Border.NEtoSE]: { adjacent: Adjacent.E, separation: Draw.Down, adjDeptCorner: Corner.ONO, arv: Corner.ESE },
  [Border.SEtoNE]: { adjacent: Adjacent.E, separation: Draw.Up, adjDeptCorner: Corner.OSO, arv: Corner.ESE },
  [Border.SOtoNO]: { adjacent: Adjacent.O, separation: Draw.Up, adjDeptCorner: Corner.ESE, arv: Corner.ONO },
  [Border.NOtoSO]: { adjacent: Adjacent.O, separation: Draw.Down, adjDeptCorner: Corner.ENE, arv: Corner.OSO },
}

const ADJACENT_PROCESSING_ORDER = {
  [Corner.ONO]: [Border.NOtoNE, Border.NEtoSE, Border.SEtoSO, Border.SOtoNO],
  [Corner.NNO]: [Border.NOtoSO, Border.SOtoSE, Border.SEtoNE, Border.NEtoNO],
  [Corner.OSO]: [Border.SOtoSE, Border.SEtoNE, Border.NEtoNO, Border.NOtoSO],
  [Corner.SSO]: [Border.SOtoNO, Border.NOtoNE, Border.NEtoSE, Border.SEtoSO],
  [Corner.NNE]: [Border.NEtoSE, Border.SEtoSO, Border.SOtoNO, Border.NOtoNE],
  [Corner.ENE]: [Border.NEtoNO, Border.NOtoSO, Border.SOtoSE, Border.SEtoNE],
  [Corner.SSE]: [Border.SEtoNE, Border.NEtoNO, Border.NOtoSO, Border.SOtoSE],
  [Corner.ESE]: [Border.SEtoSO, Border.SOtoNO, Border.NOtoNE, Border.NEtoSE],
}

const MOVE_OFFSET = {
  [Corner.ONO]: { x: 0, y: 0 },
  [Corner.NNO]: { x: 0, y: 0 },
  [Corner.OSO]: { x: 0, y: 1 },
  [Corner.SSO]: { x: 0, y: 1 },
  [Corner.NNE]: { x: 1, y: 0 },
  [Corner.ENE]: { x: 1, y: 0 },
  [Corner.SSE]: { x: 1, y: 1 },
  [Corner.ESE]: { x: 1, y: 1 },
}

type borderPoint = {
  parentCorner: Corner
  pixelIndex: number
}

const isColorSimilar = (color1: RGBColor, color2: RGBColor, similarColorTolerance?: number): boolean => {
  return (
    Math.abs(color1.r - color2.r) < (similarColorTolerance || 1) &&
    Math.abs(color1.g - color2.g) < (similarColorTolerance || 1) &&
    Math.abs(color1.b - color2.b) < (similarColorTolerance || 1)
  )
}

const createRGB = (r: number, g: number, b: number): RGBColor => {
  return { r, g, b }
}

const getAdjacentPoint = ({
  point,
  adjacent,
  width,
  height,
}: {
  point: imagePoint
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

const getAreaBorderPath = ({
  origin,
  data,
  toVisitBorderMap,
  width,
  height,
  visitedBorderSet,
}: {
  origin: borderPoint
  data: Uint8ClampedArray
  toVisitBorderMap: Map<number, Corner>
  width: number
  height: number
  visitedBorderSet: Set<number>
}) => {
  const originColor = createRGB(data[origin.pixelIndex], data[origin.pixelIndex + 1], data[origin.pixelIndex + 2])
  const originPoint = getPointFromPixelIndex(origin.pixelIndex, width)

  const dx = originPoint.x + MOVE_OFFSET[origin.parentCorner].x
  const dy = originPoint.y + MOVE_OFFSET[origin.parentCorner].y
  let path = `M ${dx} ${dy}`
  let currentBorder = origin
  let iter = 0

  while (iter < width * height) {
    iter++
    const currentBorderPoint = getPointFromPixelIndex(currentBorder.pixelIndex, width)
    visitedBorderSet.add(currentBorder.pixelIndex)
    toVisitBorderMap.delete(currentBorder.pixelIndex)

    for (let adjacentIndex = 0; adjacentIndex < 4; adjacentIndex++) {
      const borderName = ADJACENT_PROCESSING_ORDER[currentBorder.parentCorner][adjacentIndex]
      const borderCandidate = ADJACENT_PROCESSING[borderName]
      const borderCandidatePoint = getAdjacentPoint({
        point: currentBorderPoint,
        adjacent: borderCandidate.adjacent,
        width,
        height,
      })

      const borderCandidatePixel = borderCandidatePoint ? getPixelIndexFromPoint(borderCandidatePoint, width) : null

      if (
        borderCandidatePixel !== null &&
        isColorSimilar(
          originColor,
          createRGB(data[borderCandidatePixel], data[borderCandidatePixel + 1], data[borderCandidatePixel + 2]),
        )
      ) {
        currentBorder = {
          parentCorner: borderCandidate.adjDeptCorner,
          pixelIndex: borderCandidatePixel,
        }
        break
      }

      path += ` ${borderCandidate.separation}`

      if (
        currentBorder.pixelIndex === origin.pixelIndex &&
        origin.parentCorner.slice(1, 3) === borderCandidate.arv.slice(1, 3)
      ) {
        if (origin.parentCorner !== borderCandidate.arv) {
          throw 'end anomalie'
        }
        return path
      }
      if (borderCandidatePixel && !visitedBorderSet.has(borderCandidatePixel)) {
        toVisitBorderMap.set(borderCandidatePixel, borderCandidate.adjDeptCorner)
      }
      if (adjacentIndex === 3) {
        throw 'no adjacent found'
      }
    }
  }
  if (iter === height * width) {
    console.log(path)
    throw 'too many iterations'
  }
  console.log('iter', iter, height * width)
  return path
}

type Path = {
  d: string
  id: number
  color: string
}

const getCanvasPaths = ({ data, width, height }: { data: Uint8ClampedArray; width: number; height: number }) => {
  const toVisitBorderMap = new Map<number, Corner>()
  const visitedBorderSet = new Set<number>()
  toVisitBorderMap.set(0, Corner.ONO)
  const paths = []
  let pathId = 0
  while (toVisitBorderMap.size > 0) {
    const originPixelIndex = toVisitBorderMap.keys().next().value
    const originParentCorner = toVisitBorderMap.get(originPixelIndex)
    if (!originParentCorner || visitedBorderSet.has(originPixelIndex)) {
      toVisitBorderMap.delete(originPixelIndex)
      continue
    }
    const origin = { pixelIndex: originPixelIndex, parentCorner: originParentCorner }
    const path = getAreaBorderPath({ data, width, height, origin, toVisitBorderMap, visitedBorderSet })
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
