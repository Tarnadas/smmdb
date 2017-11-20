import React from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'

import LoadSaveView from './LoadSaveView'
import MainView from './MainView'

class ElectronView extends React.PureComponent {
  render () {
    return (
      this.props.cemuSave ? (
        <Route path='/' component={MainView} />
      ) : (
        <LoadSaveView />
      )
    )
  }
}
export default connect(state => ({
  cemuSave: state.getIn(['electron', 'cemuSave'])
}))(ElectronView)
