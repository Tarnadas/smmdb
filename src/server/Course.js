import {
  ObjectID
} from 'mongodb'
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

import Account from './Account'
import Database from './Database'

export default class Course {
  static async getCourse (courseId, accountId) {
    const res = await Database.filterCourses({ _id: ObjectID(courseId) }).toArray()
    if (!res || res.length !== 1) return null
    return Course.prepare(res[0], accountId)
  }

  static async prepare (course, accountId, filter) {
    if (accountId) course.starred = await Database.isCourseStarred(course._id, accountId)
    course.toJSON = Course.toJSON.bind(course, filter)
    return course
  }

  static toJSON (filter) {
    let result = Object.assign({}, this)
    result.id = this._id
    result.uploader = Account.getAccount(result.owner).username
    if (result.stars == null) result.stars = 0
    delete result._id
    delete result.serialized
    delete result.courseData
    delete result.thumbnail
    delete result.thumbnailPreview
    delete result.courseData
    delete result.courseDataGz
    if (filter) {
      for (let i in result) {
        if (!filter.includes(i)) {
          delete result[i]
        }
      }
    }
    return result
  }

  static async getCompressed (courseDB) {
    const tmpDir = tmp.dirSync({
      unsafeCleanup: true
    })
    const zipDir = join(tmpDir.name, 'course000')
    fs.mkdirSync(zipDir)
    const course = await deserialize(courseDB.courseData.buffer)
    await course.writeToSave(0, zipDir)
    const outPath = join(tmpDir.name, `${courseDB.title.replace(/[^a-z|A-Z|0-9| |\-|!]/g, '')}.zip`)
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

  static getObject (course) {
    return deserialize(course.courseData.buffer)
  }

  static async get3DS (course) {
    return (await deserialize(course.courseData.buffer)).to3DS()
  }

  static async fromBuffer (buffer, account) {
    const tmpFile = resolve(__dirname, randomString(10))
    fs.writeFileSync(tmpFile, buffer)
    const type = fileType(buffer)
    const mime = type && type.mime
    const buf = new Uint8Array(buffer)
    const is3DS = () => {
      const header = [0x04, 0x30, 0x04, 0x00, 0x7D, 0x00, 0x00, 0x00, 0xDD, 0xBA, 0xFE, 0xCA]
      for (let i = 0; i < header.length; i++) {
        if (header[i] !== buf[i + 4]) {
          return false
        }
      }
      return true
    }
    const createCourse = async (courseData) => {
      const course = Object.assign({}, courseData)
      course.owner = account._id
      course.nintendoid = null
      course.videoid = null
      course.difficulty = 1
      course.lastmodified = course.modified
      delete course.modified
      course.uploaded = Math.floor(new Date().getTime() / 1000)
      if (!course.maker) {
        const username = account.username.substr(0, 10)
        course.maker = username
        await courseData.setMaker(username)
      }
      delete course.tiles
      delete course.tilesSub
      delete course.sounds
      delete course.soundsSub
      // delete course.thumbnail
      // delete course.thumbnailPreview
      course.courseData = await courseData.serialize()
      course.courseDataGz = await courseData.serializeGzipped()
      await Database.addCourse(course)
      // fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}.jpg`), courseData.thumbnailPreview)
      // fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}_full.jpg`), courseData.thumbnail)
      // fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}`), await courseData.serialize())
      // fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}.gz`), await courseData.serializeGzipped())
      return Course.prepare(course)
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
          return courses
        } catch (err) {
          return null
        } finally {
          fs.unlinkSync(tmpFile)
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

  static async reupload (course, buffer) {
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
      const update = {}
      if (!(await courseData.isThumbnailBroken())) {
        // fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}.jpg`), courseData.thumbnailPreview)
        // fs.writeFileSync(join(__dirname, `../static/courseimg/${course._id}_full.jpg`), courseData.thumbnail)
        update.thumbnail = courseData.thumbnail
        course.thumbnail = update.thumbnail
        update.thumbnailPreview = courseData.thumbnailPreview
        course.thumbnailPreview = update.thumbnailPreview
        update.vFull = course.vFull ? course.vFull + 1 : 1
        update.vPrev = course.vPrev ? course.vPrev + 1 : 1
        course.vFull = update.vFull
        course.vPrev = update.vPrev
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
      course.courseData = await course.serialize()
      update.courseData = course.courseData
      course.courseDataGz = await course.serializeGzipped()
      update.courseDataGz = course.courseDataGz
      // fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}`), await courseData.serialize())
      // fs.writeFileSync(join(__dirname, `../static/coursedata/${course._id}.gz`), await courseData.serializeGzipped())
      await Database.updateCourse(course._id, update)
    }
    try {
      if (mime === 'application/x-rar-compressed' || mime === 'application/zip' || mime === 'application/x-7z-compressed' || mime === 'application/x-tar') {
        const courseData = await decompress(tmpFile)
        if (!courseData || courseData.length !== 1) return null
        await doUpdate(course, courseData[0])
        fs.unlinkSync(tmpFile)
        return course
      } else if (is3DS()) {
        const courseData = await loadCourse(tmpFile, 0, false)
        await courseData.loadThumbnail()
        await doUpdate(course, courseData)
        fs.unlinkSync(tmpFile)
        return course
      } else {
        return null
      }
    } catch (err) {
      console.log(err)
      fs.unlinkSync(tmpFile)
      return null
    }
  }

  static async update (courseDB, { title, maker, nintendoid, videoid, difficulty }) {
    const update = {}
    // const course = await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${courseDB._id}`)))
    const course = await deserialize(courseDB.courseData.buffer)
    if (title) {
      update.title = title
      courseDB.title = title
      await course.setTitle(title)
    }
    if (maker) {
      update.maker = maker
      courseDB.maker = maker
      await course.setMaker(maker)
    }
    if (nintendoid != null) {
      update.nintendoid = nintendoid
      courseDB.nintendoid = nintendoid
    }
    if (videoid != null) {
      update.videoid = videoid
      courseDB.videoid = videoid
    }
    if (difficulty != null) {
      update.difficulty = difficulty
      courseDB.difficulty = difficulty
    }
    update.lastmodified = Math.trunc((new Date()).getTime() / 1000)
    courseDB.lastmodified = update.lastmodified
    await course.setModified(update.lastmodified)
    courseDB.courseData = await course.serialize()
    update.courseData = courseDB.courseData
    courseDB.courseDataGz = await course.serializeGzipped()
    update.courseDataGz = courseDB.courseDataGz
    // fs.writeFileSync(join(__dirname, `../static/coursedata/${courseDB._id}`), await course.serialize())
    // fs.writeFileSync(join(__dirname, `../static/coursedata/${courseDB._id}.gz`), await course.serializeGzipped())
    await Database.updateCourse(courseDB._id, update)
  }

  static async setThumbnail (courseDB, buffer, isWide, doClip) {
    // const course = await deserialize(fs.readFileSync(join(__dirname, `../static/coursedata/${courseDB._id}`)))
    const course = await deserialize(courseDB.courseData.buffer)
    const thumbnail = await course.setThumbnail(buffer, isWide, doClip)
    // fs.writeFileSync(join(__dirname, `../static/courseimg/${courseDB._id}${isWide ? '_full' : ''}.jpg`), thumbnail)
    // fs.writeFileSync(join(__dirname, `../static/coursedata/${courseDB._id}`), await course.serialize())
    // fs.writeFileSync(join(__dirname, `../static/coursedata/${courseDB._id}.gz`), await course.serializeGzipped())
    let update
    if (isWide) {
      courseDB.vFull = courseDB.vFull ? courseDB.vFull + 1 : 1
      update = {
        vFull: courseDB.vFull,
        thumbnail
      }
    } else {
      courseDB.vPrev = courseDB.vPrev ? courseDB.vPrev + 1 : 1
      update = {
        vPrev: courseDB.vPrev,
        thumbnailPreview: thumbnail
      }
    }
    courseDB.courseData = await course.serialize()
    update.courseData = courseDB.courseData
    courseDB.courseDataGz = await course.serializeGzipped()
    update.courseDataGz = courseDB.courseDataGz
    await Database.updateCourse(courseDB._id, update)
    return thumbnail
  }

  static async delete (courseId) {
    await Database.deleteCourse(courseId)
    /* try {
      fs.unlinkSync(join(__dirname, `../static/courseimg/${courseId}.jpg`))
      fs.unlinkSync(join(__dirname, `../static/courseimg/${courseId}_full.jpg`))
      fs.unlinkSync(join(__dirname, `../static/coursedata/${courseId}`))
      fs.unlinkSync(join(__dirname, `../static/coursedata/${courseId}.gz`))
    } catch (err) {} */
  }

  static async star (course, accountId) {
    if (await Database.isCourseStarred(course._id, accountId)) {
      await Database.unstarCourse(course._id, accountId)
      course.stars--
      course.starred = 0
    } else {
      await Database.starCourse(course._id, accountId)
      if (course.stars != null) {
        course.stars++
      } else {
        course.stars = 1
      }
      course.starred = 1
    }
  }

  static getCourseAmount () {
    return Database.getCoursesCount()
  }
}
