import React, { useState, useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Spin } from 'antd'
import spinner from 'assets/spinner.png'

import './style.less'
import { getRandomNumberBetween, MAPBOX_TOKEN } from 'Conf42/utils'

mapboxgl.accessToken = MAPBOX_TOKEN

export const MAPBOX_STYLE_URL = {
  road: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
  water: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
  administrative: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka',
  regular: 'mapbox://styles/mapbox/streets-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
}

const CanvasDemo = (): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const onRender = async (): Promise<void> => {
      console.log('render')
      setIsLoading(true)

      setIsLoading(false)
    }
    const map = new mapboxgl.Map({
      container: mapContainer.current ? mapContainer.current : '',
      style: MAPBOX_STYLE_URL.satellite,
      zoom: getRandomNumberBetween(0, 20),
      center: new mapboxgl.LngLat(getRandomNumberBetween(-1, 14), getRandomNumberBetween(40, 50)),
    })

    map.on('render', () => {
      if (!map.loaded() || map.isMoving() || map.isZooming()) {
        return
      }
      onRender()
    })
    return () => {
      map.remove()
    }
  }, [])

  return (
    <div className="container">
      <div className="mapbox-container" id="mapbox-container" ref={(el) => (mapContainer.current = el)} />
      <div className="mosaic-container">
        <canvas id="mosaic-canvas" />
      </div>
      {isLoading && (
        <Spin
          className="mosaic-spinner"
          spinning={isLoading}
          indicator={<img className="spinner" src={spinner} alt="spin" />}
        />
      )}
    </div>
  )
}

export default CanvasDemo
