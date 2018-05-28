import DownloadedCourse from './DownloadedCourse'
import { deserialize } from 'cemu-smm'

import * as fs from 'fs'
import * as path from 'path'
import { resolve } from 'url'
import { stringify } from 'querystring'

export class SaveFileEditor {
  public appSavePath: string

  public downloadedCourses: any

  constructor (appSavePath: any, downloadedCourses: any) {
    this.appSavePath = appSavePath
    this.downloadedCourses = typeof (downloadedCourses) === 'object' ? downloadedCourses : {}
  }

  async downloadCourse (onStart?: any, onProgress?: any, onFinish?: any, smmdbId?: any, modified?: any) {
    try {
      this.downloadedCourses[smmdbId] = await (new DownloadedCourse(this.appSavePath)).download(onStart, onProgress, onFinish, smmdbId, modified)
    } catch (err) {
      throw err
    }
  }

  async addCourse (onFinish?: any, cemuSave?: any, smmdbId?: any) {
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

  async updateCourse (deleteObj: any, download: any, add: any) {
    if (deleteObj) await this.deleteCourse(...deleteObj)
    await this.downloadCourse(...download)
    if (add) await this.addCourse(...add)
  }

  async deleteCourse (onFinish?: any, cemuSave?: any, smmdbId?: any, courseId?: any) {
    let success = false
    try {
      await cemuSave.deleteCourse(courseId)
      success = true
    } catch (err) {
      console.error(err)
    }
    onFinish(smmdbId, courseId, success)
  }

  async deleteSelected (onFinish: any, cemuSave: any, selected: any, save: any) {
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

  async fillSave (onDownload: any, onAdd: any, cemuSave: any, onProgress: any, filter: any, order: any, downloads: any, smmdb: any, random = false) {
    const queryString = stringify(Object.assign({}, filter.toJS(), {
      order: order.get('order'),
      dir: order.get('dir') ? 'asc' : 'desc'
    }))
    let limit = 120 - Object.keys(cemuSave.courses).length
    try {
      if (limit <= 0) return
      let progress = 0
      const response = await fetch(resolve(process.env.DOMAIN!, `/api/getcourses?limit=${limit}&random=${random ? '1' : '0'}&filter=id,lastmodified&${queryString}`))
      if (!response.ok) throw new Error(response.statusText)
      const courses = await response.json()
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
