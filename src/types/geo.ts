export type GeocodingData = {
  features: {
    place_name: string
    place_type: PlaceType[]
  }[]
}

export enum PlaceType {
  Poi = 'poi',
  Address = 'address',
  Neighborhood = 'neighborhood',
  Locality = 'locality',
  Postcode = 'postcode',
  Place = 'place',
  District = 'district',
  Region = 'region',
  Country = 'country',
}

export type GeonameData = {
  geodata: {
    nearest: {
      latt: number[]
      longt: number[]
      elevation: number[]
      timezone: string[]
      city: string[]
      name: string[]
      prov: string[]
    }[]
  }
}
