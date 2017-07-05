import express       from 'express'
import compression   from 'compression'
import bodyParser    from 'body-parser'
import parseRange    from 'range-parser'
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
    app.use(bodyParser.json({
        limit: '500kb'
    }));
    app.use(bodyParser.raw({
        limit: '6mb'
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
            res.status(400).send('idToken not found');
        } else {
            verifier.verify(idToken, clientId, async (err, tokenInfo) => {
                if (err) {
                    res.status(400).send('idToken not verified');
                }

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

                res.json(account);
            });
        }

    });

    app.route('/signin').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        if (!req.session.idtoken) {
            res.status(400).send('No idToken submitted. Have you enabled cookies?');
            return;
        }
        let account = Account.getAccountBySession(req.session.idtoken);
        if (!account) {
            res.status(400).send('Account not found');
            return;
        }
        res.json(account);

    });

    app.route('/signout').post((req, res) => {

        log("[200] " + req.method + " to " + req.url);

        if (!req.session.idtoken) {
            res.status(400).send('No idToken submitted. Have you enabled cookies?');
            return;
        }
        let account = Account.getAccountBySession(req.session.idtoken);
        if (!account) {
            res.status(400).send('Account not found');
            return;
        }
        account.logout(req.session.idtoken);
        res.send('OK');

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
                res.status(400).send('Wrong syntax');
            } else if (apiCall === "getstats") {
                const result = {
                    courses: Course.getCourseAmount(),
                    accounts: Account.getAccountAmount()
                };
                res.json(result);
            } else if (apiCall === "getcourses") {
                let loggedIn = false, accountId;
                const account = Account.getAccountByAPIKey(apiData.apikey);
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
                const course = Course.getCourse(apiData.id);
                if (!course) {
                    res.status(400).send(`Course with ID ${apiData.id} not found`);
                    return;
                }
                if (apiData.type === 'zip') {
                    let file = await course.getCompressed();
                    if (typeof(file) === 'string') {
                        res.setHeader("Content-Type", "application/zip");
                        res.download(file);
                    } else {
                        res.status(500).send('Could not compress file');
                    }
                } else if (apiData.type === 'json') {
                    res.json(await course.getObject());
                } else if (apiData.type === '3ds') {
                    res.setHeader('Content-Type', 'application/3ds');
                    const course3ds = await course.get3DS();
                    if (req.headers.range) {
                        const range = parseRange(course3ds.length, req.headers.range, { combine: true });
                        if (range === -1) {
                            res.status(400).send('Unsatisfiable range');
                            return;
                        }
                        if (range === -2) {
                            res.status(400).send('Malformed header string');
                            return;
                        }
                        let resBuffer = Buffer.alloc(0);
                        if (range.type === 'bytes') {
                            range.forEach(r => {
                                resBuffer.concat([resBuffer, course3ds.slice(r.start, r.end)]);
                            });
                            res.send(resBuffer);
                        } else {
                            res.status(400).send('Unknown range type');
                        }
                    } else {
                        res.send(course3ds);
                    }
                } else {
                    res.set('Content-Encoding', 'gzip');
                    res.set('Content-Type', 'application/wiiu');
                    res.send(await course.getSerialized());
                }
            } else if (apiCall === "deletecourse") {
                if (!apiData.apikey) {
                    res.status(403).send('API key required');
                    return;
                }
                const account = Account.getAccountByAPIKey(apiData.apikey);
                if (account == null) {
                    res.status(400).send(`Account with API key ${apiData.apikey} not found`);
                    return;
                }
                const course = Course.getCourse(apiData.id);
                if (!course) {
                    res.status(400).send(`Course with ID ${apiData.id} not found`);
                    return;
                }
                if (!course.owner.equals(account._id)) {
                    res.status(403).send(`Course with ID ${apiData.id} is not owned by account with API key ${apiData.apikey}`);
                    return;
                }
                course.delete();
                res.send('OK');
            } else {
                res.status(400).send('Wrong syntax');
            }
        } else {
            res.status(400).send('Wrong syntax');
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
                res.status(403).send('API key required');
                return;
            }
            const account = Account.getAccountByAPIKey(apiData.apikey);
            if (account == null) {
                res.status(400).send(`Account with API key ${apiData.apikey} not found`);
                return;
            }
            const courses = await Course.fromBuffer(req.body, account);
            if (!courses) {
                res.status(500).send('Could not read course');
            } else {
                res.json(courses);
            }
        } else if (apiCall === "updatecourse") {
            if (!apiData.apikey) {
                res.status(403).send('API key required');
                return;
            }
            if (!apiData.id) {
                res.status(400).send('No course ID submitted');
                return;
            }
            const account = Account.getAccountByAPIKey(apiData.apikey);
            if (account == null) {
                res.status(400).send(`Account with API key ${apiData.apikey} not found`);
                return;
            }
            const course = Course.getCourse(apiData.id);
            if (course == null) {
                res.status(400).send(`Course with ID ${apiData.id} not found`);
                return;
            }
            if (!course.owner.equals(account._id)) {
                res.status(403).send(`Course with ID ${apiData.id} is not owned by account with API key ${apiData.apikey}`);
                return;
            }
            const courseData = {};
            if (!!req.body.title) courseData.title = req.body.title;
            if (!!req.body.maker) courseData.maker = req.body.maker;
            if (req.body.nintendoid != null) {
                const nId = req.body.nintendoid;
                if (nId === '') {
                    courseData.nintendoid = '';
                } else {
                    const a = nId.split("-");
                    if (nintendoIdRegEx.test(nId) && a.length === 4 && a[0].length === 4 && a[1].length === 4 && a[2].length === 4 && a[3].length === 4) {
                        courseData.nintendoid = nId;
                    }
                }
            }
            if (req.body.videoid != null) courseData.videoid = req.body.videoid;
            await course.update(courseData);
            res.json(course);
        } else if (apiCall === "setaccountdata") {
            if (!apiData.apikey) {
                res.status(403).send('API key required');
                return;
            }
            const account = Account.getAccountByAPIKey(apiData.apikey);
            if (account == null) {
                res.status(400).send(`Account with API key ${apiData.apikey} not found`);
                return;
            }
            if (!!req.body.username) await account.setUsername(req.body.username);
            res.json(account);
        } else {
            res.status(400).send('Wrong syntax');
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