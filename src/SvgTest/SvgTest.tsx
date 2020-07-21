import React, { useEffect, useState } from 'react'

import { CanvasDataPath } from 'SvgTest/CanvasDataPath'
import pixelArray from 'SvgTest/pixelArray'

import { Path } from 'SvgTest/svgUtils'

import 'SvgTest/svgtest.less'

const canvasRatio = 1
const pixelArrayWidth = 10
const canvasWidth = canvasRatio * pixelArrayWidth

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
    const canvasPath = new CanvasDataPath(data, canvasWidth, canvasWidth)
    const paths = canvasPath.getCanvasPaths()
    setPaths(paths)
    // console.log('paths', paths)
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
