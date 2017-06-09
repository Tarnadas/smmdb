import express       from 'express'
import compression   from 'compression'
import busboy        from 'connect-busboy'
import cheerio       from 'cheerio'
import sharp         from 'sharp'
import cookieSession from 'cookie-session'
import verifier      from 'google-id-token-verifier'
import favicon       from 'serve-favicon'

import * as http from 'http'
import * as fs   from 'fs'
import * as path from 'path'
import * as qs   from 'querystring'

import Lobby       from './Lobby'
import Account     from './Account'
import Course      from './Course'
import Socket      from './socket/Socket'
import API         from './scripts/api'
import Database    from './scripts/database'
import Sorting     from './scripts/sorting'
import Parsing     from './scripts/parsing'
import {
    clientId as googleClientId, cookie as cookieCredentials
} from './scripts/credentials'
import {
    log, calculatePoints
} from './scripts/util'

export const lobby = new Lobby();

const port = 80;

const $index = cheerio.load(fs.readFileSync(path.join(__dirname, "../client/views/index.html")));
const $api   = cheerio.load(fs.readFileSync(path.join(__dirname, "../client/views/api.html")));

export const pointsPerDownload = 1;
export const pointsPerStar = 15;

export const thumbnailMaxWidth  = 1000;
export const thumbnailMaxHeight = 100;

export const maxFileSize = 6 * 1024 * 1024;

//const cacheMaxAgeServer = 86400000*7; // TODO server caching?
export const cacheMaxAgeImg = 86400000;
export const cacheMaxAgeCSS = 86400000;
export const cacheMaxAgeJS  = 86400000;

const usernameRegEx = /^[a-z0-9A-Z|.]+$/;
const usernameMinCharacters = 3;
const usernameMaxCharacters = 30;

const levelnameRegEx  = /^[a-z0-9A-Z| |.|\\-]+$/;
const nintendoIdRegEx = /^[0-9A-Z|\\-]+$/;
const videoIdRegEx    = /^[a-z0-9A-Z| |.|\\_|\\-]+$/;

const clientId = googleClientId;

// initialize database
(async () => {
    try {
        await Database.initialize();
        //await Database.convertMySQL();
        main();
    } catch (err) {
        console.log(err);
    }
})();

