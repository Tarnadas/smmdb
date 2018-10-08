import * as React from 'react'

interface ErrorMessageProps {
  err: Error | XhrError
}

interface XhrError {
  response: {
    data: string,
    request: XMLHttpRequest,
    status: number
    statusText: string
  }
}

export class ErrorMessage extends React.PureComponent<ErrorMessageProps> {
  public render (): JSX.Element {
    const { err } = this.props
    const styles: any = {
      err: {
        color: '#a20007',
        marginTop: '20px',
        textAlign: 'left',
        fontSize: '17px'
      }
    }
    const error = err as Error
    const xhrError = err as XhrError
    const isXhr = !!xhrError.response
    const errorMessage = isXhr
      ? xhrError.response.data
      : error.message
    return (
      <div style={styles.err}>
        {
          errorMessage.split('\n').map((item: any, key: any) => {
            return <span key={key}>{item}<br /></span>
          })
        }
      </div>
    )
  }
}
