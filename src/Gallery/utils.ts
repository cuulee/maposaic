import { Picture } from 'Gallery/types'
import { MaposaicGeoURLParamKey } from 'Maposaic/types'
import { getURLParamsFromColorConfig } from 'Maposaic/utils'

export const showMaposaicLink = (picture: Picture) => {
  return !!picture.mapCenter && !!picture.colorConfig
}

export const getMaposaicURLParamsFromPicture = (picture: Picture) => {
  if (!picture.mapCenter) {
    return null
  }
  const urlParams = new URLSearchParams()
  urlParams.set(MaposaicGeoURLParamKey.Lat, picture.mapCenter.lat.toString())
  urlParams.set(MaposaicGeoURLParamKey.Lng, picture.mapCenter.lng.toString())
  if (picture.mapZoom) {
    urlParams.set(MaposaicGeoURLParamKey.Zoom, picture.mapZoom.toString())
  }

  return picture.colorConfig ? getURLParamsFromColorConfig(picture.colorConfig, urlParams) : urlParams
}
