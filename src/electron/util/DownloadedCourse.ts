import { stream } from 'got'
const concat = require('concat-stream')

import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'

let appSavePath: string

export default class DownloadedCourse {
  constructor (path: string) {
    appSavePath = path
  }

  async download (onStart: any, onProgress: any, onFinish: any, courseId: any, modified: any) {
    const self = this
    await new Promise((resolve, reject) => {
      if (!fs.existsSync(path.join(appSavePath, 'downloads'))) {
        fs.mkdirSync(path.join(appSavePath, 'downloads'))
      }

      const req = stream.get(url.resolve(process.env.DOMAIN!, `/api/downloadcourse?id=${courseId}`), {
        decompress: false,
        useElectronNet: false
      })
      req.on('response', (data: any) => {
        onStart(courseId, parseInt(data.headers['content-length']))
      })
      req.on('data', (chunk: any) => {
        onProgress(courseId, chunk.length)
      })
      req.on('error', (err: any) => {
        if (err.response) {
          console.log(err.response.body)
        } else {
          console.error(err)
        }
        reject(err)
      })
      req.pipe(concat(async (buf: any) => {
        (self as any).modified = modified
        const filePath = path.join(appSavePath, `downloads/${courseId}`)
        fs.writeFileSync(filePath, buf)
        onFinish(self, courseId)
        resolve(self)
      }))
    })
  }
}
