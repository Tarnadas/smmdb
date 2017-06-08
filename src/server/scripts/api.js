import * as fs from 'fs'

import Database from './database'
import Sorting  from './sorting'
import Account  from '../Account'

const MAX_LIMIT = 100;

export default class API {

    static getCourses (loggedIn, userId, filterData) {

        let orderBy = "lastmodified", dir = "desc";
        let result = [];

        if (!!filterData && !!filterData.order && !!filterData.dir) {
            orderBy = filterData.order;
            dir = filterData.dir;
        }

        let courses = Sorting.getCoursesBySorting(orderBy, dir);
        let limit = (!!filterData && !!filterData.limit) ? (filterData.limit) : MAX_LIMIT;
        let start = (!!filterData && !!filterData.start) ? (filterData.start) : 0;
        for (let i = start; i < start + limit; i++) {

            let course = courses[i];

            if (!!filterData) {
                if (filterData.ispackage != null) {
                    if (!!filterData.ispackage !== course.ispackage) {
                        continue;
                    }
                }
                if (!!filterData.lastmodifiedfrom) {
                    if (parseInt(filterData.lastmodifiedfrom) > course.lastmodified) {
                        continue;
                    }
                }
                if (!!filterData.lastmodifiedto) {
                    if (parseInt(filterData.lastmodifiedto) < course.lastmodified) {
                        continue;
                    }
                }
                if (!!filterData.uploadedfrom) {
                    if (parseInt(filterData.uploadedfrom) > course.uploaded) {
                        continue;
                    }
                }
                if (!!filterData.uploadedto) {
                    if (parseInt(filterData.uploadedto) < course.uploaded) {
                        continue;
                    }
                }
                if (!!filterData.coursetype) {
                    if (parseInt(filterData.coursetype) !== course.coursetype) {
                        continue;
                    }
                }
                if (!!filterData.title) {
                    if (!course.title.toLowerCase().includes(filterData.title.toLowerCase())) {
                        continue;
                    }
                }
                if (!!filterData.owner) {
                    if (filterData.owner.toLowerCase() !== Account.getAccount(course.owner).username.toLowerCase()) {
                        continue;
                    }
                }
                if (!!filterData.leveltype) {
                    if (parseInt(filterData.leveltype) !== course.leveltype || course.leveltype == null) {
                        continue;
                    }
                }
                if (!!filterData.difficultyfrom) {
                    if (parseInt(filterData.difficultyfrom) > course.difficulty || course.difficulty == null) {
                        continue;
                    }
                }
                if (!!filterData.difficultyto) {
                    if (parseInt(filterData.difficultyto) < course.difficulty || course.difficulty == null) {
                        continue;
                    }
                }
                if (filterData.updatereq != null) {
                    if (!!filterData.updatereq !== course.updatereq || course.updatereq == null) {
                        continue;
                    }
                }
                if (filterData.hasthumbnail != null) {
                    if (!!filterData.hasthumbnail !== course.hasthumbnail || course.hasthumbnail == null) {
                        continue;
                    }
                }
            }
            let resultCourse = course.getJSON(loggedIn, userId);
            result.push(resultCourse);

        }

        return result;

    }

    static getCoursesSelf (userId) {

        let filterData = {};
        filterData.owner = Account.getAccount(userId).username;

        return this.getCourses(true, userId, null, filterData);

    }

    static async starCourse (accountId, data) {

        if (!data.courseid) {
            return {
                err: "Course ID not found"
            };
        } else {
            let courseId = parseInt(data.courseid);
            if (!this.courses[courseId]) {
                return {
                    err: "Course not found"
                };
            } else {
                if (!!data.dostar && data.dostar === "0") {
                    if (!starredByUserId[accountId] || !!starredByUserId[accountId] && starredByUserId[accountId].includes(courseId)) {
                        try {
                            courses[courseId].stars--;

                            database.unstarCourse(accountId, courseId);
                            sorting.unstarUpload(courseId);

                            let index = starredByUserId[accountId].indexOf(courseId);
                            starredByUserId[accountId].splice(index, 1);

                            if (!!starredByCourseId[courseId]) {
                                index = starredByCourseId[courseId].indexOf(accountId);
                                starredByCourseId[courseId].splice(index, 1);
                            }

                            users[courses[courseId].owner].points -= pointsPerStar;

                            return {
                                user: accountId,
                                username: users[accountId].username,
                                owner: courses[courseId].owner,
                                ownername: courses[courseId].username,
                                points: users[courses[courseId].owner].points,
                                courseid: courseId,
                                starredself: 0
                            };
                        } catch (err) {
                            console.log(err);
                            return {
                                err: "Internal Server Error"
                            };
                        }
                    } else {
                        return {
                            err: "Tried to unstar course that is not starred"
                        };
                    }
                } else {
                    if (!starredByUserId[accountId] || !!starredByUserId[accountId] && !starredByUserId[accountId].includes(courseId)) {
                        try {
                            courses[courseId].stars++;

                            await Database.starCourse(accountId, courseId);
                            sorting.starUpload(courseId);

                            if (!starredByUserId[accountId]) {
                                starredByUserId[accountId] = [courseId];
                            } else {
                                starredByUserId[accountId].push(courseId);
                            }
                            if (!starredByCourseId[courseId]) {
                                starredByCourseId[courseId] = [accountId];
                            } else {
                                starredByCourseId[courseId].push(accountId);
                            }

                            users[courses[courseId].owner].points += pointsPerStar;

                            return {
                                user: accountId,
                                username: users[accountId].username,
                                owner: courses[courseId].owner,
                                ownername: courses[courseId].username,
                                points: users[courses[courseId].owner].points,
                                courseid: courseId,
                                starredself: 1
                            };
                        } catch (err) {
                            console.log(err);
                            return {
                                err: "Internal Server Error"
                            };
                        }
                    } else {
                        return {
                            err: "Tried to star course that is already starred"
                        };
                    }
                }
            }
        }
    }

