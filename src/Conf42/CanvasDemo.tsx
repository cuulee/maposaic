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
      <div className="mapbox-canvas" id="mapbox-canvas" ref={(el) => (mapContainer.current = el)} />
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
