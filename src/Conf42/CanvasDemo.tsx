import React, { useState, useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Spin } from 'antd'
import spinner from 'assets/spinner.png'

import './style.less'

// eslint-disable-next-line
export const MAPBOX_TOKEN: string = process.env['REACT_APP_MAPBOX_TOKEN'] || ''
mapboxgl.accessToken = MAPBOX_TOKEN

export const MAPBOX_STYLE_URL = {
  road: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
  water: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
  administrative: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka',
  regular: 'mapbox://styles/mapbox/streets-v11',
}

const CanvasDemo = (): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const paintMosaic = async (newMap: mapboxgl.Map): Promise<void> => {
    setIsLoading(false)
    const mosaicCanvas = document.getElementById('mosaic-canvas') as HTMLCanvasElement

    const mosaicContext = mosaicCanvas.getContext('2d')
    if (!mosaicContext) {
      return
    }
    // mosaicCanvas.width = 500
    // mosaicCanvas.height = 1
    const mapboxCanvas = newMap.getCanvas()
    const mapboxContext = mapboxCanvas.getContext('webgl')
    if (!mapboxContext) {
      return
    }
    mosaicCanvas.width = mapboxContext.drawingBufferWidth
    mosaicCanvas.height = mapboxContext.drawingBufferHeight
    mosaicCanvas.style.width = Math.floor(mapboxContext.drawingBufferWidth / 2).toString() + 'px'
    mosaicCanvas.style.height = Math.floor(mapboxContext.drawingBufferHeight / 2).toString() + 'px'

    console.log('size', mosaicCanvas.width, mosaicCanvas.height)
    mosaicContext.fillStyle = 'green'
    mosaicContext.fillRect(0, 0, mosaicCanvas.width, mosaicCanvas.height)

    const mosaicImageData = mosaicContext.getImageData(0, 0, mosaicCanvas.width, mosaicCanvas.height)
    const mosaicData = mosaicImageData.data
    for (let i = 0; i < mosaicCanvas.width * mosaicCanvas.height; i++) {
      mosaicData[i * 4] = Math.random() * 255
      mosaicData[i * 4 + 1] = Math.random() * 255
      mosaicData[i * 4 + 2] = Math.random() * 255
    }

    mosaicContext.putImageData(mosaicImageData, 0, 0)
  }

  useEffect(() => {
    const newMap = new mapboxgl.Map({
      container: mapContainer.current ? mapContainer.current : '',
      style: MAPBOX_STYLE_URL.road,
      zoom: 12,
      center: new mapboxgl.LngLat(2.338272, 48.858796),
    })

    newMap.on('render', () => {
      if (!newMap.loaded() || newMap.isMoving() || newMap.isZooming()) {
        return
      }
      paintMosaic(newMap)
    })
    return () => {
      newMap.remove()
    }
  }, [])

  return (
    <div className="container">
      <div className="mapbox-container" id="mapbox-container" ref={(el) => (mapContainer.current = el)} />
      <div className="mosaic-container">
        <canvas className="mosaic-canvas" id="mosaic-canvas" />
        {isLoading && (
          <Spin
            className="mosaic-spinner"
            spinning={isLoading}
            indicator={<img className="spinner" src={spinner} alt="spin" />}
          />
        )}
      </div>
    </div>
  )
}

export default CanvasDemo
