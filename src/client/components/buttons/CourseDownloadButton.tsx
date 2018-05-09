import * as React from 'react'
import { connect } from 'react-redux'

import { ScreenSize } from '../../reducers/mediaQuery'
import { DOWNLOAD_FORMAT } from '../../reducers/userData'

class Button extends React.PureComponent<any, any> {
  public isAdding: boolean

  constructor (props: any) {
    super(props)
    this.isAdding = false
  }

  public componentWillReceiveProps (nextProps: any) {
    if (this.props.saveId !== nextProps.saveId) {
      this.isAdding = false
    }
  }

  private getButton(styles: React.CSSProperties): JSX.Element {
    const screenSize = this.props.screenSize
    const downloadFormat = this.props.downloadFormat ? this.props.downloadFormat : DOWNLOAD_FORMAT.WII_U
    return (
      <a
        style={styles.href}
        href={`/api/downloadcourse${this.props.is64 ? '64' : ''}?id=${this.props.courseId}&type=${
          downloadFormat === DOWNLOAD_FORMAT.WII_U ? 'zip'
            : (
              downloadFormat === DOWNLOAD_FORMAT.N3DS ? '3ds' : 'protobuf'
            )}`
        }
        download
      >
        <div style={{
          background: '#11c2b0',
          color: '#fff',
          borderRadius: '5px',
          border: screenSize >= ScreenSize.MEDIUM ? '8px solid #0f9989' : '4px solid #0f9989',
          boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          width: '100%',
          height: screenSize >= ScreenSize.MEDIUM ? '100%' : 'auto',
          padding: '0 10px'
        }}>
          <div style={styles.icon}>
            <img style={styles.iconImg} src='/img/coursebot.png' />
          </div>
          <div style={styles.text}>
            Download
          </div>
        </div>
      </a>
    )
  }
  // #endif
  
  public render (): JSX.Element {
    const screenSize = this.props.screenSize
    const styles: React.CSSProperties = {
      href: {
        height: screenSize >= ScreenSize.MEDIUM ? '180px' : 'auto',
        margin: '0px 5px 10px 5px',
        width: '100%',
        flex: '1 0 36px'
      },
      icon: {
        maxHeight: '110px',
        height: 'auto',
        width: 'auto',
        display: 'block'
      },
      iconImg: {
        width: 'auto',
        height: screenSize >= ScreenSize.MEDIUM ? '100%' : '80px'
      },
      text: {
        height: screenSize >= ScreenSize.MEDIUM ? '70px' : 'auto',
        width: screenSize >= ScreenSize.MEDIUM ? '100%' : 'auto',
        minWidth: screenSize >= ScreenSize.MEDIUM ? '' : '90px',
        margin: screenSize >= ScreenSize.MEDIUM ? '' : '3px 0',
        lineHeight: screenSize >= ScreenSize.MEDIUM ? '70px' : '',
        fontSize: screenSize >= ScreenSize.MEDIUM ? '24px' : '16px'
      }
    }
    let jsx: JSX.Element
    jsx = this.getButton(styles)
    return jsx
  }
}
export const CourseDownloadButton = connect((state: any) => ({
  downloadFormat: state.getIn(['userData', 'accountData', 'downloadformat']),
  saveFull: state.getIn(['electron', 'saveFull'])
}))(Button) as any
