import {
  decompress, deserialize, loadCourse
} from 'cemu-smm'
import {
  zip
} from 'cross-unzip'
import tmp from 'tmp'
import fileType from 'file-type'
import randomString from 'crypto-random-string'

import { resolve, join } from 'path'
import * as fs from 'fs'

import {
  pointsPerStar, pointsPerDownload
} from '.'
import Account from './Account'
import Database from './scripts/database'
// import Sorting from './scripts/sorting'

export const courses = {}

const completed = Symbol('completed')
const starred = Symbol('starred')
const downloads = Symbol('downloads')

export default class Course {
  constructor (data) {
    for (let entry in data) {
      this[entry] = data[entry]
    }
    this[completed] = []
    this[starred] = []
    this[downloads] = []
    if (data._id) {
      courses[data._id] = this
    }
  }
  async fix (thumbnail) {
    if (!this.courseData.maker) {
      await this.courseData.setMaker(Account.getAccount(this.owner).username)
    }
    if (!this.courseData.title) {
      await this.courseData.setTitle(this.title)
    }
    if (await this.courseData.isThumbnailBroken()) {
      if (!!thumbnail && fs.existsSync(thumbnail)) {
        await this.courseData.setThumbnail(thumbnail, false)
        await this.courseData.setThumbnail(thumbnail, true)
      } else {
        await this.courseData.setThumbnail(join(__dirname, '../static/images/icon_default.jpg'))
      }
    }
    return this
  }
  static from (data) {
    return new Course(data)
  }
  async finalize () {
    this.maker = this.courseData.maker
    this.gameStyle = this.courseData.gameStyle
    this.courseTheme = this.courseData.courseTheme
    this.courseThemeSub = this.courseData.courseThemeSub
    this.time = this.courseData.time
    this.autoScroll = this.courseData.autoScroll
    this.autoScrollSub = this.courseData.autoScrollSub
    this.width = this.courseData.width
    this.widthSub = this.courseData.widthSub

    let thumbnailPath = join(__dirname, `../static/courseimg/${this._id}.jpg`)
    if (!fs.existsSync(thumbnailPath)) {
      fs.writeFileSync(thumbnailPath, this.courseData.thumbnailPreview)
      fs.writeFileSync(join(__dirname, `../static/courseimg/${this._id}_full.jpg`), this.courseData.thumbnail)
    }
    fs.writeFileSync(join(__dirname, `../static/coursedata/${this._id}`), await this.courseData.serialize())
    fs.writeFileSync(join(__dirname, `../static/coursedata/${this._id}.gz`), await this.courseData.serializeGzipped())
    delete this.courseData
    delete this.serialized
    return this
  }

  static async convertFromMySQL (data) {
    if (!data.downloadpath || !fs.existsSync(data.downloadpath)) {
      console.log('dropped course: ' + data.id)
      return []
    }
    let result = []
    try {
      let courses = await decompress(data.downloadpath)
      if (!courses) {
        throw new Error()
      }

      if (!data.lastmodified) {
        data.lastmodified = data.uploaded
      }
      delete data.id
      delete data.updatereq
      delete data.hasthumbnail
      delete data.coursetype
      delete data.ispackage
      delete data.leveltype
      delete data.hasimage
      delete data.downloadpath

      for (let i in courses) {
        let course = Object.assign({}, data)
        course.serialized = await courses[i].serializeGzipped()
        course.courseData = courses[i]
        result.push(course)
      }
      if (result.length > 1) {
        for (let i in result) {
          result[i].title = result[i].courseData.title
        }
      }
    } catch (err) {
      console.log()
      console.log(err)
      console.log('dropped course: ' + data.id)
      console.log()
    }
    return result
  }

  setId () {
    courses[this._id] = this
  }

  static getCourse (courseId) {
    return courses[courseId]
  }

  static toJSON (loggedIn, accountId) {
    let result = Object.assign({}, this)
    result.id = this._id
    /* result.completed = course[completed].length // TODO
    result.starred = course[starred].length
    result.downloads = course[downloads].length
    if (loggedIn && course.completedByUser(accountId)) {
      result.completedself = 1
    } else {
      result.completedself = 0
    }
    if (loggedIn && course.starredByUser(accountId)) {
      result.starredself = 1
    } else {
      result.starredself = 0
    } */
    result.uploader = Account.getAccount(result.owner).username
    result.reputation = Account.getAccount(result.owner).getPoints()
    delete result._id
    delete result.serialized
    delete result.courseData
    return result
  }

