import * as React from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'
import { push } from 'react-router-redux'
import { List } from 'immutable'

import { SideBarArea } from '../areas/SideBarArea'
import { SaveView } from './SaveView'
import { AppView } from '../../../client/components/views/AppView'
import { SMMButton } from '../../../client/components/buttons/SMMButton'
import { deleteSelected, setSelected, fillSave, fillSaveRandom } from '../../actions'

const SAVE_FOLDER_VIEW = 0
const SMMDB_VIEW = 1

class View extends React.PureComponent<any, any> {
  constructor (props: any) {
    super(props)
    this.onUnselect = this.onUnselect.bind(this)
    this.onDeleteAll = this.onDeleteAll.bind(this)
    this.onFillSave = this.onFillSave.bind(this)
    this.onFillSaveRandom = this.onFillSaveRandom.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.state = {
      currentView: SAVE_FOLDER_VIEW
    }
  }
  onUnselect () {
    this.props.dispatch(setSelected(List()))
  }
  onDeleteAll () {
    this.props.dispatch(deleteSelected(this.props.selected))
    this.props.dispatch(setSelected(List()))
  }
  onFillSave () {
    this.props.dispatch(fillSave())
  }
  onFillSaveRandom () {
    this.props.dispatch(fillSaveRandom())
  }
  handleClick () {
    (async () => {
      switch (this.state.currentView) {
        case SAVE_FOLDER_VIEW:
          this.setState({
            currentView: SMMDB_VIEW
          })
          this.props.dispatch(push('/courses'))
          break
        case SMMDB_VIEW:
          this.setState({
            currentView: SAVE_FOLDER_VIEW
          })
      }
    })()
  }
  render () {
    const selected = this.props.selected.toJS()
    const fillProgress = this.props.fillProgress.toJS()
    const isFilling = fillProgress.length === 2 && fillProgress[0] < fillProgress[1]
    let selectedSize = 0
    for (let i in selected) {
      if (selected[i]) selectedSize++
    }
    const styles: any = {
      global: {
        display: 'flex',
        userSelect: 'none',
        height: '100%'
      },
      content: {
        flex: '1 1 0%'
      },
      info: {
        margin: '20px 0',
        padding: '20px'
      },
      overflow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: '0',
        left: '0',
        zIndex: '1000',
        background: 'rgba(0,0,0,0.4)'
      },
      progressTitle: {
        margin: '20px',
        fontSize: '24px',
        color: '#fff',
        textShadow: '4px 4px 2px rgba(150, 150, 150, 1)'
      },
      progressBar: {
        width: '500px',
        height: '60px',
        background: isFilling ? `linear-gradient(90deg, #CC0008 ${100 * fillProgress[0] / fillProgress[1]}%, #000 ${100 * fillProgress[0] / fillProgress[1]}%)` : ''
      }
    }
    switch (this.state.currentView) {
      case SAVE_FOLDER_VIEW:
        return (
          <div style={styles.global}>
            <SideBarArea onClick={this.handleClick} view={this.state.currentView}>
              <div style={styles.info}>
                Hold Ctrl or Shift for multi-select
              </div>
              {
                selectedSize > 0 &&
                <SMMButton text={`Unselect ${selectedSize} courses`} iconSrc='/img/hand.png' onClick={this.onUnselect} />
              }
              {
                selectedSize > 0 &&
                <SMMButton text={`Delete ${selectedSize} courses`} iconSrc='/img/delete.png' padding='4px' onClick={this.onDeleteAll} />
              }
            </SideBarArea>
            <div style={styles.content}>
              <SaveView />
            </div>
          </div>
        )
      case SMMDB_VIEW:
        return (
          <div style={styles.global}>
            {
              isFilling &&
              <div style={styles.overflow}>
                <div style={styles.progressTitle}>Adding courses to save</div>
                <div style={styles.progressBar} />
              </div>
            }
            <SideBarArea onClick={this.handleClick} view={this.state.currentView}>
              <div style={styles.info}>
                You can set filters before filling your save
              </div>
              <SMMButton text='Fill save' iconSrc='/img/coursebot.png' padding='4px' onClick={this.onFillSave} />
              <SMMButton text='Fill save randomly' iconSrc='/img/coursebot.png' padding='4px' onClick={this.onFillSaveRandom} />
            </SideBarArea>
            <div style={styles.content}>
              <Route path='/' component={AppView} />
            </div>
          </div>
        )
    }
  }
}
export const MainView = connect((state: any) => ({
  selected: state.getIn(['electron', 'selected']),
  fillProgress: state.getIn(['electron', 'fillProgress'])
}))(View)
