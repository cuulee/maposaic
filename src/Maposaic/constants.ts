import { MapboxStyle } from 'Maposaic/types'

export const MAPBOX_STYLES = {
  [MapboxStyle.Relief]: {
    url: 'mapbox://styles/cartapuce/ckhf6cuex07dd19piqg029oka',
    name: 'Relief',
    imgPath: require('assets/gallery/saint-affrique-random-relief.png'),
  },
  [MapboxStyle.Road]: {
    url: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
    name: 'Streets',
    imgPath: require('assets/gallery/saint-affrique-random-road.png'),
  },
  [MapboxStyle.Water]: {
    url: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
    name: 'Water',
    imgPath: require('assets/gallery/saint-affrique-random-water.png'),
  },
  administrative: { url: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka', name: '' },
  satellite: { url: 'mapbox://styles/mapbox/satellite-v9', name: '' },
  regular: { url: 'mapbox://styles/mapbox/streets-v11', name: '' },
}
