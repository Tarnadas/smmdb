import {
    generateAPIKey
} from './scripts/util'

const accounts = {};
const accountsByGoogleId = {};
const accountsByAPIKey = {};
//const accountsLoggedIn = {};

const completed = Symbol();
const starred   = Symbol();
const loggedIn  = Symbol();

export default class Account {
    constructor (data, logIn = false) {
        for (let entry in data) {
            this[entry] = data[entry];
        }
        this.points = 0;
        this[completed] = [];
        this[starred] = [];
        this[loggedIn] = logIn;
        accounts[data.id] = this;
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
    static getAccount (accountId) {
        return accounts[accountId];
    }
    static getAccountByGoogleId (googleId) {
        return accountsByGoogleId[googleId];
    }
    static getAccountByAPIKey (apiKey) {
        return accountsByAPIKey[apiKey];
    }
    login () {
        this[loggedIn] = true;
    }
    logout () {
        this[loggedIn] = false;
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