import React from 'react';
import {
  connect
} from 'react-redux';
import {
  Route
} from 'react-router-dom'

import ChangeViewButton from '../buttons/ChangeViewButton'
import SaveView from './SaveView'
import AppView from '../../../client/components/views/AppView'

const SAVE_FOLDER_VIEW = 0
const SMMDB_VIEW = 1

class MainView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      currentView: SAVE_FOLDER_VIEW
    }
  }
  handleClick () {
    (async () => {
      switch (this.state.currentView) {
        case SAVE_FOLDER_VIEW:
          this.setState({
            currentView: SMMDB_VIEW
          })
          break
        case SMMDB_VIEW:
          this.setState({
            currentView: SAVE_FOLDER_VIEW
          })
      }
    })()
  }
  render () {
    const styles = {
      global: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      },
      content: {
        flex: '1 1 0%',
        height: '0'
      }
    }
    switch (this.state.currentView) {
      case SAVE_FOLDER_VIEW:
        return (
          <div style={styles.global}>
            <ChangeViewButton onClick={this.handleClick} view={this.state.currentView} />
            <div style={styles.content}>
              <SaveView />
            </div>
          </div>
        )
      case SMMDB_VIEW:
        return (
          <div style={styles.global}>
            <ChangeViewButton onClick={this.handleClick} view={this.state.currentView} />
            <div style={styles.content}>
              <Route path='/' component={AppView} />
            </div>
          </div>
        )
    }
  }
}
export default connect()(MainView)
