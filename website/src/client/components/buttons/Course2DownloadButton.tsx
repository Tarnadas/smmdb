import * as React from 'react'

interface Course2DownloadButtonProps {
  courseId: string
}

interface Course2DownloadButtonState {
  hover: boolean
}

export default class Course2DownloadButton extends React.PureComponent<
  Course2DownloadButtonProps,
  Course2DownloadButtonState
> {
  public constructor (props: Course2DownloadButtonProps) {
    super(props)
    this.state = {
      hover: false
    }
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
  }

  private handleMouseEnter (): void {
    this.setState({
      hover: true
    })
  }

  private handleMouseLeave (): void {
    this.setState({
      hover: false
    })
  }

  public render (): JSX.Element {
    const { courseId } = this.props
    const { hover } = this.state
    return (
      <a
        style={{
          display: 'flex',
          backgroundColor: '#fecd06',
          padding: hover ? '8px' : '10px',
          fontSize: '1.4rem',
          cursor: 'pointer',
          textDecoration: 'none',
          boxSizing: 'border-box',
          border: hover ? '2px dashed #fa5f0c' : 'none',
          margin: '12px 0 12px 20px'
        }}
        href={`${process.env.API_DOMAIN}courses2/download/${courseId}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div style={{ height: '40px' }}>
          <img
            style={{ height: '100%' }}
            src={`${process.env.DOMAIN}img/coursebot.png`}
          />
        </div>
        <span
          style={{ flex: '1 0 auto', lineHeight: '40px', margin: '0 30px' }}
        >
          Download
        </span>
      </a>
    )
  }
}
