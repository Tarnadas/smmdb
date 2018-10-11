import { User } from './User'

export class Lobby {
  private users: any

  public constructor () {
    this.users = {}

    this.addUser = this.addUser.bind(this)
    this.removeUser = this.removeUser.bind(this)
  }

  public addUser (userId: any, userName: string, client: any): void {
    this.users[userId] = new User(userId, userName, client)
  }

  public removeUser (userId: number): void {
    let user = this.users[userId]
    if (user) {
      delete this.users[userId]
    }
  }
}
