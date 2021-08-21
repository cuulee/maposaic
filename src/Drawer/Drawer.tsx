import React, { Suspense, useState } from 'react'
import { Drawer as AntDrawer, Button, InputNumber, Radio, Select, Tooltip } from 'antd'
import Title from 'antd/lib/typography/Title'

import {
  CloseOutlined,
  CloudDownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  InfoCircleOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import { Badge } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

import 'Drawer/drawer.style.less'
import dice from 'assets/dice.svg'
import gps from 'assets/gps.svg'

import ColorConfig from 'Colors/ColorConfigChoice'
import { Format, FORMAT_SIZE, FORMATS } from 'constants/dimensions'
import { PRIMARY_COLOR } from 'constants/colors'
import { DrawerPropsType } from 'Drawer/types'
import { MapboxStyle, MosaicMode } from 'Maposaic/types'
import { MAPBOX_STYLES } from 'Maposaic/constants'
import githubMark from 'assets/GitHub-Mark.png'
import { TOOLTIP_ENTER_DELAY } from 'constants/ux'
import Logo from 'Logo/Logo'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useHistory } from 'react-router-dom'
import { useEffect } from 'react'
import useDebounce from 'hooks/debounce'
import GeoSearch from 'Geo/GeoSearchInput'
import { onFullScreenClick, useIsFullScreen } from 'Maposaic/utils'
import { UploadButton } from 'CloudUpload/UploadButton'
import CloudUpload from 'CloudUpload/CloudUpload'

const millisecondsToText = (millis: number | null) => {
  const min = Math.floor((millis ?? 0) / 60000)
  const ms = (millis ?? 0) % 60000
  const s = Math.floor(ms / 1000)
  const ds = Math.floor((ms % 1000) / 100)
  return `${min > 0 ? `${min}:` : ''}${min && s < 10 ? `0${s}` : s}${min > 0 ? '' : `.${ds}s`}`
}

const radioStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center' }
const DEFAULT_RESOLUTION = '300'

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
  displayLogo,
  setDisplayLogo,
  flyTo,
  currentCenter,
  setRandomCoords,
  onGeolocationClick,
  download,
  isLoading,
  mapZoom,
  mapCenter,
  placeName,
  mosaicMode,
  setMosaicMode,
  getMosaicElementById,
}: DrawerPropsType) => {
  const history = useHistory()
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null)
  const [format, setFormat] = useState<Format>(Format.A4)
  const [pixelPerInchResolution, setPixelPerInchResolution] = useState(parseInt(DEFAULT_RESOLUTION))

  const deboucedRes = useDebounce(pixelPerInchResolution, 600)

  useEffect(() => {
    onPosterSizeChange({
      isLandscape: isLandscape,
      pixelPerInchResolution,
      longerPropertyCMLength: FORMAT_SIZE[format],
    })
    // eslint-disable-next-line
  }, [deboucedRes])

  const handleOrientationChange = (newIsLandscape: boolean) => {
    const newValue = newIsLandscape === isLandscape ? null : newIsLandscape
    setIsLandscape(newValue)
    onPosterSizeChange({
      isLandscape: newValue,
      pixelPerInchResolution,
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
      pixelPerInchResolution,
      longerPropertyCMLength: FORMAT_SIZE[format],
    })
  }

  const { isFullScreen } = useIsFullScreen()

  return (
    <AntDrawer
      visible={visible}
      placement="left"
      onClose={() => setDrawerVisible(false)}
      closable={true}
      width="min(100%,333px)"
      bodyStyle={{ padding: 0 }}
      mask={isMobile}
      forceRender={true}
      closeIcon={<CloseOutlined style={{ color: PRIMARY_COLOR }} />}
    >
      <div className="drawer">
        <div className="drawer__header">
          <div className="drawer__header__title">
            <div className="header__logo" onClick={() => setDrawerVisible(false)}>
              <Logo colorConfig={colorConfig} />
            </div>
          </div>
        </div>
        <div className="drawer__content">
          <div className="drawer__content__cards">
            {mosaicMode === MosaicMode.Map && (
              <div className="drawer_localization">
                <GeoSearch flyTo={flyTo} currentCenter={currentCenter} setDrawerVisible={setDrawerVisible} />
                <Tooltip title="Full screen" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
                  <Button
                    className="action-button"
                    onClick={() => onFullScreenClick(isFullScreen, setDrawerVisible)}
                    shape="circle"
                    icon={isFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  />
                </Tooltip>
                <Tooltip title="Random place" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
                  <Button
                    className="action-button"
                    shape="circle"
                    onClick={() => setRandomCoords({ setZoom: true, fetchFromApi: false })}
                    icon={<img src={dice} width="16px" alt="dice" />}
                  />
                </Tooltip>
                <Button
                  onClick={onGeolocationClick}
                  className="action-button"
                  shape="circle"
                  icon={<img src={gps} width="16px" alt="gps" />}
                />
              </div>
            )}
            <div className="drawer__content__cards__first-card">
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
              {mosaicMode === MosaicMode.Map && (
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
              )}
              <div className="mosaic-mode">
                <Radio.Group onChange={(e) => setMosaicMode(e.target.value)} value={mosaicMode}>
                  <Radio value={MosaicMode.Map}>Map</Radio>
                  <Radio value={MosaicMode.Image}>Image</Radio>
                </Radio.Group>
              </div>
            </div>
            {mosaicMode === MosaicMode.Map && (
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
                      style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}
                      name="preset"
                      value={isLandscape}
                      size="small"
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
                {isLandscape !== null && (
                  <div className="resolution">
                    <div className="resolution__item">Resolution</div>
                    <InputNumber
                      value={pixelPerInchResolution}
                      onChange={(value) =>
                        setPixelPerInchResolution(
                          typeof value === 'number' ? value : parseInt(value ?? DEFAULT_RESOLUTION),
                        )
                      }
                      className="resolution__item"
                    />
                    <div className="resolution__item">ppp</div>
                  </div>
                )}
                <div className="display-logo">
                  <Checkbox checked={displayLogo} onChange={() => setDisplayLogo(!displayLogo)}>
                    Display logo
                  </Checkbox>
                </div>
              </div>
            )}
            <div className="drawer-action">
              <div className="drawer-action__download-upload">
                <Button shape="round" onClick={download} icon={<CloudDownloadOutlined />} disabled={isLoading}>
                  Dowload
                </Button>
                <Suspense fallback={<UploadButton isDisabled={true} />}>
                  <CloudUpload
                    mapZoom={mapZoom}
                    mapCenter={mapCenter}
                    mapboxStyle={mapboxStyle}
                    colorConfig={colorConfig}
                    placeName={placeName}
                    className="overmap__actions__button"
                    isDisabled={isLoading}
                    isLinkButton={true}
                    getMosaicElementById={getMosaicElementById}
                  />
                </Suspense>
              </div>
              <div className="drawer-action__links">
                <Button
                  icon={<PictureOutlined />}
                  shape="round"
                  onClick={() => {
                    history.push('/gallery')
                  }}
                >
                  Vist gallery
                </Button>
              </div>
              <div className="drawer-action__switch"></div>
            </div>
          </div>
          <div className="drawer__content__footer">
            <Tooltip title="Source code" mouseEnterDelay={TOOLTIP_ENTER_DELAY}>
              <img
                onClick={() => window.open('https://github.com/viconnex/maposaic', '_blank')}
                className="footer__source__image"
                src={githubMark}
                alt="github-link"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </AntDrawer>
  )
}

export default Drawer
