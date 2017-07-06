import got from 'got'
import cheerio from 'cheerio'

import {
  courses
} from '../Course'

export default class Parsing {
  static parseNintendoCourses () {
    for (let key in courses) {
      if (courses.hasOwnProperty(key)) {
        try {
          this.parseNintendoCourse(key)
        } catch (err) {
          console.log(err)
        }
      }
    }
  }

  static parseNintendoCourse (courseId) {
    if (!!courses[courseId].coursetype && !!courses[courseId].nintendoid) {
      let url = `https://supermariomakerbookmark.nintendo.net/courses/${courses[courseId].nintendoid}`
      got(url, (err, resp, body) => {
        if (err) {
          throw new Error(`Request to ${url} failed`)
        }

        let $ = cheerio.load(body)

        // parse original author
        courses[courseId].originalauthor = $('div.name').html()

        // parse original author url
        courses[courseId].originalauthorurl = 'https://supermariomakerbookmark.nintendo.net' + $('div.creator a').attr('href').split('?', 2)[0]

        // parse original author mii
        courses[courseId].originalauthormii = $('div.creator a img').attr('src')

        // parse clear rate
        let clearRateString = ''
        $('div.clear-rate .typography').each(function () {
          if ($(this).hasClass('typography-second')) {
            clearRateString += '.'
          } else if ($(this).hasClass('typography-0')) {
            clearRateString += '0'
          } else if ($(this).hasClass('typography-1')) {
            clearRateString += '1'
          } else if ($(this).hasClass('typography-2')) {
            clearRateString += '2'
          } else if ($(this).hasClass('typography-3')) {
            clearRateString += '3'
          } else if ($(this).hasClass('typography-4')) {
            clearRateString += '4'
          } else if ($(this).hasClass('typography-5')) {
            clearRateString += '5'
          } else if ($(this).hasClass('typography-6')) {
            clearRateString += '6'
          } else if ($(this).hasClass('typography-7')) {
            clearRateString += '7'
          } else if ($(this).hasClass('typography-8')) {
            clearRateString += '8'
          } else if ($(this).hasClass('typography-9')) {
            clearRateString += '9'
          }
        })
        courses[courseId].clearrate = parseFloat(clearRateString)

        // parse liked count
        let likedCountString = ''
        $('div.liked-count .typography').each(function () {
          if ($(this).hasClass('typography-0')) {
            likedCountString += '0'
          } else if ($(this).hasClass('typography-1')) {
            likedCountString += '1'
          } else if ($(this).hasClass('typography-2')) {
            likedCountString += '2'
          } else if ($(this).hasClass('typography-3')) {
            likedCountString += '3'
          } else if ($(this).hasClass('typography-4')) {
            likedCountString += '4'
          } else if ($(this).hasClass('typography-5')) {
            likedCountString += '5'
          } else if ($(this).hasClass('typography-6')) {
            likedCountString += '6'
          } else if ($(this).hasClass('typography-7')) {
            likedCountString += '7'
          } else if ($(this).hasClass('typography-8')) {
            likedCountString += '8'
          } else if ($(this).hasClass('typography-9')) {
            likedCountString += '9'
          }
        })
        courses[courseId].likedcount = parseInt(likedCountString)

        // parse tried count
        let triedCountString = ''
        $('div.played-count .typography').each(function () {
          if ($(this).hasClass('typography-0')) {
            triedCountString += '0'
          } else if ($(this).hasClass('typography-1')) {
            triedCountString += '1'
          } else if ($(this).hasClass('typography-2')) {
            triedCountString += '2'
          } else if ($(this).hasClass('typography-3')) {
            triedCountString += '3'
          } else if ($(this).hasClass('typography-4')) {
            triedCountString += '4'
          } else if ($(this).hasClass('typography-5')) {
            triedCountString += '5'
          } else if ($(this).hasClass('typography-6')) {
            triedCountString += '6'
          } else if ($(this).hasClass('typography-7')) {
            triedCountString += '7'
          } else if ($(this).hasClass('typography-8')) {
            triedCountString += '8'
          } else if ($(this).hasClass('typography-9')) {
            triedCountString += '9'
          }
        })
        courses[courseId].triedcount = parseInt(triedCountString)
      })
    }
  }
}
