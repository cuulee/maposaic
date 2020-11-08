import { db } from 'index'
import React, { useEffect, useState } from 'react'

import 'Gallery/style.less'
import Title from 'antd/lib/typography/Title'
import { Divider, Modal } from 'antd'

import { Link } from 'react-router-dom'

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
            <div onClick={() => setDisplayedIndex(index)} className="gallery__picture" key={pic.id}>
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
        visible={displayedIndex !== null}
        onCancel={() => setDisplayedIndex(null)}
        bodyStyle={{ height: '68vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {displayedIndex !== null && pictures.length > displayedIndex && displayedIndex >= 0 && (
          <img
            className="modal__picture"
            alt={`pic-${displayedName(pictures[displayedIndex].pictureName)}`}
            src={pictures[displayedIndex].downloadURL}
          />
        )}
      </Modal>
    </div>
  )
}

export default Gallery
