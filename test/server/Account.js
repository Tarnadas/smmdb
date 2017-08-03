import { assert } from 'chai'
import { describe, it } from 'mocha'

import Account from '../../src/server/Account'
import Database from '../../src/server/Database'

describe('Account', () => {
  describe('.createAccount({ googleid, username, email, idtoken })', () => {
    it('should create an account', async () => {
      const data = {
        googleid: '1234567890',
        username: 'Hans-Peter',
        email: 'hanspeter@gmail.com',
        idtoken: 'extremelylongstringggggggggggggg'
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
        idtoken: 'extremelylongstringggggggggggggg'
      }
      const account = await Account.createAccount(data)
      assert(account.username.length <= 20, 'username is too long')
    })
    it('should randomize usernames, if they already exist in database', async () => {
      const data = {
        googleid: '1234567890',
        username: 'Hans-Peter',
        email: 'hanspeter@gmail.com',
        idtoken: 'extremelylongstringggggggggggggg'
      }
      await Account.createAccount(data)
      await Account.createAccount(data)
      await Account.createAccount(data)
      const usernames = (await Database.filterAccounts().toArray()).map(ac => ac.username)
      assert((new Set(usernames)).size === usernames.length, 'database has accounts with duplicate usernames')
    })
  })
})
