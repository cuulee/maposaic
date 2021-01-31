import { Size } from 'Canvas/types'
import { CM_PER_INCH, FORMAT_RATIO } from 'constants/dimensions'
import { OnPosterSizeChangePayload } from 'Maposaic/types'

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

export const getPosterTargetSize = ({
  isLandscape,
  longerPropertyCMLength,
  pixelPerInchResolution,
  mapboxResolutionRatio,
}: OnPosterSizeChangePayload & { mapboxResolutionRatio: number | null }) => {
  const mapsWrapper = document.getElementById('maps-wrapper')
  if (!mapsWrapper) {
    return { targetSize: null, newSizeFactor: 1 }
  }
  if (null === isLandscape) {
    return { targetSize: { w: mapsWrapper.offsetWidth, h: mapsWrapper.offsetHeight }, newSizeFactor: 1 }
  }

  const padding = mapsWrapper.offsetWidth > 800 ? 64 : 16
  const mapsContainerSize = { w: mapsWrapper.offsetWidth - padding * 2, h: mapsWrapper.offsetHeight - padding * 2 }

  const longerProperty = isLandscape ? 'w' : 'h'
  const smallerProperty = longerProperty === 'h' ? 'w' : 'h'

  const targetSize = {
    [smallerProperty]: Math.floor(mapsContainerSize[longerProperty] / FORMAT_RATIO),
    [longerProperty]: mapsContainerSize[longerProperty],
  } as Size

  if (targetSize[smallerProperty] > mapsContainerSize[smallerProperty]) {
    targetSize[smallerProperty] = mapsContainerSize[smallerProperty]
    targetSize[longerProperty] = Math.floor(mapsContainerSize[smallerProperty] * FORMAT_RATIO)
  }

  const target1DPixelCount = (longerPropertyCMLength / CM_PER_INCH) * pixelPerInchResolution
  const current1DPixelCount = targetSize[longerProperty] * (mapboxResolutionRatio ?? 1)
  const newSizeFactor = current1DPixelCount > 0 ? target1DPixelCount / current1DPixelCount : 1

  return { targetSize, newSizeFactor }
}
