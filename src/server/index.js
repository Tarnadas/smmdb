import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cheerio from 'cheerio'
import cookieSession from 'cookie-session'
import verifier from 'google-id-token-verifier'
import favicon from 'serve-favicon'
// import bytes from 'bytes'
import device from 'device'
import {
  renderToString
} from 'react-dom/server'

import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import * as qs from 'querystring'

import renderer from '../shared/renderer'

import Lobby from './Lobby'
import Account from './Account'
import Course from './Course'
import API from './scripts/api'
import Database from './scripts/database'
import Sorting from './scripts/sorting'
// import Parsing from './scripts/parsing'
import DiscordBot from './Discord'

import {
  clientId, cookie as cookieCredentials
} from './scripts/credentials'
import {
  log, calculatePoints
} from './scripts/util'
import { port } from '../static'

export const Bot = new DiscordBot()

const $index = cheerio.load(fs.readFileSync(path.join(__dirname, '../client/index.html')))

export const pointsPerDownload = 1
export const pointsPerStar = 15

export const maxFileSize = 6 * 1024 * 1024

export const cacheMaxAgeImg = '7d'
export const cacheMaxAgeCSS = '1d'
export const cacheMaxAgeJS = '1y';

// const usernameMinCharacters = 3
// const usernameMaxCharacters = 30

// const videoIdRegEx    = /^[a-z0-9A-Z| |.|\\_|\\-]+$/

// initialize database
(async () => {
  try {
    let convert = process.argv.includes('convertmysql')
    await Database.initialize(convert)
    if (convert) {
      await Database.convertMySQL()
    }
    await main()
  } catch (err) {
    console.log(err)
  }
})()

async function main () {
  console.log()
  log('Database initialized')

  calculatePoints()
  // Parsing.parseNintendoCourses()
  Sorting.sortCourses()

  await Bot.login()

  // initialize app engine
  const app = express()

  const server = http.createServer(app)

  app.set('trust proxy', 1)
  app.use(compression())
  app.use(bodyParser.json({
    limit: '500kb'
  }))
  app.use(bodyParser.raw({
    limit: '6mb'
  }))
  app.use(favicon(path.join(__dirname, '../../favicon.ico')))
  app.use('/img', express.static(path.join(__dirname, '../static/images'), { maxAge: cacheMaxAgeImg }))
  app.use('/courseimg', express.static(path.join(__dirname, '../static/courseimg'), { maxAge: cacheMaxAgeImg }))
  app.use('/styles', express.static(path.join(__dirname, '../static/styles'), { maxAge: cacheMaxAgeCSS }))
  app.use('/scripts', express.static(path.join(__dirname, '../client/scripts'), { maxAge: cacheMaxAgeJS }))
  app.use(cookieSession({
    name: 'session',
    keys: cookieCredentials,
    maxAge: 24 * 60 * 60 * 1000
  }))

  app.route('/tokensignin').post((req, res) => {
    log('[200] ' + req.method + ' to ' + req.url)

    let idToken = req.body.tokenObj.id_token
    if (!idToken) {
      res.status(400).send('idToken not found')
    } else {
      verifier.verify(idToken, clientId, async (err, tokenInfo) => {
        if (err) {
          res.status(400).send('idToken not verified')
        }

        // create account if it does not exist
        let googleId = tokenInfo.sub

        let account
        if (!Account.exists(googleId)) {
          // create new account
          account = new Account({
            googleid: googleId,
            username: tokenInfo.email.split('@')[0],
            email: tokenInfo.email
          })
          await Database.addAccount(account)
          account.setId()
        } else {
          account = Account.getAccountByGoogleId(googleId)
          account.login(idToken)
        }
        req.session.idtoken = idToken

        res.json(account)
      })
    }
  })

  app.route('/signin').post((req, res) => {
    log('[200] ' + req.method + ' to ' + req.url)

    if (!req.session.idtoken) {
      res.status(400).send('No idToken submitted. Have you enabled cookies?')
      return
    }
    let account = Account.getAccountBySession(req.session.idtoken)
    if (!account) {
      res.status(400).send('Account not found')
      return
    }
    res.json(account)
  })

  app.route('/signout').post((req, res) => {
    log('[200] ' + req.method + ' to ' + req.url)

    if (!req.session.idtoken) {
      res.status(400).send('No idToken submitted. Have you enabled cookies?')
      return
    }
    let account = Account.getAccountBySession(req.session.idtoken)
    if (!account) {
      res.status(400).send('Account not found')
      return
    }
    account.logout(req.session.idtoken)
    res.send('OK')
  })

  app.route('/api/:apicall*?').get(async (req, res) => {
    if (req.url.includes('/') && req.url.length > 5) {
      let apiCall = req.params.apicall
      let apiData = {}
      if (req.url.includes('?')) {
        let split = req.url.split('?', 2)
        let data = split[1]
        apiData = qs.parse(data)
      }

      if (!apiCall) {
        res.status(400).send('Wrong syntax')
      } else if (apiCall === 'getstats') {
        API.getStats(res)
      } else if (apiCall === 'getcourses') {
        API.getCourses(app, req, res, apiData)
      } else if (apiCall === 'downloadcourse') {
        await API.downloadCourse(req, res, apiData)
      } else if (apiCall === 'deletecourse') {
        API.deleteCourse(req, res, apiData)
      } else if (apiCall === 'getaccountdata') {
        await API.getAccountData(req, res)
      } else {
        res.status(400).send('Wrong syntax')
      }
    } else {
      res.status(400).send('Wrong syntax')
    }
  }).post(async (req, res) => {
    let apiCall = req.params.apicall
    let apiData = {}
    if (req.url.includes('?')) {
      let split = req.url.split('?', 2)
      let data = split[1]
      apiData = qs.parse(data)
    }

    if (apiCall === 'uploadcourse') {
      await API.uploadCourse(req, res)
    } else if (apiCall === 'updatecourse') {
      await API.updateCourse(req, res, apiData)
    } else if (apiCall === 'setaccountdata') {
      await API.setAccountData(req, res)
    } else {
      res.status(400).send('Wrong syntax')
    }
  })

  app.use('/', (req, res) => {
    const stats = {
      courses: Course.getCourseAmount(),
      accounts: Account.getAccountAmount()
    }
    const d = device(req.get('user-agent'))
    let [html, preloadedState] = renderer(true, renderToString, null, req, API.filterCourses(false, null, {limit: 10}), stats, d.is('phone') || d.is('tablet'))
    const index = cheerio.load($index.html())
    index('#root').html(html)
    index('body').prepend(`<script>window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}</script>`)
    res.send(index.html())
  })

  server.listen(port, () => {
    log(`Server is listening on port ${port}`)
  })
}
