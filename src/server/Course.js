import {
    decompress, deserialize
} from 'cemu-smm'

import {
     pointsPerStar, pointsPerDownload
} from './server'

import * as fs from 'fs'

export const courses = {};

const courseData = Symbol();
const completed  = Symbol();
const starred    = Symbol();
const downloads  = Symbol();

export default class Course {
    constructor (data) {
        for (let entry in data) {
            this[entry] = data[entry];
        }
        this[completed] = [];
        this[starred]   = [];
        this[downloads] = [];
        if (!!data._id) {
            courses[data._id] = this;
        }
    }
    async deserialize () {
        this[courseData] = await deserialize(this.course.buffer);
    }
    static async convertFromMySQL (data) {
        if (!data.downloadpath || !fs.existsSync(data.downloadpath)) {
            console.log("dropped course: " + data.id);
            return [];
        }
        let result = [];
        try {
            let courses = await decompress(data.downloadpath);

            if (!data.lastmodified) {
                data.lastmodified = data.uploaded;
            }
            delete data.id;
            delete data.updatereq;
            delete data.hasthumbnail;
            delete data.ispackage;
            delete data.coursetype;
            delete data.leveltype;
            delete data.hasimage;
            delete data.downloadpath;

            for (let i in courses) {
                let course = Object.assign({}, data);
                course.course = await courses[i].serializeGzipped();
                course[courseData] = courses[i];
                result.push(course);
            }
            if (result.length > 1) {
                for (let i in result) {
                    result[i].title = result[i][courseData].title;
                }
            }
        } catch(err) {
            console.log(err);
        }
        return result;
    }
    static getCourse (courseId) {
        return courses[courseId];
    }
    setId () {
        courses[this._id] = this;
    }
    getJson () {

    }
    addCompleted (accountId) {
        this[completed].push(accountId);
    }
    removeCompleted (accountId) {
        this[completed].splice(this[completed].indexOf(accountId), 1);
    }
    getCompleted () {
        return this[completed].length;
    }
    completedByUser (accountId) {
        return this[completed].includes(accountId);
    }
    addStarred (accountId) {
        this[starred].push(accountId);
    }
    removeStarred (accountId) {
        this[starred].splice(this[starred].indexOf(accountId), 1);
    }
    getStarred () {
        return this[starred].length;
    }
    starredByUser (accountId) {
        return this[starred].includes(accountId);
    }
    addDownload (ipAddress) {
        if (!this[downloads].includes(ipAddress)) {
            this[downloads].push(ipAddress);
        }
    }
    getDownloads () {
        return this[downloads].length;
    }
    getPoints () {
        return this[downloads].length * pointsPerDownload + this[starred].length * pointsPerStar
    }
}