import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Modal, Progress, Tooltip } from 'antd'
import { CheckCircleTwoTone, CloudUploadOutlined, LoadingOutlined, SendOutlined } from '@ant-design/icons'
import { ProgressProps } from 'antd/lib/progress'
import firebase from 'firebase/app'
import { uploadBlob, getPicturePathFromFileId, postOrUpdatePicturesDocument } from 'firebase/services'

import { PRIMARY_COLOR, DISABLED_COLOR, SUCCESS_COLOR } from 'constants/colors'
import link from 'assets/link.svg'
import 'CloudUpload/style.less'
import { TOOLTIP_ENTER_DELAY } from 'constants/ux'

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

const StatusMessage = ({ taskState, downloadURL }: { taskState: TaskState; downloadURL: string | null }) => {
  if (!taskState) {
    return <div>No upload in progress</div>
  }
  if (taskState === UploadStatus.Canceled) {
    return <div>Upload canceled</div>
  }
  if (taskState === UploadStatus.Running) {
    return <div>Uploading picture...</div>
  }
  if (taskState === UploadStatus.Error || !downloadURL) {
    return <div>Upload failed</div>
  }
  if (taskState === UploadStatus.Success) {
    return (
      <div>
        Picture uploaded !{' '}
        <a target="_blank" rel="noopener noreferrer" href={downloadURL}>
          show <img alt="" width="14px" src={link} />
        </a>
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
}: {
  isDisabled: boolean
  className?: string
  mapCenter?: mapboxgl.LngLat
  mapZoom?: number
  placeName: string | null
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [taskState, setTaskState] = useState<TaskState>(null)
  const [uploadTask, setUploadTask] = useState<null | firebase.storage.UploadTask>(null)
  const [downloadURL, setDownloadURL] = useState<string | null>(null)
  const [pictureName, setPictureName] = useState('')
  const [fileId, setFileId] = useState<null | string>(null)
  const [isFormUploaded, setIsFormUploaded] = useState(false)
  const [isUploadingForm, setIsUploadingForm] = useState(false)
  const [pictureDocumentId, setPictureDocumentId] = useState<string | null>(null)

  const onUploadClick = () => {
    setModalVisible(true)
    if (taskState === UploadStatus.Running) {
      return
    }
    setDownloadURL(null)
    setTaskState(null)
    setUploadTask(null)
    setPictureDocumentId(null)
    setPictureName(placeName ?? '')

    const mosaicElement = document.getElementById('maposaic-canvas') as HTMLCanvasElement | null
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
      payload: {
        downloadURL,
        filePath: getPicturePathFromFileId(fileId),
        mapCenter: mapCenter?.toArray(),
        mapZoom,
        placeName,
      },
    })
    updateDocumentId(documentId)
    if (documentId) {
      setTaskState(UploadStatus.Success)
      setDownloadURL(downloadURL)
    } else {
      setTaskState(UploadStatus.Error)
    }
  }
  const memoizedOnComplete = useCallback(onComplete, [pictureDocumentId])

  const onSnapshot = (snapshot: firebase.storage.UploadTaskSnapshot, rand: number) => {
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
        onSnapshot(snapshot, Math.random())
      },
      (error) => {
        onError(error)
      },
      async () => {
        try {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
          memoizedOnComplete({ downloadURL, fileId })
        } catch (e) {
          onError()
        }
      },
    )
    return () => unsubscribe()
  }, [uploadTask, memoizedOnComplete, fileId])

  const onModalOk = () => {
    if (!isFormSubmitDisabled && !isFormUploaded) {
      submitForm()
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
    const documentId = await postOrUpdatePicturesDocument({ documentId: pictureDocumentId, payload: { pictureName } })
    updateDocumentId(documentId)
    setIsUploadingForm(false)
    setIsFormUploaded(true)
  }

  const updateDocumentId = (newDocumentId: string | null) => {
    if (!newDocumentId) {
    }
    if (!pictureDocumentId && newDocumentId) {
      setPictureDocumentId(newDocumentId)
    }
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
      <Tooltip title="Upload picture to gallery" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
        <Button
          disabled={isDisabled}
          type="default"
          shape="circle"
          onClick={onUploadClick}
          icon={<CloudUploadOutlined />}
        />
      </Tooltip>
      <Modal visible={modalVisible} onCancel={onModalCancel} onOk={onModalOk}>
        <StatusMessage downloadURL={downloadURL} taskState={taskState} />
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
          <div className="form__title">Picture name (optional)</div>
          <div className="form__field">
            <Input
              placeholder="Picture name"
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
