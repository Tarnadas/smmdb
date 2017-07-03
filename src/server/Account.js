import {
    generateAPIKey
} from './scripts/util'
import Database from './scripts/database'

export const accounts = {};
const accountsByGoogleId = {};
const accountsByAPIKey = {};
const accountsBySession = {};

const points    = Symbol();
const completed = Symbol();
const starred   = Symbol();
const loggedIn  = Symbol();

export default class Account {
    constructor (data, logIn = false) {
        for (let entry in data) {
            this[entry] = data[entry];
        }
        this[points] = 0;
        this[completed] = [];
        this[starred] = [];
        this[loggedIn] = logIn;
        accountsByGoogleId[data.googleid] = this;
        if (!!data.apikey) {
            accountsByAPIKey[data.apikey] = this;
        } else {
            let apiKey = generateAPIKey();
            while (Object.keys(accountsByAPIKey).includes(apiKey)) {
                apiKey = generateAPIKey();
            }
            this.apikey = apiKey;
            accountsByAPIKey[apiKey] = this;
        }
    }
    static convertFromMySQL (data) {
        delete data.id;
        delete data.password;
        return data;
    }
    static getAccount (accountId) {
        return accounts[accountId];
    }
    static getAccountByAPIKey (apiKey) {
        return accountsByAPIKey[apiKey];
    }
    static getAccountAmount () {
        return Object.keys(accounts).length;
    }
    setId () {
        accounts[this._id] = this;
    }
    async setUsername (username) {
        this.username = username;
        await Database.updateAccount(this._id, { username });
        return null;
    }
    static exists (googleId) {
        return !!accountsByGoogleId[googleId];
    }
    static getAccountByGoogleId (googleId) {
        return accountsByGoogleId[googleId];
    }
    static getAccountByAPIKey (apiKey) {
        return accountsByAPIKey[apiKey];
    }
    static getAccountBySession (idToken) {
        return accountsBySession[idToken];
    }
    toJSON () {
        return {
            username: this.username,
            id: this._id,
            apikey: this.apikey,
            completed: this[completed],
            starred: this[starred],
            points: this[points]
        }
    }
    addPoints (p) {
        this[points] += p;
    }
    getPoints () {
        return this[points];
    }
    login (idToken) {
        this[loggedIn] = true;
        accountsBySession[idToken] = this;
    }
    logout (idToken) {
        this[loggedIn] = false;
        delete accountsBySession[idToken];
    }
    isLoggedIn () {
        return this[loggedIn];
    }
    addCompleted (courseId) {
        this[completed].push(courseId);
    }
    removeCompleted (courseId) {
        this[completed].splice(this[completed].indexOf(courseId), 1);
    }
    getCompletedAmount () {
        return this[completed].length
    }
    addStarred (courseId) {
        this[starred].push(courseId);
    }
    removeStarred (courseId) {
        this[starred].splice(this[starred].indexOf(courseId), 1);
    }
    getStarredAmount () {
        return this[starred].length
    }
}