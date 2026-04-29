import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      /** Resize lại cửa sổ chính */
      resizeMainWindow: (width: number, height: number, reset?: boolean) => void

      /** Gửi/nhận IPC thủ công (nếu bạn dùng) */
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void
        on: (channel: string, listener: (...args: any[]) => void) => void
      }
    }

    /** Nếu bạn còn expose cái gì khác (VD: api), thì để thêm ở đây */
    api?: unknown
  }
}
