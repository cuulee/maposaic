import { Button, Input, Modal, Progress, Tooltip } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import firebase from 'firebase/app'

import { CloudUploadOutlined, SendOutlined } from '@ant-design/icons'
import { postOrUpdatePicturesDocument, uploadBlob } from 'firebase/services'
import { ProgressProps } from 'antd/lib/progress'

import 'CloudUpload/style.less'

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
        Picture uploaded ! <a href={downloadURL}>show</a>
      </div>
    )
  }
  return <div>Upload failed</div>
}

const CloudUpload = ({ isDisabled, className }: { isDisabled: boolean; className?: string }) => {
  const [modalVisible, setModalVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const [taskState, setTaskState] = useState<TaskState>(null)
  const [uploadTask, setUploadTask] = useState<null | firebase.storage.UploadTask>(null)
  const [downloadURL, setDownloadURL] = useState<string | null>(null)
  const [pictureName, setPictureName] = useState('')
  const [hasFormChanged, setHasFormChanged] = useState(false)
  const [filePath, setFilePath] = useState<null | string>(null)
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
    setPictureName('')

    const mosaicElement = document.getElementById('maposaic-canvas') as HTMLCanvasElement | null
    if (!mosaicElement) {
      return
    }
    setProgress(0)
    mosaicElement.toBlob((blob) => {
      if (!blob) {
        return
      }
      const { uploadTask, filePath } = uploadBlob({ blob })
      setUploadTask(uploadTask)
      setFilePath(filePath)
    })
  }

  const onError = (error?: firebase.storage.FirebaseStorageError) => {
    if (error && error.code === 'storage/canceled') {
      setTaskState(UploadStatus.Canceled)
    }
    setTaskState(UploadStatus.Error)
  }

  const onComplete = async ({ downloadURL, filePath }: { downloadURL: string; filePath: string }) => {
    const documentId = await postOrUpdatePicturesDocument({ downloadURL, documentId: pictureDocumentId, filePath })
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
    if (!uploadTask || !filePath) {
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
          memoizedOnComplete({ downloadURL, filePath })
        } catch (e) {
          onError()
        }
      },
    )
    return () => unsubscribe()
  }, [uploadTask, memoizedOnComplete, filePath])

  const onModalOk = () => {
    setModalVisible(false)
  }

  const onModalCancel = () => {
    cancelUpload()
    // setModalVisible(false)
  }

  const cancelUpload = () => {
    if (taskState && [firebase.storage.TaskState.RUNNING, firebase.storage.TaskState.PAUSED].includes(taskState)) {
      // uploadTask.cancel()
      setTaskState(UploadStatus.Canceled)
    }
  }

  useEffect(() => setHasFormChanged(true), [pictureName])

  const isFormSubmitDisabled =
    !pictureName.length ||
    !taskState ||
    ![UploadStatus.Running, UploadStatus.Success].includes(taskState) ||
    !hasFormChanged

  const onFormSubmit = async () => {
    if (isFormSubmitDisabled) {
      return
    }
    setIsUploadingForm(true)
    setHasFormChanged(false)
    const documentId = await postOrUpdatePicturesDocument({ pictureName, documentId: pictureDocumentId })
    updateDocumentId(documentId)
    setIsUploadingForm(false)
  }

  const updateDocumentId = (newDocumentId: string | null) => {
    if (!newDocumentId) {
      console.log('error on save')
    }
    if (!pictureDocumentId && newDocumentId) {
      console.log('doc id', newDocumentId)
      setPictureDocumentId(newDocumentId)
    }
  }

  return (
    <div className={className}>
      <Tooltip title="Upload picture to gallery" mouseEnterDelay={0.4}>
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
          <div className="form__title">Optional</div>
          <div className="form__field">
            <Input placeholder="Picture name" value={pictureName} onChange={(e) => setPictureName(e.target.value)} />
            <Button
              shape="circle"
              icon={<SendOutlined style={{ fontSize: 10 }} />}
              className="form__field__submit"
              type="primary"
              loading={isUploadingForm}
              size="small"
              disabled={isFormSubmitDisabled}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={onFormSubmit}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CloudUpload
