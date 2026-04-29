// src/hooks/useWindowData.ts
import { useEffect, useState } from 'react'

export function useWindowData<T = any>() {
  const [data, setData] = useState<T | null>(null)

  useEffect(() => {
    const keyMatch = window.location.hash.match(/chitiet(\d+)/)
    const key = keyMatch ? `chitiet${keyMatch[1]}` : ''

    const handleData = (_: any, d: T) => {
      setData(d)
      sessionStorage.setItem(key, JSON.stringify(d))
    }

    // Lấy cache hoặc yêu cầu main gửi lại data
    const cached = sessionStorage.getItem(key)
    cached
      ? setData(JSON.parse(cached))
      : key && window.electron.ipcRenderer.send('request-window-data', key)

    window.electron.ipcRenderer.on('window-data', handleData)
    return () => {
      window.electron.ipcRenderer.removeListener('window-data', handleData)
    }
  }, [])

  return data
}
