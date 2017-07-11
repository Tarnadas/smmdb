import React from 'react'
import {
  connect
} from 'react-redux'
import {
  List
} from 'immutable'
import got from 'got'
import stream from 'filereader-stream'
import concat from 'concat-stream'
import progress from 'progress-stream'

import { resolve } from 'url'

import { domain } from '../../../static'
import {
  setCoursesUploaded, setUpload, deleteUpload
} from '../../actions'

const SERVER_TIMEOUT = 30000

class UploadArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      uploads: List()
    }
    this.currentUpload = 0
    this.sendCourse = this.sendCourse.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }
  sendCourse (course) {
    let timeout
    const id = this.currentUpload
    this.currentUpload++
    try {
      let abort
      const req = got.stream.post(resolve(domain, `/api/uploadcourse?apikey=${this.props.apiKey}`), {
        headers: { 'Content-Type': 'application/octet-stream' }
      })
      req.on('request', r => {
        abort = r.abort
        this.props.dispatch(setUpload(id, {
          id,
          title: course.name,
          percentage: 0,
          eta: 0
        }))
      })
      req.on('response', () => {
        if (timeout) {
          clearTimeout(timeout)
          this.props.dispatch(deleteUpload(id))
        }
      })
      req.on('error', err => {
        console.log(err)
        if (timeout) {
          clearTimeout(timeout)
          this.props.dispatch(deleteUpload(id))
        }
      })
      const prog = progress({
        length: course.size,
        time: 1000
      })
      prog.on('progress', progress => {
        this.props.dispatch(setUpload(id, {
          id,
          title: course.name,
          percentage: progress.percentage,
          eta: progress.eta
        }))
        if (progress.percentage === 100) {
          timeout = setTimeout(() => {
            if (abort) {
              abort()
              this.props.dispatch(deleteUpload(id))
            }
          }, SERVER_TIMEOUT)
        }
      })
      req.pipe(concat(buf => {
        try {
          const courses = JSON.parse(new TextDecoder('utf-8').decode(buf))
          this.props.dispatch(setCoursesUploaded(courses, true))
        } catch (err) {
          if (timeout) {
            clearTimeout(timeout)
            this.props.dispatch(deleteUpload(id))
          }
        }
      }))
      const s = stream(course)
      s.pipe(prog).pipe(req)
    } catch (err) {
      console.log(err)
      if (err.response.body) {
        console.log(err.response.body)
      }
      if (timeout) {
        clearTimeout(timeout)
        this.props.dispatch(deleteUpload(id))
      }
    }
  }
  handleChange (e) {
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
    const styles = {
      drag: {
        height: 'auto',
        width: 'auto',
        padding: '40px 20px',
        marginBottom: '10px',
        background: '#fff',
        color: '#000',
        fontSize: '20px',
        border: ' 4px dashed #000000',
        borderRadius: '20px',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
      }
    }
    return (
      <div style={styles.drag}>
        <input style={styles.input} type='file' multiple value={this.state.value} onChange={this.handleChange} onClick={this.handleClick} />
        Drag and drop or click here to upload a course (max 6MB)
      </div>
    )
  }
}
export default connect(state => ({
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(UploadArea)
