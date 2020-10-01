import React, { useState } from 'react'
import { Drawer as AntDrawer, Radio, Divider, Button, InputNumber, Tooltip } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import Title from 'antd/lib/typography/Title'
import { FormatPainterOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Badge } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import { MAPBOX_STYLE_URL } from './Mapozaic'
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
  sizeFactor: number
  setNewSizeFactor: (sizeFactor: number) => void
  flyTo: (center: [number, number]) => void
  currentCenter: [number, number]
  maposaicColors: MaposaicColors
  setNewMaposaicColors: (colors: MaposaicColors) => void
  openCanvasImage: () => void
  specificColorTransforms: SpecificColorTransforms
  setNewSpecificColorTransforms: (colors: SpecificColorTransforms) => void
  remainingTime: number | null
  estimatedTime: number | null
  updateEstimatedTime: (sizeFactor: number) => void
}

const millisecondsToText = (millis: number | null) => {
  const min = Math.floor((millis || 0) / 60000)
  const ms = (millis || 0) % 60000
  const s = Math.floor(ms / 1000)
  const ds = Math.floor((ms % 1000) / 100)
  return `${min > 0 ? `${min}:` : ''}${min && s < 10 ? `0${s}` : s}${min > 0 ? '' : `.${ds}s`}`
}

const Drawer = ({
  visible,
  setDrawerVisible,
  mapboxStyleURL,
  changeMapStyle,
  sizeFactor,
  setNewSizeFactor,
  flyTo,
  currentCenter,
  maposaicColors,
  setNewMaposaicColors,
  openCanvasImage,
  specificColorTransforms,
  setNewSpecificColorTransforms,
  remainingTime,
  estimatedTime,
  updateEstimatedTime,
}: DrawerPropsType) => {
  const onStyleUrlChange = (event: RadioChangeEvent) => {
    setDrawerVisible(false)
    changeMapStyle(event.target.value)
  }
  const [localSizeFactor, setLocalSizeFactor] = useState(sizeFactor)

  const onGranularityChange = (value: number | undefined | string) => {
    if (value !== undefined && typeof value !== 'string') {
      updateEstimatedTime(value)
      setLocalSizeFactor(value)
    }
  }

  const applyGranularity = () => {
    setNewSizeFactor(localSizeFactor)
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
      <div className="granularity">
        <InputNumber
          min={1}
          max={10}
          step={0.1}
          value={localSizeFactor}
          onChange={onGranularityChange}
          style={{ width: '68px' }}
        />
        <Button
          className="granularity__paint"
          shape="circle"
          disabled={sizeFactor === localSizeFactor}
          onClick={applyGranularity}
        >
          <FormatPainterOutlined />
        </Button>
        {(remainingTime || estimatedTime) && (
          <Badge className="granularity__time" count={<ClockCircleOutlined style={{ color: '#e53f67' }} />}>
            <span className="granularity__time__box">{millisecondsToText(remainingTime || estimatedTime)}</span>
          </Badge>
        )}
      </div>
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
