import * as React from 'react'
import { connect } from 'react-redux'

import { Course2 } from '@/client/models/Course2'
import { ScreenSize } from '@/client/reducers/mediaQuery'

interface Course2DetailsAreaProps {
  course: Course2
  onClose: (event: React.MouseEvent) => void
  screenSize: number
}

class Course2DetailsArea extends React.PureComponent<Course2DetailsAreaProps> {
  public constructor (props: Course2DetailsAreaProps) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleStop = this.handleStop.bind(this)
  }

  private handleClick (event: React.MouseEvent): void {
    this.props.onClose(event)
  }

  private handleStop (event: React.MouseEvent): void {
    event.stopPropagation()
  }

  public render (): JSX.Element {
    const { course, screenSize } = this.props
    return (
      <div
        onClick={this.handleClick}
        style={{
          display: 'flex',
          position: 'fixed',
          zIndex: 1100,
          backgroundColor: 'rgba(0,0,0,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          cursor: 'default'
        }}
      >
        <div
          onClick={this.handleStop}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1101,
            borderRadius: '8px',
            backgroundColor: '#ffe500',
            fontSize: '0.7rem',
            width: screenSize >= ScreenSize.MEDIUM ? '80%' : '100%',
            height: '80%',
            maxWidth: '100vw',
            minHeight: '500px',
            overflow: 'auto'
          }}
          id="scroll"
        >
          <div
            style={{
              display: 'flex',
              flex: '1 1 auto',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                flex: '1 1 auto',
                fontSize: '1.2rem'
              }}
            >
              Course Details of {course.course.header.title}
            </span>
            <div
              onClick={this.handleClick}
              style={{
                zIndex: 1102,
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                minWidth: '32px',
                minHeight: '32px',
                margin: '6px',
                backgroundColor: '#11c2b0',
                borderRadius: '5px',
                padding: '6px'
              }}
            >
              <img style={{ width: '100%' }} src="/img/cancel.svg" />
            </div>
          </div>
          <Course2DetailsTable values={course} fontSize={1} />
        </div>
      </div>
    )
  }
}
export default connect(
  (state: any): any => ({
    screenSize: state.getIn(['mediaQuery', 'screenSize']) as number
  })
)(Course2DetailsArea) as any

class Course2DetailsTable extends React.PureComponent<{
  values: { [key: string]: any }
  fontSize: number
}> {
  public render (): JSX.Element {
    const { values, fontSize } = this.props
    return (
      <table>
        <tbody>
          {Object.entries(values).map(([key, value]) => (
            <tr key={key}>
              <td
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.6)',
                  fontSize: `${fontSize}rem`
                }}
              >
                {key}
              </td>
              {value instanceof Object ? (
                <td>
                  <Course2DetailsTable
                    values={value}
                    fontSize={fontSize - 0.1}
                  />
                </td>
              ) : (
                <td
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.6)',
                    fontSize: `${fontSize - 0.1}rem`,
                    width: '100%'
                  }}
                >
                  {value}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}
