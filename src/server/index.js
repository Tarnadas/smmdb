import express       from 'express'
import compression   from 'compression'
import bodyParser    from 'body-parser'
import range         from 'express-range'
import cheerio       from 'cheerio'
import cookieSession from 'cookie-session'
import verifier      from 'google-id-token-verifier'
import favicon       from 'serve-favicon'
import bytes         from 'bytes'
import device        from 'device'
import {
    renderToString
} from 'react-dom/server'

import * as http from 'http'
import * as fs   from 'fs'
import * as path from 'path'
import * as qs   from 'querystring'

import renderer from '../shared/renderer'

import Lobby       from './Lobby'
import Account     from './Account'
import Course      from './Course'
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
import { port } from '../static'

export const lobby = new Lobby();

const $index = cheerio.load(fs.readFileSync(path.join(__dirname, "../client/views/index.html")));

export const pointsPerDownload = 1;
export const pointsPerStar = 15;

export const maxFileSize = 6 * 1024 * 1024;

export const cacheMaxAgeImg = '7d';
export const cacheMaxAgeCSS = '1d';
export const cacheMaxAgeJS  = '1y';

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
        let convert = process.argv.includes('convertmysql');
        await Database.initialize(convert);
        if (convert) {
            await Database.convertMySQL();
        }
        main();
    } catch (err) {
        console.log(err);
    }
})();

function main() {

    console.log();
    log("Database initialized");

    calculatePoints();
    Parsing.parseNintendoCourses();
    Sorting.sortCourses();

    // initialize app engine
    const app = express();

    const server = http.createServer(app);

    app.set('trust proxy', 1);
    app.use(compression());
    app.use(bodyParser.json());
    app.use(range({
        accept: 'bytes'
    }));
    app.use(favicon(path.join(__dirname, '../../favicon.ico')));
    app.use('/img', express.static(path.join(__dirname, '../client/images'), { maxAge: cacheMaxAgeImg }));
    app.use('/courseimg', express.static(path.join(__dirname, '../client/courseimg'), { maxAge: cacheMaxAgeImg }));
    app.use('/styles', express.static(path.join(__dirname, '../client/styles'), { maxAge: cacheMaxAgeCSS }));
    app.use('/script', express.static(path.join(__dirname, '../client/script'), { maxAge: cacheMaxAgeJS }));
    app.use(cookieSession({
        name: 'session',
        keys: cookieCredentials,
        maxAge: 24 * 60 * 60 * 1000
    }));

    app.route('/tokensignin').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        let idToken = req.body.tokenObj.id_token;
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
                        account.login(idToken);
                    }
                    req.session.idtoken = idToken;

                    res.json(account.getJSON());

                }
            });
        }

    });

    app.route('/signin').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        if (!req.session.idtoken) {
            res.json({
                err: 'No idToken submitted. Have you enabled cookies?'
            });
            return;
        }
        let account = Account.getAccountBySession(req.session.idtoken);
        if (!account) {
            res.json({
                err: 'Account not found'
            });
            return;
        }
        res.json(account.getJSON());

    });

    app.route('/signout').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        if (!req.session.idtoken) {
            res.json({
                err: 'No idToken submitted. Have you enabled cookies?'
            });
            return;
        }
        let account = Account.getAccountBySession(req.session.idtoken);
        if (!account) {
            res.json({
                err: 'Account not found'
            });
            return;
        }
        account.logout(req.session.idtoken);
        res.json({
            message: 'success'
        });

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
            } else if (apiCall === "getstats") {
                const result = {
                    courses: Course.getCourseAmount(),
                    accounts: Account.getAccountAmount()
                };
                res.json(result);
            } else if (apiCall === "getcourses") {
                let loggedIn = false, accountId;
                let account = Account.getAccountByAPIKey(apiData.apikey);
                if (!!account) {
                    loggedIn = true;
                    accountId = account.id;
                    apiData.uploader = account.username;
                }
                if (!!apiData.prettify) {
                    app.set('json spaces', 2);
                }
                res.json(API.getCourses(loggedIn, accountId, apiData));
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
                    res.json(await course.getObject());
                } else if (apiData.type === '3ds') {
                    res.setHeader('Content-Type', 'application/3ds');
                    res.range({
                        first: req.range.first,
                        last: req.range.last,
                        length: bytes.length
                    });
                    const course = await course.get3DS();
                    res.send(course.slice(req.range.first, req.range.last));
                } else {
                    res.set('Content-Encoding', 'gzip');
                    res.set('Content-Type', 'application/wiiu');
                    res.send(await course.getSerialized());
                }
            } else {
                res.json({
                    err: "Wrong syntax"
                });
            }
            
        } else {
            res.json({
                err: "Wrong syntax"
            });
        }
        
    }).post(async (req, res) => {

        let apiCall = req.params.apicall;
        let apiData = {};
        if (req.url.includes("?")) {
            let split = req.url.split("?", 2);
            let data = split[1];
            apiData = qs.parse(data);
        }
        if (apiCall === "uploadcourse") {
            if (!apiData.apikey) {
                res.json({
                    err: "API key required"
                });
            } else {
                const account = Account.getAccountByAPIKey(apiData.apikey);
                if (account == null) {
                    res.json({
                        err: `Account with API key ${apiData.apikey} not found`
                    });
                } else {

                }
            }
        } else if (apiCall === "updatecourse") {
            if (!apiData.apikey) {
                res.json({
                    err: "API key required"
                });
            } else if (!apiData.id) {
                res.json({
                    err: "No course ID submitted"
                });
            } else {
                const account = Account.getAccountByAPIKey(apiData.apikey);
                if (account == null) {
                    res.json({
                        err: `Account with API key ${apiData.apikey} not found`
                    });
                    return;
                }
                const course = Course.getCourse(apiData.id);
                if (course == null) {
                    res.json({
                        err: `Course with ID ${apiData.id} not found`
                    });
                    return;
                }
                if (!course.owner.equals(account._id)) {
                    res.json({
                        err: `Course with ID ${apiData.id} is not owned by account with API key ${apiData.apikey}`
                    });
                    return;
                }
                const courseData = {};
                if (!!req.body.title) courseData.title = req.body.title;
                if (!!req.body.maker) courseData.maker = req.body.maker;
                await course.update(courseData);
                res.json(course.getJSON());
            }
        } else if (apiCall === "setaccountdata") {
            if (!apiData.apikey) {
                res.json({
                    err: "API key required"
                });
            } else {
                const account = Account.getAccountByAPIKey(apiData.apikey);
                if (account == null) {
                    res.json({
                        err: `Account with API key ${apiData.apikey} not found`
                    });
                } else {
                    if (!!req.body.username) await account.setUsername(req.body.username);
                    res.json(account.getJSON());
                }
            }
        } else {
            res.json({
                err: "Wrong syntax"
            });
        }
        
    });

    app.use('/', (req, res) => {
        const stats = {
            courses: Course.getCourseAmount(),
            accounts: Account.getAccountAmount()
        };
        const d = device(req.get('user-agent'));
        let [html, preloadedState] = renderer(true, renderToString, null, req, API.getCourses(false, null, {limit: 10}), stats, d.is('phone') || d.is('tablet'));
        const index = cheerio.load($index.html());
        index('#root').html(html);
        index('body').prepend(`<script>window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\u003c')}</script>`);
        res.send(index.html());
    });

    server.listen(port, () => {
        log(`Server is listening on port ${port}`);
    });

}