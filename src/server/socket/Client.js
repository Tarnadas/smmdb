import {
    lobby
} from '../server'

const MIN_LENGTH_USERNAME = 3;
const MAX_LENGTH_USERNAME = 20;

let socket = Symbol();
let onDisconnect = Symbol(), onChatGlobal = Symbol();

/**
 * represents a single client connection
 */

export default class Client {
    constructor (s, id, client, disconnect, chatGlobal) {

        this.onDisconnect = this.onDisconnect.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onChatGlobal = this.onChatGlobal.bind(this);
        this.sendChatGlobal = this.sendChatGlobal.bind(this);

        this.id = id;
        this.client = client;
        this[socket] = s;
        this[onDisconnect] = disconnect;
        this[onChatGlobal] = chatGlobal;

        this.client.emit('alter', JSON.stringify({
            id
        }));
        this.client.on('disconnect', this.onDisconnect);
        this.client.on('login', this.onLogin);
        this.client.on('chatGlobal', this.onChatGlobal);
    }

    /**
     * client disconnected
     */
    onDisconnect () {
        this[onDisconnect](this);
    }

    /**
     * client tries to login
     * @param rawData stringified LoginMessage
     */
    onLogin (rawData) {
        let data = JSON.parse(rawData);
        let username = data.username;
        let password = data.password; // TODO
        if (!username) {
            this.client.emit('err', JSON.stringify({
                reason: 'username is empty'
            }));
        } else if (username.length < MIN_LENGTH_USERNAME) {
            this.client.emit('err', JSON.stringify({
                reason: 'username too short'
            }));
        } else if (username.length > MAX_LENGTH_USERNAME) {
            this.client.emit('err', JSON.stringify({
                reason: 'username too long, fast so long wie ...'
            }));
        } else {
            this[socket].onJoinLobby(this);
            lobby.addUser(this.id, username, this.client);
            let response = '';
            this.client.emit('login', response);
        }
    }

    /**
     * client sends chat message in global
     * @param {string} rawData - stringified data
     */
    onChatGlobal (rawData) {
        let data;
        try {
            data = JSON.parse(rawData);
        } catch (err) {
            this.client.emit('err', JSON.stringify({
                reason: 'could not parse data'
            }));
            return;
        }
        if (data.userId === null) {
            this.client.emit('err', JSON.stringify({
                reason: 'no user ID submitted'
            }));
            return;
        }
        if (!data.message) {
            this.client.emit('err', JSON.stringify({
                reason: 'no message submitted'
            }));
            return;
        }
        if (!data.timestamp) {
            this.client.emit('err', JSON.stringify({
                reason: 'no timestamp submitted'
            }));
            return;
        }
        let response = {
            timestamp: data.timestamp,
            userName: lobby.users[data.userId].userName,
            message: data.message
        };
        this[onChatGlobal](response);
    }
    
    /**
     * send global chat message to client
     * @param jsonData stringified chat message to send
     */
    sendChatGlobal (jsonData) {
        this.client.emit('chatGlobal', jsonData);
    }
}