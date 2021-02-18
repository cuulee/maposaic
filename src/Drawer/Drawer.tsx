import React, { useState } from 'react'
import { Drawer as AntDrawer, Radio, Select, Tooltip } from 'antd'
import Title from 'antd/lib/typography/Title'

import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Badge } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import 'Drawer/drawer.style.less'
import ColorConfig from 'Colors/ColorConfigChoice'
import { Format, FORMAT_SIZE, FORMATS } from 'constants/dimensions'
import { PRIMARY_COLOR } from 'constants/colors'
import { DrawerPropsType } from 'Drawer/types'
import { MapboxStyle } from 'Maposaic/types'
import { MAPBOX_STYLES } from 'Maposaic/constants'
import spinner from 'assets/spinner.png'
import githubMark from 'assets/GitHub-Mark.png'
import { TOOLTIP_ENTER_DELAY } from 'constants/ux'

const millisecondsToText = (millis: number | null) => {
  const min = Math.floor((millis ?? 0) / 60000)
  const ms = (millis ?? 0) % 60000
  const s = Math.floor(ms / 1000)
  const ds = Math.floor((ms % 1000) / 100)
  return `${min > 0 ? `${min}:` : ''}${min && s < 10 ? `0${s}` : s}${min > 0 ? '' : `.${ds}s`}`
}

const radioStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center' }

const Drawer = ({
  visible,
  setDrawerVisible,
  mapboxStyle,
  changeMapStyle,
  colorConfig,
  setColorConfig,
  specificColorTransforms,
  setNewSpecificColorTransforms,
  remainingTime,
  estimatedTime,
  onPosterSizeChange,
  isMobile,
}: DrawerPropsType) => {
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null)
  const [format, setFormat] = useState<Format>(Format.A4)

  const handleOrientationChange = (newIsLandscape: boolean) => {
    const newValue = newIsLandscape === isLandscape ? null : newIsLandscape
    setIsLandscape(newValue)
    onPosterSizeChange({
      isLandscape: newValue,
      pixelPerInchResolution: 300,
      longerPropertyCMLength: FORMAT_SIZE[format],
    })
  }

  const handleFormatChange = (format: Format) => {
    setFormat(format)
    if (null === isLandscape) {
      setIsLandscape(true)
    }
    onPosterSizeChange({
      isLandscape: isLandscape ?? true,
      pixelPerInchResolution: 300,
      longerPropertyCMLength: FORMAT_SIZE[format],
    })
  }

  return (
    <AntDrawer
      visible={visible}
      placement="left"
      onClose={() => setDrawerVisible(false)}
      closable={true}
      width="min(100%,333px)"
      bodyStyle={{ padding: 0 }}
      mask={isMobile}
      closeIcon={<CloseOutlined style={{ color: PRIMARY_COLOR }} />}
    >
      <div className="drawer">
        <div className="drawer__header">
          <div className="drawer__header__title">
            <img width="16px" src={spinner} alt="logo" />
            <div className="drawer__header__text">Settings</div>
          </div>
        </div>
        <div className="drawer__content">
          <div className="drawer__content__cards">
            <div className="drawer__content__cards__card">
              <Title level={5}>Colors</Title>
              <ColorConfig
                colorConfig={colorConfig}
                setColorConfig={setColorConfig}
                specificColorTransforms={specificColorTransforms}
                setNewSpecificColorTransforms={setNewSpecificColorTransforms}
              />
            </div>
            <div className="drawer__content__cards__card">
              <Title level={5}>Background</Title>
              <div className="drawer__backgroungs">
                {Object.values(MapboxStyle).map((style) => {
                  return (
                    <div
                      className={`drawer__backgroungs__background${
                        mapboxStyle === style ? ' drawer__backgroungs__background--selected' : ''
                      }`}
                      onClick={() => changeMapStyle(style)}
                      key={style}
                    >
                      <div>{MAPBOX_STYLES[style].name}</div>
                      <img
                        className={`background-image${mapboxStyle === style ? ' background-image--selected' : ''}`}
                        width="60px"
                        alt={style}
                        src={MAPBOX_STYLES[style].imgPath}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="drawer__content__cards__card">
              <Title level={5}>
                Poster
                <Tooltip className="poster-tooltip" title="300 pixels per inch">
                  <InfoCircleOutlined />
                </Tooltip>
              </Title>
              <div className="poster">
                <div className="poster__settings">
                  <Select value={format} onSelect={handleFormatChange}>
                    {FORMATS.map((format) => {
                      return (
                        <Select.Option value={format} key={format}>
                          {format}
                        </Select.Option>
                      )
                    })}
                  </Select>
                  <Radio.Group
                    style={{ display: 'flex', alignItems: 'center' }}
                    name="preset"
                    value={isLandscape}
                    size="small"
                    className="poster__settings__landscape"
                  >
                    <Radio.Button
                      style={{ width: '29px', height: '21px', ...radioStyle }}
                      onClick={() => handleOrientationChange(true)}
                      value={true}
                    >
                      A
                    </Radio.Button>
                    <Radio.Button
                      onClick={() => handleOrientationChange(false)}
                      style={{
                        width: '21px',
                        height: '29px',
                        marginLeft: '12px',
                        ...radioStyle,
                      }}
                      value={false}
                    >
                      A
                    </Radio.Button>
                  </Radio.Group>
                </div>
                {(remainingTime || estimatedTime) && (
                  <Badge className="poster__time" count={<ClockCircleOutlined style={{ color: PRIMARY_COLOR }} />}>
                    <span className="poster__time__box">
                      {millisecondsToText(remainingTime ? remainingTime : estimatedTime)}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div
            onClick={() => window.open('https://github.com/viconnex/maposaic', '_blank')}
            className="drawer__content__footer"
          >
            <Tooltip title="Source code" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
              <img className="drawer__content__footer__image" width="24px" src={githubMark} alt="github-link" />
            </Tooltip>
          </div>
        </div>
      </div>
    </AntDrawer>
  )
}

export default Drawer
