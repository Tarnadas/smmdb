import { MongoClient, ObjectID, Db, Collection, UpdateWriteOpResult, DeleteWriteOpResultObject } from 'mongodb'
import { Account } from './Account'
// import jimp from 'jimp'
/* import imageminWebp from 'imagemin-webp'
import ProgressBar from 'progress'

import fs from 'fs'
import path from 'path' */

import { log } from './scripts/util'
import { Match } from '../models/Match'

const mongoUrl = `mongodb://${process.env.DOCKER === 'docker' ? 'mongodb' : 'localhost'}:27017`

type SimilartySchema = {
  _id: ObjectID
  similarCourses: Match[]
}

export abstract class Database {
  private static database?: Db

  private static courses: any

  private static courseData: any

  private static courses64: any

  private static accounts: any

  private static stars: any

  private static stars64: any

  private static net64: any

  private static blog: any

  private static similarity: Collection<SimilartySchema>

  public static async initialize (isTest = false): Promise<void> {
    log(`Connecting to database at ${mongoUrl}`)
    const connect = (): Promise<void> => {
      return new Promise(async (resolve): Promise<void> => {
        try {
          this.database = await MongoClient.connect(mongoUrl) as any
          resolve()
        } catch (err) {
          console.warn('Connecting to MongoDB failed. Retrying...')
          setTimeout(connect, 5000)
        }
      })
    }
    await connect()
    log('Connected')

    if (!this.database) {
      throw new Error()
    }

    if (isTest) {
      try {
        await this.database.collection('coursesTest').drop()
      } catch (err) {}
      try {
        await this.database.collection('accountsTest').drop()
      } catch (err) {}
      this.courses = this.database.collection('coursesTest')
      this.courses64 = this.database.collection('courses64Test')
      this.accounts = this.database.collection('accountsTest')
      this.stars = this.database.collection('starsTest')
      this.stars64 = this.database.collection('stars64Test')
    } else {
      this.courses = this.database.collection('courses')
      this.courseData = this.database.collection('courseData')
      this.courses64 = this.database.collection('courses64')
      this.accounts = this.database.collection('accounts')
      this.stars = this.database.collection('stars')
      this.stars64 = this.database.collection('stars64')
      this.net64 = this.database.collection('net64')
      this.blog = this.database.collection('blog')
      this.similarity = this.database.collection('similarity')
    }
    /* const imgPath = path.join(__dirname, 'img')
    const optPath = path.join(__dirname, 'opt')
    if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath)
    if (!fs.existsSync(optPath)) fs.mkdirSync(optPath)
    const entries = await this.courseData.find().toArray()
    console.log()
    const bar = new ProgressBar(':bar :percent :current/:total  :etas', {
      total: entries.length
    })
    for (let entry of entries) {
      const webp = await imageminWebp({
        quality: 80,
        method: 6
      })(entry.thumbnail.buffer)
      const webpPreview = await imageminWebp({
        quality: 80,
        method: 6
      })(entry.thumbnailPreview.buffer)
      await this.courseData.updateOne({ _id: ObjectID(entry._id) }, { $set: {
        thumbnailWebp: webp,
        thumbnailPreviewWebp: webpPreview
      } })
      bar.tick()
    }
    console.log() */
  }

  public static async addCourse (course: any): Promise<number> {
    return (await this.courses.insertOne(course)).insertedId
  }

  public static addCourseData (course: any): any {
    return this.courseData.insertOne(course)
  }

  public static addCourse64 (course: any): any {
    return this.courses64.insertOne(course)
  }

  public static updateCourse (id: string, course: any): any {
    return this.courses.updateOne({ '_id': new ObjectID(id) }, { $set: course })
  }

  public static updateCourseData (id: string, course: any): any {
    return this.courseData.updateOne({ '_id': new ObjectID(id) }, { $set: course })
  }

  public static updateCourse64 (id: string, course: any): any {
    return this.courses64.updateOne({ '_id': new ObjectID(id) }, { $set: course })
  }

  public static filterCourses (filter: any, sort: any = { lastmodified: -1 }, skip = 0, limit = 100, random = false): any {
    const query = [{ $match: filter }]
    if (random) query.push({ $sample: { size: limit } } as any)
    query.push({ $sort: Object.assign(sort, sort.stars == null ? { stars: 1 } : {}, sort.title == null ? { title: -1 } : {}) } as any,
      { $limit: skip + limit } as any,
      { $skip: skip } as any)
    return this.courses.aggregate(query)
  }

