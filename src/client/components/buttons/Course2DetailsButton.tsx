import * as React from 'react'

import { Course2 } from '@/client/models/Course2'
import Course2DetailsArea from '../areas/Course2DetailsArea'

interface Course2DetailsButtonProps {
  course: Course2
}

interface Course2DetailsButtonState {
  hover: boolean
  display: boolean
}

export default class Course2DetailsButton extends React.PureComponent<
  Course2DetailsButtonProps,
  Course2DetailsButtonState
> {
  public constructor (props: Course2DetailsButtonProps) {
    super(props)
    this.state = {
      hover: false,
      display: false
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleMouseEnter = this.handleMouseEnter.bind(this)
    this.handleMouseLeave = this.handleMouseLeave.bind(this)
    this.onClose = this.onClose.bind(this)
  }

  private handleClick (): void {
    this.setState({ display: true })
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

  private onClose (event: React.MouseEvent): void {
    event.stopPropagation()
    this.setState({ display: false })
  }

  public render (): JSX.Element {
    const { course } = this.props
    const { hover, display } = this.state
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
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div style={{ height: '40px' }}>
          <img
            style={{ height: '100%' }}
            src={`${process.env.DOMAIN}img/help.png`}
          />
        </div>
        <span
          style={{ flex: '1 0 auto', lineHeight: '40px', margin: '0 30px' }}
        >
          Details
        </span>
        {display && (
          <Course2DetailsArea course={course} onClose={this.onClose} />
        )}
      </div>
    )
  }
}
