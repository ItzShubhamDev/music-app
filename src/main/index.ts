import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import YTMusic from 'ytmusic-api'
import ytdl from '@distube/ytdl-core'
import { Readable } from 'stream'
let agent: ytdl.Agent | undefined
import fs from 'fs'
import zlib from 'zlib'

let settings: {
  cookies: ytdl.Cookie[]
  cache: boolean
} = {
  cookies: [],
  cache: true
}

async function loadSettings() {
  try {
    const data = fs.readFileSync('./settings.json')
    settings = JSON.parse(data.toString())
  } catch {
    fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2))
  }
  agent = ytdl.createAgent(settings.cookies)
}

const ytmusic = new YTMusic()
let win: BrowserWindow | null

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 360,
    height: 700,
    minWidth: 360,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', async () => {
    await ytmusic.initialize()
    await loadSettings()
    mainWindow.show()
  })

  win = mainWindow

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('maximized', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('maximized', false)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Functions
  ipcMain.handle('play', async (_, videoId: string) => {
    const cacheFolder = './cache'
    if (!fs.existsSync(cacheFolder) || !fs.statSync(cacheFolder).isDirectory()) {
      fs.mkdirSync(cacheFolder)
    }
    const cachePath = `${cacheFolder}/${videoId}.cache`
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size !== 0) {
      const cached = fs.createReadStream(cachePath)
      const decompressed = cached.pipe(zlib.createBrotliDecompress())
      const buffer = await streamToBuffer(decompressed)
      return buffer
    }
    try {
      const response = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
        filter: 'audioonly',
        quality: 'highestaudio',
        agent,
        playerClients: ['IOS', 'WEB_CREATOR']
      })
      if (settings.cache) {
        const cache = fs.createWriteStream(cachePath)
        const compressed = zlib.createBrotliCompress()
        response.pipe(compressed)
        compressed.pipe(cache)
      }
      const buffer = await streamToBuffer(response)
      return buffer
    } catch (error) {
      console.error('Failed to load audio', error)
      return null
    }
  })

  ipcMain.handle('search', async (_, query: string) => {
    const results = await ytmusic.search(query)
    const songs = results.filter(
      (song) =>
        (song.type == 'SONG' || song.type == 'VIDEO') &&
        song.videoId &&
        song.videoId != '' &&
        song.duration! < 1200
    )
    return songs
  })

  ipcMain.handle('suggest', async (_, query: string) => {
    const results = await ytmusic.getSearchSuggestions(query)
    return results
  })

  ipcMain.handle('thumbnail', async (_, videoId: string) => {
    const cacheFolder = './cache'
    if (!fs.existsSync(cacheFolder) || !fs.statSync(cacheFolder).isDirectory()) {
      fs.mkdirSync(cacheFolder)
    }
    const cachePath = `${cacheFolder}/${videoId}-img.cache`
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size !== 0) {
      const cached = fs.createReadStream(cachePath)
      const decompressed = cached.pipe(zlib.createBrotliDecompress())
      const buffer = await streamToBuffer(decompressed)
      return buffer
    }
    try {
      const info = await ytdl.getBasicInfo(videoId, {
        agent
      })
      const thumbnail = bestThumbnail(info.videoDetails.thumbnails)
      const r = await fetch(thumbnail.url)
      const arrBuffer = await r.arrayBuffer()
      const buffer = Buffer.from(arrBuffer)
      if (settings.cache) {
        const cache = fs.createWriteStream(cachePath)
        const compressed = zlib.createBrotliCompress()
        Readable.from(buffer).pipe(compressed)
        compressed.pipe(cache)
      }
      return buffer
    } catch {
      return null
    }
  })

  ipcMain.handle('getSettings', async () => {
    return settings
  })

  ipcMain.handle('updateSettings', async (_, newSettings: typeof settings) => {
    settings = newSettings
    fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 2))
    return
  })

  ipcMain.on('minimize', () => {
    if (!win) return
    win.minimize()
  })

  ipcMain.on('maximize', () => {
    if (!win) return
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })

  ipcMain.on('close', () => {
    if (!win) return
    win.close()
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

async function streamToBuffer(readableStream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    readableStream.on('data', (data) => {
      if (typeof data === 'string') {
        chunks.push(Buffer.from(data, 'utf-8'))
      } else if (data instanceof Buffer) {
        chunks.push(data)
      } else {
        const jsonData = JSON.stringify(data)
        chunks.push(Buffer.from(jsonData, 'utf-8'))
      }
    })
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
    readableStream.on('error', reject)
  })
}

function bestThumbnail(thumbnails: ytdl.videoInfo['videoDetails']['thumbnails']) {
  return thumbnails.reduce((a, b) => {
    return b.width * b.height > a.width * a.height ? b : a
  })
}
