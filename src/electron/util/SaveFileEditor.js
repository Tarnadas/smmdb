import DownloadedCourse from './DownloadedCourse'
import { deserialize } from 'cemu-smm'
import got from 'got'

import fs from 'fs'
import path from 'path'
import { resolve } from 'url'
import { stringify } from 'querystring'

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

  async deleteSelected (onFinish, cemuSave, selected, save) {
    const smmdbIds = []
    const courseIds = []
    selected = selected.toJS()
    for (let i in selected) {
      if (!selected[i]) continue
      try {
        const smmdbId = save.getIn([String(i), 'smmdbId'])
        await cemuSave.deleteCourse(parseInt(i))
        smmdbIds.push(smmdbId)
        courseIds.push(i)
      } catch (err) {}
    }
    onFinish(courseIds, smmdbIds, true)
  }

  async fillSave (onDownload, onAdd, cemuSave, onProgress, filter, order, downloads, smmdb, random = false) {
    const queryString = stringify(Object.assign({}, filter.toJS(), {
      order: order.get('order'),
      dir: order.get('dir') ? 'asc' : 'desc'
    }))
    let limit = 120 - Object.keys(cemuSave.courses).length
    try {
      if (limit <= 0) return
      let progress = 0
      const courses = (await got(resolve(process.env.DOMAIN, `/api/getcourses?limit=${limit}&random=${random ? '1' : '0'}&filter=id,lastmodified&${queryString}`), {
        json: true,
        useElectronNet: false
      })).body
      if (courses.length < limit) limit = courses.length
      downloads = downloads.toJS()
      smmdb = smmdb.toJS()
      for (let i in courses) {
        const course = courses[i]
        try {
          if (!Object.keys(downloads).includes(course.id)) {
            await this.downloadCourse(onDownload.onStart, onDownload.onProgress, onDownload.onFinish, course.id, course.lastmodified)
          }
          if (!Object.keys(smmdb).includes(course.id)) {
            await this.addCourse(onAdd.onAddFinish, cemuSave, course.id)
          }
        } catch (err) {
          console.log(err)
        }
        onProgress(++progress, limit)
      }
    } catch (err) {
    } finally {
      onProgress(limit, limit)
    }
  }
}
