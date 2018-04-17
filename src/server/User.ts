const client = Symbol('client')

export class User {
  private [client]: any

  constructor (private id: string, public username: string, cl: any) {
    this.id = id
    this.username = username
    this[client] = cl

    this.getClient = this.getClient.bind(this)
  }

  public getClient (): any {
    return this[client]
  }
}
