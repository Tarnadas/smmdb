import parseRange from 'range-parser'

import Database from './database'
import Sorting from './sorting'
import Account from '../Account'
import Course from '../Course'

const MAX_FILTER_LIMIT = 100

const nintendoIdRegEx = /^[0-9A-Z|\\-]+$/

export default class API {
  static getStats (res) {
    const result = {
      courses: Course.getCourseAmount(),
      accounts: Account.getAccountAmount()
    }
    res.json(result)
  }

  static getCourses (app, res, apiData) {
    let loggedIn = false
    let accountId
    const account = Account.getAccountByAPIKey(apiData.apikey)
    if (account) {
      loggedIn = true
      accountId = account.id
      apiData.uploader = account.username
    }
    if (apiData.prettify) {
      app.set('json spaces', 2)
    }
    res.json(this.filterCourses(loggedIn, accountId, apiData))
    if (apiData.prettify) {
      app.set('json spaces', 0)
    }
  }

  static filterCourses (loggedIn, accountId, filterData) {
    let orderBy = 'lastmodified'
    let dir = 'desc'

    if (!!filterData && !!filterData.order && !!filterData.dir) {
      orderBy = filterData.order
      dir = filterData.dir
    }
    let courses = Sorting.getCoursesBySorting(orderBy, dir)
    if (!courses) {
      return {
        err: 'Wrong order and/or dir property'
      }
    }

    const limit = (!!filterData && !!filterData.limit) ? (+filterData.limit) : MAX_FILTER_LIMIT
    const start = (!!filterData && !!filterData.start) ? (+filterData.start) : 0
    delete filterData.limit
    delete filterData.start
    let filteredResult = filterData !== {} ? [] : courses

    for (let i in courses) {
      let course = courses[i]
      if (!course) break
      if (filteredResult.length >= (start + limit)) break

      if (filterData) {
        if (filterData.lastmodifiedfrom) {
          if (parseInt(filterData.lastmodifiedfrom) > course.lastmodified) {
            continue
          }
        }
        if (filterData.lastmodifiedto) {
          if (parseInt(filterData.lastmodifiedto) < course.lastmodified) {
            continue
          }
        }
        if (filterData.uploadedfrom) {
          if (parseInt(filterData.uploadedfrom) > course.uploaded) {
            continue
          }
        }
        if (filterData.uploadedto) {
          if (parseInt(filterData.uploadedto) < course.uploaded) {
            continue
          }
        }
        if (filterData.difficultyfrom) {
          if (parseInt(filterData.difficultyfrom) > course.difficulty || course.difficulty == null) {
            continue
          }
        }
        if (filterData.difficultyto) {
          if (parseInt(filterData.difficultyto) < course.difficulty || course.difficulty == null) {
            continue
          }
        }
        if (filterData.title) {
          if (!course.title.toLowerCase().includes(filterData.title.toLowerCase())) {
            continue
          }
        }
        if (filterData.maker) {
          if (filterData.maker.toLowerCase() !== course.maker.toLowerCase()) {
            continue
          }
        }
        if (filterData.uploader) {
          if (filterData.uploader.toLowerCase() !== Account.getAccount(course.owner).username.toLowerCase()) {
            continue
          }
        }
        if (filterData.gamestyle) {
          if (parseInt(filterData.gamestyle) !== course.gameStyle) {
            continue
          }
        }
        if (filterData.coursetheme) {
          if (parseInt(filterData.coursetheme) !== course.courseTheme) {
            continue
          }
        }
        if (filterData.coursethemesub) {
          if (parseInt(filterData.coursethemesub) !== course.courseThemeSub) {
            continue
          }
        }
        if (filterData.autoscroll) {
          const autoScroll = parseInt(filterData.autoscroll)
          if (autoScroll !== course.autoScroll && autoScroll !== course.autoScrollSub) {
            continue
          }
        }
      }
      let resultCourse = course.toJSON(loggedIn, accountId)
      filteredResult.push(resultCourse)
    }

    return filteredResult.splice(start, limit)
  }

