import { app, protocol, BrowserWindow } from 'electron'
import rimraf from 'rimraf'

import path from 'path'
import fs from 'fs'
import { resolve } from 'url'

(async () => {
  let mainWindow = null
  const appSavePath = path.resolve(`${app.getPath('appData')}/smmdb`)
  if (!fs.existsSync(appSavePath)) {
    fs.mkdirSync(appSavePath)
  }
  global.save = {
    appSavePath
  }
  if (fs.existsSync(path.join(appSavePath, 'save.json'))) {
    const appSaveData = JSON.parse(fs.readFileSync(path.join(appSavePath, 'save.json')))
    if (appSaveData == null || appSaveData.version == null) { // TODO add version control
      await new Promise(resolve => {
        rimraf(appSavePath, err => {
          if (err) {
            console.log(err)
          } else {
            fs.mkdirSync(appSavePath)
          }
          resolve()
        })
      })
    } else {
      global.save.appSaveData = appSaveData
    }
  }

  const onReady = () => {
    protocol.interceptFileProtocol('file', (request, callback) => {
      let url = request.url.substr(7)
      const isStatic = url.includes('styles') || url.includes('img')
      const isUrl = url.includes('courseimg')
      if (url.includes('/img')) {
        url = url.replace('img', 'images')
      }
      const urlPath = isUrl ? (
        resolve(process.env.DOMAIN, url)
      ) : (
        isStatic ? (
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
      )
      callback(urlPath)
    }, err => {
      if (err) console.error('Failed to register protocol')
    })

    require('electron-debug')({showDevTools: true})
    mainWindow = new BrowserWindow({
      width: 2000,
      height: 1500,
      icon: path.join(__dirname, 'build/static/images/icon.png'),
      title: 'Cemu SMMDB'
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
    app.quit()
  })
})()
