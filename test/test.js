import { before } from 'mocha'

import Database from '../src/server/Database'

import './server/Account'

before(async () => {
  await Database.initialize(true)
})
