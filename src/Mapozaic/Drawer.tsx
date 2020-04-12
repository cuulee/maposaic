import React from 'react'
import { Drawer as AntDrawer } from 'antd'

type PropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
}

const Drawer = ({ visible, setDrawerVisible }: PropsType) => {
  return (
    <AntDrawer visible={visible} placement="left" onClose={() => setDrawerVisible(false)}>
      Coucou
    </AntDrawer>
  )
}

export default Drawer
