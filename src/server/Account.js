import {
  ObjectID
} from 'mongodb'
import randomString from 'crypto-random-string'

import {
  generateAPIKey
} from './scripts/util'
import Database from './Database'

const MAX_LENGTH_USERNAME = 20

export default class Account {
  static async createAccount ({ googleid, username, email, idtoken }) {
    if (username.length > MAX_LENGTH_USERNAME) username = username.substr(0, MAX_LENGTH_USERNAME)
    const accountNames = (await Database.filterAccounts().toArray()).map(ac => ac.username)
    while (accountNames.includes(username)) {
      username = username.substr(0, 15) + randomString(3)
    }
    return (await Database.addAccount({
      googleid,
      username,
      email,
      idtoken,
      apikey: generateAPIKey()
    })).ops[0]
  }

  static async getAccount ({ accountId, googleid, apikey, idtoken }) {
    const filter = {}
    if (accountId) filter._id = accountId
    if (googleid) filter.googleid = googleid
    if (apikey) filter.apikey = apikey
    if (idtoken) filter.idtoken = idtoken
    if (Object.keys(filter).length === 0) return null
    let res = await Database.filterAccounts(filter).toArray()
    if (res.length === 0) return null
    res[0].toJSON = Account.toJSON.bind(res[0])
    return res[0]
  }

  static getAccountByAccountId (accountId) {
    return Account.getAccount({ accountId: ObjectID(accountId) })
  }

  static getAccountByGoogleId (googleId) {
    return Account.getAccount({ googleid: googleId })
  }

  static getAccountByAPIKey (apiKey) {
    return Account.getAccount({ apikey: apiKey })
  }

  static getAccountBySession (idToken) {
    return Account.getAccount({ idtoken: idToken })
  }

  static getAccountAmount () {
    return Database.getAccountsCount()
  }

  static async update (account, { username, downloadFormat }) {
    const update = {}
    if (username) {
      update.username = username
      account.username = username
    }
    if (downloadFormat != null) {
      update.downloadformat = downloadFormat
      account.downloadformat = downloadFormat
    }
    await Database.updateAccount(account._id, update)
  }

  static login (accountId, idToken) {
    return Database.updateAccount(accountId, { idtoken: idToken })
  }

  static logout (accountId) {
    return Database.updateAccount(accountId, { idtoken: undefined })
  }

  static toJSON () {
    return {
      username: this.username,
      id: this._id,
      downloadformat: this.downloadformat != null ? this.downloadformat : 0,
      apikey: this.apikey
    }
  }
}
