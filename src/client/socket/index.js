import io from 'socket.io-client'

import {
    setUserId,
    addChatMessageGlobal
} from '../actions';

let store, socket;

export default class Socket {
    constructor (address) {
        socket = io(address);

        /**
         * outgoing messages binding
         */
        this.login = this.login.bind(this);
        this.chatGlobal = this.chatGlobal.bind(this);

        /**
         * incoming messages binding
         */
        this.onConnected = this.onConnected.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onError = this.onError.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onChatGlobal = this.onChatGlobal.bind(this);

        /**
         * incoming messages event handler
         */
        socket.on('alter', this.onConnected);
        socket.on('disconnect', this.onDisconnect);
        socket.on('err', this.onError);
        socket.on('login', this.onLogin);
        socket.on('chatGlobal', this.onChatGlobal);

        socket.emit('connection');
    }

    setStore (s) {
        store = s;
    }

    /**
     * send serialized login data
     * @param username
     * @param password
     */
    login (username, password) {
        socket.emit('login', JSON.stringify({
            username,
            password
        }));
    }

    /**
     * send global chat message
     * @param timestamp
     * @param userId
     * @param message
     */
    chatGlobal (timestamp, userId, message) {
        socket.emit('chatGlobal', JSON.stringify({
            timestamp,
            userId,
            message
        }))
    }

    /**
     * receive connection message
     * @param rawData stringified data
     */
    onConnected (rawData) {
        console.log(rawData);
        let data = JSON.parse(rawData);
        console.log(`your user ID is ${data.id}`);
        store.dispatch(setUserId(data.id));
    }

    /**
     * disconnected from server
     */
    onDisconnect () {
        // TODO
        //alert('lost connection to server, DU WICHSER');
    }

    /**
     * receive arbitrary error messages
     * @param rawData stringified data
     */
    onError (rawData) {
        let data = JSON.parse(rawData);
        alert(data.reason);
    }

    /**
     * receive login message
     * @param rawData stringified data
     */
    onLogin (rawData) {
        let data = JSON.parse(rawData);
        if (!!data.username) {
            store.dispatch(setUserName(data.username));
        }
    }

    /**
     * receive global chat message
     * @param rawData stringified data
     */
    onChatGlobal (rawData) {
        let data = JSON.parse(rawData);
        store.dispatch(addChatMessageGlobal(data.timestamp, data.userName, data.message));
    }
}