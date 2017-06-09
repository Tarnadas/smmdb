import {
    decompress
} from 'cemu-smm'

import {
     pointsPerStar, pointsPerDownload
} from './server'
import Account from './Account'

import * as fs   from 'fs'
import * as path from 'path'

export const courses = {};

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
                course.serialized = await courses[i].serializeGzipped();
                course.courseData = courses[i];
                result.push(course);
            }
            if (result.length > 1) {
                for (let i in result) {
                    result[i].title = result[i].courseData.title;
                }
            }
        } catch(err) {
            console.log(err);
        }
        return result;
    }
    async fix (thumbnail) {
        if (!this.courseData.maker) {
            await this.courseData.setMaker(Account.getAccount(this.owner).username);
        }
        if (!this.courseData.title) {
            await this.courseData.setTitle(this.title);
        }
        if (await this.courseData.isThumbnailBroken()) {
            if (!!thumbnail && fs.existsSync(thumbnail)) {
                await this.courseData.setThumbnail(thumbnail);
            } else {
                await this.courseData.setThumbnail(path.join(__dirname, '../client/images/icon_default.jpg'));
            }
        }
        return this;
    }
    setId () {
        courses[this._id] = this;
    }
    static getCourse (courseId) {
        return courses[courseId];
    }
    getJSON (loggedIn, accountId) {
        let result = Object.assign({}, this);
        result.completed = this[completed].length;
        result.starred   = this[starred].length;
        result.downloads = this[downloads].length;
        if (loggedIn && this.completedByUser(accountId)) {
            result.completedself = 1;
        } else {
            result.completedself = 0;
        }
        if (loggedIn && this.starredByUser(accountId)) {
            result.starredself = 1;
        } else {
            result.starredself = 0;
        }
        result.maker = Account.getAccount(result.owner).username;
        result.gamestyle = this.courseData.gameStyle;
        result.coursetheme = this.courseData.courseTheme;
        result.coursethemesub = this.courseData.courseThemeSub;
        result.time = this.courseData.time;
        result.autoscroll = this.courseData.autoScroll;
        result.autoscrollsub = this.courseData.autoScrollSub;
        result.points = Account.getAccount(result.owner).points;
        delete result.owner;
        delete result.serialized;
        delete result.courseData;
        return result;
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
    saveThumbnail () {
        fs.writeFileSync(path.join(__dirname, `../client/courseimg/${this._id}.jpg`), this.courseData.thumbnailPreview);
        fs.writeFileSync(path.join(__dirname, `../client/courseimg/${this._id}_full.jpg`), this.courseData.thumbnail);
    }
}