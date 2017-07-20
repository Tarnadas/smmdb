import cryptoRandomString from 'crypto-random-string'

import Account from '../Account'
import { courses } from '../Course'

export function log (message) {
  console.log(`${new Date().toISOString().substr(0, 19)} ${message}`)
}

export function calculatePoints () {
  for (let courseId in courses) {
    if (courses.hasOwnProperty(courseId)) {
      let course = courses[courseId]
      Account.getAccount(course.owner).addPoints(course.getPoints())
    }
  }
}

export function generateAPIKey () {
  return cryptoRandomString(30)
}
