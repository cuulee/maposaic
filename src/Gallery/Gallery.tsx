import { db } from 'index'
import React, { useEffect, useState } from 'react'

import 'Gallery/style.less'

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

const Gallery = () => {
  const [pictures, setPictures] = useState<Picture[]>([])

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
      {pictures.map((pic) => {
        return (
          <div className="gallery__picture" key={pic.id}>
            <img className="gallery__picture__image" src={pic.downloadURL} />
            <div className="gallery__picture__name">{pic.pictureName || 'no name'}</div>
          </div>
        )
      })}
    </div>
  )
}

export default Gallery
