import electron from 'electron'

import * as path from 'path'
import * as fs from 'fs'
// import { resolve } from 'url'

const app = electron.app
const protocol = electron.protocol
const BrowserWindow = electron.BrowserWindow;

(async () => {
  let mainWindow = null
  const appSavePath = path.resolve(`${app.getPath('appData')}/cemu-smmdb`)
  if (!fs.existsSync(appSavePath)) {
    fs.mkdirSync(appSavePath)
  }
  global.save = {
    appSavePath
  }
  if (fs.existsSync(path.join(appSavePath, 'save.json'))) {
    global.save.appSaveData = JSON.parse(fs.readFileSync(path.join(appSavePath, 'save.json')))
  }

  const onReady = () => {
    protocol.interceptFileProtocol('file', (request, callback) => {
      let url = request.url.substr(7)
      const isStatic = url.includes('styles') || url.includes('img') || url.includes('courseimg')
      if (url.includes('/img')) {
        url = url.replace('img', 'images')
      }
      const urlPath = isStatic ? (
        path.normalize(`${__dirname}/../static/${url}`)
      ) : (
        url.length === 1 ? path.normalize(`${__dirname}/index.html`)
          : (
            url.includes(':') ? (
              url.substr(1)
            ) : (
              path.normalize(`${__dirname}/${url}`)
            )
          )
      )
      callback(urlPath)
    }, err => {
      if (err) console.error('Failed to register protocol')
    })

    require('electron-debug')({showDevTools: true})
    mainWindow = new BrowserWindow({
      width: 1500,
      height: 800,
      icon: path.join(__dirname, 'build/static/images/icon.png')
    })

    mainWindow.loadURL('file://')

    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', onReady)

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    onReady()
  })

  app.on('uncaughtException', (err) => {
    fs.writeFileSync('./error_log.txt', err)
  })
})()
