import * as functions from 'firebase-functions'
import fetch from 'node-fetch'
import { parseStringPromise } from 'xml2js'

const cors = require('cors')({ origin: true })

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})

export const fetch3Geonames = functions.https.onRequest(async (request, response) => {
  try {
    const result = await fetch('https://api.3geonames.org/?randomland=yes')
    const text = await result.text()
    const res = await parseStringPromise(text)
    cors(request, response, () => {
      response.send(res)
    })
  } catch {
    response.status(500).send('Error')
  }
})
