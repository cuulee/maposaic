import { db } from 'index'
import React, { useEffect, useState } from 'react'

import 'Gallery/style.less'
import Title from 'antd/lib/typography/Title'
import { Divider, Modal } from 'antd'

import { Link } from 'react-router-dom'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

type ApiPicture = {
  pictureName?: string
  filePath?: string
  downloadURL?: string
}

type Picture = {
  id: string
  pictureName?: string
  downloadURL: string
}

const displayedName = (name: string | undefined): string => {
  return name || 'no name'
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
                alt={`pic-${displayedName(pic.pictureName)}`}
                src={pic.downloadURL}
              />
              <div className="gallery__picture__name">{displayedName(pic.pictureName)}</div>
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
              alt={`pic-${displayedName(pictures[displayedIndex].pictureName)}`}
              src={pictures[displayedIndex].downloadURL}
            />
            <div className="modal-content__nav">
              <LeftOutlined
                onClick={() => (displayedIndex ? setDisplayedIndex(displayedIndex - 1) : setDisplayedIndex(0))}
              />
              <div className="modal-content__name">{displayedName(pictures[displayedIndex].pictureName)}</div>
              <RightOutlined
                onClick={() =>
                  displayedIndex !== null && displayedIndex + 1 < pictures.length
                    ? setDisplayedIndex(displayedIndex + 1)
                    : setDisplayedIndex(0)
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Gallery
