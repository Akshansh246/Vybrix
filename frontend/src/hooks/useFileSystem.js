import { useState, useEffect, useCallback } from 'react'
import { ENDPOINTS } from '../config/api.js'

export function useFileSystem(sandboxId) {
  const [files, setFiles] = useState([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(false)
  const [error, setError] = useState(null)

  const fetchFiles = useCallback(async () => {
    if (!sandboxId) return
    setIsLoadingFiles(true)
    setError(null)
    try {
      const res = await fetch(ENDPOINTS.listFiles(sandboxId))
      if (!res.ok) throw new Error(`Failed to list files: ${res.status}`)
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoadingFiles(false)
    }
  }, [sandboxId])

  /**
   * Read a file and return its content string.
   * Callers (e.g. WorkspacePage) are responsible for updating the IDE store.
   */
  const readFile = useCallback(
    async (filePath) => {
      if (!sandboxId) return ''
      try {
        const res = await fetch(ENDPOINTS.readFiles(sandboxId, filePath))
        if (!res.ok) throw new Error(`Failed to read file: ${res.status}`)
        const data = await res.json()
        const result = data.results?.[0]
        if (result) {
          return Object.values(result)[0] ?? ''
        }
        return ''
      } catch (err) {
        setError(err.message)
        return ''
      }
    },
    [sandboxId]
  )

  const updateFile = useCallback(
    async (filePath, content) => {
      if (!sandboxId) return
      try {
        const res = await fetch(ENDPOINTS.updateFiles(sandboxId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: [{ file: filePath, content }] }),
        })
        if (!res.ok) throw new Error(`Failed to update file: ${res.status}`)
        return await res.json()
      } catch (err) {
        setError(err.message)
        throw err
      }
    },
    [sandboxId]
  )

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return {
    files,
    isLoadingFiles,
    error,
    fetchFiles,
    readFile,
    updateFile,
  }
}
