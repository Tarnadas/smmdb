import React from 'react'
import {
  connect
} from 'react-redux'
import {
  Route
} from 'react-router-dom'

import LoadSaveView from './LoadSaveView'
import AppView from '../../../client/components/views/AppView'

class ElectronView extends React.PureComponent {
  render () {
    return (
      this.props.cemuSave ? (
        <div>
          <Route path='/' component={AppView} />
        </div>
      ) : (
        <div>
          <LoadSaveView />
        </div>
      )
    )
  }
}
export default connect(state => ({
  cemuSave: state.getIn(['electron', 'cemuSave'])
}))(ElectronView)
