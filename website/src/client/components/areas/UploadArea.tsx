import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import axios from 'axios'

import { resolve } from 'url'

import { ErrorMessage } from '../shared/ErrorMessage'
import {
  setCoursesUploaded,
  setCoursesUploaded64,
  setUpload,
  setUpload64,
  deleteUpload,
  deleteUpload64
} from '../../actions'

interface UploadAreaProps {
  apiKey: string
  is64?: boolean
  upload?: any
  dispatch: Dispatch<any>
}

interface UploadAreaState {
  value: string
  err?: Error
}

class Area extends React.PureComponent<UploadAreaProps, UploadAreaState> {
  public currentUpload: number

  public constructor (props: UploadAreaProps) {
    super(props)
    this.state = {
      value: '',
      err: undefined
    }
    this.currentUpload = 0
    this.sendCourse = this.sendCourse.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  private async sendCourse (course: File): Promise<void> {
    const courseId = String(this.currentUpload)
    this.currentUpload++
    const { is64 } = this.props
    const upload = is64 ? setUpload64 : setUpload
    const del = is64 ? deleteUpload64 : deleteUpload
    const reqUrl = resolve(
      process.env.DOMAIN || '',
      `/api/uploadcourse${is64 ? '64' : ''}`
    )

    this.props.dispatch(
      upload(courseId, {
        courseId,
        title: course.name,
        percentage: 0,
        eta: 0
      })
    )
    this.setState({
      err: undefined
    })

    try {
      await this.makeUploadRequest(reqUrl, course, courseId)
    } catch (err) {
      this.setState({
        err
      })
      this.props.dispatch(del(courseId))
    }
  }

  private async makeUploadRequest (
    reqUrl: string,
    course: File,
    courseId: string
  ): Promise<void> {
    const { apiKey, is64, dispatch } = this.props
    const upload = is64 ? setUpload64 : setUpload
    const setCourses = is64 ? setCoursesUploaded64 : setCoursesUploaded
    let name = ''
    try {
      name = course.name
        .split('.')
        .slice(0, -1)
        .join()
      name.replace('_', ' ')
    } catch (err) {}
    const res = await axios.post(reqUrl, course, {
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `APIKEY ${apiKey}`,
        Filename: name
      },
      onUploadProgress: ({ loaded, total }): void => {
        const percentage = (loaded * 100) / total
        dispatch(
          upload(courseId, {
            courseId,
            title: course.name,
            percentage,
            eta: 0
          })
        )
        this.setState({
          err: undefined
        })
      }
    })
    const courses = res.data
    this.props.dispatch(setCourses(is64 ? [courses] : courses, true))
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
      reader.onload = (): void => {
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
    const err = this.state.err
    const styles: any = {
      drag: {
        maxWidth: '950px',
        padding: '40px 20px',
        margin: '10px 0',
        background: '#fff',
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
          type="file"
          multiple
          value={this.state.value}
          onChange={this.handleChange}
          onClick={this.handleClick}
        />
        Drag and drop or click here to upload a Super Mario Maker 1 course (max
        6MB)
        {err && <ErrorMessage err={err} />}
      </div>
    )
  }
}
export const UploadArea = connect(
  (state: any): any => ({
    apiKey: state.getIn(['userData', 'accountData', 'apikey'])
  })
)(Area) as any
