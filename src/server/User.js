const client = Symbol('client')

export default class User {
  constructor (id, username, cl) {
    this.id = id
    this.username = username
    this[client] = cl

    this.getClient = this.getClient.bind(this)
  }
  getClient () {
    return this[client]
  }
}
