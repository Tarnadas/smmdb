import got from 'got'
import concat from 'concat-stream'
import {
  deserialize
} from 'cemu-smm'

import * as fs from 'fs'
import * as path from 'path'
import { resolve } from 'url'

import {
  domain
} from '../../static'

let appSavePath

export default class DownloadedCourse {
  constructor (path) {
    appSavePath = path
  }

  async download (onStart, onProgress, onFinish, courseId, modified) {
    if (!fs.existsSync(path.join(appSavePath, 'downloads'))) {
      fs.mkdirSync(path.join(appSavePath, 'downloads'))
    }

    const req = got.stream.get(resolve(domain, `/api/downloadcourse?id=${courseId}`), {
      decompress: false,
      useElectronNet: false
    })
    req.on('response', data => {
      onStart(courseId, parseInt(data.headers['content-length']))
    })
    req.on('data', chunk => {
      onProgress(courseId, chunk.length)
    })
    req.pipe(concat(async buf => {
      // const course = await deserialize(buf)
      // console.log(course)
      this.modified = modified
      const filePath = path.join(appSavePath, `downloads/${courseId}`)
      fs.writeFileSync(filePath, buf)
      onFinish(this, courseId)
    }))

    return this
  }
}
