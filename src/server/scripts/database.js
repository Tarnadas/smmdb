import mysql from 'mysql2/promise'
import {
  MongoClient, ObjectID
} from 'mongodb'
import ProgressBar from 'progress'
import rmrf from 'rimraf'

import * as path from 'path'
import * as fs from 'fs'
import * as util from 'util'

import Course from '../Course'
import Account from '../Account'

import {
  mysql as mysqlCredentials
} from './credentials'
import { log } from './util'

const rimraf = util.promisify(rmrf)

const mysqlConnection = Symbol('mysql')
const mongoUrl = 'mongodb://localhost:27017'

export default class Database {
  static async initialize (convert) {
    log('Connecting to database')
    this.db = await MongoClient.connect(mongoUrl)
    log('Connected')
    if (convert) return

    // load courses
    this.courses = this.db.collection('courses')
    let courses = await this.courses.find({}).toArray()
    let progressCourses = new ProgressBar('  loading courses [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: courses.length
    })
    for (let i in courses) {
      Course.from(courses[i])
      await new Promise(resolve => {
        setTimeout(() => {
          resolve()
        })
      })
      progressCourses.tick()
    }

    // load accounts
    this.accounts = this.db.collection('accounts')
    let accounts = await this.accounts.find({}).toArray()
    for (let i in accounts) {
      (new Account(accounts[i])).setId()
    }
  }

  static async addCourse (course) {
    const res = await this.courses.insertOne(course)
    return res
  }

  static async updateCourse (id, course) {
    const res = await this.courses.updateOne({ '_id': ObjectID(id) }, { $set: course })
    return res
  }

  static async deleteCourse (id) {
    const res = await this.courses.removeOne({ '_id': ObjectID(id) })
    return res
  }

  static async addAccount (account) {
    const res = await this.accounts.insertOne(account)
    return res
  }

  static async updateAccount (id, account) {
    const res = await this.accounts.updateOne({ '_id': ObjectID(id) }, { $set: account })
    return res
  }

  static async convertMySQL () {
    try {
      await this.db.collection('courses').drop()
      await this.db.collection('accounts').drop()
    } catch (err) {}
    this.courses = this.db.collection('courses')
    this.accounts = this.db.collection('accounts')
    let courseImagePath = path.join(__dirname, '../client/courseimg')
    if (fs.existsSync(courseImagePath)) {
      await rimraf(courseImagePath)
    }
    fs.mkdirSync(courseImagePath)
    let courseDataPath = path.join(__dirname, '../client/coursedata')
    if (fs.existsSync(courseDataPath)) {
      await rimraf(courseDataPath)
    }
    fs.mkdirSync(courseDataPath)

    this[mysqlConnection] = await mysql.createConnection(mysqlCredentials)
    let query = 'SELECT id,title,owner,coursetype,nintendoid,leveltype,difficulty,updatereq,hasthumbnail,hasimage,ispackage,downloadpath,' +
      'videoid,UNIX_TIMESTAMP(lastmodified) as lastmodified,UNIX_TIMESTAMP(uploaded) as uploaded FROM courses'

    // convert accounts
    let rows = (await this[mysqlConnection].execute('SELECT * FROM accounts'))[0]
    let accountIds = {}
    for (let i = 0; i < rows.length; i++) {
      let id = rows[i].id
      let account = new Account(Account.convertFromMySQL(rows[i]))
      accountIds[id] = (await this.addAccount(account)).insertedId
      account.setId()
    }

    // convert courses
    rows = (await this[mysqlConnection].execute(query))[0]
    let progress = new ProgressBar('  converting courses [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: rows.length
    })
    try {
      for (let i = 0; i < rows.length; i++) {
        let id = rows[i].id
        let courses = await Course.convertFromMySQL(rows[i])
        let thumbnail = path.join(__dirname, `../client/img/courses/${id}.pic`)
        for (let j = 0; j < courses.length; j++) {
          courses[j].owner = accountIds[courses[j].owner]
          let course = await (new Course(courses[j])).fix(thumbnail)
          await this.addCourse(course)
          await course.finalize()
          course.setId()
          await this.updateCourse(course._id, course)
        }
        progress.tick()
      }
    } catch (err) {
      console.log(err)
    }
    await new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 100)
    })

    return null
  }
}
