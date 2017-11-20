import got from 'got'
import concat from 'concat-stream'

import fs from 'fs'
import path from 'path'
import url from 'url'

let appSavePath

export default class DownloadedCourse {
  constructor (path) {
    appSavePath = path
  }

  async download (onStart, onProgress, onFinish, courseId, modified) {
    const self = this
    await new Promise((resolve, reject) => {
      if (!fs.existsSync(path.join(appSavePath, 'downloads'))) {
        fs.mkdirSync(path.join(appSavePath, 'downloads'))
      }

      const req = got.stream.get(url.resolve(process.env.DOMAIN, `/api/downloadcourse?id=${courseId}`), {
        decompress: false,
        useElectronNet: false
      })
      req.on('response', data => {
        onStart(courseId, parseInt(data.headers['content-length']))
      })
      req.on('data', chunk => {
        onProgress(courseId, chunk.length)
      })
      req.on('error', err => {
        if (err.response) {
          console.log(err.response.body)
        } else {
          console.error(err)
        }
        reject(err)
      })
      req.pipe(concat(async buf => {
        self.modified = modified
        const filePath = path.join(appSavePath, `downloads/${courseId}`)
        fs.writeFileSync(filePath, buf)
        onFinish(self, courseId)
        resolve(self)
      }))
    })
  }
}
