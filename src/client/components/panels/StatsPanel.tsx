import * as React from 'react'
import { connect } from 'react-redux'

import { resolve } from 'url'

import { setStats } from '../../actions'

class Panel extends React.PureComponent<any, any> {
  // eslint-disable-next-line
  public async UNSAFE_componentWillMount (): Promise<void> {
    if (process.env.IS_SERVER) return
    try {
      const response = await fetch(resolve(process.env.DOMAIN || '', `/api/getstats`))
      if (!response.ok) throw new Error(response.statusText)
      const stats = await response.json()
      this.props.dispatch(setStats(stats))
    } catch (err) {
      console.error(err)
    }
  }

  public render (): JSX.Element | null {
    const stats = this.props.stats.toJS()
    if (!stats) return null
    const styles: any = {
      panel: {
        width: '100%',
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
export const StatsPanel = connect((state: any): any => ({
  stats: state.get('stats')
}))(Panel) as any
