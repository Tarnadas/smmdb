import React from 'react'

import ChangeViewButton from '../buttons/ChangeViewButton'

export default class SideBarArea extends React.PureComponent {
  render () {
    const styles = {
      area: {
        width: 'auto',
        maxWidth: '228px',
        boxShadow: 'inset -3px 0px 4px -2px rgba(0,0,0,0.75)',
        display: 'flex',
        flexDirection: 'column'
      }
    }
    return (
      <div style={styles.area}>
        <ChangeViewButton onClick={this.props.onClick} view={this.props.view} />
        { this.props.children }
      </div>
    )
  }
}
