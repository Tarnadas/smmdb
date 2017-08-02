import {
  MongoClient, ObjectID
} from 'mongodb'

import { log } from './scripts/util'

const mongoUrl = 'mongodb://localhost:27017'

export default class Database {
  static async initialize (isTest = false) {
    log('Connecting to database')
    this.db = await MongoClient.connect(mongoUrl)
    log('Connected')

    if (isTest) {
      try {
        await this.db.collection('coursesTest').drop()
        await this.db.collection('accountsTest').drop()
      } catch (err) {}
      this.courses = this.db.collection('coursesTest')
      this.accounts = this.db.collection('accountsTest')
    } else {
      this.courses = this.db.collection('courses')
      this.accounts = this.db.collection('accounts')
    }
  }

  static addCourse (course) {
    return this.courses.insertOne(course)
  }

  static updateCourse (id, course) {
    return this.courses.updateOne({ '_id': ObjectID(id) }, { $set: course })
  }

  static filterCourses (filter, sort = { lastmodified: -1 }, skip = 0, limit = 100) {
    return this.courses.find(filter).sort(sort).skip(skip).limit(limit)
  }

  static deleteCourse (id) {
    return this.courses.removeOne({ '_id': ObjectID(id) })
  }

  static async getCoursesCount () {
    return (await this.courses.stats()).count
  }

  static addAccount (account) {
    return this.accounts.insertOne(account)
  }

  static updateAccount (id, account) {
    return this.accounts.updateOne({ '_id': ObjectID(id) }, { $set: account })
  }

  static filterAccounts (filter) {
    return this.accounts.find(filter)
  }

  static async getAccountsCount () {
    return (await this.accounts.stats()).count
  }
}
