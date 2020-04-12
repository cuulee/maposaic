import React from 'react'
import { Drawer as AntDrawer, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import { MAPBOX_STYLE_URL } from './Mapozaic'

type PropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyleURL: string
  changeMapStyle: (style: string) => void
}

const Drawer = ({ visible, setDrawerVisible, mapboxStyleURL, changeMapStyle }: PropsType) => {
  const onStyleUrlChange = (event: RadioChangeEvent) => {
    changeMapStyle(event.target.value)
  }

  return (
    <AntDrawer visible={visible} placement="left" onClose={() => setDrawerVisible(false)}>
      <Radio.Group onChange={onStyleUrlChange} value={mapboxStyleURL}>
        <Radio value={MAPBOX_STYLE_URL.road}>Roads</Radio>
        <Radio value={MAPBOX_STYLE_URL.administrative}>Administrative boundaries</Radio>
      </Radio.Group>
    </AntDrawer>
  )
}

export default Drawer
