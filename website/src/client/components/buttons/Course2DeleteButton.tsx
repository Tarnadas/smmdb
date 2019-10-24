import * as React from 'react'

interface Course2DeleteButtonProps {
  courseId: string
}

interface Course2DeleteButtonState {
  hover: boolean
  shouldDelete: boolean
}

export default class Course2DeleteButton extends React.PureComponent<
  Course2DeleteButtonProps,
  Course2DeleteButtonState
> {
  public constructor (props: Course2DeleteButtonProps) {
    super(props)
    this.state = {
      hover: false,
      shouldDelete: false
    }
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
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

  private async onCourseDelete (): Promise<void> {
    const { shouldDelete } = this.state
    if (shouldDelete) {
      const { courseId } = this.props
      try {
        const res = await fetch(
          `${process.env.API_DOMAIN}courses2/${courseId}`,
          {
            method: 'delete',
            credentials: 'include'
          }
        )
      } catch (err) {
        console.error(err.response.body)
      }
    } else {
      this.setState({
        shouldDelete: true
      })
    }
  }

  public render (): JSX.Element {
    const { hover, shouldDelete } = this.state
    return (
      <div
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
        onClick={this.onCourseDelete}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div style={{ height: '40px' }}>
          <img
            style={{ height: '100%' }}
            src={`${process.env.DOMAIN}img/delete.png`}
          />
        </div>
        <span
          style={{ flex: '1 0 auto', lineHeight: '40px', margin: '0 30px' }}
        >
          {shouldDelete ? 'Click again' : 'Delete'}
        </span>
      </div>
    )
  }
}