function main() {

    log("Database initialized");

    calculatePoints();
    Parsing.parseNintendoCourses();
    Sorting.sortCourses();

    // initialize app engine
    const app = express();

    const server = http.createServer(app);
    const io = require('socket.io')(server);
    const socket = new Socket();
    io.on('connection', socket.onConnection);

    app.use(compression());
    app.set('trust proxy', 1);
    app.use(busboy({limits: {
        files: 1,
        fileSize: maxFileSize
    }}));
    app.use(favicon(path.join(__dirname, '../../favicon.ico')));
    app.use('/img', express.static(path.join(__dirname, '../client/images'), { maxAge: cacheMaxAgeImg }));
    app.use('/courseimg', express.static(path.join(__dirname, '../client/courseimg')));
    app.use('/styles', express.static(path.join(__dirname, '../client/styles'), { maxAge: cacheMaxAgeCSS })); // TODO minimize styles
    app.use('/script', express.static(path.join(__dirname, '../client/script'), { maxAge: cacheMaxAgeJS }));
    app.use(cookieSession({
        name: 'session',
        keys: cookieCredentials,
        maxAge: 24 * 60 * 60 * 1000
    }));

    app.use('/courses', async (req, res) => {

        let courseId = req.url.substr(1);

        if  (!courses[courseId]) {
            res.writeHeader(404, {"Content-Type": "text/html"});
            res.end();
        } else {
            res.download(__dirname + '/' + courses[courseId].downloadpath, courses[courseId].title + "." + courses[courseId].downloadpath.split(".", 2)[1]);
            let ipAddress = req.ip;
            if (!downloadedByCourseId[courseId] || !downloadedByCourseId[courseId].includes(ipAddress)) {
                if (!downloadedByCourseId[courseId]) {
                    downloadedByCourseId[courseId] = [ipAddress];
                    downloadedAmount[courseId] = 1;
                    await database.storeDownload(courseId, ipAddress);
                } else if (!downloadedByCourseId[courseId].includes(ipAddress)) {
                    downloadedByCourseId[courseId].push(ipAddress);
                    downloadedAmount[courseId]++;
                    await database.storeDownload(courseId, ipAddress);
                }
                users[courses[courseId].owner].points += pointsPerDownload;
                courses[courseId].downloads = downloadedAmount[courseId];
            }
        }

    });

    app.get('/', (req, res) => {

        log("[200] " + req.method + " to " + req.url);
        res.send($index.html());

    });

    app.get('/package', (req, res) => {

        log("[200] " + req.method + " to " + req.url);
        // TODO

    });

    app.get('/upload', (req, res) => {

        log("[200] " + req.method + " to " + req.url);
        // TODO

    });

    app.get('/profile', (req, res) => {

        log("[200] " + req.method + " to " + req.url);
        // TODO
        /*if (!usersLoggedIn[req.session.token]) {
            res.redirect('/');
        } else {

            let userId = usersLoggedIn[req.session.token];
            let userName = users[userId].username;
            let apiKey = users[userId].apiKey;
            let template = cheerio.load("<div class='profile'>" +
                "<span>Username:</span></br>" +
                "<form class='profile-update' autocomplete='off'><input type='text' name='username' /></form>" +
                html.profileSubmitButton +
                html.apiKeyShowButton +
                "</div>");
            template('.profile-update input').attr("value", userName);

            if (!apiKey) {
                apiKey = util.generateAPIKey();
                users[userId].apiKey = apiKey;
                usersByAPIKey[apiKey] = userId;
                database.setAPIKey(apiKey, userId);
            }

            util.sendHtml(res, template.html(), "", null, userId, apiKey);

        }*/

    });

    app.route('/tokensignin').post((req, res) => {

        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            data = JSON.parse(data);
            let idToken = data.tokenObj.id_token;
            if (!idToken) {
                res.json({
                    err: 'idToken not found'
                });
            } else {
                verifier.verify(idToken, clientId, async (err, tokenInfo) => {
                    if (!err) {

                        // create account if it does not exist
                        let googleId = tokenInfo.sub;

                        let account;
                        if (!Account.exists(googleId)) {
                            // create new account
                            let username = tokenInfo.email.split("@")[0];
                            account = new Account({
                                googleid: googleId,
                                username
                            });
                            await Database.addAccount(account);
                        } else {
                            account = Account.getAccountByGoogleId(googleId);
                            account.login();
                        }
                        req.session.apikey = account.apikey;

                        res.json(account.getJSON());

                    }
                });
            }

        })

    });

    app.route('/signout').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        /*req.on('data', (chunk) => {
            if (chunk.toString().includes("idtoken=")) { // TODO chunk should be a json
                let token = chunk.toString().split("idtoken=", 2)[1].split("&")[0];
                delete usersLoggedIn[token];
                database.removeSession(token);
                res.json({
                    message: "Success"
                });
            } else {
                res.json({
                    err: "Wrong Syntax"
                })
            }
        });*/

    });

    app.route('/course-upload').post(async (req, res) => {

        log("[200] " + req.method + " to " + req.url);

        res.json(await api.uploadCourse(req, usersLoggedIn[req.session.token]));

    });

    // TODO api
    app.route('/course-reupload').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        let idToken = req.session.token;

        if (!!usersLoggedIn[idToken]) {
            req.pipe(req.busboy);
            req.busboy.on('file', function (fieldname, file) {
                let courseId = req.get("course-id");
                if (!courses[courseId]) {
                    res.writeHeader(500, {"Content-Type": "text/html"});
                    res.write("Course ID not found");
                    res.end();
                } else if (courses[courseId].owner !== usersLoggedIn[req.session.token]) {
                    res.writeHeader(500, {"Content-Type": "text/html"});
                    res.write("You cannot change levels you do not own");
                    res.end();
                } else {
                    let newFileName = courses[courseId].downloadpath.split("/")[1];

                    let fstream = fs.createWriteStream(__dirname + '/courses/' + newFileName);
                    file.pipe(fstream);
                    fstream.on('close', async () => {
                        await database.bumpCourse(courseId);
                        sorting.updateCourse(courseId);

                        courses[courseId].lastmodified = Math.trunc(new Date().getTime() / 1000); // TODO

                        res.json({
                            message: "Success"
                        });
                    });
                }
            });
        } else {
            res.json({
                err: "You are not logged in"
            });
        }

    });

    // TODO api
    app.route('/course-update').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        let idToken = req.session.token;

        if (!!usersLoggedIn[idToken]) {
            req.on('data', chunk => {
                let chunkData = decodeURI(chunk.toString().split('+').join(' ')).split('&'); // TODO chunk should be json
                let data = {};
                for (let i = 0; i < chunkData.length; i++) {
                    let a = chunkData[i].split('=');
                    data[a[0]] = a[1];
                }
                // TODO levelid -> courseid
                // TODO levelname -> title
                // TODO leveldifficulty -> difficulty
                // TODO levelupdate -> updatereq
                // TODO levelthumbnail -> hasthumbnail
                // TODO levelvideoid -> videoid
                // TODO levelpackage -> ispackage
                if (!(levelnameRegEx.test(data.title))) {
                    res.json({
                        err: "You may only use alphanumeric characters, spaces, dots and minus"
                    });
                } else if (!!data.coursetype && !!data.nintendoid && !(nintendoIdRegEx.test(data.nintendoid))) {
                    res.json({
                        err: "Nintendo ID invalid! It must have the format XXXX-XXXX-XXXX-XXXX where X must be an upper case letter or a number"
                    });
                } else if (courses[data.courseid].owner !== usersLoggedIn[idToken]) {
                    res.json({
                        err: "You cannot change levels you do not own"
                    });
                } else {
                    if (!!data.coursetype && !!data.nintendoid) {
                        let a = data.nintendoid.split("-");
                        if (a.length !== 4 || a[0].length !== 4 || a[1].length !== 4 || a[2].length !== 4 || a[3].length !== 4) {
                            res.json({
                                err: "Nintendo ID invalid! It must have the format XXXX-XXXX-XXXX-XXXX where X must be an upper case letter or a number"
                            });
                        }
                    }
                    
                    // update DB entry and variables
                    if (!!data.coursetype) {
                        courses[data.courseid].coursetype = parseInt(data.coursetype);
                    }
                    if (!!data.coursetype && !!data.nintendoid) {
                        courses[data.courseid].nintendoid = data.nintendoid;
                    } else {
                        courses[data.courseid].nintendoid = "";
                    }
                    if (!!data.title) {
                        courses[data.courseid].title = data.title;
                    }
                    if (!!data.leveltype) {
                        courses[data.courseid].leveltype = parseInt(data.leveltype);
                    }
                    if (!!data.difficulty) {
                        courses[data.courseid].difficulty = parseInt(data.difficulty);
                    }
                    if (!!data.updatereq) {
                        courses[data.courseid].updatereq = parseInt(data.updatereq);
                    }
                    if (!!data.hasthumbnail) {
                        courses[data.courseid].hasthumbnail = parseInt(data.hasthumbnail);
                    }
                    if (!!data.videoid) {
                        let videoId;
                        if (data.videoid.indexOf("%3F") !== -1) {
                            videoId = data.videoid.split("%3F", 2)[1];
                            if (videoId.indexOf("v%3D") !== -1) {
                                videoId = videoId.split("v%3D", 2)[1].split("%26")[0];
                            }
                        } else if (data.videoid.indexOf(".be%2F") !== -1) {
                            videoId = data.videoid.split(".be%2F", 2)[1];
                        } else {
                            videoId = data.videoid;
                        }
                        if ((videoIdRegEx.test(videoId)) && !!videoId) {
                            courses[data.courseid].videoid = videoId;
                        }
                    }
                    if (!!data.ispackage) {
                        courses[data.courseid].ispackage = parseInt(data.ispackage);
                    }
                    courses[data.courseid].lastmodified = Math.trunc(new Date().toISOString().substr(0, 19).getTime() / 1000); // TODO
                    
                    sorting.sortUpload(courses, coursesSorted, data.courseid);
                    database.updateCourse(courses[data.courseid]);
                    
                    if (!!courses[data.courseid].coursetype && !!courses[data.courseid].nintendoid) {
                        parsing.parseNintendoCourse(courses, data.courseid);
                    }

                    res.json({
                        message: "Success",
                        title: data.title
                    });
                }
            });
        } else {
            res.json({
                err: "You are not logged in"
            });
        }
        
    });

    // TODO api
    app.route('/course-delete').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);
        
        let idToken = req.session.token;
        
        if (!!usersLoggedIn[idToken]) {
            req.on('data', function(chunk) {
                let chunkData = decodeURI(chunk.toString().split('+').join(' ')).split('&'); // TODO chunk should be json
                let data = {};
                for (let i = 0; i < chunkData.length; i++) {
                    let a = chunkData[i].split('=');
                    data[a[0]] = a[1];
                }
                
                if (!data.id) {
                    res.json({
                        err: "Course ID not found"
                    });
                } else {
                    let courseId = parseInt(data.id);
                    if (!courses[courseId]) {
                        res.json({
                            err: "Course not found"
                        });
                    } else {
                        let path = __dirname + "/" + courses[courseId].downloadpath;
                        if (fs.existsSync(path)) {
                            fs.unlinkSync(path);
                        }
                        if (courses[courseId].hasimage === 1) {
                            path = __dirname + "/img/courses/" + courseId + ".pic"; // TODO .pic ...
                            if (fs.existsSync(path)) {
                                fs.unlinkSync(path);
                            }
                            path = __dirname + "/img/courses/thumbnails/" + courseId + ".pic";
                            if (fs.existsSync(path)) {
                                fs.unlinkSync(path);
                            }
                        }
                        
                        database.deleteCourse(courseId);
                        sorting.deleteUpload(courses, coursesSorted, courseId);
                        
                        users[courses[courseId].owner].points -= courses[courseId].downloads * pointsPerDownload + courses[courseId].stars * pointsPerStar + pointsPerUpload;
                        delete courses[courseId];
                        
                        if (!!completedByCourseId[courseId]) {
                            delete completedByCourseId[courseId];
                        }
                        for (let key in completedByUserId) {
                            let index = completedByUserId[key].indexOf(courseId);
                            if (index > -1) {
                                completedByUserId[key].splice(index, 1);
                            }
                        }
                        if (!!starredByCourseId[courseId]) {
                            delete starredByCourseId[courseId];
                        }
                        for (let key in starredByUserId) {
                            let index = starredByUserId[key].indexOf(courseId);
                            if (index > -1) {
                                starredByUserId[key].splice(index, 1);
                            }
                        }
                        if (!!downloadedByCourseId[courseId]) {
                            delete downloadedByCourseId[courseId];
                        }
                        if (!!downloadedAmount[courseId]) {
                            delete downloadedAmount[courseId];
                        }

                        res.json({
                            message: "Success"
                        });
                    }
                }
            });
        } else {
            res.json({
                err: "You are not logged in"
            });
        }
        
    });

    // TODO api
    app.route('/image-upload').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);
        
        let idToken = req.session.token;
        
        if (!!usersLoggedIn[idToken]) {
            let courseId = req.get("course-id");
            if (!courseId) {
                res.json({
                    err: "Course ID not found"
                });
            } else if (!courses[courseId]) {
                res.json({
                    err: "Course not found"
                });
            } else if (courses[id].owner !== usersLoggedIn[req.session.token]) {
                res.json({
                    err: "You cannot change levels you do not own"
                });
            } else {
                let path = __dirname + '/img/courses/' + id + ".pic";
                let thumbnailPath = __dirname + '/img/courses/thumbnails/' + id + ".pic";
                if (fs.existsSync(path)) {
                    fs.unlinkSync(path);
                }
                if (fs.existsSync(thumbnailPath)) {
                    fs.unlinkSync(thumbnailPath);
                }
                req.pipe(req.busboy);
                req.busboy.on('file', function (fieldname, file, filename) {
                    let split = filename.split(".");
                    let fileEnding = split[split.length-1];
                    let tempPath = __dirname + '/img/courses/' + (new Date().getTime() + "." + fileEnding); // TODO
                    
                    let fstream = fs.createWriteStream(tempPath);
                    file.pipe(fstream);
                    
                    fstream.on('close', () => {
                        database.addImage(id);
                        sorting.updateUpload(courses, coursesSorted, id);

                        courses[courseId].hasimage = 1;
                        courses[courseId].lastmodified = Math.trunc(new Date().getTime() / 1000); // TODO
                        
                        fs.rename(tempPath, path, function() {
                            sharp(path).resize(thumbnailMaxWidth, thumbnailMaxHeight).max().toFile(thumbnailPath);
                        });
                        
                        console.log("Upload Finished of " + filename);

                        res.json({
                            message: "Success"
                        });
                    })
                });
            }
        } else {
            res.writeHeader(500, {"Content-Type": "text/html"});
            res.write("You are not logged in");
            res.end();
        }
        
    });

    app.route('/star').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);
        
        let idToken = req.session.token;
        
        if (!!usersLoggedIn[idToken]) {
            req.on('data', function(chunk) {
                let chunkData = decodeURI(chunk.toString().split('+').join(' ')).split('&'); // TODO chunk should be json
                let data = {};
                for (let i = 0; i < chunkData.length; i++) {
                    let a = chunkData[i].split('=');
                    data[a[0]] = a[1];
                }

                res.json(api.starCourse(usersLoggedIn[idToken], data));
                
            });
        } else {
            res.json({
                err: "You are not logged in"
            });
        }
        
    });

    app.route('/complete').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);
        
        let idToken = req.session.token;
        
        if (!!usersLoggedIn[idToken]) {
            req.on('data', function(chunk) {
                let chunkData = decodeURI(chunk.toString().split('+').join(' ')).split('&'); // TODO chunk should be json
                let data = {};
                for (let i = 0; i < chunkData.length; i++) {
                    let a = chunkData[i].split('=');
                    data[a[0]] = a[1];
                }

                res.json(api.completeCourse(usersLoggedIn[idToken], data));
                
            });
        } else {
            res.json({
                err: "You are not logged in"
            });
        }
        
    });

    // TODO api
    app.route('/profile-update').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);
        
        let idToken = req.session.token;
        
        if (!!usersLoggedIn[idToken]) {
            req.on('data', function(chunk) {
                let chunkData = decodeURI(chunk.toString().split('+').join(' ')).split('&'); // TODO chunk should be json
                let data = {};
                for (let i = 0; i < chunkData.length; i++) {
                    let a = chunkData[i].split('=');
                    data[a[0]] = a[1];
                }
                
                if (data.username.length < usernameMinCharacters) {
                    res.json({
                        err: `Your username must have at least ${usernameMinCharacters} characters`
                    });
                } else if (data.username.length > usernameMaxCharacters) {
                    res.json({
                        err: `Your username must have at least ${usernameMaxCharacters} characters`
                    });
                } else if (!(usernameRegEx.test(data.username))) {
                    res.json({
                        err: "You may only use alphanumeric characters, spaces and dots"
                    });
                } else {
                    let usernames = [], j = 0, userId = usersLoggedIn[idToken];
                    for (let key in users) {
                        if (!!users[key].username && userId !== users[key].id) {
                            usernames[j++] = users[key].username;
                        }
                    }
                    if (!usernames.includes(data.username)) {
                        database.setUsername(data.username, usersLoggedIn[idToken]);
                        users[userId].username = data.username;
                        
                        for (let key in courses) {
                            if (courses[key].owner === userId) {
                                courses[key].ownername = data.username;
                            }
                        }

                        res.json({
                            message: "Success"
                        });
                    } else {
                        res.json({
                            err: "Username is already taken"
                        });
                    }
                }
            });
        } else {
            res.json({
                err: "You are not logged in"
            });
        }
        
    });

    app.route('/api/:apicall*?').get((req, res) => {
        
        if (req.url.includes("/") && req.url.length > 5) {

            let apiCall = req.params.apicall;
            
            let apiData = {};
            if (req.url.includes("?")) {
                let split = req.url.split("?", 2);
                let data = split[1];
                apiData = qs.parse(data);
            }
            
            if (!apiCall) {
                res.json({
                    err: "Wrong syntax"
                });
            } else if (apiCall === "getcourses") {
                let loggedIn = false, userId;
                let account = Account.getAccountByAPIKey(apiData.apikey);
                if (!!account) {
                    loggedIn = true;
                    userId = account.id;
                }
                res.json(API.getCourses(loggedIn, userId, apiData));
            } else if (apiCall === "starcourse") {
                if (!apiData.apikey) {
                    res.json({
                        err: "API key required"
                    });
                } else if (!usersByAPIKey.hasOwnProperty(apiData.apikey)) {
                    res.json({
                        err: "API key unknown"
                    });
                } else {
                    let userId = usersByAPIKey[apiData.apikey];
                    res.json(API.starCourse(userId, apiData));
                }
            } else if (apiCall === "completecourse") {
                if (!apiData.apikey) {
                    res.json({
                        err: "API key required"
                    });
                } else if (!usersByAPIKey.hasOwnProperty(apiData.apikey)) {
                    res.json({
                        err: "API key unknown"
                    });
                } else {
                    let userId = usersByAPIKey[apiData.apikey];
                    res.json(API.completeCourse(userId, apiData));
                }
            } else {
                res.json({
                    err: "Wrong syntax"
                });
            }
            
        } else {
            sendHtml(null, res, $api.html());
        }
        
    }).post(async (req, res) => {

        let apiCall = req.get("request");
        let apiKey = req.get("apikey");
        if (apiCall === "uploadcourse") {
            if (!apiKey) {
                res.json({
                    err: "API key required"
                });
            } else if (!usersByAPIKey.hasOwnProperty(apiKey)) {
                res.json({
                    err: "API key unknown"
                });
            } else {
                res.json(await API.uploadCourse(req, res, usersByAPIKey[apiKey]));
            }
        } else {
            res.json({
                err: "Wrong syntax"
            });
        }
        
    });

    server.listen(port, () => {
        log(`Server is listening on port ${port}`);
    });

}