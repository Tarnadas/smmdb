# SMMDB

A cross console/emulator sharing platform for Super Mario Maker courses to rule them all.

Visit the server at [http://smmdb.ddns.net](http://smmdb.ddns.net)

## Protocol Buffer Files

Protocol Buffer files can be found at [smm-protobuf](https://github.com/Tarnadas/smm-protobuf)

## API

All API calls are subject to change.

`http://smmdb.ddns.net/api/request?querystring`

### Receive server statistics

**Request**: `getstats`

**Method**: GET

**Querystring**: empty

**Example**: `http://smmdb.ddns.net/api/getstats`

### Receive course list

**Request**: `getcourses` \|\| `getcourses64`

**Method**: GET

**Header**:

| Directives | Description |
| --- | --- |
| Authorization: APIKEY \<apiKey> | Optional user identification |

**Querystring**: (default values are *italic*)

| Query | Value | Description |
| --- | --- | --- |
| format | *`json`*` \| ini` | Order direction of courses |
| order | *`lastmodified`*` \| uploaded \| title \| stars` | Order of courses |
| dir | `asc \| `*`desc`* | Order direction of courses |
| limit | `{number} \| `*`120`* | Limit maximum amount of sent courses (max: 100) |
| start | `{number} \| `*`0`* | Start index for pagination |
| random | *`0`*` \| 1` | Receive random courses wrt filters |
| filter | `{Array<string>}` delimited with comma | Limit response values attributes, e.g. `filter=id,stars` |
| ids | `{Array<string>}` delimited with comma | Return only courses with specific id |
| lastmodifiedfrom | `{number}` | Unix timestamp lower limit for lastmodified value |
| lastmodifiedto | `{number}` | Unix timestamp upper limit for lastmodified value |
| uploadedfrom | `{number}` | Unix timestamp lower limit for uploaded value |
| uploadedto | `{number}` | Unix timestamp upper limit for uploaded value |
| difficultyfrom | `{number}` | Difficulty setting lower limit (0: Easy, 1: Normal, 2: Expert, 3: Super Expert) |
| difficultyto | `{number}` | Difficulty setting upper limit (0: Easy, 1: Normal, 2: Expert, 3: Super Expert) |
| title | `{string}` | Title's substring, case-insensitive |
| maker | `{string}` | Maker's exact name, case-insensitive |
| uploader | `{string}` | Uploader's exact name,  case-insensitive |
| gamestyle | `{number}` | Game style of course (0: SMB, 1: SMB3, 2: SMW, 3: NSMBU) |
| coursetheme | `{number}` | Course theme (0: Ground, 1: Underground, 2: Castle, 3: Airship, 4: Underwater, 5: Ghost House) |
| coursethemesub | `{number}` | Subcourse theme (0: Ground, 1: Underground, 2: Castle, 3: Airship, 4: Underwater, 5: Ghost House) |
| timefrom | `{number}` | Course completion time lower limit in seconds |
| timeto | `{number}` | Course completion time upper limit in seconds |
| autoscroll | `{number} \| `*`0`* | Auto scroll speed (0: disabled, 1: slow, 2: medium, 3: fast) |
| autoscrollsub | `{number} \| `*`0`* | Auto scroll speed of sub course |
| widthfrom | `{number}` | Course width lower limit in block |
| widthto | `{number}` | Course width upper limit in block |
| widthsubfrom | `{number}` | Subcourse width lower limit in block |
| widthsubto | `{number}` | Subcourse width upper limit in block |
| prettify | *`0`*` \| 1` | Pretty print json response |

**Example**: `http://smmdb.ddns.net/api/getcourses?limit=50&start=121&prettify=1`

Receive courses 121 to 170 in lastmodified descending order with indentation.

**Response**: `Array<Course>` \|\| `Array<Course64>` where

`Course`:

| Attribute | Value | Description |
| --- | --- | --- |
| id | `{string}` | Unique course ID |
| [header.type] | `{number}` | [Header type](https://github.com/Tarnadas/smm-protobuf/blob/master/proto/Header.proto#L4-L7) |
| [header.data] | `{string}` | Base64 encoded `0xF0` original course data header |
| owner | `{string}` | Unique owner ID |
| title | `{string}` | Course title |
| maker | `{string}` | Course maker name |
| gameStyle | `{string}` | [Game style](https://github.com/Tarnadas/smm-protobuf/blob/master/proto/SMMCourse.proto#L7-L13) |
| courseTheme | `{string}` | [Course theme](https://github.com/Tarnadas/smm-protobuf/blob/master/proto/SMMCourse.proto#L15-L22) |
| courseThemeSub | `{string}` | Course theme sub world |
| time | `{string}` | Completion time |
| autoScroll | `{string}` | [Auto scroll](https://github.com/Tarnadas/smm-protobuf/blob/master/proto/SMMCourse.proto#L26-L31) |
| autoScrollSub | `{string}` | Auto scroll sub world |
| width | `{string}` | Course width in blocks |
| widthSub | `{string}` | Subcourse width in blocks |
| nintendoid | `{string}` | Unique Nintendo course ID |
| videoid | `{string}` | YouTube video ID |
| difficulty | `{string}` | Course difficulty (0: Easy, 1: Normal, 2: Expert, 3: Super Expert) |
| lastmodified | `{number}` | Unix timestamp of last modification |
| uploaded | `{number}` | Unit timestamp of upload date |
| vPrev | `{number}` | Version number for 4:3 thumbnail (can be used for long term caching) |
| vFull | `{number}` | Version number for full course thumbnail (can be used for long term caching) |
| stars | `{string}` | Received stars |
| [starred] | `{boolean}` | (Authorization required) whether user has starred this course |

`Course64`:

| Attribute | Value | Description |
| --- | --- | --- |
| id | `{string}` | Unique course ID |
| owner | `{string}` | Unique owner ID |
| title | `{string}` | Course title |
| uploader | `{string}` | Course uploader name |
| courseTheme | `{string}` | [Course theme](https://github.com/Tarnadas/smmdb/blob/master/src/client/reducers/courseData.js#L11-L24) |
| courseStars | `{number}` | Amount of collectible stars |
| difficulty | `{string}` | Course difficulty (0: Easy, 1: Normal, 2: Expert, 3: Super Expert) |
| lastmodified | `{number}` | Unix timestamp of last modification |
| uploaded | `{number}` | Unit timestamp of upload date |
| videoid | `{string}` | YouTube video ID |
| vImg | `{number}` | Version number for course thumbnail (can be used for long term caching) |
| stars | `{string}` | Received stars |
| [starred] | `{boolean}` | (Authorization required) whether user has starred this course |

### Download course

**Request**: `downloadcourse`

**Method**: GET

**Querystring**: (default values are *italic*)

| Query | Value | Description |
| --- | --- | --- |
| id | `{string}` | Course ID |
| type | `zip \| 3ds \| json \| `*`protobuf`* | MIME type of response. 3ds supports Accept-Ranges: bytes HTTP header |

**Example**: `http://smmdb.ddns.net/api/downloadcourse?id=ihavenoidea&type=zip`

Downloads course with ID `ihavenoidea` as zip-compressed folder.

### Upload Course

**Request**: `uploadcourse`

**Method**: POST

**Header**:

| Directives | Description |
| --- | --- |
| Content-Type: application/octet-stream | |
| Authorization: APIKEY \<apiKey> | User identification |

**Querystring**: empty

**POST body**: Raw binary data with header `{ 'Content-Type': 'application/octet-stream', 'Authorization': 'APIKEY myapikey' }'`. Server assumes zip/rar/7z compressed files to contain Wii U courses. Raw binary data is checked, if it is a 3DS course. Server accepts gzipped/deflated streams.

### Update course

**Request**: `updatecourse`

**Method**: POST

**Header**:

| Directives | Description |
| --- | --- |
| Content-Type: application/octet-stream | |
| Authorization: APIKEY \<apiKey> | User identification |

**Querystring**:

| Query | Value | Description |
| --- | --- | --- |
| id | `{string}` | Course ID |

**POST body**: Must contain JSON.stringified Object with Object properties to change.

**Example**: `http://smmdb.ddns.net/api/updatecourse?id=mycourseid`
with header `{ 'Authorization': 'APIKEY myapikey' }'` and body `{ 'maker': 'newMaker' }`

Changes maker of course with specified course ID.

### Delete course

**Request**: `deletecourse`

**Method**: POST

**Header**:

| Directives | Description |
| --- | --- |
| Content-Type: application/octet-stream | |
| Authorization: APIKEY \<apiKey> | User identification |

**Querystring**:

| Query | Value | Description |
| --- | --- | --- |
| id | `{string}` | Course ID |

**Example**: `http://smmdb.ddns.net/api/deletecourse?id=mycourseid`
with header `{ 'Authorization': 'APIKEY myapikey' }'`

Deletes course with specified course ID.

### Profile Update

**Request**: `setaccountdata`

**Method**: POST

**Header**:

| Directives | Description |
| --- | --- |
| Content-Type: application/octet-stream | |
| Authorization: APIKEY \<apiKey> | User identification |

**Querystring**: empty

**POST body**: Must contain JSON.stringified Object with Object properties to change.

**Example**: `http://smmdb.ddns.net/api/setaccountdata`
with header `{ 'Authorization': 'APIKEY myapikey' }'` and body `{ 'username': 'newUsername' }`

Changes username of user with specified API key.

## Lighthouse Report

[commit b0055d7165d0bcc2ac0d4d3db003e3b8cacbab3b](http://htmlpreview.github.io/?https://github.com/Tarnadas/smmdb/blob/master/docs/smm-test.alextc.de_2017-06-29_15-07-06.html)

[commit 27be681b78cc083be3741c3455b0748831e7c556](http://htmlpreview.github.io/?https://github.com/Tarnadas/smmdb/blob/master/docs/smm-test.alextc.de_2017-06-29_14-54-38.html)