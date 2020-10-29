import React from 'react'
import { useFirestoreDocData, useFirestore, SuspenseWithPerf } from 'reactfire'

const Gallery = () => {
  const burritoRef = useFirestore().collection('salopettes').doc('nSBJQty7FQxHCNY6rUgw')

  // subscribe to the doc. just one line!
  const burrito = useFirestoreDocData<{ couleur: string }>(burritoRef)

  // get the value from the doc
  const isYummy = burrito.couleur

  return <p>The burrito is {isYummy}</p>
}

export default Gallery
