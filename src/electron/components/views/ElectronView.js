import React from 'react'
import {
  connect
} from 'react-redux'

import LoadSaveView from './LoadSaveView'
import AppView from '../../../client/components/views/AppView'

class ElectronView extends React.PureComponent {
  render () {
    return (
      this.props.cemuSave ? (
        <div>
          <AppView editor={this.props.editor} />
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
