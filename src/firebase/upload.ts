import { firestore } from 'index'
import firebase from 'firebase/app'

const uploadBlob = async ({
  blob,
  onSnapshot,
  onError,
  onComplete,
  setUploadTask,
}: {
  blob: Blob | null
  onSnapshot: (snapshot: firebase.storage.UploadTaskSnapshot) => void
  onError: (error?: firebase.storage.FirebaseStorageError) => void
  onComplete: (downloadURL: string) => void
  setUploadTask: (uploadTask: firebase.storage.UploadTask) => void
}) => {
  if (!blob) {
    return
  }
  const storageRef = firestore.ref('maposaic_pictures/' + Math.floor(Math.random() * 1000000))
  const uploadTask = storageRef.put(blob)

  setUploadTask(uploadTask)

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      onSnapshot(snapshot)
    },
    (error) => {
      onError(error)
    },
    async () => {
      try {
        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
        onComplete(downloadURL)
      } catch (e) {
        onError()
      }
    },
  )
}

export default uploadBlob
