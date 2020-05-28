import { ObjectID } from 'mongodb'
import randomString from 'crypto-random-string'

import { generateAPIKey } from './scripts/util'
import { Database } from './Database'

export const MAX_LENGTH_USERNAME = 20
export const MIN_LENGTH_USERNAME = 3

export abstract class Account {
  public static async createAccount ({ googleid, username, email, idtoken }: any): Promise<any> {
    if (username.length < MIN_LENGTH_USERNAME) throw new Error('Username received by Google account was too short')
    if (username.length > MAX_LENGTH_USERNAME) username = username.substr(0, MAX_LENGTH_USERNAME)
    const accountNames = (await Database.filterAccounts().toArray()).map((ac: any): string => ac.username)
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

  public static async getAccount ({ accountId, googleid, apikey, idtoken }: any, hideSensitive = true): Promise<any> {
    const filter: any = {}
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

  public static getAccountByAccountId (accountId: string, hideSensitive?: boolean): any {
    return Account.getAccount({ accountId: new ObjectID(accountId) }, hideSensitive)
  }

  public static getAccountByGoogleId (googleId: any, hideSensitive?: boolean): any {
    return Account.getAccount({ googleid: googleId }, hideSensitive)
  }

  public static getAccountByAPIKey (apiKey: string, hideSensitive?: boolean): any {
    return Account.getAccount({ apikey: apiKey }, hideSensitive)
  }

  public static getAccountBySession (idToken: any, hideSensitive?: boolean): Promise<any> {
    return Account.getAccount({ idtoken: idToken }, hideSensitive)
  }

  public static getAccountAmount (): any {
    return Database.getAccountsCount()
  }

  public static async prepare (account: any): Promise<any> {
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

  public static async update (account: any, { username, downloadFormat }: any): Promise<any> {
    const update: any = {}
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

  public static async updateNet64Server (account: any, server: any): Promise<string> {
    const _server = await Database.getNet64Server(account._id)
    if (_server) {
      Database.updateNet64Server(_server._id, server)
      return _server._id
    } else {
      return (await Database.insertNet64Server(server)).insertedId
    }
  }

  public static login (accountId: any, idToken: any): any {
    return Database.updateAccount(accountId, { idtoken: idToken })
  }

  public static logout (accountId: any): any {
    return Database.updateAccount(accountId, { idtoken: undefined })
  }

  public static toJSON (hideSensitive = true): any {
    return Object.assign({
      username: (this as any).username,
      id: (this as any)._id,
      downloadformat: (this as any).downloadformat != null ? (this as any).downloadformat : 0,
      stars: (this as any).stars,
      stars64: (this as any).stars64
    }, hideSensitive ? {} : {
      apikey: (this as any).apikey
    }, (this as any).permissions ? {
      permissions: (this as any).permissions
    } : {})
  }
}