  async getCompressed () {
    const tmpDir = tmp.dirSync({
      unsafeCleanup: true
    })
    const zipDir = join(tmpDir.name, 'course000')
    fs.mkdirSync(zipDir)
    const course = await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${this._id}`)))
    await course.writeToSave(0, zipDir)
    const outPath = join(tmpDir.name, `${this.title.replace(/[^a-z|A-Z|0-9| |\-|!]/g, '')}.zip`)
    try {
      const res = await new Promise((resolve, reject) => {
        zip(zipDir, outPath, err => {
          if (err) reject(err)
          resolve(outPath)
        })
      })
      setTimeout(() => {
        tmpDir.removeCallback()
      }, 20000)
      return res
    } catch (err) {
      tmpDir.removeCallback()
      return null
    }
  }

  async getObject () {
    const res = await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${this._id}`)))
    return res
  }

  getSerialized () {
    return fs.readFileSync(join(__dirname, `../static/coursedata/${this._id}.gz`))
  }

  async get3DS () {
    const res = await (await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${this._id}`)))).to3DS()
    return res
  }

  static async fromBuffer (buffer, account) {
    const tmpFile = resolve(__dirname, randomString(10))
    fs.writeFileSync(tmpFile, buffer)
    const type = fileType(buffer)
    const mime = type && type.mime
    const buf = new Uint8Array(buffer)
    const is3DS = () => {
      const header = [0x04, 0x30, 0x04, 0x00, 0x7D, 0x00, 0x00, 0x00, 0xDD, 0xBA, 0xFE, 0xCA, 0x3B, 0xA0, 0xB2, 0xB8, 0x6E, 0x55, 0x29, 0x8B, 0x00, 0xC0, 0x10, 0x00]
      for (let i = 0; i < header.length; i++) {
        if (header[i] !== buf[i + 4]) {
          return false
        }
      }
      return true
    }
    const createCourse = async (courseData) => {
      const course = new Course(courseData)
      course.owner = account._id
      course.nintendoid = null
      course.videoid = null
      course.difficulty = 1
      course.lastmodified = course.modified
      delete course.modified
      course.uploaded = Math.floor(new Date().getTime() / 1000)
      if (!course.maker) course.maker = account.username
      delete course.tiles
      delete course.tilesSub
      delete course.sounds
      delete course.soundsSub
      delete course.thumbnail
      delete course.thumbnailPreview
      await Database.addCourse(course)
      fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}.jpg`), courseData.thumbnailPreview)
      fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}_full.jpg`), courseData.thumbnail)
      fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}`), await courseData.serialize())
      fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}.gz`), await courseData.serializeGzipped())
      course.setId()
      // Sorting.insertCourse(course)
      return course
    }
    try {
      if (mime === 'application/x-rar-compressed' || mime === 'application/zip' || mime === 'application/x-7z-compressed' || mime === 'application/x-tar') {
        try {
          const courseData = await decompress(tmpFile)
          if (courseData == null) {
            fs.unlinkSync(tmpFile)
            return null
          }
          const courses = []
          for (let i = 0; i < courseData.length; i++) {
            const course = await createCourse(courseData[i])
            courses.push(course)
          }
          fs.unlinkSync(tmpFile)
          return courses
        } catch (err) {
          fs.unlinkSync(tmpFile)
          return null
        }
      } else if (is3DS()) {
        const courseData = await loadCourse(tmpFile, 0, false)
        await courseData.loadThumbnail()
        const course = await createCourse(courseData)
        fs.unlinkSync(tmpFile)
        return [course]
      } else {
        return null
      }
    } catch (err) {
      console.log(err)
      fs.unlinkSync(tmpFile)
      return null
    }
  }

  async reupload (buffer) {
    const tmpFile = resolve(__dirname, randomString(10))
    fs.writeFileSync(tmpFile, buffer)
    const type = fileType(buffer)
    const mime = type && type.mime
    const buf = new Uint8Array(buffer)
    const is3DS = () => {
      const header = [0x04, 0x30, 0x04, 0x00, 0x7D, 0x00, 0x00, 0x00, 0xDD, 0xBA, 0xFE, 0xCA, 0x3B, 0xA0, 0xB2, 0xB8, 0x6E, 0x55, 0x29, 0x8B, 0x00, 0xC0, 0x10, 0x00]
      for (let i = 0; i < header.length; i++) {
        if (header[i] !== buf[i + 4]) {
          return false
        }
      }
      return true
    }
    const doUpdate = async (course, courseData) => {
      if (!(await courseData.isThumbnailBroken())) {
        fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}.jpg`), courseData.thumbnailPreview)
        fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}_full.jpg`), courseData.thumbnail)
        const update = {
          vFull: course.vFull ? course.vFull + 1 : 1,
          vPrev: course.vPrev ? course.vPrev + 1 : 1
        }
        course.vFull = update.vFull
        course.vPrev = update.vPrev
        await Database.updateCourse(course._id, update)
      }
      await courseData.setTitle(course.title)
      await courseData.setMaker(course.maker)
      course.gameStyle = courseData.gameStyle
      course.courseTheme = courseData.courseTheme
      course.courseThemeSub = courseData.courseThemeSub
      course.time = courseData.time
      course.autoScroll = courseData.autoScroll
      course.autoScrollSub = courseData.autoScrollSub
      course.width = courseData.width
      course.widthSub = courseData.widthSub
      course.lastmodified = courseData.modified
      fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}`), await courseData.serialize())
      fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}.gz`), await courseData.serializeGzipped())
    }
    try {
      if (mime === 'application/x-rar-compressed' || mime === 'application/zip' || mime === 'application/x-7z-compressed' || mime === 'application/x-tar') {
        const courseData = await decompress(tmpFile)
        if (!courseData || courseData.length !== 1) return null
        await doUpdate(this, courseData[0])
        fs.unlinkSync(tmpFile)
        return this
      } else if (is3DS()) {
        const courseData = await loadCourse(tmpFile, 0, false)
        await courseData.loadThumbnail()
        await doUpdate(this, courseData)
        fs.unlinkSync(tmpFile)
        return this
      } else {
        return null
      }
    } catch (err) {
      console.log(err)
      fs.unlinkSync(tmpFile)
      return null
    }
  }

  async update ({ title, maker, nintendoid, videoid, difficulty }) {
    const update = {}
    const course = await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${this._id}`)))
    if (title) {
      this.title = title
      update.title = title
      await course.setTitle(title)
    }
    if (maker) {
      this.maker = maker
      update.maker = maker
      await course.setMaker(maker)
    }
    if (nintendoid != null) {
      this.nintendoid = nintendoid
      update.nintendoid = nintendoid
    }
    if (videoid != null) {
      this.videoid = videoid
      update.videoid = videoid
    }
    if (difficulty != null) {
      this.difficulty = difficulty
      update.difficulty = difficulty
    }
    this.lastmodified = Math.trunc((new Date()).getTime() / 1000)
    update.lastmodified = this.lastmodified
    await course.setModified(update.lastmodified)
    this.courseData = course
    fs.writeFileSync(join(__dirname, `../static/coursedata/${this._id}`), await this.courseData.serialize())
    fs.writeFileSync(join(__dirname, `../static/coursedata/${this._id}.gz`), await this.courseData.serializeGzipped())
    await Database.updateCourse(this._id, update)
    return null
  }

  async setThumbnail (buffer, isWide, doClip) {
    const course = await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${this._id}`)))
    const thumbnail = await course.setThumbnail(buffer, isWide, doClip)
    this.courseData = course
    fs.writeFileSync(join(__dirname, `../static/courseimg/${this._id}${isWide ? '_full' : ''}.jpg`), thumbnail)
    fs.writeFileSync(join(__dirname, `../static/coursedata/${this._id}`), await this.courseData.serialize())
    fs.writeFileSync(join(__dirname, `../static/coursedata/${this._id}.gz`), await this.courseData.serializeGzipped())
    let update
    if (isWide) {
      this.vFull = this.vFull ? this.vFull + 1 : 1
      update = {
        vFull: this.vFull
      }
    } else {
      this.vPrev = this.vPrev ? this.vPrev + 1 : 1
      update = {
        vPrev: this.vPrev
      }
    }
    await Database.updateCourse(this._id, update)
    return thumbnail
  }

  async delete () {
    // Sorting.deleteCourse(this._id)
    delete courses[this._id]
    await Database.deleteCourse(this._id)
    fs.unlinkSync(join(__dirname, `../static/courseimg/${this._id}.jpg`))
    fs.unlinkSync(join(__dirname, `../static/courseimg/${this._id}_full.jpg`))
    fs.unlinkSync(join(__dirname, `../static/coursedata/${this._id}`))
    fs.unlinkSync(join(__dirname, `../static/coursedata/${this._id}.gz`))
  }

  static getCourseAmount () {
    return Object.keys(courses).length
  }

  addCompleted (accountId) {
    this[completed].push(accountId)
  }

  removeCompleted (accountId) {
    this[completed].splice(this[completed].indexOf(accountId), 1)
  }

  getCompleted () {
    return this[completed].length
  }

  completedByUser (accountId) {
    return this[completed].includes(accountId)
  }

  addStarred (accountId) {
    this[starred].push(accountId)
  }

  removeStarred (accountId) {
    this[starred].splice(this[starred].indexOf(accountId), 1)
  }

  getStarred () {
    return this[starred].length
  }

  starredByUser (accountId) {
    return this[starred].includes(accountId)
  }

  addDownload (ipAddress) {
    if (!this[downloads].includes(ipAddress)) {
      this[downloads].push(ipAddress)
    }
  }

  getDownloads () {
    return this[downloads].length
  }

  getPoints () {
    return this[downloads].length * pointsPerDownload + this[starred].length * pointsPerStar
  }
}
