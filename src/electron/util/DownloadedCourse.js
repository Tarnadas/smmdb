import got from 'got'
import concat from 'concat-stream'

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

  async download (onStart, onProgress, onFinish, courseId, courseName, ownerName, videoId, courseType, modified) {
    this.smmdbId = courseId

    if (!fs.existsSync(path.join(appSavePath, 'downloads'))) {
      fs.mkdirSync(path.join(appSavePath, 'downloads'))
    }

    this.filePath = path.join(appSavePath, `downloads/${courseId}`)

    const req = got.stream.get(resolve(domain, `/api/downloadcourse?id=${courseId}`), {
      useElectronNet: false
    })
    req.on('response', data => {
      onStart(courseId, parseInt(data.headers['content-length']))
    })
    req.on('data', chunk => {
      onProgress(courseId, chunk.length)
    })
    req.pipe(concat(buf => {
      // TODO
      onFinish(this)
    }))

    return this
  }
}