  static async downloadCourse (req, res, apiData) {
    const course = Course.getCourse(apiData.id)
    if (!course) {
      res.status(400).send(`Course with ID ${apiData.id} not found`)
      return
    }
    if (apiData.type === 'zip') {
      const file = await course.getCompressed()
      if (typeof (file) === 'string') {
        res.setHeader('Content-Type', 'application/zip')
        res.download(file)
      } else {
        res.status(500).send('Could not compress file')
      }
    } else if (apiData.type === 'json') {
      res.json(await course.getObject())
    } else if (apiData.type === '3ds') {
      res.setHeader('Content-Type', 'application/3ds')
      const course3ds = await course.get3DS()
      if (req.headers.range) {
        const range = parseRange(course3ds.length, req.headers.range, { combine: true })
        if (range === -1) {
          res.status(400).send('Unsatisfiable range')
          return
        }
        if (range === -2) {
          res.status(400).send('Malformed header string')
          return
        }
        let resBuffer = Buffer.alloc(0)
        if (range.type === 'bytes') {
          range.forEach(r => {
            resBuffer.concat([resBuffer, course3ds.slice(r.start, r.end)])
          })
          res.send(resBuffer)
        } else {
          res.status(400).send('Unknown range type')
        }
      } else {
        res.set('Content-disposition', `attachment;filename=${encodeURI(course.title)}.3ds`)
        res.send(course3ds)
      }
    } else {
      res.set('Content-Encoding', 'gzip')
      res.set('Content-Type', 'application/wiiu')
      res.send(await course.getSerialized())
    }
  }

  static async uploadCourse (req, res, apiData) {
    if (!apiData.apikey) {
      res.status(403).send('API key required')
      return
    }
    const account = Account.getAccountByAPIKey(apiData.apikey)
    if (account == null) {
      res.status(400).send(`Account with API key ${apiData.apikey} not found`)
      return
    }
    const courses = await Course.fromBuffer(req.body, account)
    if (!courses) {
      res.status(500).send('Could not read course')
    } else {
      res.json(courses)
    }
  }

  static async updateCourse (req, res, apiData) {
    if (!apiData.apikey) {
      res.status(403).send('API key required')
      return
    }
    if (!apiData.id) {
      res.status(400).send('No course ID submitted')
      return
    }
    const account = Account.getAccountByAPIKey(apiData.apikey)
    if (account == null) {
      res.status(400).send(`Account with API key ${apiData.apikey} not found`)
      return
    }
    const course = Course.getCourse(apiData.id)
    if (course == null) {
      res.status(400).send(`Course with ID ${apiData.id} not found`)
      return
    }
    if (!course.owner.equals(account._id)) {
      res.status(403).send(`Course with ID ${apiData.id} is not owned by account with API key ${apiData.apikey}`)
      return
    }
    const courseData = {}
    if (req.body.title) courseData.title = req.body.title
    if (req.body.maker) courseData.maker = req.body.maker
    if (req.body.nintendoid != null) {
      const nId = req.body.nintendoid
      if (nId === '') {
        courseData.nintendoid = ''
      } else {
        const a = nId.split('-')
        if (nintendoIdRegEx.test(nId) && a.length === 4 && a[0].length === 4 && a[1].length === 4 && a[2].length === 4 && a[3].length === 4) {
          courseData.nintendoid = nId
        }
      }
    }
    if (req.body.videoid != null) courseData.videoid = req.body.videoid
    await course.update(courseData)
    res.json(course)
  }

  static deleteCourse (res, apiData) {
    if (!apiData.apikey) {
      res.status(403).send('API key required')
      return
    }
    const account = Account.getAccountByAPIKey(apiData.apikey)
    if (account == null) {
      res.status(400).send(`Account with API key ${apiData.apikey} not found`)
      return
    }
    const course = Course.getCourse(apiData.id)
    if (!course) {
      res.status(400).send(`Course with ID ${apiData.id} not found`)
      return
    }
    if (!course.owner.equals(account._id)) {
      res.status(403).send(`Course with ID ${apiData.id} is not owned by account with API key ${apiData.apikey}`)
      return
    }
    course.delete()
    res.send('OK')
  }

  static async setAccountData (req, res, apiData) {
    if (!apiData.apikey) {
      res.status(403).send('API key required')
      return
    }
    const account = Account.getAccountByAPIKey(apiData.apikey)
    if (account == null) {
      res.status(400).send(`Account with API key ${apiData.apikey} not found`)
      return
    }
    const accountData = {}
    if (req.body.username) {
      account.setUsername(req.body.username)
      accountData.username = req.body.username
    }
    if (req.body.downloadformat) {
      const downloadFormat = typeof (req.body.downloadformat) !== 'number' ? parseInt(req.body.downloadformat) : req.body.downloadformat
      account.setDownloadFormat(downloadFormat)
      accountData.downloadformat = downloadFormat
    }
    await Database.updateAccount(account._id, accountData)
    res.json(account)
  }
}
