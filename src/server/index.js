import express from 'express'
import compression from 'compression'
import bodyParser from 'body-parser'
import cheerio from 'cheerio'
import cookieSession from 'cookie-session'
import verifier from 'google-id-token-verifier'
import favicon from 'serve-favicon'
import device from 'device'
import {
  renderToString
} from 'react-dom/server'
import pmx from 'pmx'

import * as http from 'http'
import * as fs from 'fs'
import * as path from 'path'
import * as qs from 'querystring'

import renderer from '../shared/renderer'

import Account from './Account'
import Course from './Course'
import API from './scripts/api'
import Database from './Database'
import DiscordBot from './Discord'

import {
  clientId, cookie as cookieCredentials
} from './scripts/credentials'
import {
  log
} from './scripts/util'
import { port } from '../static'

export const Bot = new DiscordBot()

const usersPerDay = pmx.probe().meter({
  name: 'users/day',
  samples: 86400,
  timeframe: 86400
})

const downloadMetrics = {
  downloadsPerDay: pmx.probe().meter({
    name: 'Downloads/day',
    samples: 86400,
    timeframe: 86400
  }),
  downloadsWiiUPerDay: pmx.probe().meter({
    name: 'Downloads WiiU/day',
    samples: 86400,
    timeframe: 86400
  }),
  downloads3DSPerDay: pmx.probe().meter({
    name: 'Downloads 3DS/day',
    samples: 86400,
    timeframe: 86400
  }),
  downloadsProtoPerDay: pmx.probe().meter({
    name: 'Downloads Proto/day',
    samples: 86400,
    timeframe: 86400
  })
}

const $index = cheerio.load(fs.readFileSync(path.join(__dirname, '../client/index.html')))

export const cacheMaxAgeImg = '7d'
export const cacheMaxAgeCSS = '1d'
export const cacheMaxAgeJS = '1y';

// initialize database
(async () => {
  try {
    await Database.initialize()
    await main()
  } catch (err) {
    console.log(err)
  }
})()

async function main () {
  console.log()
  log('Database initialized')

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
  const connections = {}
  app.use((req, res, next) => {
    const ip = req.ip
    if (!connections.hasOwnProperty(ip)) {
      usersPerDay.mark()
      connections[ip] = {}
      setTimeout(() => {
        delete connections[ip]
      }, 86400 * 1000)
    }
    next()
  })

  app.route('/tokensignin').post((req, res) => {
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

        let account = await Account.getAccountByGoogleId(googleId)
        if (!account) {
          // create new account
          account = await Account.createAccount({
            googleid: googleId,
            username: tokenInfo.email.split('@')[0],
            email: tokenInfo.email,
            idtoken: idToken
          })
        } else {
          await Account.login(account._id, idToken)
        }
        req.session.idtoken = idToken
        res.json(account)
      })
    }
  })

  app.route('/signin').post(async (req, res) => {
    if (!req.session.idtoken) {
      res.status(400).send('No idToken submitted. Have you enabled cookies?')
      return
    }
    const account = await Account.getAccountBySession(req.session.idtoken)
    if (!account) {
      res.status(400).send('Account not found')
      return
    }
    res.json(account)
  })

  app.route('/signout').post(async (req, res) => {
    if (!req.session.idtoken) {
      res.status(400).send('No idToken submitted. Have you enabled cookies?')
      return
    }
    let account = await Account.getAccountBySession(req.session.idtoken)
    if (!account) {
      res.status(400).send('Account not found')
      return
    }
    await Account.logout(account._id, req.session.idtoken)
    res.send('OK')
  })

  app.route('/api/:apicall*?').get(async (req, res) => {
    if (req.url.includes('/') && req.url.length > 5) {
      let apiCall = req.params.apicall
      let apiData = {}
      if (req.url.includes('?')) {
        apiData = qs.parse(req.url.split('?', 2)[1])
      }

      if (!apiCall) {
        res.status(400).send('Wrong syntax')
      } else if (apiCall === 'getstats') {
        API.getStats(res)
      } else if (apiCall === 'getcourses') {
        API.getCourses(app, req, res, apiData)
      } else if (apiCall === 'downloadcourse') {
        API.downloadCourse(req, res, apiData, downloadMetrics)
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
      API.uploadCourse(req, res)
    } else if (apiCall === 'reuploadcourse') {
      API.reuploadCourse(req, res, apiData)
    } else if (apiCall === 'updatecourse') {
      API.updateCourse(req, res, apiData)
    } else if (apiCall === 'starcourse') {
      API.starCourse(req, res, apiData)
    } else if (apiCall === 'setaccountdata') {
      API.setAccountData(req, res)
    } else if (apiCall === 'uploadimagefull') {
      API.uploadImage(req, res, true)
    } else if (apiCall === 'uploadimageprev') {
      API.uploadImage(req, res, false)
    } else {
      res.status(400).send('Wrong syntax')
    }
  })

  app.use('/', async (req, res) => {
    const stats = {
      courses: await Course.getCourseAmount(),
      accounts: await Account.getAccountAmount()
    }
    const d = device(req.get('user-agent'))
    let [html, preloadedState] = renderer(true, renderToString, null, req, await API.filterCourses(null, {limit: 10}), stats, d.is('phone'), d.is('tablet'))
    const index = cheerio.load($index.html())
    index('#root').html(html)
    index('body').prepend(`<script>window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}</script>`)
    res.send(index.html())
  })

  server.listen(port, () => {
    log(`Server is listening on port ${port}`)
  })
}
