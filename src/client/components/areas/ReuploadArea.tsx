import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import * as got from 'got'
const stream = require('filereader-stream')
const concat = require('concat-stream')
const progress = require('progress-stream')

import { resolve } from 'url'

import {
  setReupload, setReupload64, deleteReupload, deleteReupload64
} from '../../actions'

const SERVER_TIMEOUT = 30000

class Area extends React.PureComponent<any, any> {
  private currentUpload: number

  constructor (props: any) {
    super(props)
    this.state = {
      value: '',
      uploads: List(),
      err: ''
    }
    this.currentUpload = 0
    this.sendCourse = this.sendCourse.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }
  sendCourse (course: any) {
    let timeout: any
    const id = this.props.courseId
    const reupload = this.props.is64 ? setReupload64 : setReupload
    const deleteReup = this.props.is64 ? deleteReupload64 : deleteReupload
    try {
      let abort: any
      const req = got.stream.post(resolve(process.env.DOMAIN!, `/api/reuploadcourse${this.props.is64 ? '64' : ''}`), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `APIKEY ${this.props.apiKey}`,
          'course-id': String(this.props.courseId)
        },
        useElectronNet: false
      })
      req.on('request', (r: any) => {
        abort = r.abort
        this.props.dispatch(reupload(id, {
          id,
          title: course.name,
          percentage: 0,
          eta: 0
        }))
        this.setState({
          err: ''
        })
      })
      req.on('response', () => {
        if (timeout) {
          clearTimeout(timeout)
          this.props.dispatch(deleteReup(id))
        }
      })
      req.on('error', (err: any) => {
        console.error(err)
        if (timeout) {
          clearTimeout(timeout)
          this.props.dispatch(deleteReup(id))
        }
      })
      const prog = progress({
        length: course.size,
        time: 1000
      })
      prog.on('progress', (progress: any) => {
        this.props.dispatch(reupload(id, {
          id,
          title: course.name,
          percentage: progress.percentage,
          eta: progress.eta
        }))
        this.setState({
          err: ''
        })
        if (progress.percentage === 100) {
          timeout = setTimeout(() => {
            if (abort) {
              abort()
              this.props.dispatch(deleteReup(id))
            }
          }, SERVER_TIMEOUT)
        }
      })
      req.pipe(concat((buf: any) => {
        let res = ''
        try {
          res = new (window as any).TextDecoder('utf-8').decode(buf)
          const course = JSON.parse(res)
          this.props.onUploadComplete(course)
        } catch (err) {
          this.setState({
            err: res
          })
          if (timeout) {
            clearTimeout(timeout)
            this.props.dispatch(deleteReup(id))
          }
        }
      }))
      const s = stream(course)
      s.pipe(prog).pipe(req)
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
      }
      if (timeout) {
        clearTimeout(timeout)
        this.props.dispatch(deleteReup(id))
      }
    }
  }
  handleChange (e: any) {
    this.setState({
      value: e.target.value
    })
    const files = e.target.files
    for (let i in files) {
      const file = files[i]
      if (!(file instanceof Blob)) continue
      if (file.size > 6 * 1024 * 1024) continue
      const reader = new FileReader()
      reader.onload = () => {
        this.sendCourse(file)
      }
      reader.readAsText(file)
    }
  }
  handleClick () {
    this.setState({
      value: ''
    })
  }
  render () {
    const err = this.state.err
    const upload = this.props.upload && this.props.upload.toJS()
    const styles: React.CSSProperties = {
      drag: {
        height: 'auto',
        width: 'calc(100% - 40px)',
        margin: '0 20px 10px',
        padding: '15px 20px',
        background: upload && upload.percentage
          ? `linear-gradient(90deg, #33cc33 ${upload.percentage}%, #fff ${upload.percentage}%)` : '#fff',
        color: '#000',
        fontSize: '20px',
        border: ' 4px dashed #000000',
        borderRadius: '20px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      },
      input: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '20',
        opacity: '0',
        cursor: 'pointer'
      },
      err: {
        color: '#a20007',
        marginTop: '20px',
        textAlign: 'left',
        fontSize: '17px'
      }
    }
    return (
      <div style={styles.drag}>
        <input
          style={styles.input}
          type='file'
          multiple
          value={this.state.value}
          onChange={this.handleChange}
          onClick={this.handleClick}
        />
        Drag and drop or click here to reupload course (max 6MB)
        {
          err &&
          <div style={styles.err}>
            {
              err.split('\n').map((item: any, key: any) => {
                return <span key={key}>{item}<br /></span>
              })
            }
          </div>
        }
      </div>
    )
  }
}
export const ReuploadArea = connect((state: any) => ({
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(Area) as any
