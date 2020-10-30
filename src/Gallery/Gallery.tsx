import { db } from 'index'
import React, { useEffect, useState } from 'react'

const getSalopette = async (salopetteId: string) => {
  try {
    const doc = await db.collection('salopettes').doc(salopetteId).get()
    return doc.data()?.couleur || ''
  } catch (e) {
    console.log(e)
    return ''
  }
}

const Gallery = () => {
  const trigg = async () => {
    await getSalopette('jean')
  }
  const [color, setColor] = useState('')

  useEffect(() => {
    const setData = async () => {
      const data = await getSalopette('jean')
      setColor(data)
    }
    setData()
  })

  return (
    <div>
      <div>coucou la gallery</div>
      <div>La salopette est {color}</div>
      <button onClick={trigg}>trigg</button>
    </div>
  )
}

export default Gallery
