import React from 'react'
import {
  connect
} from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import {
  setStats
} from '../../actions'
import {
  domain
} from '../../../static'

class StatsPanel extends React.PureComponent {
  componentWillMount () {
    (async () => {
      try {
        const stats = (await got(resolve(domain, `/api/getstats`), {
          json: true,
          useElectronNet: false
        })).body
        this.props.dispatch(setStats(stats))
      } catch (err) {
        if (!err.response) {
          console.error(err.response.body)
        }
      }
    })()
  }
  render () {
    const stats = this.props.stats.toJS()
    if (!stats) return null
    const styles = {
      panel: {
        height: 'auto',
        textAlign: 'left',
        color: 'rgb(255, 229, 0)',
        margin: '16px 0 5px 20px'
      }
    }
    return (
      <div style={styles.panel}>
        There are {this.props.is64 ? stats.courses64 : stats.courses} uploaded courses and {stats.accounts} registered accounts
      </div>
    )
  }
}
export default connect(state => ({
  stats: state.get('stats')
}))(StatsPanel)
