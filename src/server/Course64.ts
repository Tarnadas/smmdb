import { ObjectID } from 'mongodb'
import * as jimp from 'jimp'

import { Account } from './Account'
import { Database } from './Database'

export class Course64 {
  public static async getCourse (courseId: string, accountId?: string): Promise<any> {
    const res = await Database.filterCourses64({ _id: new ObjectID(courseId) }).toArray()
    if (!res || res.length !== 1) return null
    return Course64.prepare(res[0], accountId)
  }

  public static async prepare (course: any, accountId?: string, filter?: any): Promise<any> {
    if (accountId) course.starred = await Database.isCourse64Starred(course._id, accountId)
    course.uploader = (await Account.getAccountByAccountId(course.owner)).username
    course.toJSON = Course64.toJSON.bind(course, filter)
    return course
  }

  private static toJSON (filter: any): any {
    let result: any = Object.assign({}, this)
    result.id = (this as any)._id
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

  public static fromBuffer (name: string, buffer: any, account: any): any {
    try {
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
    } catch (err) {
      return {
        code: 500,
        err: `An internal server error occurred:\n\n${err}\n\nPlease report this error to the webmaster.`
      }
    }
  }

  public static reupload (course: any, buffer: any, accountId: string): any {
    try {
      const time = Math.floor(new Date().getTime() / 1000)
      const update = {
        data: buffer,
        lastmodified: time
      }
      course.data = buffer
      course.lastmodified = time
      Database.updateCourse64(course._id, update)
      return Course64.prepare(course, accountId)
    } catch (err) {
      return {
        code: 500,
        err: `An internal server error occurred:\n\n${err}\n\nPlease report this error to the webmaster.`
      }
    }
  }

  public static async update (courseDB: any, { title, videoid, difficulty, stars, theme, description }: any): Promise<any> {
    const update: any = {}
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
    if (description != null) {
      update.description = description
      courseDB.description = description
    }
    update.lastmodified = Math.trunc((new Date()).getTime() / 1000)
    courseDB.lastmodified = update.lastmodified
    await Database.updateCourse64(courseDB._id, update)
  }

  public static async setThumbnail (course: any, buffer: any): Promise<any> {
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
      return {
        code: 500,
        err: `An internal server error occurred:\n\n${err}\n\nPlease report this error to the webmaster.`
      }
    }
  }

  public static delete (courseId: string): any {
    return Database.deleteCourse64(courseId)
  }

  public static async star (course: any, accountId: string): Promise<void> {
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

  public static getCourseAmount (): Promise<number> {
    return Database.getCourses64Count()
  }
}
