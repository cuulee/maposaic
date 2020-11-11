import * as functions from 'firebase-functions'
import fetch from 'node-fetch'
import { parseStringPromise } from 'xml2js'

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})

// type GeoData = {
//   geodata: {
//     nearest: {
//       latt: number
//       longt: number
//       elevation: number
//       timezone: string
//       city: string
//       name: string
//       prov: string
//     }
//   }
// }

export const fetch3Geonames = functions.https.onRequest(async (request, response) => {
  try {
    const result = await fetch('https://api.3geonames.org/?randomland=yes')
    const text = await result.text()
    const res = await parseStringPromise(text)
    response.send(res)
  } catch {
    response.status(500).send('Error')
  }
})
