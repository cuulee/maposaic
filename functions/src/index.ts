import * as functions from 'firebase-functions'
import fetch from 'node-fetch'
import { parseStringPromise } from 'xml2js'
import { v4 as uuidv4 } from 'uuid'

import * as admin from 'firebase-admin'
import * as corsLib from 'cors'
import { createPersistentDownloadUrl } from './utils'

const cors = corsLib({ origin: true })

admin.initializeApp()
const db = admin.firestore()

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})

export const fetch3Geonames = functions.https.onRequest(async (request, response) => {
  try {
    const result = await fetch('https://api.3geonames.org/?randomland=yes')
    console.log('res', result)
    const text = await result.text()
    const res = await parseStringPromise(text)
    cors(request, response, () => {
      response.send(res)
    })
  } catch (e) {
    console.log('error', e)
    response.status(500).send('Error')
  }
})

exports.updatePictureDocumentWithThumbnailURL = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name
  if (!filePath) {
    return
  }
  const thumbnailName = filePath?.split('maposaic_pictures/thumbnails/')
  if (thumbnailName.length < 2) {
    return
  }
  const pictureId = thumbnailName[1].split('_')[0]
  const snapshot = await db.collection('pictures').where('filePath', '==', `maposaic_pictures/${pictureId}`).get()
  if (snapshot.empty) {
    console.log('No matching documents.')
    return
  }

  // see https://www.sentinelstand.com/article/guide-to-firebase-storage-download-urls-tokens
  const bucket = admin.storage().bucket()
  const file = await bucket.file(filePath)
  const uuid = uuidv4()
  await file.setMetadata({
    metadata: {
      firebaseStorageDownloadTokens: uuid,
    },
  })

  snapshot.forEach((snap) =>
    snap.ref.update({ thumbnailDownloadURL: createPersistentDownloadUrl(bucket.name, filePath, uuid) }),
  )
})

exports.deletePictureDocumentOnFileDeletion = functions.storage.object().onDelete(async (object) => {
  const filePath = object.name
  if (!filePath) {
    return
  }
  if (filePath.includes('thumbnails/')) {
    return
  }

  const snapshot = await db.collection('pictures').where('filePath', '==', filePath).get()

  if (snapshot.empty) {
    console.log('No matching documents.')
    return
  }

  snapshot.forEach((snap) => {
    const data = snap.data()
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    snap.ref.delete()
    console.log(`Picture document with id ${data.id} and place name ${data.placeName} deleted`)
  })
})
