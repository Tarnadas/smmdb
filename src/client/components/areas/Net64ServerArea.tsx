import * as React from 'react'
import { connect } from 'react-redux'

import { resolve } from 'url'

import { Net64ServerPanel } from '../panels/Net64ServerPanel'
import { ScreenSize } from '../../reducers/mediaQuery'

class Area extends React.PureComponent<any, any> {
  private unmount: any

  constructor (props: any) {
    super(props)
    this.state = {
      servers: []
    }
    this.updateServers = this.updateServers.bind(this)
    this.renderServers = this.renderServers.bind(this)
  }
  componentWillMount () {
    if (process.env.IS_SERVER) return
    this.updateServers()
  }
  componentWillUnmount () {
    this.unmount = true
  }
  async updateServers () {
    if (this.unmount) return
    try {
      const response = await fetch(resolve(process.env.DOMAIN!, `/api/getnet64servers`))
      if (!response.ok) throw new Error(response.statusText)
      const servers = await response.json()
      if (this.unmount) return
      this.setState({
        servers
      })
    } catch (err) {
      console.error(err)
    }
    setTimeout(this.updateServers, 10000)
  }
  renderServers (servers: any) {
    return Array.from((function * () {
      for (const server of servers) {
        yield (
          <Net64ServerPanel key={server.id} server={server} />
        )
      }
    })())
  }
  render () {
    const screenSize = this.props.screenSize
    const isNet64 = this.props.isNet64
    const servers = this.state.servers
    const styles: React.CSSProperties = {
      list: {
        margin: isNet64 ? '0' : '20px',
        overflowY: 'auto',
        padding: '4px',
        display: 'flex',
        flexDirection: 'column',
        width: screenSize < ScreenSize.MEDIUM || isNet64 ? '100%' : 'calc(100% - 120px)'
      }
    }
    return (
      <div id='scroll' style={styles.list}>
        {
          this.renderServers(servers)
        }
      </div>
    )
  }
}
export const Net64ServerArea = connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Area)