    static async completeCourse (accountId, data) {

        if (!data.courseid) {
            return {
                err: "Course ID not found"
            };
        } else {
            let courseId = parseInt(data.courseid);
            if (!courses[courseId]) {
                return {
                    err: "Course not found"
                };
            } else {
                if (data.hasOwnProperty('docomplete') && !data.docomplete) {
                    if (!completedByUserId[accountId] || !!completedByUserId[accountId] && completedByUserId[accountId].includes(courseId)) {
                        try {
                            courses[courseId].completed--;

                            await Database.uncompleteCourse(accountId, courseId);
                            sorting.uncompleteUpload(courseId);

                            let index = completedByUserId[accountId].indexOf(courseId);
                            completedByUserId[accountId].splice(index, 1);

                            if (!!completedByCourseId[courseId]) {
                                index = completedByCourseId[courseId].indexOf(accountId);
                                completedByCourseId[courseId].splice(index, 1);
                            }

                            return {
                                user: accountId,
                                username: users[accountId].username,
                                owner: courses[courseId].owner,
                                ownername: courses[courseId].ownername,
                                courseid: courseId,
                                completedself: 0
                            };
                        } catch (err) {
                            console.log(err);
                            return {
                                err: "Internal Server Error"
                            };
                        }
                    } else {
                        return {
                            err: "Tried to uncomplete course that is not completed"
                        };
                    }
                } else {
                    if (!completedByUserId[accountId] || !!completedByUserId[accountId] && !completedByUserId[accountId].includes(courseId)) {
                        try {
                            courses[courseId].completed++;

                            database.completeCourse(accountId, courseId);
                            sorting.completeUpload(courseId);

                            if (!completedByUserId[accountId]) {
                                completedByUserId[accountId] = [courseId];
                            } else {
                                completedByUserId[accountId].push(courseId);
                            }
                            if (!completedByCourseId[courseId]) {
                                completedByCourseId[courseId] = [accountId];
                            } else {
                                completedByCourseId[courseId].push(accountId);
                            }

                            return {
                                user: accountId,
                                username: users[accountId].username,
                                owner: courses[courseId].owner,
                                ownername: courses[courseId].ownername,
                                courseid: courseId,
                                completedself: 1
                            };
                        } catch (err) {
                            console.log(err);
                            return {
                                err: "Internal Server Error"
                            };
                        }
                    } else {
                        return {
                            err: "Tried to complete course that is already completed"
                        };
                    }
                }
            }
        }

    }

    static async uploadCourse (req, accountId) {

        return new Promise(async (resolve) => {

            if (!accountId) {
                resolve(JSON.stringify({
                    err: "Invalid API key"
                }));
            } else {
                req.pipe(req.busboy);
                req.busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                    if (!mimetype.includes("zip-compressed") && !mimetype.includes("octet-stream")) {
                        resolve(JSON.stringify({
                            err: "Wrong MIME type"
                        }));
                    } else {

                        let limitReached = false;
                        file.fileRead = [];
                        let size = 0;

                        file.on('data', (chunk) => {
                            file.fileRead.push(chunk);
                            size += chunk.length;
                        });

                        file.on('limit', () => {
                            limitReached = true;
                            file.resume();
                            resolve(JSON.stringify({
                                err: "File size too big"
                            }));
                        });

                        file.on('end', async () => {
                            if (!limitReached) {
                                let split = filename.split(".");
                                let newFileName = Date.now() + "." + split[split.length - 1];

                                let buffer = Buffer.concat(file.fileRead, size);
                                let fstream = fs.createWriteStream(__dirname + '/../courses/' + newFileName);
                                fstream.write(buffer);

                                console.log("Upload Finished of " + filename);

                                // create DB entry
                                let title = "";
                                for (let i = 0; i < split.length - 1; i++) {
                                    title += split[i];
                                }
                                let path = "courses/";

                                users[accountId].points += pointsPerUpload;

                                let result = await database.saveCourse(title, accountId, path + newFileName);
                                Sorting.insertUpload(result.id);

                                resolve(JSON.stringify(result));
                            }
                        });
                    }
                });
            }
        });

    }

}