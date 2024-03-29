import { CompassOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useEffect, useState } from 'react'

import 'PlaceName/placeName.style.less'

const PlaceName = ({
  placeName,
  showPlaceNameTrigger,
  hidePlaceName,
}: {
  placeName: string | null
  showPlaceNameTrigger: number
  hidePlaceName: boolean
}) => {
  const [isTextDisplayed, setIsTextDisplayed] = useState(false)
  useEffect(() => {
    if (!showPlaceNameTrigger || isTextDisplayed) {
      return
    }
    setIsTextDisplayed(true)

    // eslint-disable-next-line
  }, [showPlaceNameTrigger])

  const onCompassClick = () => {
    setIsTextDisplayed(!isTextDisplayed)
  }

  const getAdditionalPlaceNameClass = () => {
    if (!hidePlaceName && isTextDisplayed) {
      return 'place-name--displayed'
    }
    if (hidePlaceName || !showPlaceNameTrigger) {
      return 'place-name--hidden'
    }
    return 'place-name--hidden place-name--hidden--animation'
  }

  return (
    <div className={`place-name ${getAdditionalPlaceNameClass()}`} onClick={onCompassClick}>
      <Button className="show-place-name" shape="circle" onClick={onCompassClick} icon={<CompassOutlined />} />
      <div className="place-name__text">{placeName ?? '...'}</div>
    </div>
  )
}

export default PlaceName
