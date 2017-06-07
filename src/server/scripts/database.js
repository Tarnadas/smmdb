import mysql from 'mysql2/promise'

import Sorting from './sorting'
import Course  from '../Course'
import Account from '../Account'

import {
    mysql as mysqlCredentials
} from './credentials'

const mysqlConnection = Symbol();

export default class Database {

    static async initialize () {

        // TODO add table creation queries
        this[mysqlConnection] = await mysql.createConnection(mysqlCredentials);

    }

    static async getCourses () {

        let query = "SELECT id,title,owner,coursetype,nintendoid,leveltype,difficulty,updatereq,hasthumbnail,hasimage,ispackage,downloadpath," +
            "videoid,UNIX_TIMESTAMP(lastmodified) as lastmodified,UNIX_TIMESTAMP(uploaded) as uploaded FROM courses";
        let rows = (await this[mysqlConnection].execute(query))[0];
        for (let i = 0; i < rows.length; i++) {
            new Course(rows[i]);
        }
        return null;

    }

    static async getAccounts () {

        let rows = (await this[mysqlConnection].execute("SELECT * FROM accounts"))[0];
        for (let i = 0; i < rows.length; i++) {
            new Account(rows[i]);
        }
        return null;

    }

    static async getCompletedCourses () {

        let rows = (await this[mysqlConnection].execute("SELECT * FROM completed"))[0];
        for (let i = 0; i < rows.length; i++) {
            Account.getAccount(rows[i].userid).addCompleted(rows[i].courseid);
            Course.getCourse(rows[i].courseid).addCompleted(rows[i].courseid);
        }
        return null;

    }

    static async getStarredCourses () {

        let rows = (await this[mysqlConnection].execute("SELECT * FROM stars"))[0];
        for (let i = 0; i < rows.length; i++) {
            Account.getAccount(rows[i].userid).addStarred(rows[i].courseid);
            Course.getCourse(rows[i].courseid).addStarred(rows[i].courseid);
        }
        return null;

    }

    static async getDownloadedCourses () {

        let rows = (await this[mysqlConnection].execute("SELECT * FROM downloads"))[0];
        for (let i = 0; i < rows.length; i++) {
            Course.getCourse(rows[i].courseid).addDownload(rows[i].ipaddress);
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
            username: profileName,
            points: 0
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