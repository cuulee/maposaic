import { Size } from 'Canvas/types'

export const toggleCanvasOpacity = (isMapbox: boolean): void => {
  const mapboxElement = document.getElementById('mapbox-wrapper')
  const mosaicCanvas = document.getElementById('maposaic-canvas')
  if (!mapboxElement || !mosaicCanvas) {
    return
  }
  mapboxElement.style.opacity = isMapbox ? '1' : '0'
  mosaicCanvas.style.opacity = isMapbox ? '0' : '1'
}

export const setMapboxArtificialSize = (sizeFactor: number) => {
  const mapboxWrapper = document.getElementById('mapbox-wrapper')
  if (!mapboxWrapper) {
    return
  }
  mapboxWrapper.style.width = (mapboxWrapper.offsetWidth * sizeFactor).toString() + 'px'
  mapboxWrapper.style.height = (mapboxWrapper.offsetHeight * sizeFactor).toString() + 'px'
}

export const setMapboxDisplaySize = () => {
  const mapboxCanvas = document.getElementsByClassName('mapboxgl-canvas')[0] as HTMLElement
  const mapboxWrapper = document.getElementById('mapbox-wrapper')
  if (!mapboxCanvas || !mapboxWrapper) {
    return
  }
  mapboxCanvas.style.width = '100%'
  mapboxCanvas.style.height = '100%'
  mapboxWrapper.style.width = '100%'
  mapboxWrapper.style.height = '100%'
}

export const resizeMapsContainer = (size: Size) => {
  const container = document.getElementById('maps-container')
  const mapboxWrapper = document.getElementById('mapbox-wrapper')
  const mosaicCanvas = document.getElementById('maposaic-canvas')
  if (!container || !mapboxWrapper || !mosaicCanvas) {
    return
  }
  container.style.width = size.w.toString() + 'px'
  container.style.height = size.h.toString() + 'px'
  mapboxWrapper.style.width = size.w.toString() + 'px'
  mapboxWrapper.style.height = size.h.toString() + 'px'
  mosaicCanvas.style.width = size.w.toString() + 'px'
  mosaicCanvas.style.height = size.h.toString() + 'px'
}

export const isMobile = () => {
  const rootWrapper = document.getElementById('root-wrapper')
  if (!rootWrapper) {
    return true
  }
  console.log('ismobil', rootWrapper.offsetWidth)
  return rootWrapper.offsetWidth < 800
}
