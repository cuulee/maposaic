import React, { useState, useEffect } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Button, InputNumber, Tooltip } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import Title from 'antd/lib/typography/Title'
import { InfoCircleOutlined } from '@ant-design/icons'

import { MAPBOX_STYLE_URL, INITIAL_SIZE_FACTOR } from './Mapozaic'
import GeoSearch from './GeoSearchInput'
import { MaposaicColors } from 'Colors/types'

import './drawer.style.less'
import ColorTabs from './ColorTabs'
import { SpecificColorTransforms } from 'Mapozaic/types'

export type DrawerPropsType = {
  visible: boolean
  setDrawerVisible: (visible: boolean) => void
  mapboxStyleURL: string
  changeMapStyle: (style: string) => void
  setNewSizeFactor: (sizeFactor: number) => void
  flyTo: (center: [number, number]) => void
  currentCenter: [number, number]
  maposaicColors: MaposaicColors
  setNewMaposaicColors: (colors: MaposaicColors) => void
  openCanvasImage: () => void
  specificColorTransforms: SpecificColorTransforms
  setNewSpecificColorTransforms: (colors: SpecificColorTransforms) => void
}

const Drawer = ({
  visible,
  setDrawerVisible,
  mapboxStyleURL,
  changeMapStyle,
  setNewSizeFactor,
  flyTo,
  currentCenter,
  maposaicColors,
  setNewMaposaicColors,
  openCanvasImage,
  specificColorTransforms,
  setNewSpecificColorTransforms,
}: DrawerPropsType) => {
  const onStyleUrlChange = (event: RadioChangeEvent) => {
    setDrawerVisible(false)
    changeMapStyle(event.target.value)
  }
  const [localSizeFactor, setLocalSizeFactor] = useState(INITIAL_SIZE_FACTOR)

  useEffect(() => {
    const chrono = setTimeout(() => setNewSizeFactor(localSizeFactor), 400)
    return () => {
      clearTimeout(chrono)
    }
    // eslint-disable-next-line
  }, [localSizeFactor])

  const onNumberInputChange = (value: number | undefined | string) => {
    if (value !== undefined && typeof value !== 'string') {
      setLocalSizeFactor(value)
    }
  }

  return (
    <AntDrawer
      visible={visible}
      placement="left"
      onClose={() => setDrawerVisible(false)}
      closable={false}
      width="min(75%,333px)"
    >
      <GeoSearch flyTo={flyTo} currentCenter={currentCenter} setDrawerVisible={setDrawerVisible} />
      <Divider />
      <Title level={4}>Colors</Title>
      <ColorTabs
        maposaicColors={maposaicColors}
        setNewMaposaicColors={setNewMaposaicColors}
        specificColorTransforms={specificColorTransforms}
        setNewSpecificColorTransforms={setNewSpecificColorTransforms}
      />

      <Divider />
      <Title level={4}>
        Granularity{' '}
        <Tooltip title="Increase size and... waiting time">
          <InfoCircleOutlined />
        </Tooltip>
      </Title>
      <InputNumber min={1} max={10} step={0.1} value={localSizeFactor} onChange={onNumberInputChange} />
      <Divider />
      <Radio.Group onChange={onStyleUrlChange} value={mapboxStyleURL}>
        <Radio value={MAPBOX_STYLE_URL.road}>Road boundaries</Radio>
        <Radio value={MAPBOX_STYLE_URL.water}>Water boundaries</Radio>
        <Radio value={MAPBOX_STYLE_URL.administrative}>Administrative boundaries</Radio>
      </Radio.Group>
      <Divider />
      <Button className="open-button" onClick={openCanvasImage}>
        Open map image in new window
      </Button>
    </AntDrawer>
  )
}

export default Drawer
