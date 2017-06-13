# SMMDB

A cross console/emulator sharing platform for Super Mario Maker courses to rule them all.

This server is not production ready. However a public test server is running on [http://smm-test.alextc.de]()

## API

All API calls are subject to change.

[http://smm-test.alextc.de/api/request?querystring]() where `querystring` can have following arguments (default values are *italic*):

### Receive course list

**Request**: `getcourses`

| Query | Value | Description |
| --- | --- | --- |
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

| Query | Value | Description |
| --- | --- | --- |
| id | `{string}` | Course ID |
| type | `zip \| json \| `*`protobuf`* | MIME type of response |

**Example**: `http://smm-test.alextc.de/api/downloadcourse?id=ihavenoidea&type=zip`

Downloads course with ID `ihavenoidea` as zip-compressed folder.
