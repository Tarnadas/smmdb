import express       from 'express'
import compression   from 'compression'
import busboy        from 'connect-busboy'
import cheerio       from 'cheerio'
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
        if (process.argv.includes('convertmysql')) {
            await Database.convertMySQL();
        }
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

    app.get('/', (req, res) => {

        log("[200] " + req.method + " to " + req.url);
        res.send($index.html());

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
                        req.session.idtoken = idToken;

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

    app.route('/api/:apicall*?').get(async (req, res) => {
        
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
                if (!!apiData.prettify) {
                    app.set('json spaces', 2);
                }
                res.json(API.getCourses(loggedIn, userId, apiData));
                if (!!apiData.prettify) {
                    app.set('json spaces', 0);
                }
            } else if (apiCall === "downloadcourse") {
                let course = Course.getCourse(apiData.id);
                if (!course) {
                    res.json({
                        err: 'Course not found'
                    });
                    return;
                }
                if (apiData.type === 'zip') {
                    let file = await course.getCompressed();
                    if (typeof(file) === 'string') {
                        res.setHeader("Content-Type", "application/zip");
                        res.download(file);
                    } else {
                        res.json({
                            err: 'Could not compress file'
                        });
                    }
                } else if (apiData.type === 'json') {
                    res.json(course.courseData);
                } else {
                    res.send(course.serialized);
                }
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
            //sendHtml(null, res, $api.html());
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