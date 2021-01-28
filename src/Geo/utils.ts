import { MAPBOX_TOKEN } from 'constants/mapbox'
import { GeocodingData, GeonameData, PlaceType } from 'types/geo'
import mapboxgl from 'mapbox-gl'
import { GEOCODING_BASE_URL } from 'Geo/constants'

export const PLACE_TYPE_RELEVANCE = [
  PlaceType.Place,
  PlaceType.Locality,
  PlaceType.Postcode,
  PlaceType.District,
  PlaceType.Region,
  PlaceType.Country,
  PlaceType.Neighborhood,
]

export const getPlaceNameFromPosition = async (center: mapboxgl.LngLat | null) => {
  if (!center) {
    return null
  }
  const geoResponse = await fetch(`${GEOCODING_BASE_URL}/${center.lng},${center.lat}.json?access_token=${MAPBOX_TOKEN}`)
  const geoCoding = (await geoResponse.json()) as GeocodingData
  for (const nextRelevantPlaceType of PLACE_TYPE_RELEVANCE) {
    for (const feature of geoCoding.features) {
      for (const foundPlaceType of feature.place_type) {
        if (foundPlaceType === nextRelevantPlaceType) {
          return feature.place_name
        }
      }
    }
  }
  return null
}

export const getPlaceNameFromGeoname = (data: GeonameData) => {
  const city = data.geodata.nearest[0]?.city[0]
  const timezone = data.geodata.nearest[0]?.timezone[0]
  const prov = data.geodata.nearest[0]?.prov[0]
  const isCity = city && city.length
  const isTimezone = timezone && timezone.length
  const isProv = prov && prov.length

  if (!isCity && !isTimezone && !isProv) {
    return null
  }
  return `${city}${isProv && ', '}${prov}${isTimezone && ', '}${timezone}`
}

export const fetchGeoRandom = async (): Promise<mapboxgl.LngLat> => {
  try {
    const response = await fetch('https://us-central1-maposaic-99785.cloudfunctions.net/fetch3Geonames')
    const data = (await response.json()) as GeonameData
    return new mapboxgl.LngLat(
      data.geodata.nearest[0]?.longt[0] ?? 2.338272,
      data.geodata.nearest[0]?.latt[0] ?? 48.858796,
    )
  } catch {
    return new mapboxgl.LngLat(Math.random() * 100, Math.random() * 50 + 10)
  }
}

export const getRandomZoom = () => {
  // mapbox zoom range : 0 (most zoom out) - 22
  return Math.random() * 13 + 3
}

// to fetch a lot of random coords
export const fetchRandom = () => {
  const coords = []
  const proms = []
  for (let i = 0; i < 1000; i++) {
    const prom = new Promise((resolve) => {
      try {
        const response = fetch('https://us-central1-maposaic-99785.cloudfunctions.net/fetch3Geonames')
        void response.then((r) => {
          void r
            .json()
            .then((data: GeonameData) =>
              resolve([data.geodata.nearest[0]?.longt[0] ?? 2.338272, data.geodata.nearest[0]?.latt[0] ?? 48.858796]),
            )
        })
      } catch {
        resolve(null)
      }
    })
    // eslint-disable-next-line
      proms.push(prom)
  }

  void Promise.all(proms).then((p) => console.log(p))
}
