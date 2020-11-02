import { Input } from 'antd'
import { db } from 'index'
import React, { useEffect, useState } from 'react'
import firebase from 'firebase/app'

import 'Gallery/style.less'

type Picture = {
  email: string
  name: string
  id: string
}

const Gallery = () => {
  const [email, setEmail] = useState('')
  const [pictureName, setPictureName] = useState('')
  const [pictures, setPictures] = useState<Picture[]>([])
  const submit = async () => {
    await db
      .collection('pictures')
      .add({ email, name: pictureName, timestamp: firebase.firestore.FieldValue.serverTimestamp() })
  }

  const fetchData = async () => {
    try {
      const snapshot = await db.collection('pictures').orderBy('timestamp', 'desc').get()
      const newPictures: Picture[] = []
      snapshot.forEach((doc) => {
        console.log('snap', doc.id)
        const pic = {
          id: doc.id,
          ...doc.data(),
        } as Picture
        newPictures.push(pic)
      })
      setPictures(newPictures)
    } catch (e) {
      console.log(e)
      return ''
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="gallery">
      <div>coucou la gallery</div>
      <Input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="image name" value={pictureName} onChange={(e) => setPictureName(e.target.value)} />
      <button onClick={submit}>Submit</button>
      <button onClick={fetchData}>Fetch</button>
      <div>Pictures saved</div>
      {pictures.map((pic) => {
        return (
          <div className="gallery__picture" key={pic.id}>
            <div className="gallery__picture__prop">
              <div>id : </div>
              <div>{pic.id}</div>
            </div>
            <div className="gallery__picture__prop">
              <div>email : </div>
              <div>{pic.email}</div>
            </div>
            <div className="gallery__picture__prop">
              <div>name : </div>
              <div>{pic.name}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Gallery
