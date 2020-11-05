import { Button, Input, Modal, Progress, Tooltip } from 'antd'
import React, { useState } from 'react'
import firebase from 'firebase/app'

import { CloudUploadOutlined, SendOutlined } from '@ant-design/icons'
import uploadBlob from 'firebase/upload'
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

const StatusMessage = ({ taskState, downloadUrl }: { taskState: TaskState; downloadUrl: string | null }) => {
  if (!taskState) {
    return <div>No upload in progress</div>
  }
  if (taskState === UploadStatus.Canceled) {
    return <div>Upload canceled</div>
  }
  if (taskState === UploadStatus.Running) {
    return <div>Uploading picture...</div>
  }
  if (taskState === UploadStatus.Error || !downloadUrl) {
    return <div>Upload failed</div>
  }
  if (taskState === UploadStatus.Success) {
    return (
      <div>
        Picture uploaded ! <a href={downloadUrl}>show</a>
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
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [pictureName, setPictureName] = useState('')

  const onError = (error?: firebase.storage.FirebaseStorageError) => {
    if (error && error.code === 'storage/canceled') {
      setTaskState(UploadStatus.Canceled)
    }
    setTaskState(UploadStatus.Error)
  }

  const onComplete = (downloadUrl: string) => {
    setTaskState(UploadStatus.Success)
    setDownloadUrl(downloadUrl)
  }
  const onSnapshot = (snapshot: firebase.storage.UploadTaskSnapshot) => {
    setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
    setTaskState(UploadStatus.Running)
  }

  const onUploadClick = () => {
    setModalVisible(true)
    if (taskState === firebase.storage.TaskState.RUNNING) {
      return
    }
    const mosaicElement = document.getElementById('maposaic-canvas') as HTMLCanvasElement | null
    if (!mosaicElement) {
      return
    }
    setProgress(0)
    mosaicElement.toBlob((blob) => {
      uploadBlob({ blob, onError: onError, onSnapshot, onComplete, setUploadTask })
    })
  }

  const onModalOk = () => {
    setModalVisible(false)
  }

  const onModalCancel = () => {
    cancelUpload()
    // setModalVisible(false)
  }

  const cancelUpload = () => {
    if (
      uploadTask &&
      [firebase.storage.TaskState.RUNNING, firebase.storage.TaskState.PAUSED].includes(taskState ?? '')
    ) {
      uploadTask.cancel()
      setTaskState(UploadStatus.Canceled)
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
        <StatusMessage downloadUrl={downloadUrl} taskState={taskState} />
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
            <Input
              className="form__field__input"
              placeholder="Picture name"
              value={pictureName}
              onChange={(e) => setPictureName(e.target.value)}
            />
            <Button
              shape="circle"
              icon={<SendOutlined style={{ fontSize: 10 }} />}
              className="form__field__submit"
              type="primary"
              loading={false}
              size="small"
              onClick={() => {}}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CloudUpload
