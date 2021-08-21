import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Modal, Progress } from 'antd'
import { CheckCircleTwoTone, CloudUploadOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons'
import { ProgressProps } from 'antd/lib/progress'
import firebase from 'firebase/app'
import { firebaseAuth } from 'firebaseService/initialize'
import { getPicturePathFromFileId, postOrUpdatePicturesDocument, uploadBlob } from 'firebaseService/services'

import { DISABLED_COLOR, PRIMARY_COLOR, SUCCESS_COLOR } from 'constants/colors'
import 'CloudUpload/style.less'
import { useHistory } from 'react-router-dom'
import { PICTURE_ID_PARAM } from 'Gallery/constants'
import { ColorConfig } from 'Colors/types'
import { MapboxStyle } from 'Maposaic/types'
import { UploadButton } from 'CloudUpload/UploadButton'

enum UploadStatus {
  Error = 'error',
  Canceled = 'canceled',
  Running = 'running',
  Success = 'success',
}

export type TaskState = UploadStatus | null

const ProgressStatus: { [key in UploadStatus]: ProgressProps['status'] } = {
  [UploadStatus.Error]: 'exception',
  [UploadStatus.Canceled]: 'exception',
  [UploadStatus.Running]: 'active',
  [UploadStatus.Success]: 'success',
}

const StatusMessage = ({ taskState, documentId }: { taskState: TaskState; documentId: string | null }) => {
  const history = useHistory()
  if (!taskState) {
    return <div>No upload in progress</div>
  }
  if (taskState === UploadStatus.Canceled) {
    return <div>Upload canceled</div>
  }
  if (taskState === UploadStatus.Running) {
    return <div>Uploading picture...</div>
  }
  if (taskState === UploadStatus.Error || !documentId) {
    return <div>Upload failed</div>
  }
  if (taskState === UploadStatus.Success) {
    return (
      <div className="status-message">
        Picture uploaded !{' '}
        <div
          className="status-message__link"
          onClick={() => history.push(`/gallery?${PICTURE_ID_PARAM}=${documentId}`)}
        >
          show in gallery
        </div>
      </div>
    )
  }
  return <div>Upload failed</div>
}

const CloudUpload = ({
  isDisabled,
  className,
  mapCenter,
  mapZoom,
  placeName,
  colorConfig,
  mapboxStyle,
  isLinkButton,
  getMosaicElementById,
}: {
  isDisabled: boolean
  className?: string
  mapCenter?: mapboxgl.LngLat
  mapZoom?: number
  placeName: string | null
  colorConfig: ColorConfig
  mapboxStyle: MapboxStyle
  isLinkButton?: boolean
  getMosaicElementById: () => HTMLCanvasElement | null
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [taskState, setTaskState] = useState<TaskState>(null)
  const [uploadTask, setUploadTask] = useState<null | firebase.storage.UploadTask>(null)
  const [pictureName, setPictureName] = useState('')
  const [fileId, setFileId] = useState<null | string>(null)
  const [isFormUploaded, setIsFormUploaded] = useState(false)
  const [isUploadingForm, setIsUploadingForm] = useState(false)
  const [pictureDocumentId, setPictureDocumentId] = useState<string | null>(null)
  const [anonymousUid, setAnonymousUid] = useState<string | null>(null)

  useEffect(() => {
    void firebaseAuth.signInAnonymously()
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setAnonymousUid(user.uid)
      } else {
        setAnonymousUid(null)
      }
    })
  }, [])

  const onUploadClick = (getMosaicElementById: () => HTMLCanvasElement | null) => {
    setModalVisible(true)
    if (taskState === UploadStatus.Running) {
      return
    }
    setTaskState(null)
    setUploadTask(null)
    setPictureDocumentId(null)
    setPictureName('')

    const mosaicElement = getMosaicElementById()
    if (!mosaicElement) {
      return
    }
    setProgress(0)
    mosaicElement.toBlob((blob) => {
      if (!blob) {
        return
      }
      const { uploadTask, fileId } = uploadBlob({ blob })
      setUploadTask(uploadTask)
      setFileId(fileId)
    })
  }

  const onError = (error?: firebase.storage.FirebaseStorageError) => {
    if (error && error.code === 'storage/canceled') {
      setTaskState(UploadStatus.Canceled)
    }
    setTaskState(UploadStatus.Error)
  }

  const onComplete = async ({ downloadURL, fileId }: { downloadURL: string; fileId: string }) => {
    const documentId = await postOrUpdatePicturesDocument({
      documentId: pictureDocumentId,
      anonymousUid,
      payload: {
        downloadURL,
        filePath: getPicturePathFromFileId(fileId),
        mapCenter: mapCenter?.toArray() ?? '',
        colorConfig,
        mapZoom,
        placeName,
        mapboxStyle,
      },
    })
    updateDocumentId(documentId)
    if (documentId) {
      setTaskState(UploadStatus.Success)
    } else {
      setTaskState(UploadStatus.Error)
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedOnComplete = useCallback(onComplete, [pictureDocumentId, anonymousUid])

  const onSnapshot = (snapshot: firebase.storage.UploadTaskSnapshot) => {
    setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
    setTaskState(UploadStatus.Running)
  }

  useEffect(() => {
    if (!uploadTask || !fileId) {
      return
    }
    const unsubscribe = uploadTask.on(
      'state_changed',
      (snapshot) => {
        onSnapshot(snapshot)
      },
      (error) => {
        onError(error)
      },
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async () => {
        try {
          const downloadURL = (await uploadTask.snapshot.ref.getDownloadURL()) as string
          void memoizedOnComplete({ downloadURL, fileId })
        } catch (e) {
          onError()
        }
      },
    ) as () => void
    return () => unsubscribe()
  }, [uploadTask, memoizedOnComplete, fileId])

  const onModalOk = () => {
    if (!isFormSubmitDisabled && !isFormUploaded) {
      void submitForm()
    }
    setModalVisible(false)
  }

  const onModalCancel = () => {
    cancelUpload()
    setModalVisible(false)
  }

  const cancelUpload = () => {
    if (
      taskState &&
      [firebase.storage.TaskState.RUNNING, firebase.storage.TaskState.PAUSED].includes(taskState) &&
      uploadTask
    ) {
      uploadTask.cancel()
      setTaskState(UploadStatus.Canceled)
    }
  }

  useEffect(() => setIsFormUploaded(false), [pictureName])

  const isFormSubmitDisabled =
    !pictureName.length ||
    !taskState ||
    ![UploadStatus.Running, UploadStatus.Success].includes(taskState) ||
    isFormUploaded

  const submitForm = async () => {
    if (isFormSubmitDisabled) {
      return
    }
    setIsUploadingForm(true)
    const documentId = await postOrUpdatePicturesDocument({
      documentId: pictureDocumentId,
      payload: { pictureName },
      anonymousUid,
    })
    updateDocumentId(documentId)
    setIsUploadingForm(false)
    setIsFormUploaded(true)
  }

  const updateDocumentId = (newDocumentId: string | null) => {
    if (!newDocumentId || pictureDocumentId) {
      return
    }
    setPictureDocumentId(newDocumentId)
  }

  const InputSuffix = ({ className }: { className?: string }) => {
    if (isUploadingForm) {
      return <LoadingOutlined spin className={className} style={{ color: PRIMARY_COLOR }} />
    }
    if (isFormUploaded) {
      return <CheckCircleTwoTone className={className} twoToneColor={SUCCESS_COLOR} />
    }
    return (
      <SendOutlined
        className={className}
        onClick={isFormSubmitDisabled ? undefined : submitForm}
        style={{ color: isFormSubmitDisabled ? DISABLED_COLOR : PRIMARY_COLOR }}
      />
    )
  }

  return (
    <div className={className}>
      {isLinkButton ? (
        <Button icon={<CloudUploadOutlined />} shape="round" onClick={() => onUploadClick(getMosaicElementById)}>
          Upload to gallery
        </Button>
      ) : (
        <UploadButton isDisabled={isDisabled} onUploadClick={onUploadClick} />
      )}
      <Modal visible={modalVisible} onCancel={onModalCancel} onOk={onModalOk}>
        <StatusMessage documentId={pictureDocumentId} taskState={taskState} />
        {taskState && (
          <React.Fragment>
            <Progress
              percent={Math.round(progress)}
              size="small"
              status={taskState ? ProgressStatus[taskState] : undefined}
            />
          </React.Fragment>
        )}
        <div className="form">
          <div className="form__title">Picture name</div>
          <div className="form__field">
            <Input
              placeholder="Optional"
              value={pictureName}
              onChange={(e) => setPictureName(e.target.value)}
              suffix={<InputSuffix />}
              onPressEnter={submitForm}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CloudUpload
