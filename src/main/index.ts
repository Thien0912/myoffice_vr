import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 🧱 Danh sách cửa sổ
let mainWindow: BrowserWindow | null = null
const windows: Record<string, BrowserWindow | BrowserWindow[]> = {}
let windowOffset = 0
const windowDataStore: Record<string, any> = {}

/**
 * 🪟 Tạo cửa sổ chính
 */
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    show: false,
    resizable: true,
    autoHideMenuBar: true,
    icon: process.platform === 'linux' ? icon : undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const url =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? process.env['ELECTRON_RENDERER_URL']
      : join(__dirname, '../renderer/index.html')

  is.dev ? mainWindow.loadURL(url!) : mainWindow.loadFile(url)
  mainWindow.on('closed', () => (mainWindow = null))
}

/**
 * 🧩 Mở hoặc focus cửa sổ con / modal
 */
function openOrFocusWindow(
  options: {
    key: string
    route: string
    width?: number
    height?: number
    resizable?: boolean
    allowMultiple?: boolean
    modal?: boolean
    data?: Record<string, unknown>
    stayOnParent?: boolean // mới: nổi trên parent nhưng không khóa
  },
  parent?: BrowserWindow | null
): void {
  const {
    key,
    route,
    width = 800,
    height = 500,
    resizable = true,
    allowMultiple = false,
    modal = false,
    data,
    stayOnParent = false
  } = options

  const existing = windows[key]

  // Check nếu đã có modal/key trùng parent
  if (!allowMultiple) {
    if (Array.isArray(existing)) {
      const existWithSameParent = existing.find(
        (w) => w.getParentWindow() === parent && !w.isDestroyed()
      )
      if (existWithSameParent) {
        existWithSameParent.focus()
        return
      }
    } else if (existing instanceof BrowserWindow && !existing.isDestroyed()) {
      if (existing.getParentWindow() === parent) {
        existing.focus()
        return
      }
    }
  }

  // Vị trí
  const baseBounds = parent?.getBounds() || mainWindow?.getBounds() || { x: 100, y: 100 }
  const x = baseBounds.x + 50 + windowOffset
  const y = baseBounds.y + 50 + windowOffset
  windowOffset = (windowOffset + 20) % 200

  const win = new BrowserWindow({
    parent: stayOnParent && parent ? parent : undefined, // nổi trên parent nhưng không khóa
    modal: modal,
    x,
    y,
    width,
    height,
    resizable,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  const url =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? `${process.env['ELECTRON_RENDERER_URL']}#${route}`
      : join(__dirname, '../renderer/index.html')
  is.dev ? win.loadURL(url) : win.loadFile(url, { hash: route })

  if (data) {
    // Lưu dữ liệu theo key để reload vẫn giữ được
    windowDataStore[key] = data

    win.webContents.once('did-finish-load', () => {
      win.webContents.send('window-data', data)
    })
  }

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
    if (stayOnParent && parent) {
      // Nổi trên parent nhưng không khóa
      win.setAlwaysOnTop(true)
      win.setAlwaysOnTop(false)
    }
  })

  // Lưu window theo key
  if (allowMultiple) {
    if (!Array.isArray(windows[key])) windows[key] = []
    ;(windows[key] as BrowserWindow[]).push(win)
  } else {
    windows[key] = win
  }
  //focus
  win.on('focus', () => {
    win.setAlwaysOnTop(true) // đưa lên top
    win.setAlwaysOnTop(false) // reset để không giữ top mãi
  })

  // Cleanup
  win.on('closed', () => {
    if (Array.isArray(windows[key])) {
      windows[key] = (windows[key] as BrowserWindow[]).filter((w) => w !== win)
      if ((windows[key] as BrowserWindow[]).length === 0) delete windows[key]
    } else {
      delete windows[key]
    }
  })
}

/**
 * 🚀 App lifecycle
 */
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))
  createMainWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

/**
 * 📡 IPC mở cửa sổ mới
 */
ipcMain.on('open-window', (event, payload) => {
  const parentWindow = BrowserWindow.fromWebContents(event.sender)
  openOrFocusWindow(payload, parentWindow)
})

ipcMain.on('request-window-data', (event, key) => {
  if (windowDataStore[key]) {
    event.sender.send('window-data', windowDataStore[key])
  }
})
const originalMainSize = { width: 450, height: 700 }
ipcMain.on('resize-main-window', (_event, { width, height, reset }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return

  // Nếu có tham số reset => trả về kích thước ban đầu
  if (reset) {
    mainWindow.setSize(originalMainSize.width, originalMainSize.height)
    mainWindow.resizable = false
    mainWindow.center()
    return
  } else {
    // Resize bình thường
    mainWindow.setSize(width, height)
    mainWindow.resizable = true
    mainWindow.center()
  }
})
