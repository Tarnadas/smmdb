import React from 'react'
import {
  connect
} from 'react-redux'

import Net64ServerArea from '../areas/Net64ServerArea'
import SMMButton from '../buttons/SMMButton'
import {
  ScreenSize
} from '../../reducers/mediaQuery'

class Net64View extends React.PureComponent {
  render () {
    const screenSize = this.props.screenSize
    const styles = {
      view: {
        height: '100%',
        fontSize: '14px',
        textAlign: 'left',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        color: '#000',
        alignItems: 'center'
      },
      info: {
        fontSize: '18px',
        marginBottom: '6px'
      },
      list: {
        margin: '20px',
        overflowY: 'auto',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        width: screenSize < ScreenSize.MEDIUM ? '100%' : 'calc(100% - 120px)'
      }
    }
    return (
      <div id='scroll' style={styles.view}>
        <div style={styles.info}>
          Net64 allows playing Super Mario 64 in an online multiplayer mode.<br />
          To join any of the servers listed below, you need Net64+. The official client won't be able to connect! Just follow the links.
        </div>
        <div>
          <SMMButton link='https://github.com/Tarnadas/net64plus/releases/download/0.5/Net64plus_0.5.7z' blank text='Get the Client' iconSrc='/img/net64.png' iconColor='bright' />
          <SMMButton link='https://github.com/Tarnadas/net64plus' blank text='Client Source' iconSrc='/img/github.svg' iconColor='bright' />
          <SMMButton link='https://github.com/Tarnadas/net64plus-ded' blank text='Get the Server' iconSrc='/img/github.svg' iconColor='bright' />
          <SMMButton link='https://sm64o.com/' blank text='Net64 Forum' iconSrc='/img/sm64o.png' iconColor='bright' noText />
          <SMMButton link='https://discord.gg/k9QMFaB' blank text='Net64 Discord' iconSrc='/img/discord.svg' iconColor='bright' />
        </div>
        <Net64ServerArea />
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Net64View)
