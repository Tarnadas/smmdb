import {
  ObjectID
} from 'mongodb'
import jimp from 'jimp'

import Account from './Account'
import Database from './Database'

export default class Course64 {
  static async getCourse (courseId, accountId) {
    const res = await Database.filterCourses64({ _id: ObjectID(courseId) }).toArray()
    if (!res || res.length !== 1) return null
    return Course64.prepare(res[0], accountId)
  }

  static async prepare (course, accountId, filter) {
    if (accountId) course.starred = await Database.isCourse64Starred(course._id, accountId)
    course.uploader = (await Account.getAccountByAccountId(course.owner)).username
    course.toJSON = Course64.toJSON.bind(course, filter)
    return course
  }

  static toJSON (filter) {
    let result = Object.assign({}, this)
    result.id = this._id
    if (result.stars == null) result.stars = 0
    delete result._id
    delete result.data
    delete result.image
    if (filter) {
      for (let i in result) {
        if (!filter.includes(i)) {
          delete result[i]
        }
      }
    }
    return result
  }

  static fromBuffer (name, buffer, account) {
    const time = Math.floor(new Date().getTime() / 1000)
    const course = {
      title: name,
      owner: account._id,
      difficulty: 1,
      videoid: '',
      lastmodified: time,
      uploaded: time,
      courseTheme: 0,
      data: buffer
    }
    Database.addCourse64(course)
    return Course64.prepare(course, account._id)
  }

  static reupload (course, buffer, accountId) {
    const time = Math.floor(new Date().getTime() / 1000)
    const update = {
      data: buffer,
      lastmodified: time
    }
    course.data = buffer
    course.lastmodified = time
    Database.updateCourse64(course._id, update)
    return Course64.prepare(course, accountId)
  }

  static async update (courseDB, { title, videoid, difficulty, stars, theme }) {
    const update = {}
    if (title) {
      update.title = title
      courseDB.title = title
    }
    if (videoid != null) {
      update.videoid = videoid
      courseDB.videoid = videoid
    }
    if (difficulty != null) {
      update.difficulty = difficulty
      courseDB.difficulty = difficulty
    }
    if (stars != null) {
      update.courseStars = stars
      courseDB.courseStars = stars
    }
    if (theme != null) {
      update.theme = theme
      courseDB.theme = theme
    }
    update.lastmodified = Math.trunc((new Date()).getTime() / 1000)
    courseDB.lastmodified = update.lastmodified
    await Database.updateCourse64(courseDB._id, update)
  }

  static async setThumbnail (course, buffer) {
    try {
      const image = await jimp.read(buffer)
      image.autocrop()
      image.cover(400, 225)
      course.image = await new Promise((resolve, reject) => {
        image.quality(95)
        image.getBuffer(jimp.MIME_JPEG, (err, buffer) => {
          if (err) reject(err)
          resolve(buffer)
        })
      })
      course.vImg = course.vImg ? course.vImg + 1 : 1
      course.lastmodified = Math.trunc((new Date()).getTime() / 1000)
      const update = {
        image: course.image,
        vImg: course.vImg,
        lastmodified: course.lastmodified
      }
      await Database.updateCourse64(course._id, update)
      return course.image
    } catch (err) {
      console.error(err)
      return null
    }
  }

  static delete (courseId) {
    return Database.deleteCourse64(courseId)
  }

  static async star (course, accountId) {
    if (await Database.isCourse64Starred(course._id, accountId)) {
      await Database.unstarCourse64(course._id, accountId)
      course.stars--
      course.starred = 0
    } else {
      await Database.starCourse64(course._id, accountId)
      if (course.stars != null) {
        course.stars++
      } else {
        course.stars = 1
      }
      course.starred = 1
    }
  }

  static getCourseAmount () {
    return Database.getCourses64Count()
  }
}
