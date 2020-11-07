import { db } from 'index'
import React, { useEffect, useState } from 'react'

import 'Gallery/style.less'
import Title from 'antd/lib/typography/Title'
import { Button, Divider } from 'antd'
import { PRIMARY_COLOR } from 'constants/colors'

import spinner from 'assets/spinner.png'
import { HomeOutlined } from '@ant-design/icons'
import { Link, useHistory } from 'react-router-dom'

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
  const history = useHistory()

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
        {pictures.map((pic) => {
          return (
            <div onClick={() => window.open(pic.downloadURL)} className="gallery__picture" key={pic.id}>
              <img className="gallery__picture__image" src={pic.downloadURL} />
              <div className="gallery__picture__name">{pic.pictureName || 'no name'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Gallery
