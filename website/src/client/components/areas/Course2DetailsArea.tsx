import * as React from 'react'

import { Course2 } from '@/client/models/Course2'

interface Course2DetailsAreaProps {
  course: Course2
  onClose: (event: React.MouseEvent) => void
}

export default class Course2DetailsArea extends React.PureComponent<
  Course2DetailsAreaProps
> {
  public constructor (props: Course2DetailsAreaProps) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  private handleClick (event: React.MouseEvent): void {
    this.props.onClose(event)
  }

  public render (): JSX.Element {
    const { course } = this.props
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
          left: 0
        }}
      >
        <div
          style={{
            display: 'flex',
            zIndex: 1101,
            borderRadius: '8px',
            backgroundColor: '#ffe500',
            fontSize: '0.7rem',
            width: '80%',
            height: '80%',
            minWidth: '600px',
            minHeight: '500px',
            overflow: 'auto'
          }}
          id="scroll"
        >
          <Course2DetailsTable values={course} fontSize={1} />
        </div>
      </div>
    )
  }
}

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
