import {
    pointsPerUpload, pointsPerStar, pointsPerDownload
} from './server'

export const courses = {};

const completed = Symbol();
const starred   = Symbol();
const downloads = Symbol();

export default class Course {
    constructor (data) {
        for (let entry in data) {
            this[entry] = data[entry];
        }
        this.updatereq = !!this.updatereq;
        this.hasthumbnail = !!this.hasthumbnail;
        this.ispackage = !!this.ispackage;
        if (!this.lastmodified) {
            this.lastmodified = this.uploaded;
        }
        this.completed = 0;
        this.starred = 0;
        this.downloads = 0;
        this[completed] = [];
        this[starred]   = [];
        this[downloads] = [];
        courses[data.id] = this;
    }
    static getCourse (courseId) {
        return courses[courseId];
    }
    addCompleted (accountId) {
        this[completed].push(accountId);
        this.completed++;
    }
    removeCompleted (accountId) {
        this[completed].splice(this[completed].indexOf(accountId), 1);
        this.completed--;
    }
    completedByUser (accountId) {
        return this[completed].includes(accountId);
    }
    addStarred (accountId) {
        this[starred].push(accountId);
        this.starred++;
    }
    removeStarred (accountId) {
        this[starred].splice(this[starred].indexOf(accountId), 1);
        this.starred--;
    }
    starredByUser (accountId) {
        return this[starred].includes(accountId);
    }
    addDownload (ipAddress) {
        if (!this[downloads].includes(ipAddress)) {
            this[downloads].push(ipAddress);
            this.downloads++;
        }
    }
    getPoints () {
        return this.downloads * pointsPerDownload + this.starred * pointsPerStar + pointsPerUpload
    }
}