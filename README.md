# SMMDB

A cross console/emulator sharing platform for Super Mario Maker courses to rule them all.

This server is not production ready. However a public test server is running on [http://smm-test.alextc.de]()

## API

All API calls are subject to change.

[http://smm-test.alextc.de/api/request?querystring]()

### Receive server statistics

**Request**: `getstats`

**Protocol**: GET

**Querystring**: empty

**Example**: `http://smm-test.alextc.de/api/getstats`

### Receive course list

**Request**: `getcourses`

**Protocol**: GET

**Querystring**: (default values are *italic*)

| Query | Value | Description |
| --- | --- | --- |
| apikey | {string} | Optional user identification |
| order | *`lastmodified`*` \| uploaded \| title \| stars \| downloads \| completed` | Order of courses |
| dir | `asc \| `*`desc`* | Order direction of courses |
| limit | `{number} \| `*`100`* | Limit maximum amount of sent courses (max: 100) |
| start | `{number} \| `*`0`* | Start index |
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
| prettify | *`0`*` \| 1` | Pretty print json response |

**Example**: `http://smm-test.alextc.de/api/getcourses?limit=50&start=121&prettify=1`

Receive courses 121 to 170 in lastmodified descending order with indentation.

### Download course

**Request**: `downloadcourse`

**Protocol**: GET

**Querystring**: (default values are *italic*)

| Query | Value | Description |
| --- | --- | --- |
| id | `{string}` | Course ID |
| type | `zip \| 3ds \| json \| `*`protobuf`* | MIME type of response. 3ds supports Accept-Ranges: bytes HTTP header |

**Example**: `http://smm-test.alextc.de/api/downloadcourse?id=ihavenoidea&type=zip`

Downloads course with ID `ihavenoidea` as zip-compressed folder.

### Profile Update

**Request**: `setaccountdata`

**Protocol**: POST

**Querystring**:

| Query | Value | Description |
| --- | --- | --- |
| apikey | `{string}` | User's API key |

**POST body**: Must contain JSON.stringified Object with Object properties to change.

**Example**: `http://smm-test.alextc.de/api/setaccountdata?apikey=myAPIKey`
with body `{ "username": "newUsername" }`

Changes username of user with specified API key.

## Lighthouse Report

[commit b0055d7165d0bcc2ac0d4d3db003e3b8cacbab3b](http://htmlpreview.github.io/?https://github.com/Tarnadas/smmdb/blob/master/docs/smm-test.alextc.de_2017-06-29_15-07-06.html)

[commit 27be681b78cc083be3741c3455b0748831e7c556](http://htmlpreview.github.io/?https://github.com/Tarnadas/smmdb/blob/master/docs/smm-test.alextc.de_2017-06-29_14-54-38.html)