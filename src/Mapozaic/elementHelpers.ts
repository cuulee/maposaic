import { Size } from 'Canvas/types'

type SetDisplaySize = (size: Size) => void

export const toggleCanvasOpacity = (isMapbox: boolean): void => {
  const mapboxElement = document.getElementById('mapbox-wrapper')
  const mosaicCanvas = document.getElementById('maposaic-canvas')
  if (!mapboxElement || !mosaicCanvas) {
    return
  }
  mapboxElement.style.opacity = isMapbox ? '1' : '0'
  mosaicCanvas.style.opacity = isMapbox ? '0' : '1'
}

export const setMapboxArtificialSize = (sizeFactor: number, setDisplaySize: SetDisplaySize) => {
  const mapboxWrapper = document.getElementById('mapbox-wrapper')
  if (!mapboxWrapper) {
    return
  }
  setDisplaySize({ w: mapboxWrapper.offsetWidth, h: mapboxWrapper.offsetHeight }) // remember previous value
  mapboxWrapper.style.width = (mapboxWrapper.offsetWidth * sizeFactor).toString() + 'px'
  mapboxWrapper.style.height = (mapboxWrapper.offsetHeight * sizeFactor).toString() + 'px'
}

export const setMapboxDisplaySize = (displaySize: Size) => {
  const mapboxCanvas = document.getElementsByClassName('mapboxgl-canvas')[0] as HTMLElement
  const mapboxWrapper = document.getElementById('mapbox-wrapper')
  if (!mapboxCanvas || !mapboxWrapper) {
    return
  }
  mapboxCanvas.style.width = displaySize.w.toString() + 'px'
  mapboxCanvas.style.height = displaySize.h.toString() + 'px'
  mapboxWrapper.style.width = displaySize.w.toString() + 'px'
  mapboxWrapper.style.height = displaySize.h.toString() + 'px'
}

export const resizeMapsContainer = (size: Size, setDisplaySize: SetDisplaySize) => {
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
  setDisplaySize({ w: size.w, h: size.h })
}
