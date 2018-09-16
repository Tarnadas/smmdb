import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import axios from 'axios'

import { resolve } from 'url'

import { ErrorMessage } from '../shared/ErrorMessage';
import {
  setReupload, setReupload64, deleteReupload, deleteReupload64
} from '../../actions'

interface ReuploadAreaProps {
  courseId: string
  apiKey: string
  is64?: boolean
  upload?: any
  dispatch: Dispatch<any>
}

interface ReuploadAreaState {
  value: string
  err?: Error
}

class Area extends React.PureComponent<ReuploadAreaProps, ReuploadAreaState> {
  public constructor (props: ReuploadAreaProps) {
    super(props)
    this.state = {
      value: '',
      err: undefined
    }
    this.sendCourse = this.sendCourse.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  private async sendCourse (course: File): Promise<void> {
    const { courseId, is64 } = this.props
    const reupload = is64 ? setReupload64 : setReupload
    const deleteReup = is64 ? deleteReupload64 : deleteReupload
    const reqUrl = resolve(process.env.DOMAIN!, `/api/reuploadcourse${is64 ? '64' : ''}`)

    this.props.dispatch(reupload(courseId, {
      courseId,
      title: course.name,
      percentage: 0,
      eta: 0
    }))
    this.setState({
      err: undefined
    })

    try {
      await this.makeUploadRequest(reqUrl, course, courseId)
    } catch (err) {
      this.setState({
        err
      })
      this.props.dispatch(deleteReup(courseId))
    }
  }

  private async makeUploadRequest (reqUrl: string, course: File, courseId: string): Promise<void> {
    const { apiKey, is64, dispatch } = this.props
    const reupload = is64 ? setReupload64 : setReupload
    await axios.post(
      reqUrl,
      course,
      {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `APIKEY ${apiKey}`,
          'course-id': courseId
        },
        onUploadProgress: ({ loaded, total }) => {
          const percentage = loaded * 100 / total
          dispatch(reupload(courseId, {
            courseId,
            title: course.name,
            percentage,
            eta: 0
          }))
          this.setState({
            err: undefined
          })
        }
      }
    )
  }

  private handleChange ({ target }: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      value: target.value
    })
    const files = target.files
    if (!files) return
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

  private handleClick (): void {
    this.setState({
      value: ''
    })
  }

  public render (): JSX.Element {
    const { err } = this.state
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
          <ErrorMessage
            err={err}
          />
        }
      </div>
    )
  }
}
export const ReuploadArea = connect((state: any) => ({
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(Area) as any
