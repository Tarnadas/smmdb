import React from 'react'

import FilterButton from '../buttons/FilterButton'
// import RefreshButton from '../buttons/RefreshButton'

export default class SideBarArea extends React.PureComponent {
  render () {
    const styles = {
      sideBar: {
        width: '100px',
        height: 'auto',
        overflow: 'hidden',
        position: 'absolute',
        top: '200px',
        left: '20px',
        color: '#6dd3bd',
        boxShadow: '0px 0px 4px 12px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px'
      },
      element: {
        overflow: 'hidden',
        height: 'auto',
        margin: '10px',
        width: '80px'
      }
    }
    return (
      <div style={styles.sideBar}>
        <div style={styles.element}>
          <FilterButton />
        </div>
      </div>
    )
  }
}