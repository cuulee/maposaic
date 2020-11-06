import { db, firestore } from 'index'
import firebase from 'firebase/app'

const PICTURE_COLLECTION_ID = 'pictures'

export const uploadBlob = ({ blob }: { blob: Blob }) => {
  const filePath = 'maposaic_pictures/' + Math.floor(Math.random() * 1000000)
  const storageRef = firestore.ref(filePath)
  const uploadTask = storageRef.put(blob)

  return { filePath, uploadTask }
}

export const postOrUpdatePicturesDocument = async ({
  downloadURL,
  documentId,
  pictureName,
  filePath,
}: {
  documentId: string | null
  downloadURL?: string
  pictureName?: string
  filePath?: string
}) => {
  // undefined value in payload is not accepted by firestore
  const payload: PostOrUpdatePictureDocumentPayload = {}
  if (downloadURL) {
    payload.downloadURL = downloadURL
  }
  if (pictureName) {
    payload.pictureName = pictureName
  }
  if (filePath) {
    payload.filePath = filePath
  }

  if (documentId) {
    const docRef = await db.collection(PICTURE_COLLECTION_ID).doc(documentId)
    docRef.update(payload)

    return documentId
  }

  try {
    const response = await db
      .collection(PICTURE_COLLECTION_ID)
      .add({ ...payload, timestamp: firebase.firestore.FieldValue.serverTimestamp() })
    return response.id
  } catch (e) {
    return null
  }
}

type PostOrUpdatePictureDocumentPayload = {
  downloadURL?: string
  pictureName?: string
  filePath?: string
}
