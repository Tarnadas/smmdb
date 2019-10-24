import * as React from 'react'
import { connect } from 'react-redux'

import { Course2, GameStyle } from '@/client/models/Course2'

import Course2DownloadButton from '../buttons/Course2DownloadButton'

interface Course2PanelProps {
  accountData: any
  courseId: string
  course: Course2
}

interface Course2PanelState {
  canEdit: boolean
  extended: boolean
  maxHeight: number | null
}

class Course2Panel extends React.PureComponent<
  Course2PanelProps,
  Course2PanelState
> {
  private extendedDivElement: HTMLDivElement | null = null

  private transitionDuration = 400

  public constructor (props: Course2PanelProps) {
    super(props)
    const accountId = props.accountData.get('id')
    this.state = {
      canEdit: accountId && accountId === props.courseId,
      extended: false,
      maxHeight: null
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  public componentDidMount (): void {
    if (this.extendedDivElement) {
      this.setState({
        maxHeight: this.extendedDivElement.clientHeight
      })
    }
  }

  public componentDidUpdate (prevProps: Course2PanelProps): void {
    if (this.props.accountData !== prevProps.accountData) {
      const accountId = this.props.accountData.get('id')
      this.setState({
        canEdit: accountId && accountId === this.props.course.owner
      })
    }
    if (this.extendedDivElement) {
      this.setState({
        maxHeight: this.extendedDivElement.clientHeight
      })
    }
  }

  private handleClick (): void {
    const { extended } = this.state
    if (extended) return
    this.setState({
      extended: true
    })
  }

  private handleClose (): void {
    this.setState({
      extended: false
    })
  }

  private getGameStyleImage (gameStyle: GameStyle): string {
    switch (gameStyle) {
      case GameStyle.M1:
        return '/img/smb.png'
      case GameStyle.M3:
        return '/img/smb3.png'
      case GameStyle.MW:
        return '/img/smw.png'
      case GameStyle.WU:
        return '/img/nsmbu.png'
      default:
        return ''
    }
  }

  public render (): JSX.Element {
    const { course, courseId } = this.props
    const { canEdit, extended, maxHeight } = this.state
    // console.log(course)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          borderRadius: '8px',
          backgroundColor: '#fffdee',
          width: '700px',
          maxWidth: '100%',
          margin: '0.4rem 0',
          color: '#491110',
          padding: '0.05rem 0.5rem',
          cursor: extended ? 'default' : 'pointer',
          overflow: 'hidden',
          flex: '0 0 auto'
        }}
        onClick={this.handleClick}
      >
        <div style={{ display: 'flex', height: '44px' }}>
          <div style={{ height: '100%' }}>
            <img
              src={this.getGameStyleImage(course.course.header.game_style)}
            />
          </div>
          <span
            style={{
              fontSize: '1.4rem',
              marginLeft: '0.5rem',
              lineHeight: '44px',
              flex: '1 1 auto',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
          >
            {course.course.header.title}
          </span>
          {extended && (
            <div
              style={{
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                margin: '6px',
                backgroundColor: '#11c2b0',
                borderRadius: '5px',
                padding: '6px',
                flex: '0 0 auto'
              }}
              onClick={this.handleClose}
            >
              <img style={{ width: '100%' }} src="/img/cancel.svg" />
            </div>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between'
          }}
        >
          <img
            src={`${process.env.API_DOMAIN}courses2/thumbnail/${
              course.id
            }?size=m`}
            style={{
              height: '140px'
            }}
          />
          <div
            style={{
              backgroundColor: '#fef3d3',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '1 1 200px'
            }}
          >
            {course.course.header.description}
          </div>
        </div>
        <div
          style={{
            overflow: 'hidden',
            maxHeight: extended ? maxHeight || '600px' : '0px',
            transition: `max-height ${this.transitionDuration}ms linear`
          }}
        >
          <div
            ref={divElement => {
              this.extendedDivElement = divElement
            }}
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                margin: '10px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
              }}
            >
              {canEdit && <div>CAN EDIT</div>}
              <Course2DownloadButton courseId={courseId} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
export default connect(
  (state: any): any => ({
    accountData: state.getIn(['userData', 'accountData'])
  })
)(Course2Panel) as any
