export const MAPBOX_STYLE_URL = {
  road: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
  water: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
  administrative: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka',
  relief: 'mapbox://styles/cartapuce/ckhf6cuex07dd19piqg029oka',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  regular: 'mapbox://styles/mapbox/streets-v11',
}

// eslint-disable-next-line
export const MAPBOX_TOKEN: string = process.env['REACT_APP_MAPBOX_TOKEN'] || ''

export const GEOCODING_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places'
