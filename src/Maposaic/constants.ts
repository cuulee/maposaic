import { MapboxStyle } from 'Maposaic/types'

export const MAPBOX_STYLES = {
  [MapboxStyle.Relief]: {
    url: 'mapbox://styles/cartapuce/ckhf6cuex07dd19piqg029oka',
    name: 'Relief',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Fsaint-affrique-random-relief.png?alt=media&token=1cd8f1c9-51da-44af-a714-524e73e74e22',
  },
  [MapboxStyle.Road]: {
    url: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
    name: 'Streets',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Fsaint-affrique-random-road.png?alt=media&token=0fe8ca06-c885-48fe-a904-ad45787977c9',
  },
  [MapboxStyle.Water]: {
    url: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
    name: 'Water',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Fsaint-affrique-random-water.png?alt=media&token=184e049b-5c67-4155-8905-be29661cd12f',
  },
  administrative: { url: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka', name: '' },
  satellite: { url: 'mapbox://styles/mapbox/satellite-v9', name: '' },
  regular: { url: 'mapbox://styles/mapbox/streets-v11', name: '' },
}
