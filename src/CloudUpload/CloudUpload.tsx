import { Button, Input, Upload } from 'antd'
import { db } from 'index'
import React from 'react'
import firebase from 'firebase/app'

import { CloudUploadOutlined } from '@ant-design/icons'
import { UploadChangeParam } from 'antd/lib/upload'

const CloudUpload = () => {
  return (
    <div>
      <Button type="primary" shape="circle" onClick={() => {}} icon={<CloudUploadOutlined />} />
    </div>
  )
}

export default CloudUpload
