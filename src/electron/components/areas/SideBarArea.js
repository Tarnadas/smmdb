import React from 'react'
import { connect } from 'react-redux'

import ChangeViewButton from '../buttons/ChangeViewButton'
import SMMButton from '../../../client/components/buttons/SMMButton'
import { unloadSave } from '../../actions/index'

class SideBarArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.onChangeFolder = this.onChangeFolder.bind(this)
  }
  onChangeFolder () {
    this.props.dispatch(unloadSave())
  }
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
        <SMMButton
          text='Change save folder'
          iconSrc='/img/profile.png'
          fontSize='13px'
          padding='3px'
          onClick={this.onChangeFolder}
        />
        { this.props.children }
      </div>
    )
  }
}
export default connect()(SideBarArea)