  public static filterCourses64 (filter: any, sort: any = { lastmodified: -1 }, skip = 0, limit = 100, random = false): any {
    const query = [{ $match: filter }]
    if (random) query.push({ $sample: { size: limit } } as any)
    query.push({ $sort: Object.assign(sort, sort.stars == null ? { stars: 1 } : {}, sort.title == null ? { title: -1 } : {}) } as any,
      { $limit: skip + limit } as any,
      { $skip: skip } as any)
    return this.courses64.aggregate(query)
  }

  public static async getCourseData (id: string): Promise<any> {
    try {
      const course = (await this.courseData.find({ '_id': new ObjectID(id) }).toArray())[0]
      return [course.courseData.buffer, course.courseDataGz.buffer]
    } catch (err) {
      return null
    }
  }

  public static async getImage (id: string, full: boolean, webp = false): Promise<any> {
    try {
      const course = (await this.courseData.find({ '_id': new ObjectID(id) }).toArray())[0]
      return full ? (
        webp ? course.thumbnailWebp.buffer : course.thumbnail.buffer
      ) : (
        webp ? course.thumbnailPreviewWebp.buffer : course.thumbnailPreview.buffer
      )
    } catch (err) {
      return null
    }
  }

  public static async getImage64 (id: string): Promise<any> {
    try {
      return (await this.courses64.find({ '_id': new ObjectID(id) }).toArray())[0].image.buffer
    } catch (err) {
      return null
    }
  }

  public static deleteCourse (id: string): Promise<any> {
    return this.courses.deleteOne({ '_id': new ObjectID(id) })
  }

  public static deleteCourseData (id: string): Promise<any> {
    return this.courseData.deleteOne({ '_id': new ObjectID(id) })
  }

  public static deleteCourse64 (id: string): any {
    return this.courses64.deleteOne({ '_id': new ObjectID(id) })
  }

  public static async starCourse (courseId: string, accountId: string): Promise<any> {
    await this.stars.insertOne({ courseId, accountId })
    const stars = (await this.stars.find({ courseId: new ObjectID(courseId) }).toArray()).length
    return this.courses.updateOne({ '_id': new ObjectID(courseId) }, { $set: { stars } })
  }

  public static async starCourse64 (courseId: string, accountId: string): Promise<any> {
    await this.stars64.insertOne({ courseId, accountId })
    const stars = (await this.stars64.find({ courseId: new ObjectID(courseId) }).toArray()).length
    return this.courses64.updateOne({ '_id': new ObjectID(courseId) }, { $set: { stars } })
  }

  public static async unstarCourse (courseId: string, accountId: string): Promise<any> {
    await this.stars.deleteOne({ courseId: new ObjectID(courseId), accountId: new ObjectID(accountId) })
    const stars = (await this.stars.find({ courseId: new ObjectID(courseId) }).toArray()).length
    return this.courses.updateOne({ '_id': new ObjectID(courseId) }, { $set: { stars } })
  }

  public static async unstarCourse64 (courseId: string, accountId: string): Promise<any> {
    await this.stars64.deleteOne({ courseId: new ObjectID(courseId), accountId: new ObjectID(accountId) })
    const stars = (await this.stars64.find({ courseId: new ObjectID(courseId) }).toArray()).length
    return this.courses64.updateOne({ '_id': new ObjectID(courseId) }, { $set: { stars } })
  }

  public static getAccountStars (accountId: string): any {
    return this.stars.find({ accountId: new ObjectID(accountId) }).toArray()
  }

  public static getAccountStars64 (accountId: string): any {
    return this.stars64.find({ accountId: new ObjectID(accountId) }).toArray()
  }

  public static async isCourseStarred (courseId: string, accountId: string): Promise<any> {
    const length = (await this.stars.find({ courseId: new ObjectID(courseId), accountId: new ObjectID(accountId) }).toArray()).length
    return length === 1
  }

  public static async isCourse64Starred (courseId: string, accountId: string): Promise<any> {
    const length = (await this.stars64.find({ courseId: new ObjectID(courseId), accountId: new ObjectID(accountId) }).toArray()).length
    return length === 1
  }

  public static async getCoursesCount (): Promise<number> {
    return (await this.courses.stats()).count
  }

  public static async getCourses64Count (): Promise<number> {
    return (await this.courses64.stats()).count
  }

  public static addAccount (account: any): any {
    return this.accounts.insertOne(account)
  }

  public static updateAccount (id: string, account: any): any {
    return this.accounts.updateOne({ '_id': new ObjectID(id) }, { $set: account })
  }

  public static filterAccounts (filter?: any): any {
    return this.accounts.find(filter)
  }

  public static async getAccountsCount (): Promise<number> {
    return (await this.accounts.stats()).count
  }

  public static async getNet64Server (accountId: string): Promise<any> {
    try {
      return (await this.net64.find({ owner: new ObjectID(accountId) }).toArray())[0]
    } catch (err) {
      return null
    }
  }

