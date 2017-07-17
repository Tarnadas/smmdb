import DownloadedCourse from './DownloadedCourse'
import {
  deserialize
} from 'cemu-smm'

import * as fs from 'fs'
import * as path from 'path'

export default class SaveFileEditor {
  constructor (appSavePath, downloadedCourses) {
    this.appSavePath = appSavePath
    this.downloadedCourses = typeof (downloadedCourses) === 'object' ? downloadedCourses : {}
  }

  setCemuSave (cemuSave) {
    this.cemuSave = cemuSave
  }

  async downloadCourse (onStart, onProgress, onFinish, smmdbId, modified) {
    try {
      this.downloadedCourses[smmdbId] = await (new DownloadedCourse(this.appSavePath)).download(onStart, onProgress, onFinish, smmdbId, modified)
    } catch (err) {
      throw err
    }
  }

  async addCourse (onFinish, smmdbId) {
    let success = false
    let saveId = -1
    try {
      const filePath = path.join(this.appSavePath, `downloads/${smmdbId}`)
      const course = await deserialize(fs.readFileSync(filePath))
      saveId = await this.cemuSave.addCourse(course)
      if (saveId === -1) {
        throw new Error()
      }
      await this.cemuSave.courses[`course${(saveId + '').padStart(3, '000')}`].exportThumbnail()
      success = true
    } catch (err) {
      success = false
    }
    onFinish(this.cemuSave, smmdbId, saveId, success)
  }

  async deleteCourse (onFinish, smmdbId, saveId) {
    let success = false
    try {
      await this.cemuSave.deleteCourse(saveId)
      success = true
    } catch (err) {
      console.log(err)
    }
    onFinish(this.cemuSave, smmdbId, saveId, success)
  }
}
