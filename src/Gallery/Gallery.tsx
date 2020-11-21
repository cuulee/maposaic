import { db } from 'index'
import React, { useEffect, useState } from 'react'

import 'Gallery/style.less'
import Title from 'antd/lib/typography/Title'
import { Divider, Modal, Spin } from 'antd'
import { DISABLED_COLOR } from 'constants/colors'

import { Link } from 'react-router-dom'
import { LeftOutlined, LoadingOutlined, RightOutlined } from '@ant-design/icons'

type ApiPicture = {
  pictureName?: string
  filePath?: string
  downloadURL?: string
  placeName?: string | null
  thumbnailDownloadURL?: string
}

type Picture = {
  id: string
  pictureName: string | undefined
  placeName: string | undefined | null
  downloadURL: string
  thumbnailDownloadURL?: string
}

const displayedName = (picture: Picture): string => {
  return picture.pictureName ?? picture.placeName ?? 'no name'
}
let xDown: null | number = null
let yDown: null | number = null

const Gallery = () => {
  const [pictures, setPictures] = useState<Picture[]>([])
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isModalPictureLoaded, setIsModalPictureLoaded] = useState(false)

  const fetchData = async () => {
    try {
      const snapshot = await db.collection('pictures').orderBy('timestamp', 'desc').get()
      const newPictures: Picture[] = []
      snapshot.forEach((doc) => {
        const apiPicture = doc.data() as ApiPicture
        if (!apiPicture.downloadURL) {
          return
        }
        const pic = {
          id: doc.id,
          pictureName: apiPicture.pictureName,
          downloadURL: apiPicture.downloadURL,
          placeName: apiPicture.placeName,
          thumbnailDownloadURL: apiPicture.thumbnailDownloadURL,
        }
        newPictures.push(pic)
      })
      setPictures(newPictures)
    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const incrementPictureIndex = (increment: -1 | 1) => {
    if (
      null === displayedIndex ||
      (increment < 0 && displayedIndex === 0) ||
      (increment > 0 && displayedIndex === pictures.length - 1)
    ) {
      return
    }
    setIsModalPictureLoaded(false)
    setDisplayedIndex(Math.min(Math.max(0, displayedIndex + increment), pictures.length - 1))
  }

  const onKeyDown = ({ key }: { key: string }) => {
    if (key === 'ArrowLeft') {
      incrementPictureIndex(-1)
    } else if (key === 'ArrowRight') {
      incrementPictureIndex(1)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const onThumbnailClick = (index: number) => {
    if (index !== displayedIndex) {
      setIsModalPictureLoaded(false)
    }
    setDisplayedIndex(index)
    setIsModalVisible(true)
  }
  useEffect(() => {
    if (!isModalVisible) {
      return
    }
    document.addEventListener('touchstart', handleTouchStart, false)
    document.addEventListener('touchmove', handleTouchMove, false)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
    }
    // eslint-disable-next-line
  }, [isModalVisible, displayedIndex, pictures])

  function handleTouchStart(evt: TouchEvent) {
    const firstTouch = evt.touches[0]
    xDown = firstTouch.clientX
    yDown = firstTouch.clientY
  }

  function handleTouchMove(evt: TouchEvent) {
    if (!xDown || !yDown) {
      return
    }
    var xUp = evt.touches[0].clientX
    var yUp = evt.touches[0].clientY

    var xDiff = xDown - xUp
    var yDiff = yDown - yUp

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        incrementPictureIndex(1)
      } else {
        incrementPictureIndex(-1)
      }
    } else {
      setIsModalVisible(false)
    }
    xDown = null
    yDown = null
  }

  return (
    <div className="gallery">
      <Title level={2}>Gallery</Title>
      <Link to="/">from maposaic</Link>
      <Divider />
      <div className="gallery__pictures">
        {pictures.map((pic, index) => {
          return (
            <div onClick={() => onThumbnailClick(index)} className="gallery__picture" key={pic.id}>
              <img
                className="gallery__picture__image"
                alt={`pic-${displayedName(pic)}`}
                src={pic.thumbnailDownloadURL ?? pic.downloadURL}
              />
              <div className="gallery__picture__name">{displayedName(pic)}</div>
            </div>
          )
        })}
      </div>
      <Modal
        closable={false}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        footer={null}
        style={{ maxWidth: '90vw', paddingBottom: '0', top: 0 }}
        width="fit-content"
      >
        {displayedIndex !== null && pictures.length > displayedIndex && displayedIndex >= 0 && (
          <div className="modal-content">
            <img
              className="modal-content__picture"
              alt={`pic-${displayedName(pictures[displayedIndex])}`}
              src={pictures[displayedIndex].downloadURL}
              onLoad={() => setIsModalPictureLoaded(true)}
            />
            <div className="modal-content__nav">
              <div className="modal-content__name">
                {isModalPictureLoaded ? displayedName(pictures[displayedIndex]) : '...'}
              </div>
            </div>
            {!isModalPictureLoaded && (
              <Spin
                className="modal-content__loader"
                indicator={<LoadingOutlined style={{ fontSize: '24px', color: 'white' }} />}
              />
            )}
          </div>
        )}
      </Modal>
      {isModalVisible && displayedIndex && displayedIndex > 0 && (
        <LeftOutlined
          className="gallery__arrow gallery__arrow--left"
          style={{ fontSize: '28px', color: DISABLED_COLOR }}
          onClick={() => incrementPictureIndex(-1)}
        />
      )}
      {isModalVisible && displayedIndex !== null && displayedIndex + 1 < pictures.length && (
        <RightOutlined
          className="gallery__arrow gallery__arrow--right"
          style={{ fontSize: '28px', color: DISABLED_COLOR }}
          onClick={() => incrementPictureIndex(1)}
        />
      )}
    </div>
  )
}

export default Gallery
