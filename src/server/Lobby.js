import User from './User'

export default class Lobby {

    constructor () {

        this.users = {};

        this.addUser = this.addUser.bind(this);
        this.removeUser = this.removeUser.bind(this);

    }

    addUser (userId, userName, client) {
        this.users[userId] = new User(userId, userName, client);
    }

    removeUser (userId) {

        let user = this.users[userId];
        if (!!user) {
            delete this.users[userId];
        }

    }

}