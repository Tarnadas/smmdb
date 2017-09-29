import React from 'react'
import {
  connect
} from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import Net64ServerPanel from '../panels/Net64ServerPanel'
import SMMButton from '../buttons/SMMButton'
import {
  ScreenSize
} from '../../reducers/mediaQuery'
import {
  domain
} from '../../../static'

class Net64View extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      servers: []
    }
    this.updateServers = this.updateServers.bind(this)
    this.renderServers = this.renderServers.bind(this)
  }
  componentWillMount () {
    if (!this.props.isServer) this.updateServers()
  }
  componentWillUnmount () {
    this.unmount = true
  }
  async updateServers () {
    if (this.unmount) return
    try {
      const servers = (await got(resolve(domain, `/api/getnet64servers`), {
        json: true,
        useElectronNet: false
      })).body
      this.setState({
        servers
      })
    } catch (err) {}
    setTimeout(this.updateServers, 10000)
  }
  renderServers (servers) {
    return Array.from((function * () {
      for (const server of servers) {
        yield (
          <Net64ServerPanel key={server._id} server={server} />
        )
      }
    })())
  }
  render () {
    const screenSize = this.props.screenSize
    const servers = this.state.servers
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
          <SMMButton link='https://github.com/Tarnadas/sm64o/releases/download/0.4/Net64.7z' blank text='Get the Client' iconSrc='/img/net64.png' iconColor='bright' />
          <SMMButton link='https://github.com/Tarnadas/sm64o' blank text='Client Source' iconSrc='/img/github.svg' iconColor='bright' />
          <SMMButton link='https://github.com/Tarnadas/sm64o-ded' blank text='Get the Server' iconSrc='/img/github.svg' iconColor='bright' />
          <SMMButton link='https://sm64o.com/' blank text='Net64 Forum' iconSrc='/img/sm64o.png' iconColor='bright' noText />
          <SMMButton link='https://discord.gg/k9QMFaB' blank text='Net64 Discord' iconSrc='/img/discord.svg' iconColor='bright' />
        </div>
        <div id='scroll' style={styles.list}>
          {
            this.renderServers(servers)
          }
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Net64View)
