export const createPersistentDownloadUrl = (bucket: string, pathToFile: string, downloadToken: string) => {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
    pathToFile,
  )}?alt=media&token=${downloadToken}`
}
