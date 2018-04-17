import * as React from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'

import { LoadSaveView } from './LoadSaveView'
import { MainView } from './MainView'

class View extends React.PureComponent<any, any> {
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
export const ElectronView = connect((state: any) => ({
  cemuSave: state.getIn(['electron', 'cemuSave'])
}))(View)
