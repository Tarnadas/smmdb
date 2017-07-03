import {
    decompress, courseProto, deserialize, loadCourse
} from 'cemu-smm'
import {
    zip
} from 'cross-unzip'
import tmp from 'tmp'
import fileType from 'file-type'

import { resolve } from 'path'

import {
     pointsPerStar, pointsPerDownload
} from '.'
import Account  from './Account'
import Database from './scripts/database'
import Sorting  from './scripts/sorting'

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
    async finalize () {
        this.maker = this.courseData.maker;
        this.gameStyle = this.courseData.gameStyle;
        this.courseTheme = this.courseData.courseTheme;
        this.courseThemeSub = this.courseData.courseThemeSub;
        this.time = this.courseData.time;
        this.autoScroll = this.courseData.autoScroll;
        this.autoScrollSub = this.courseData.autoScrollSub;
        this.width = this.courseData.width;
        this.widthSub = this.courseData.widthSub;

        let thumbnailPath = path.join(__dirname, `../client/courseimg/${this._id}.jpg`);
        if (!fs.existsSync(thumbnailPath)) {
            fs.writeFileSync(thumbnailPath, this.courseData.thumbnailPreview);
            fs.writeFileSync(path.join(__dirname, `../client/courseimg/${this._id}_full.jpg`), this.courseData.thumbnail);
        }
        fs.writeFileSync(path.join(__dirname, `../client/coursedata/${this._id}`), await this.courseData.serialize());
        fs.writeFileSync(path.join(__dirname, `../client/coursedata/${this._id}.gz`), await this.courseData.serializeGzipped());
        delete this.courseData;
        delete this.serialized;
        return this;
    }

    static async convertFromMySQL (data) {
        if (!data.downloadpath || !fs.existsSync(data.downloadpath)) {
            console.log("dropped course: " + data.id);
            return [];
        }
        let result = [];
        try {
            let courses = await decompress(data.downloadpath);
            if (!courses) {
                throw new Error();
            }

            if (!data.lastmodified) {
                data.lastmodified = data.uploaded;
            }
            delete data.id;
            delete data.updatereq;
            delete data.hasthumbnail;
            delete data.coursetype;
            delete data.ispackage;
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
            console.log();
            console.log(err);
            console.log("dropped course: " + data.id);
            console.log();
        }
        return result;
    }

    setId () {
        courses[this._id] = this;
    }

    static getCourse (courseId) {
        return courses[courseId];
    }

    toJSON (loggedIn, accountId) {
        let result = Object.assign({}, this);
        result.id = this._id;
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
        result.uploader = Account.getAccount(result.owner).username;
        result.reputation = Account.getAccount(result.owner).getPoints();
        delete result._id;
        delete result.serialized;
        delete result.courseData;
        return result;
    }

    async getCompressed () {
        let tmpDir = await new Promise((resolve, reject) => {
            tmp.dir({}, (err, path) => {
                if (err) reject(err);
                resolve(path);
            })
        });
        await (await deserialize(fs.readFileSync(path.join(__dirname, `../client/coursedata/${this._id}`)))).writeToSave(0, tmpDir);
        const outPath = path.join(tmpDir, `${this.title}.zip`);
        return await new Promise(resolve => {
            zip(tmpDir, outPath, err => {
                if (err) throw err;
                resolve(outPath);
            });
        });
    }

    async getObject () {
        return await deserialize(fs.readFileSync(path.join(__dirname, `../client/coursedata/${this._id}`)));
    }

    getSerialized () {
        return fs.readFileSync(path.join(__dirname, `../client/coursedata/${this._id}.gz`));
    }

    async get3DS () {
        return await (await deserialize(fs.readFileSync(path.join(__dirname, `../client/coursedata/${this._id}`)))).to3DS();
    }

    static async fromBuffer (buffer, account) {
        const tmpFile = resolve(__dirname, 'course');
        fs.writeFileSync(tmpFile, buffer);
        const type = fileType(buffer);
        const mime = type && type.mime;
        const buf = new Uint8Array(buffer);
        const is3DS = () => {
            const header = [0x04, 0x30, 0x04, 0x00, 0x7D, 0x00, 0x00, 0x00, 0xDD, 0xBA, 0xFE, 0xCA, 0x3B, 0xA0, 0xB2, 0xB8, 0x6E, 0x55, 0x29, 0x8B, 0x00, 0xC0, 0x10, 0x00];
            for (let i = 0; i < header.length; i++) {
                if (header[i] !== buf[i + 4]) {
                    return false;
                }
            }
            return true;
        };
        const createCourse = async (courseData) => {
            const course = await (new Course(courseData));
            course.owner = account._id;
            course.nintendoid = null;
            course.videoid = null;
            course.difficulty = 1;
            course.lastmodified = course.modified;
            delete course.modified;
            course.uploaded = Math.floor(new Date().getTime() / 1000);
            if (!course.maker) course.maker = account.username;
            delete course.tiles;
            delete course.tilesSub;
            delete course.sounds;
            delete course.soundsSub;
            delete course.thumbnail;
            delete course.thumbnailPreview;
            await Database.addCourse(course);
            fs.writeFileSync(path.join(__dirname, `../client/courseimg/${course._id}.jpg`), courseData.thumbnailPreview);
            fs.writeFileSync(path.join(__dirname, `../client/courseimg/${course._id}_full.jpg`), courseData.thumbnail);
            fs.writeFileSync(path.join(__dirname, `../client/coursedata/${course._id}`), await courseData.serialize());
            fs.writeFileSync(path.join(__dirname, `../client/coursedata/${course._id}.gz`), await courseData.serializeGzipped());
            course.setId();
            Sorting.insertCourse(course);
            return course;
        };
        try {
            if (mime === 'application/x-rar-compressed' || mime === 'application/zip' || mime === 'application/x-7z-compressed' || mime === 'application/x-tar') {
                const courseData = await decompress(tmpFile);
                const courses = [];
                for (let i = 0; i < courseData.length; i++) {
                    const course = await createCourse(courseData[i]);
                    courses.push(course)
                }
                fs.unlinkSync(tmpFile);
                return courses;
            } else if (is3DS()) {
                const course = await createCourse(await loadCourse(tmpFile, 0, false));
                fs.unlinkSync(tmpFile);
                return [course];
            }
        } catch (err) {
            fs.unlinkSync(tmpFile);
            return null;
        }
    }

    async update ({ title, maker }) {
        const course = await deserialize(fs.readFileSync(path.join(__dirname, `../client/coursedata/${this._id}`)));
        const update = {};
        if (title) {
            this.title = title;
            update.title = title;
            await course.setTitle(title);
        }
        if (maker) {
            this.maker = maker;
            update.maker = maker;
            await course.setMaker(maker);
        }
        this.courseData = course;
        fs.writeFileSync(path.join(__dirname, `../client/coursedata/${this._id}`), await this.courseData.serialize());
        fs.writeFileSync(path.join(__dirname, `../client/coursedata/${this._id}.gz`), await this.courseData.serializeGzipped());
        await Database.updateCourse(this._id, update);
        return null;
    }

    static getCourseAmount () {
        return Object.keys(courses).length;
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