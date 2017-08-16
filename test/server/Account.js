import { assert } from 'chai'
import { describe, it, before } from 'mocha'
import randomString from 'crypto-random-string'

import Account from '../../src/server/Account'
import Database from '../../src/server/Database'

describe('Account', () => {
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

  describe('.createAccount({ googleid, username, email, idtoken })', () => {
    it('should create an account', async () => {
      const data = {
        googleid: '1234567890',
        username: 'Hans-Peter',
        email: 'hanspeter@gmail.com',
        idtoken: randomString(50)
      }
      const res = await Account.createAccount(data)
      assert.exists(res)
      assert.exists(res._id)
      assert.exists(res.googleid)
      assert.exists(res.username)
      assert.exists(res.idtoken)
      assert.exists(res.apikey)
    })
    it('should truncate too long usernames', async () => {
      const data = {
        googleid: '12345678901',
        username: 'this.is.a.too.damn.long.username',
        email: 'toolong@gmail.com',
        idtoken: randomString(50)
      }
      const res = await Account.createAccount(data)
      assert(res.username.length <= 20, 'username is too long')
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

  describe('.getAccountByAccountId (accountId, hideSensitive)', () => {
    it('should return account', async () => {
      const res = await Account.getAccountByAccountId(account._id)
      assert.exists(res)
    })
    it('should show/hide sensitive data on stringification, if asked for', async () => {
      let res = JSON.parse((await Account.getAccountByAccountId(account._id)).toJSON())
      assert.notExists(res.idtoken)
      assert.notExists(res.apikey)
      res = JSON.parse((await Account.getAccountByAccountId(account._id, false)).toJSON())
      assert.exists(res.apikey)
    })
  })

  describe('.getAccountByGoogleId (googleId, hideSensitive)', () => {
    it('should return account', async () => {
      const res = await Account.getAccountByGoogleId(account.googleid)
      assert.exists(res)
    })
    it('should show/hide sensitive data on stringification, if asked for', async () => {
      let res = JSON.parse((await Account.getAccountByGoogleId(account.googleid)).toJSON())
      assert.notExists(res.idtoken)
      assert.notExists(res.apikey)
      res = JSON.parse((await Account.getAccountByGoogleId(account.googleid, false)).toJSON())
      assert.exists(res.apikey)
    })
  })

  describe('.getAccountByAPIKey (apiKey, hideSensitive)', () => {
    it('should return account', async () => {
      const res = await Account.getAccountByAPIKey(account.apikey)
      assert.exists(res)
    })
    it('should show/hide sensitive data on stringification, if asked for', async () => {
      let res = JSON.parse((await Account.getAccountByAPIKey(account.apikey)).toJSON())
      assert.notExists(res.idtoken)
      assert.notExists(res.apikey)
      res = JSON.parse((await Account.getAccountByAPIKey(account.apikey, false)).toJSON())
      assert.exists(res.apikey)
    })
  })

  describe('.getAccountBySession (idToken, hideSensitive)', () => {
    it('should return account', async () => {
      const res = await Account.getAccountBySession(account.idtoken)
      assert.exists(res)
    })
    it('should show/hide sensitive data on stringification, if asked for', async () => {
      let res = JSON.parse((await Account.getAccountBySession(account.idtoken)).toJSON())
      assert.notExists(res.idtoken)
      assert.notExists(res.apikey)
      res = JSON.parse((await Account.getAccountBySession(account.idtoken, false)).toJSON())
      assert.exists(res.apikey)
    })
  })

  describe('.getAccountAmount ()', () => {
    it('should return amount of accounts stored in database', async () => {
      const amount = await Account.getAccountAmount()
      assert.exists(amount)
      assert.isNumber(amount)
      assert.isAtLeast(amount, 0)
    })
  })

  describe('.prepare (account)', () => {
    it('should add list of course IDs starred by given account', () => {
      // TODO
    })
  })

  describe('.update (account, { username, downloadFormat })', () => {
    it('should be able to change username for account', () => {
      // TODO
    })
    it('should be able to change downloadformat for account', () => {
      // TODO
    })
  })

  describe('.login (accountId, idToken)', () => {
    it('should add idToken to database for given account', () => {
      // TODO
    })
  })

  describe('.logout (accountId, idToken)', () => {
    it('should remove idToken from database for given account', () => {
      // TODO
    })
  })

  describe('.toJSON (hideSensitive = true)', () => {
    it('should stringify bound account object', () => {
      // TODO
    })
    it('should show/hide sensitive data, if asked for', async () => {
      // TODO
    })
  })
})
