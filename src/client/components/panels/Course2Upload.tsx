import * as React from 'react'
import Axios from 'axios'

import { Course2, Course2Duplicate, Difficulty2 } from '@/client/models/Course2'
import { ProgressSpinner } from '../shared/ProgressSpinner'

interface Course2UploadProps {
  course: File
  difficulty?: Difficulty2
  setFinished: () => void
}

interface Course2UploadState {
  progress: number
  processing: boolean
  succeeded?: Course2[]
  failed?: Course2Duplicate[]
  err?: Error
}

export default class Course2Upload extends React.PureComponent<
  Course2UploadProps,
  Course2UploadState
> {
  public constructor (props: Course2UploadProps) {
    super(props)
    this.state = {
      progress: 0,
      processing: false
    }
  }

  public async componentDidMount (): Promise<void> {
    try {
      const { course, difficulty } = this.props
      await this.sendCourse(course, difficulty)
    } catch (err) {
      this.setState({
        err
      })
    }
    this.props.setFinished()
    this.setState({
      processing: false
    })
  }

  private async sendCourse (
    course: File,
    difficulty?: Difficulty2
  ): Promise<void> {
    const url = `${process.env.API_DOMAIN || ''}courses2${
      difficulty ? `?difficulty=${difficulty}` : ''
    }`
    this.setState({
      progress: 0
    })
    const res = await Axios.put(url, course, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/zip'
      },
      onUploadProgress: ({ loaded, total }): void => {
        const progress = (loaded * 100) / total
        this.setState({
          progress,
          err: undefined
        })
        if (progress > 99.9) {
          this.setState({
            processing: true
          })
        }
      }
    })
    const { succeeded, failed } = res.data
    this.setState({
      succeeded,
      failed
    })
  }

  public render (): JSX.Element {
    const { course } = this.props
    const { progress, processing, succeeded, failed, err } = this.state
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 100px',
          minWidth: '250px',
          margin: '0.6rem',
          boxShadow: '0px 0px 2px 2px rgba(0,0,0,0.75)'
        }}
      >
        <div
          style={{
            width: '100%',
            height: '12px',
            background: `linear-gradient(90deg, #33cc33 ${progress}%, #000 ${progress}%)`
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            fontSize: '0.8rem',
            textAlign: 'left',
            padding: '0.2rem 0.5rem'
          }}
        >
          <span
            style={{
              width: '100%',
              lineHeight: '36px',
              fontSize: '1.2rem'
            }}
          >
            {course.name}
          </span>
          {processing && <ProgressSpinner inline={true} />}
          {succeeded && <span>found {succeeded.length} new courses</span>}
          {failed &&
            failed.length > 0 && (
              <span>found {failed.length} courses with duplicates</span>
            )}
        </div>
      </div>
    )
  }
}
