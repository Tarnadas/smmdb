import React from 'react'
import {
  connect
} from 'react-redux'

import SMMButton from '../buttons/SMMButton'
import AmazonPanel from '../panels/AmazonPanel'
import {
  ScreenSize
} from '../../reducers/mediaQuery'

class MainView extends React.PureComponent {
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      main: {
        height: '100%',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '6% 5%' : '6% 10%',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        overflow: screenSize < ScreenSize.MEDIUM ? 'hidden' : 'auto'
      },
      content: {
        flex: '1 0 auto',
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        fontSize: '16px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)'
      },
      affiliate: {
        padding: screenSize === ScreenSize.SUPER_SMALL ? '20px 10px' : '20px',
        backgroundColor: 'rgba(59,189,159,1)',
        boxShadow: '0px 0px 10px 10px rgba(59,189,159,1)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        flex: '0 0 auto'
      },
      header: {
        fontSize: '18px',
        padding: '6px 12px',
        width: '100%',
        margin: '20px 0',
        backgroundColor: '#fff8af',
        borderRadius: '6px',
        border: '4px solid #f8ca00',
        boxShadow: '0 0 0 4px black'
      }
    }
    return (
      <div style={styles.main} id='scroll'>
        <div style={styles.content}>
          <div style={styles.header}>
            Welcome to Super Mario Maker Database!
          </div>
          You can share your Super Mario Maker courses platform independently on this website. Supported platforms are Wii U, 3DS and Cemu. For Cemu there is even a save file editor. Just navigate to 'Client'.<br />
          It also features courses for Super Mario 64 Maker, a popular ROM hack by Kaze Emanuar.<br /><br />
          To use all features on this website it is recommended to sign in with Google.<br /><br />
          All content on this website is user-created. We do not share any copyrighted stuff.
        </div>
        <div style={styles.affiliate}>
          <div style={styles.header}>
            Affiliates
          </div>
          <SMMButton link='https://sm64o.com/' blank text='Super Mario 64 Online' iconSrc='/img/sm64o.png' iconColor='bright' noText />
          <SMMButton link='http://sm64hacks.com/' blank text='Super Mario 64 Hacks' iconSrc='/img/sm64hacks.png' iconColor='bright' noText />
        </div>
        <AmazonPanel />
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(MainView)
