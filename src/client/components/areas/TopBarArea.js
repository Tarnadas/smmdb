import React from 'react'
import {
  connect
} from 'react-redux'

import LoginButton from '../buttons/LoginButton'
import SMMButton from '../buttons/SMMButton'
import {
  ScreenSize
} from '../../reducers/mediaQuery'

class TopBarArea extends React.PureComponent {
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      topbar: {
        width: '100%',
        height: 'auto',
        padding: '10px',
        display: screenSize === ScreenSize.LARGE ? 'flex' : 'none',
        flex: '0 0 auto'
      },
      bar: {
        flex: '1 0 0%'
      },
      button: {
        width: 'auto',
        height: 'auto',
        flexShrink: '0'
      }
    }
    return (
      <div style={styles.topbar}>
        <div style={styles.bar}>
          <SMMButton link='/' text='Courses' iconSrc='/img/courses.png' iconColor='dark' />
          <SMMButton link='/upload' text='Upload' iconSrc='/img/upload.png' iconColor='dark' />
          <SMMButton link='/profile' text='Profile' iconSrc='/img/profile.png' iconColor='dark' />
          {
            !process.env.ELECTRON && (
            <div style={{ width: 'auto', height: 'auto' }}>
              <SMMButton link='https://github.com/Tarnadas/smmdb' blank text='API' iconSrc='/img/api.png' iconColor='dark' />
              <SMMButton link='https://github.com/Tarnadas/cemu-smmdb/releases' blank text='Client' iconSrc='/img/client.png' iconColor='dark' />
              <SMMButton link='https://www.reddit.com/r/CemuMarioMaker' blank text='Reddit' iconSrc='/img/reddit.png' iconColor='dark' />
              <SMMButton link='https://discord.gg/SPZsgSe' blank text='Discord' iconSrc='/img/discord.png' iconColor='dark' />
            </div>
          )
          }
        </div>
        <div style={styles.button}>
          {
            !process.env.ELECTRON && <LoginButton />
          }
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(TopBarArea)
