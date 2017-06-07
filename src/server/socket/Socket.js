import Client from './Client'
import {
    lobby
} from '../server';

let currentId = 0;


/**
 * represents all client connections
 */

export default class Socket {
    constructor () {
        this.clients = {};
        this.clientsInLobby = {};

        this.onConnection = this.onConnection.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.onJoinLobby  = this.onJoinLobby.bind(this);
        this.onLeaveLobby = this.onLeaveLobby.bind(this);
        this.onChatGlobal = this.onChatGlobal.bind(this);
    }
    
    /**
     * new client connected
     * @param {Client} client - connecting client
     */
    onConnection (client) {
        this.clients[currentId] = new Client(this, currentId++, client, this.onDisconnect, this.onChatGlobal);
    }
    
    /**
     * client disconnected
     * @param {Client} client - disconnecting client
     */
    onDisconnect (client) {
        lobby.removeUser(client.id);
        delete this.clients[client.id];
        if (!!this.clientsInLobby[client.id]) {
            delete this.clientsInLobby[client.id];
        }
    }
    
    /**
     * client joined lobby
     * @param {Client} client - joining client
     */
    onJoinLobby (client) {
        this.clientsInLobby[client.id] = client;
    }
    
    /**
     * client left lobby
     * @param {Client} client - leaving client
     */
    onLeaveLobby (client) {
        delete this.clientsInLobby[client.id];
    }
    
    /**
     * broadcast global chat message
     * @param data chat message to broadcast
     */
    onChatGlobal (data) {
        let jsonData = JSON.stringify(data);
        for (let i in this.clients) {
            this.clients[i].sendChatGlobal(jsonData);
        }
    }
}