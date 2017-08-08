import React from 'react'
import {
  connect
} from 'react-redux'

import {
  ScreenSize
} from '../../reducers/mediaQuery'

class MainView extends React.PureComponent {
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      main: {
        padding: screenSize === ScreenSize.SUPER_SMALL ? '6% 5%' : '6% 10%',
        color: '#000',
        display: 'flex',
        flexDirection: 'column'
      },
      content: {
        flex: '1 0 0%',
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        fontSize: '16px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)',
        overflow: screenSize < ScreenSize.MEDIUM ? 'hidden' : 'auto'
      }
    }
    return (
      <div style={styles.main}>
        <div style={styles.content}>
          Welcome to Super Mario Maker Database!<br /><br /><br /><br />
          This is a website solely for the purpose to share Super Mario Maker courses platform independently.
          It doesn't matter if you want to use courses on this website for Wii U, 3DS or an emulator. All platforms are supported.<br /><br />
          To use all features on this website it is recommended to sign in with Google.<br /><br />
          All content on this website is user-created. We do not share any copyrighted stuff.
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(MainView)
