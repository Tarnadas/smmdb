import {
  ObjectID
} from 'mongodb'
import randomString from 'crypto-random-string'

import {
  generateAPIKey
} from './scripts/util'
import Database from './Database'

export const MAX_LENGTH_USERNAME = 20
export const MIN_LENGTH_USERNAME = 3

export default class Account {
  static async createAccount ({ googleid, username, email, idtoken }) {
    if (username.length < MIN_LENGTH_USERNAME) throw new Error('Username received by Google account was too short')
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

  static async getAccount ({ accountId, googleid, apikey, idtoken }, hideSensitive = true) {
    const filter = {}
    if (accountId) filter._id = accountId
    if (googleid) filter.googleid = googleid
    if (apikey) filter.apikey = apikey
    if (idtoken) filter.idtoken = idtoken
    if (Object.keys(filter).length === 0) return null
    let res = await Database.filterAccounts(filter).toArray()
    if (res.length === 0) return null
    const account = res[0]
    await Account.prepare(account)
    account.toJSON = Account.toJSON.bind(account, hideSensitive)
    return account
  }

  static getAccountByAccountId (accountId, hideSensitive) {
    return Account.getAccount({ accountId: ObjectID(accountId) }, hideSensitive)
  }

  static getAccountByGoogleId (googleId, hideSensitive) {
    return Account.getAccount({ googleid: googleId }, hideSensitive)
  }

  static getAccountByAPIKey (apiKey, hideSensitive) {
    return Account.getAccount({ apikey: apiKey }, hideSensitive)
  }

  static getAccountBySession (idToken, hideSensitive) {
    return Account.getAccount({ idtoken: idToken }, hideSensitive)
  }

  static getAccountAmount () {
    return Database.getAccountsCount()
  }

  static async prepare (account) {
    const stars = await Database.getAccountStars(account._id)
    const stars64 = await Database.getAccountStars64(account._id)
    account.stars = []
    account.stars64 = []
    for (let i in stars) {
      account.stars.push(stars[i].courseId)
    }
    for (let i in stars64) {
      account.stars64.push(stars64[i].courseId)
    }
    return account
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

  static toJSON (hideSensitive = true) {
    return Object.assign({
      username: this.username,
      id: this._id,
      downloadformat: this.downloadformat != null ? this.downloadformat : 0,
      stars: this.stars,
      stars64: this.stars64
    }, hideSensitive ? {} : {
      apikey: this.apikey
    }, this.permissions ? {
      permissions: this.permissions
    } : {})
  }
}
