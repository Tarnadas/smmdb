import React from 'react'
import {
  connect
} from 'react-redux'

import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  DOWNLOAD_FORMAT
} from '../../reducers/userData'

class CourseDownloadButton extends React.PureComponent {
  render () {
    const downloadFormat = this.props.downloadFormat ? this.props.downloadFormat : DOWNLOAD_FORMAT.WII_U
    const screenSize = this.props.screenSize
    const styles = {
      href: {
        height: screenSize === ScreenSize.LARGE ? '180px' : 'auto',
        // width: 'calc(50% - 10px)',
        margin: '0 5px',
        width: '100%'
      },
      button: {
        backgroundColor: '#11c2b0',
        color: '#fff',
        borderRadius: '5px',
        border: screenSize === ScreenSize.LARGE ? '8px solid #0f9989' : '4px solid #0f9989',
        boxShadow: '0px 5px 0px 0px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        width: '100%',
        height: screenSize === ScreenSize.LARGE ? '100%' : 'auto',
        padding: '0 10px'
      },
      icon: {
        maxHeight: '110px',
        height: 'auto',
        width: 'auto',
        display: 'block'
      },
      iconImg: {
        width: 'auto',
        height: screenSize === ScreenSize.LARGE ? '100%' : '80px'
      },
      text: {
        height: screenSize === ScreenSize.LARGE ? '70px' : 'auto',
        width: screenSize === ScreenSize.LARGE ? '100%' : 'auto',
        minWidth: screenSize === ScreenSize.LARGE ? '' : '90px',
        margin: screenSize === ScreenSize.LARGE ? '' : '3px 0',
        lineHeight: screenSize === ScreenSize.LARGE ? '70px' : '',
        fontSize: screenSize === ScreenSize.LARGE ? '24px' : '16px'
      }
    }
    return (
      <a style={styles.href} href={`/api/downloadcourse?id=${this.props.courseId}&type=${
        downloadFormat === DOWNLOAD_FORMAT.WII_U ? 'zip'
          : (
            downloadFormat === DOWNLOAD_FORMAT.N3DS ? '3ds' : 'protobuf'
          )
      }`} download>
        <div style={styles.button}>
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
}
export default connect(state => ({
  downloadFormat: state.getIn(['userData', 'accountData', 'downloadformat'])
}))(CourseDownloadButton)
