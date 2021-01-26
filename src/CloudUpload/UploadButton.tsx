import React from 'react'
import { Button, Tooltip } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'
import { TOOLTIP_ENTER_DELAY } from 'constants/ux'

export const UploadButton = ({ isDisabled, onUploadClick }: { isDisabled: boolean; onUploadClick?: () => void }) => {
  return (
    <Tooltip title="Upload to public gallery" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
      <Button
        disabled={isDisabled}
        type="default"
        shape="circle"
        onClick={onUploadClick}
        icon={<CloudUploadOutlined />}
      />
    </Tooltip>
  )
}
