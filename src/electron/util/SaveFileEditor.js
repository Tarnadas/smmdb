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

  async downloadCourse (onStart, onProgress, onFinish, smmdbId, modified) {
    try {
      this.downloadedCourses[smmdbId] = await (new DownloadedCourse(this.appSavePath)).download(onStart, onProgress, onFinish, smmdbId, modified)
    } catch (err) {
      throw err
    }
  }

  async addCourse (onFinish, cemuSave, smmdbId) {
    let success = false
    let courseId = -1
    try {
      const filePath = path.join(this.appSavePath, `downloads/${smmdbId}`)
      const course = await deserialize(fs.readFileSync(filePath))
      courseId = await cemuSave.addCourse(course)
      if (courseId === -1) {
        throw new Error()
      }
      await cemuSave.courses[`course${String(courseId).padStart(3, '000')}`].exportThumbnail()
      success = true
    } catch (err) {
      success = false
    }
    onFinish(smmdbId, courseId, success)
  }

  async updateCourse (deleteObj, download, add) {
    if (deleteObj) await this.deleteCourse(...deleteObj)
    await this.downloadCourse(...download)
    if (add) await this.addCourse(...add)
  }

  async deleteCourse (onFinish, cemuSave, smmdbId, courseId) {
    let success = false
    try {
      await cemuSave.deleteCourse(courseId)
      success = true
    } catch (err) {
      console.error(err)
    }
    onFinish(smmdbId, courseId, success)
  }
}
