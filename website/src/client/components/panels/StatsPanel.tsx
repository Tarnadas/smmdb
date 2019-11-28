import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { resolve } from 'url'

import { setStats } from '../../actions'

class Panel extends React.PureComponent<any, any> {
  // eslint-disable-next-line
  public async UNSAFE_componentWillMount(): Promise<void> {
    if (process.env.IS_SERVER) return
    try {
      const response = await fetch(
        resolve(process.env.DOMAIN || '', `/api/getstats`)
      )
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
        textAlign: 'left',
        color: 'rgb(255, 229, 0)',
        margin: '16px 0 5px 20px',
        display: 'flex',
        alignItems: 'center'
      }
    }
    const StyledTable = styled.table`
      td,
      th {
        padding: 0.2rem;
      }
    `
    return (
      <div style={styles.panel}>
        <span style={{ marginRight: '0.5rem' }}>Stats:</span>
        <StyledTable>
          <thead>
            <tr>
              <th>SMM1</th>
              <th>SMM2</th>
              <th>SM64M</th>
              <th>Accounts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{stats.courses}</td>
              <td>{stats.courses2}</td>
              <td>{stats.courses64}</td>
              <td>{stats.accounts}</td>
            </tr>
          </tbody>
        </StyledTable>
      </div>
    )
  }
}
export const StatsPanel = connect(
  (state: any): any => ({
    stats: state.get('stats')
  })
)(Panel) as any
