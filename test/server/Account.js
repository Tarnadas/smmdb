import { assert } from 'chai'
import { describe, it, before } from 'mocha'
import randomString from 'crypto-random-string'

import Account from '../../src/server/Account'
import Database from '../../src/server/Database'

describe('Account', () => {
  describe('.createAccount({ googleid, username, email, idtoken })', () => {
    it('should create an account', async () => {
      const data = {
        googleid: '1234567890',
        username: 'Hans-Peter',
        email: 'hanspeter@gmail.com',
        idtoken: randomString(50)
      }
      const account = await Account.createAccount(data)
      assert.exists(account)
      assert.exists(account._id)
      assert.exists(account.googleid)
      assert.exists(account.username)
      assert.exists(account.idtoken)
      assert.exists(account.apikey)
    })
    it('should truncate too long usernames', async () => {
      const data = {
        googleid: '12345678901',
        username: 'this.is.a.too.damn.long.username',
        email: 'toolong@gmail.com',
        idtoken: randomString(50)
      }
      const account = await Account.createAccount(data)
      assert(account.username.length <= 20, 'username is too long')
    })
    it('should randomize usernames, if they already exist in database', async () => {
      const data = {
        googleid: '1234567890',
        username: 'Hans-Peter',
        email: 'hanspeter@gmail.com',
        idtoken: randomString(50)
      }
      await Account.createAccount(data)
      await Account.createAccount(data)
      await Account.createAccount(data)
      const usernames = (await Database.filterAccounts().toArray()).map(ac => ac.username)
      assert((new Set(usernames)).size === usernames.length, 'database has accounts with duplicate usernames')
    })
    it('should throw, if username is too short (because Google uses min username length of 6)', async () => {
      let thrown = false
      try {
        const data = {
          googleid: '12345678901',
          username: 'a',
          email: 'a@gmail.com',
          idtoken: randomString(50)
        }
        await Account.createAccount(data)
      } catch (err) {
        thrown = true
      }
      assert(thrown, 'did not throw on too short username')
    })
  })

  describe('.getAccount({ accountId, googleid, apikey, idtoken })', () => {
    let account
    before(async () => {
      const username = randomString(10)
      const data = {
        googleid: '12345678901',
        username,
        email: `${username}@gmail.com`,
        idtoken: randomString(50)
      }
      account = await Account.createAccount(data)
    })
    it('should return account, if it exists', async () => {
      const res = await Account.getAccount({
        accountId: account._id,
        googleid: account.googleid,
        apikey: account.apikey,
        idtoken: account.idtoken
      })
      delete res.toJSON
      delete res.stars
      assert.deepEqual(res, account, 'returned account does not match inserted account')
    })
    it('should return account on a single search parameter', async () => {
      let res = await Account.getAccount({ accountId: account._id })
      assert.exists(res)
      res = await Account.getAccount({ googleid: account.googleid })
      assert.exists(res)
      res = await Account.getAccount({ apikey: account.apikey })
      assert.exists(res)
      res = await Account.getAccount({ idtoken: account.idtoken })
      assert.exists(res)
    })
    it('should be stringifiable', async () => {
      const res = await Account.getAccount({ accountId: account._id })
      assert(typeof (res.toJSON()) === 'string')
    })
    it('should show/hide sensitive data on stringification, if asked for', async () => {
      let res = JSON.parse((await Account.getAccount({ accountId: account._id })).toJSON())
      assert.notExists(res.idtoken)
      assert.notExists(res.apikey)
      res = JSON.parse((await Account.getAccount({ accountId: account._id }, false)).toJSON())
      assert.exists(res.apikey)
    })
  })
})
