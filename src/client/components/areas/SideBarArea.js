import React from 'react'

import OrderButton from '../buttons/OrderButton'
import FilterButton from '../buttons/FilterButton'

export default class SideBarArea extends React.PureComponent {
  render () {
    const styles = {
      sideBar: {
        display: 'flex',
        width: '100px',
        height: 'auto',
        margin: '0 30px',
        color: '#6dd3bd',
        boxShadow: '0px 0px 4px 12px rgba(0,0,0,0.1)',
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
          <OrderButton />
          {
            !this.props.is64 &&
            <FilterButton />
          }
        </div>
      </div>
    )
  }
}