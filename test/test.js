import { before } from 'mocha'
import randomString from 'crypto-random-string'

import Database from '../src/server/Database'
import Account, {
  MAX_LENGTH_USERNAME,
  MIN_LENGTH_USERNAME
} from '../src/server/Account'
// import Course from '../src/server/Course'

import './server/Account'

const ACCOUNT_MOCK_DATA = 100
const GOOGLE_ID_LENGTH = 20

before(async () => {
  await Database.initialize(true)
  for (let i = 0; i < ACCOUNT_MOCK_DATA; i++) {
    const username = randomString(Math.floor(Math.random() * (MAX_LENGTH_USERNAME - MIN_LENGTH_USERNAME)) + MIN_LENGTH_USERNAME)
    const data = {
      googleid: randomString(100).replace(/[^0-9]+/g, '').substr(0, GOOGLE_ID_LENGTH),
      username,
      email: `${username}@gmail.com`,
      idtoken: randomString(50)
    }
    await Account.createAccount(data)
  }
})
