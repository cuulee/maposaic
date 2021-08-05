import { MapboxStyle } from 'Maposaic/types'

export const MAPBOX_STYLES = {
  [MapboxStyle.Relief]: {
    url: 'mapbox://styles/cartapuce/ckhf6cuex07dd19piqg029oka',
    name: 'Relief',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Frelief-alpes.png?alt=media&token=add862d4-3a5e-49ff-aa1f-57b98543050a',
  },
  [MapboxStyle.Road]: {
    url: 'mapbox://styles/cartapuce/ck8vk01zo2e5w1ipmytroxgf4',
    name: 'Roads',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Fstreet-paris-fourche.png?alt=media&token=b247c027-eab3-4804-b08c-4fa971432f52',
  },
  [MapboxStyle.Water]: {
    url: 'mapbox://styles/cartapuce/ck8ynyj0x022h1hpmffi87im9',
    name: 'Water',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Fwater-loire.png?alt=media&token=1b986519-854e-433e-bbc0-81b974a77a39',
  },
  administrative: {
    url: 'mapbox://styles/cartapuce/ck8vkvxjt27z71ila3b3jecka',
    name: 'Borders',
    imgPath:
      'https://firebasestorage.googleapis.com/v0/b/maposaic-99785.appspot.com/o/app_assets%2Fwater-loire.png?alt=media&token=1b986519-854e-433e-bbc0-81b974a77a39',
  },
  satellite: { url: 'mapbox://styles/mapbox/satellite-v9', name: '' },
  regular: { url: 'mapbox://styles/mapbox/streets-v11', name: '' },
}
