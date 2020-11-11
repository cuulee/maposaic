import * as functions from 'firebase-functions'
import fetch from 'node-fetch'

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})

export const fetch3Geonames = functions.https.onRequest(async (request, response) => {
  const result = await fetch('https://api.3geonames.org/?randomland=yes')

  const text = await result.text()
  console.log('coucou', text)
  console.log('finn dou')
  response.send(text)
})
