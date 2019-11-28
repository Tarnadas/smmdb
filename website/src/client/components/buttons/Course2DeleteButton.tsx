import * as React from 'react'
import { SMMButton } from './SMMButton'

interface Course2DeleteButtonProps {
  courseId: string
  onDelete: () => void
}

interface Course2DeleteButtonState {
  shouldDelete: boolean
}

export default class Course2DeleteButton extends React.PureComponent<
  Course2DeleteButtonProps,
  Course2DeleteButtonState
> {
  public constructor (props: Course2DeleteButtonProps) {
    super(props)
    this.state = {
      shouldDelete: false
    }
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.onCourseDelete = this.onCourseDelete.bind(this)
  }

  private handleMouseLeave (): void {
    this.setState({
      shouldDelete: false
    })
  }

  private async onCourseDelete (): Promise<void> {
    const { shouldDelete } = this.state
    if (shouldDelete) {
      const { courseId, onDelete } = this.props
      try {
        await fetch(`${process.env.API_DOMAIN}courses2/${courseId}`, {
          method: 'delete',
          credentials: 'include'
        })
        onDelete()
      } catch (err) {
        console.error(err)
      }
    } else {
      this.setState({
        shouldDelete: true
      })
    }
  }

  public render (): JSX.Element {
    const { shouldDelete } = this.state
    return (
      <div
        style={{
          marginLeft: '12px'
        }}
      >
        <SMMButton
          onClick={this.onCourseDelete}
          onMouseLeave={this.handleMouseLeave}
          text={shouldDelete ? 'Click again' : 'Delete'}
          iconSrc="/img/delete.png"
          iconColor="bright"
          padding="3px"
          noMargin
        />
      </div>
    )
  }
}
