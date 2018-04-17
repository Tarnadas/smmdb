import * as React from 'react'
import { connect } from 'react-redux'
import { List } from 'immutable'
import got from 'got'
const stream = require('filereader-stream')
const concat = require('concat-stream')
const progress = require('progress-stream')

import { resolve } from 'url'

import {
  setUploadImageFull, setUploadImagePreview, setUploadImage64, setUploadBlog,
  deleteUploadImageFull, deleteUploadImagePreview, deleteUploadImage64, deleteUploadBlog
} from '../../actions'

const SERVER_TIMEOUT = 30000

class Area extends React.PureComponent<any, any> {
  constructor (props: any) {
    super(props)
    this.state = {
      value: '',
      uploads: List(),
      err: ''
    }
    this.sendImage = this.sendImage.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }
  sendImage (course: any) {
    let timeout: any
    const id = this.props.courseId
    const setUpload = this.props.type === 'full'
      ? setUploadImageFull : this.props.type === '64'
        ? setUploadImage64 : this.props.type === 'blog'
          ? setUploadBlog : setUploadImagePreview
    const deleteUpload = this.props.type === 'full'
      ? deleteUploadImageFull : this.props.type === '64'
        ? deleteUploadImage64 : this.props.type === 'blog'
          ? deleteUploadBlog : deleteUploadImagePreview
    try {
      let abort: any
      const req = (got as any).stream.post(resolve(process.env.DOMAIN!, `/api/uploadimage${this.props.type}`), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `APIKEY ${this.props.apiKey}`,
          'course-id': String(id)
        },
        useElectronNet: false
      })
      req.on('request', (r: any) => {
        abort = r.abort
        this.props.dispatch(setUpload(id, {
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
          this.props.dispatch(deleteUpload(id))
        }
      })
      req.on('error', (err: any) => {
        if (err.response) {
          console.log(err.response.body)
        } else {
          console.error(err)
        }
        if (timeout) {
          clearTimeout(timeout)
          this.props.dispatch(deleteUpload(id))
        }
      })
      const prog = progress({
        length: course.size,
        time: 1000
      })
      prog.on('progress', (progress: any) => {
        this.props.dispatch(setUpload(id, {
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
              this.props.dispatch(deleteUpload(id))
            }
          }, SERVER_TIMEOUT)
        }
      })
      req.pipe(concat((buf: any) => {
        let res = ''
        try {
          res = new (window as any).TextDecoder('utf-8').decode(buf)
          if (this.props.type !== 'blog') {
            const course = JSON.parse(res)
            this.props.onUploadComplete(course)
          } else {
            console.log(res)
          }
        } catch (err) {
          this.setState({
            err: res
          })
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
        this.sendImage(file)
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
        width: this.props.type === '64' ? 'calc(100% - 40px)' : this.props.type === 'blog' ? '100%' : 'calc(50% - 40px)',
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
        {
          this.props.type === 'full' ? (
            'Upload full course image (max 6MB)'
          ) : (
            this.props.type === '64' ? (
              'Upload course image (max 6MB)'
              ) : (
              'Upload preview course image (max 6MB)'
            )
          )
        }
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
export const UploadImageArea = connect((state: any) => ({
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(Area) as any
