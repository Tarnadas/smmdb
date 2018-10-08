import * as React from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import axios from 'axios'

import { resolve } from 'url'

import { ErrorMessage } from '../shared/ErrorMessage';
import {
  setUploadImageFull, setUploadImagePreview, setUploadImage64, setUploadBlog,
  deleteUploadImageFull, deleteUploadImagePreview, deleteUploadImage64, deleteUploadBlog
} from '../../actions'

interface UploadImageAreaProps {
  courseId: string
  apiKey: string
  type: string
  upload?: any
  onUploadComplete: (...args: any[]) => void
  dispatch: Dispatch<any>
}

interface UploadImageAreaState {
  value: string
  err?: Error
}

class Area extends React.PureComponent<UploadImageAreaProps, UploadImageAreaState> {
  constructor (props: UploadImageAreaProps) {
    super(props)
    this.state = {
      value: '',
      err: undefined
    }
    this.sendImage = this.sendImage.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  private async sendImage (image: File): Promise<void> {
    const { courseId, type } = this.props
    const setUpload = type === 'full'
      ? setUploadImageFull
      : type === '64'
        ? setUploadImage64
        : type === 'blog'
          ? setUploadBlog
          : setUploadImagePreview
    const deleteUpload = type === 'full'
      ? deleteUploadImageFull
      : type === '64'
        ? deleteUploadImage64
        : type === 'blog'
          ? deleteUploadBlog
          : deleteUploadImagePreview
    const reqUrl = resolve(process.env.DOMAIN!, `/api/uploadimage${type}`)

    this.props.dispatch(setUpload(courseId, {
      courseId,
      title: image.name,
      percentage: 0,
      eta: 0
    }))
    this.setState({
      err: undefined
    })

    try {
      await this.makeUploadRequest(reqUrl, image, courseId, setUpload)
    } catch (err) {
      this.setState({
        err
      })
      this.props.dispatch(deleteUpload(courseId))
    }
  }

  private async makeUploadRequest (reqUrl: string, course: File, courseId: string, setUpload: any): Promise<void> {
    const { apiKey, dispatch } = this.props
    const res = await axios.post(
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
          dispatch(setUpload(courseId, {
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
    this.props.onUploadComplete(res.data)
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
        this.sendImage(file)
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
    const upload = this.props.upload && this.props.upload.toJS()
    const styles: any = {
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
          <ErrorMessage
            err={err}
          />
        }
      </div>
    )
  }
}
export const UploadImageArea = connect((state: any) => ({
  apiKey: state.getIn(['userData', 'accountData', 'apikey'])
}))(Area) as any
