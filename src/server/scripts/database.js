import mysql from 'mysql2/promise'
import {
    MongoClient
} from 'mongodb'
import ProgressBar from 'progress'

import * as path from 'path'

import Sorting from './sorting'
import Course, {courses}  from '../Course'
import Account from '../Account'

import {
    mysql as mysqlCredentials
} from './credentials'
import { log } from './util'

const mysqlConnection = Symbol();
const mongoUrl = 'mongodb://localhost:27017';

export default class Database {

    static async initialize () {

        log('Connecting to database');
        this.db = await MongoClient.connect(mongoUrl);

        // load courses
        this.courses = this.db.collection('courses');
        let courses = await this.courses.find({}).toArray();
        log('Connected');
        let progressCourses = new ProgressBar('  loading courses [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: courses.length
        });
        for (let i in courses) {
            new Course(courses[i]);
            await new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                });
            });
            progressCourses.tick();
        }

        // load accounts
        this.accounts = this.db.collection('accounts');
        let accounts = await this.accounts.find({}).toArray();
        for (let i in accounts) {
            (new Account(accounts[i])).setId();
        }

    }

    static async addCourse (course) {
        return await this.courses.insertOne(course);
    }

    static async addAccount (account) {
        return await this.accounts.insertOne(account);
    }

    static async convertMySQL () {

        this[mysqlConnection] = await mysql.createConnection(mysqlCredentials);
        let query = "SELECT id,title,owner,coursetype,nintendoid,leveltype,difficulty,updatereq,hasthumbnail,hasimage,ispackage,downloadpath," +
            "videoid,UNIX_TIMESTAMP(lastmodified) as lastmodified,UNIX_TIMESTAMP(uploaded) as uploaded FROM courses";
        let rows = (await this[mysqlConnection].execute(query))[0];
        let courses = [];
        let progress = new ProgressBar('  converting courses [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: rows.length
        });
        let thumbnails = [];
        for (let i = 0; i < rows.length; i++) {
            let id = rows[i].id;
            let a = await Course.convertFromMySQL(rows[i]);
            thumbnails = thumbnails.concat(Array.from((function * () {
                for (let i = 0; i < a.length; i++) {
                    yield path.join(__dirname, `../client/img/courses/${id}.pic`);
                }
            })()));
            courses = courses.concat(a);
            progress.tick();
        }

        rows = (await this[mysqlConnection].execute("SELECT * FROM accounts"))[0];
        let accountIds = {};
        for (let i = 0; i < rows.length; i++) {
            let id = rows[i].id;
            let account = new Account(Account.convertFromMySQL(rows[i]));
            accountIds[id] = (await this.addAccount(account)).insertedId;
            account.setId();
        }

        progress = new ProgressBar('  fixing courses [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 40,
            total: rows.length
        });
        for (let i in courses) {
            courses[i].owner = accountIds[courses[i].owner];
            let course = await (new Course(courses[i])).fix(thumbnails[i]);
            await this.addCourse(course);
            course.setId();
            progress.tick();
        }

        return null;

    }

    static async saveAccount (googleId, idToken, email, profileName) {

        let query = `INSERT INTO accounts (googleid, email, username) VALUES ('${googleId}','${email}','${profileName}')`;
        let result = (await this[mysqlConnection].execute(query))[0];
        let accountId = parseInt(result.insertId);
        await this[mysqlConnection].execute(`INSERT INTO sessions (token, accountid) VALUES ('${idToken}','${accountId}');`);
        new Account({
            id: accountId,
            googleid: +googleId,
            username: profileName
        }, true);
        return null;

    }

    static async storeDownload (id, ip) {

        let query = `INSERT INTO downloads (courseid,ipaddress,timestamp) VALUES ('${id}','${ip}',NOW())`;
        await this[mysqlConnection].execute(query);
        return null;

    }

    static async saveCourse (title, accountId, downloadPath) {

        let query = `INSERT INTO courses (title, owner, downloadpath, uploaded) VALUES ('${title}','${accountId}','${downloadPath}',NOW())`;
        let result = (await this[mysqlConnection].execute(query))[0];
        let courseId = parseInt(result.insertId); // TODO check if this works
        let course = new Course({
            id: courseId,
            coursetype: 0,
            nintendoid: "",
            title: title,
            owner: accountId,
            hasimage: 0,
            ispackage: 0,
            downloadpath: downloadPath,
            uploaded: Math.trunc(new Date().getTime() / 1000), // TODO
            lastmodified: Math.trunc(new Date().getTime() / 1000),
            completed: 0,
            stars: 0,
            downloads: 0
        });
        Sorting.insertCourse(course);

        return Object.assign({}, course, {
            ownername: Account.getAccount(accountId).username,
            points: Account.getAccount(accountId).points
        });

    }

    static async updateCourse (data) {

        let query = `UPDATE courses SET lastmodified=NOW(),title='${data.title}'`;
        if (!!data.coursetype) {
            query += `,coursetype='${data.coursetype}'`;
        }
        if (!!data.coursetype && !!data.nintendoid) {
            query += `,nintendoid='${data.nintendoid}'`;
        }
        if (!!data.leveltype) {
            query += `,leveltype='${data.leveltype}'`;
        }
        if (!!data.difficulty) {
            query += `,difficulty='${data.difficulty}'`;
        }
        if (!!data.updatereq) {
            query += `,updatereq='${data.updatereq}'`;
        }
        if (!!data.hasthumbnail) {
            query += `,hasthumbnail='${data.hasthumbnail}'`;
        }
        if (!!data.videoid) {
            query += `,videoid='${data.videoid}'`;
        }
        if (!!data.ispackage) {
            query += `,ispackage='${data.ispackage}'`;
        }
        query += ` WHERE id=${data.id}`;

        return await this[mysqlConnection].execute(query);

    }

    static async bumpCourse (courseId) {

        return await this[mysqlConnection].execute(`UPDATE courses set lastmodified=NOW() WHERE id='${courseId}'`);

    }

    static async addImage (courseId) {

        return await this[mysqlConnection].execute(`UPDATE courses set lastmodified=NOW(),hasimage='1' WHERE id='${courseId}'`);

    }

    static async deleteCourse (courseId) {

        await this[mysqlConnection].execute(`DELETE FROM courses WHERE id='${courseId}'`);
        await this[mysqlConnection].execute(`DELETE FROM downloads WHERE courseid='${courseId}'`);
        await this[mysqlConnection].execute(`DELETE FROM stars WHERE courseid='${courseId}'`);
        await this[mysqlConnection].execute(`DELETE FROM completed WHERE courseid='${courseId}'`);
        return null;

    }

    static async updateSession (accountId, idToken) {

        await this[mysqlConnection].execute(`DELETE FROM sessions WHERE accountid='${accountId}'`);
        await this[mysqlConnection].execute(`INSERT INTO sessions (token, accountid) VALUES ('${idToken}','${accountId}');`);
        return null;

    }

    static async removeSession (token) {

        return await this[mysqlConnection].execute(`DELETE FROM sessions WHERE token='${token}'`);

    }

    static async starCourse (accountId, courseId) {

        let query = `INSERT INTO stars (userid,courseid,timestamp) VALUES ('${accountId}','${courseId}',NOW())`;
        return await this[mysqlConnection].execute(query);

    }

    static async unstarCourse (accountId, courseId) {

        let query = `DELETE FROM stars WHERE userid='${accountId}' AND courseid='${courseId}'`;
        return await this[mysqlConnection].execute(query);

    }

    static async completeCourse (accountId, courseId) {

        let query = `INSERT INTO completed (userid,courseid,timestamp) VALUES ('${accountId}','${courseId}',NOW())`;
        return await this[mysqlConnection].execute(query);

    }

    static async uncompleteCourse (accountId, courseId) {

        let query = `DELETE FROM completed WHERE userid='${accountId}' AND courseid='${courseId}'`;
        return await this[mysqlConnection].execute(query);

    }

    static async setUsername (username, accountId) {

        let query = `UPDATE accounts SET username='${username}' WHERE id='${accountId}'`;
        return await this[mysqlConnection].execute(query);

    }

    static async setAPIKey (apiKey, accountId) {

        let query = `UPDATE accounts SET apikey='${apiKey}' WHERE id='${accountId}'`;
        return await this[mysqlConnection].execute(query);

    }

}