import * as React from 'react'

import { Difficulty2 } from '@/client/models/Course2'

import Course2Upload from './Course2Upload'
import { SMMButton } from '../buttons/SMMButton'

interface Upload {
  course: File
  finished: boolean
}

interface Upload2PanelProps {
  refresh: () => Promise<void>
}

interface Upload2PanelState {
  value: string
  uploads: Upload[]
  allFinished: boolean
  difficulty?: Difficulty2
  err?: Error
}

export default class Upload2Panel extends React.PureComponent<
  Upload2PanelProps,
  Upload2PanelState
> {
  public constructor (props: Upload2PanelProps) {
    super(props)
    this.state = {
      value: '',
      uploads: [],
      allFinished: false
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this)
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
      if (file.size > 6 * 1024 * 1024 * 1024) continue
      const reader = new FileReader()
      reader.onload = (): void => {
        this.setState(prevState => ({
          uploads: [...prevState.uploads, { course: file, finished: false }]
        }))
      }
      reader.readAsText(file)
    }
  }

  private handleClick (): void {
    this.setState({
      value: ''
    })
  }

  private handleDifficultyChange (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void {
    const value = event.target.value as any
    this.setState({ difficulty: value })
  }

  private setFinished (index: number): void {
    const uploads = [...this.state.uploads]
    uploads[index].finished = true
    const allFinished = uploads
      .map(upload => upload.finished)
      .reduce((acc, cur) => acc && cur, true)
    this.setState({
      uploads,
      allFinished
    })
  }

  private renderUploads (
    uploads: Upload[],
    difficulty?: Difficulty2
  ): JSX.Element[] {
    return uploads.map((upload, index) => (
      <Course2Upload
        key={index}
        course={upload.course}
        difficulty={difficulty}
        setFinished={this.setFinished.bind(this, index)}
      />
    ))
  }

  public render (): JSX.Element {
    const { refresh } = this.props
    const { uploads, allFinished, difficulty } = this.state
    return (
      <div
        style={{
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
          flexDirection: 'column',
          width: '700px',
          maxWidth: '100%'
        }}
      >
        <input
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 20,
            opacity: 0,
            cursor: 'pointer'
          }}
          type="file"
          accept=".zip"
          multiple
          value={this.state.value}
          onChange={this.handleChange}
          onClick={this.handleClick}
        />
        <span style={{ marginBottom: '0.6rem' }}>
          Drag and drop or click here to upload a Super Mario Maker 2 course
          (max 60MB)
        </span>
        <div
          style={{
            zIndex: 21,
            alignSelf: 'flex-start',
            marginTop: '0.5rem'
          }}
        >
          <span style={{ marginRight: '0.3rem' }}>Difficulty:</span>
          <select
            style={{
              width: '50%',
              minWidth: '150px',
              marginBottom: '12px'
            }}
            value={difficulty}
            onChange={this.handleDifficultyChange}
          >
            <option />
            <option value={Difficulty2.Easy}>Easy</option>
            <option value={Difficulty2.Normal}>Normal</option>
            <option value={Difficulty2.Expert}>Expert</option>
            <option value={Difficulty2.SuperExpert}>Super Expert</option>
          </select>
        </div>
        {allFinished && (
          <SMMButton
            onClick={refresh}
            text="Refresh list"
            iconSrc="/img/refresh.svg"
            padding="3px"
            zIndex={21}
          />
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%'
          }}
        >
          {this.renderUploads(uploads, difficulty)}
        </div>
      </div>
    )
  }
}