  public static getNet64Servers (query: any): any {
    query = query || [
      {
        $match: {
          updated: {
            $gte: Math.trunc(Date.now() / 1000) - 15
          }
        }
      },
      {
        $sort: {
          playerCount: -1,
          isDedicated: -1
        }
      }
    ]
    return this.net64.aggregate(query).toArray()
  }

  public static insertNet64Server (server: any): any {
    return this.net64.insertOne(server)
  }

  public static updateNet64Server (id: string, server: any): any {
    return this.net64.updateOne({ '_id': new ObjectID(id) }, { $set: server })
  }

  public static async getBlogPosts ({ accountId, blogId, skip, limit, getCurrent }: any): Promise<any> {
    const query = Object.assign(accountId ? { accountId: new ObjectID(accountId) } : {},
      blogId ? { _id: new ObjectID(blogId) } : {},
      getCurrent ? { isCurrent: true } : { isCurrent: { $ne: true } }
    )
    let blogPosts = this.blog.find(query)
    if (skip != null) {
      blogPosts = blogPosts.skip(skip)
      if (limit != null) blogPosts = blogPosts.limit(skip + limit)
    }
    blogPosts.sort({ published: -1 })
    return Promise.all((await blogPosts.toArray())
      .map(async (blogPost: any): Promise<void> => {
        const ownerName = (await Account.getAccountByAccountId(blogPost.accountId)).username
        return Object.assign(blogPost, { ownerName })
      }))
  }

  public static async setBlogPost ({ accountId, blogId, markdown }: any): Promise<any> {
    let blogPost
    if (!blogId) {
      blogPost = await this.blog.find({ accountId: new ObjectID(accountId), isCurrent: true }).toArray()
    } else {
      blogPost = await this.blog.find({ accountId: new ObjectID(accountId), _id: new ObjectID(blogId) }).toArray()
    }
    if (!blogPost || blogPost.length !== 1) {
      return (await this.blog.insertOne({ accountId: new ObjectID(accountId), markdown, isCurrent: true })).insertedId
    } else {
      await this.blog.updateOne({ _id: blogPost[0]._id }, { $set: { markdown } })
      return blogPost[0]._id
    }
  }

  public static async publishBlogPost ({ accountId, blogId, markdown }: any): Promise<any> {
    console.log({ accountId, blogId, markdown })
    if (!blogId) {
      blogId = (await this.blog.insertOne({ accountId: new ObjectID(accountId), markdown, isCurrent: true })).insertedId
    }
    let blogPost = await this.blog.find({
      accountId: new ObjectID(accountId), _id: new ObjectID(blogId)
    }).toArray()
    if (!blogPost || blogPost.length === 0) {
      return {
        err: `Blog post with id ${blogId} was not found or marked as publishable`
      }
    }
    blogPost = blogPost[0]
    const published = Math.trunc(Date.now() / 1000)
    await this.blog.updateOne({ _id: blogPost._id }, {
      $set: Object.assign({
        isCurrent: false,
        markdown
      }, blogPost.isCurrent ? { published } : { edited: published })
    })
    blogPost.published = published
    blogPost.markdown = markdown
    return blogPost
  }

  public static async deleteBlogPost ({ accountId, blogId }: any): Promise<any> {
    const blogPost = await this.blog.find({
      accountId: new ObjectID(accountId), _id: new ObjectID(blogId)
    }).toArray()
    if (!blogPost || blogPost.length === 0) {
      return {
        err: `Blog post with id ${blogId} was not found or marked as publishable`
      }
    }
    await this.blog.deleteOne({ _id: blogPost[0]._id })
    return blogPost
  }

  public static updateSimilarity (courseId: string | ObjectID, similarCourses: Match[]): Promise<UpdateWriteOpResult> {
    return this.similarity.updateOne({ '_id': new ObjectID(courseId) }, { $set: { similarCourses } }, { upsert: true })
  }

  public static async deleteSimilarity (id: string): Promise<DeleteWriteOpResultObject> {
    const courseId = new ObjectID(id)
    const matches: SimilartySchema[] = await (await this.similarity.find<SimilartySchema>({ '_id': courseId })).toArray()
    for (const match of matches) {
      const similarCourses = (await this.similarity.findOne<SimilartySchema>({ '_id': match._id }))
      if (!similarCourses) continue
      const similarCourseIds = similarCourses.similarCourses
      const similarCourseIdsWithoutDeletedOne = similarCourseIds.filter(({ courseId: _courseId }): boolean => _courseId !== String(courseId))
      await Database.updateSimilarity(match._id, similarCourseIdsWithoutDeletedOne)
    }
    return this.similarity.deleteOne({ '_id': courseId })
  }
}
