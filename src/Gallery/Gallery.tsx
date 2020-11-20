import { db } from 'index'
import React, { useEffect, useState } from 'react'

import 'Gallery/style.less'
import Title from 'antd/lib/typography/Title'
import { Divider, Modal } from 'antd'
import { DISABLED_COLOR } from 'constants/colors'

import { Link } from 'react-router-dom'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

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

const Gallery = () => {
  const [pictures, setPictures] = useState<Picture[]>([])
  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)

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
    if (null === displayedIndex) {
      return
    }
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

  return (
    <div className="gallery">
      <Title level={2}>Gallery</Title>
      <Link to="/">from maposaic</Link>
      <Divider />
      <div className="gallery__pictures">
        {pictures.map((pic, index) => {
          return (
            <div
              onClick={() => {
                setDisplayedIndex(index)
                setIsModalVisible(true)
              }}
              className="gallery__picture"
              key={pic.id}
            >
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
            />
            <div className="modal-content__nav">
              <div className="modal-content__name">{displayedName(pictures[displayedIndex])}</div>
            </div>
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
