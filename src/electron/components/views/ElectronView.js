import React from 'react'
import {
  connect
} from 'react-redux'

import LoadSaveView from './LoadSaveView'
import MainView from '../../../client/components/views/MainView'

class ElectronView extends React.PureComponent {
  render () {
    return (
      this.props.cemuSave ? (
        <div>
          <MainView editor={this.props.editor} />
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
