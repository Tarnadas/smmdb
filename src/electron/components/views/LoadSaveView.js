import React from 'react'
import {
  connect
} from 'react-redux'
import {
  remote
} from 'electron'
import {
  loadSave as loadCemuSave
} from 'cemu-smm'

import SMMButton from '../../../client/components/buttons/SMMButton'
import {
  LENGTH_API_KEY
} from '../areas/EnterAPIKeyArea'
import {
  addApiKey, deleteApiKey, addSave, loadSave, deleteSave
} from '../../actions'
import {
  setAccountData
} from '../../../client/actions'
import {
  initAccount
} from '../../renderer'

const dialog = remote && remote.dialog

class LoadSaveView extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      showApiKey: false
    }
    this.onAddSave = this.onAddSave.bind(this)
    this.onLoadSave = this.onLoadSave.bind(this)
    this.onDeleteSave = this.onDeleteSave.bind(this)
    this.showApiKey = this.showApiKey.bind(this)
    this.hideApiKey = this.hideApiKey.bind(this)
    this.addApiKey = this.addApiKey.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.getSaveName = this.getSaveName.bind(this)
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (nextProps.apiKey) {
      this.setState({
        apiKey: nextProps.apiKey
      })
    }
  }
  onAddSave () {
    dialog.showOpenDialog({properties: ['openDirectory']}, async cemuPaths => {
      if (cemuPaths) {
        const cemuPath = cemuPaths[0]
        try {
          const cemuSave = await loadCemuSave(cemuPath)
          this.setState({
            loading: true
          })
          cemuSave.reorderSync()
          await cemuSave.loadCourses()
          await cemuSave.exportThumbnail()
          await cemuSave.unlockAmiibos()
          this.props.dispatch(addSave(cemuPath, cemuSave))
        } catch (err) {
          console.log(err)
        }
      }
    })
  }
  onLoadSave () {
    (async (savePath, saveId) => {
      this.setState({
        loading: true
      })
      try {
        const cemuSave = await loadCemuSave(savePath)
        cemuSave.reorderSync()
        await cemuSave.loadCourses()
        await cemuSave.exportThumbnail()
        this.props.dispatch(loadSave(cemuSave, saveId))
      } catch (err) {
        console.log(err)
      }
    })(this.savePath, this.saveId)
  }
  onDeleteSave (saveId) {
    this.props.dispatch(deleteSave(saveId))
  }
  showApiKey () {
    this.setState({
      showApiKey: true
    })
  }
  hideApiKey () {
    this.setState({
      showApiKey: false
    })
  }
  async addApiKey () {
    if (this.state.apiKey.length !== LENGTH_API_KEY) return
    const account = await initAccount(this.state.apiKey)
    if (!account) return
    this.props.dispatch(setAccountData(account))
    this.props.dispatch(addApiKey(this.state.apiKey))
    this.setState({
      showApiKey: false
    })
  }
  deleteApiKey () {
    this.props.dispatch(deleteApiKey())
  }
  handleChange (e) {
    let value = e.target.value
    if (value.length > 30) {
      value = value.substr(0, 30)
    }
    this.setState({
      apiKey: value
    })
  }
  getSaveName () {
    const split = this.savePath.split('\\')
    return `Load ${split[split.length - 4]} ${split[split.length - 1]}`
  }
  listCemuSaves (cemuSaves) {
    const self = this
    return Array.from((function * () {
      for (let i = 0; i < cemuSaves.size; i++) {
        self.savePath = cemuSaves.getIn([i, 'path'])
        self.saveId = i
        yield (
          <SMMButton key={i} text={self.getSaveName()} iconSrc='/img/profile.png' fontSize='13px' padding='3px' onDelete={self.onDeleteSave} onClick={self.onLoadSave} saveId={i} />
        )
      }
    })())
  }
  render () {
    const apiKey = this.props.apiKey
    const cemuSaves = this.props.cemuSaveData
    const styles = {
      center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexDirection: 'column'
      },
      text: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateY(+150%) translateX(-50%)',
        width: '100%',
        color: '#323245',
        textAlign: 'center'
      },
      showApiKey: {
        width: 'auto',
        height: 'auto',
        marginBottom: '40px'
      },
      apiKey: {
        height: 'auto',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateY(-50%) translateX(-50%)',
        textAlign: 'center',
        zIndex: '100',
        width: '500px',
        backgroundColor: '#0d633d',
        border: '12px solid #42c074'
      },
      apiKeyExplanation: {
        width: '400px',
        height: 'auto',
        lineHeight: '20px',
        display: 'inline-block',
        color: '#fff',
        margin: '10px auto',
        padding: '0 10px'
      },
      apiKeyExplanationSmall: {
        width: '400px',
        height: 'auto',
        lineHeight: '11px',
        fontSize: '11px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        display: 'inline-block',
        color: '#fff',
        margin: '10px auto',
        padding: '0 10px'
      },
      apiKeyInput: {
        width: '400px',
        height: '30px',
        lineHeight: '30px',
        display: 'inline-block',
        margin: '10px auto',
        padding: '0 10px',
        color: '#323245'
      },
      cancel: {
        float: 'right',
        margin: '4px',
        width: '32px',
        height: '32px',
        boxSizing: 'border-box',
        borderRadius: '3px',
        backgroundColor: '#45b46a',
        cursor: 'pointer'
      },
      cancelImg: {
        width: '24px',
        height: '24px',
        margin: '4px'
      }
    }
    return (
      <div>
        {
          <div>
            <div style={styles.center}>
              {
                <div style={styles.showApiKey}>
                  <SMMButton text={`${apiKey ? 'Change' : 'Add'} API Key`} iconSrc='/img/api.png' fontSize='13px' padding='3px' onClick={this.showApiKey} />
                </div>
              }
              {
                cemuSaves.size > 0 && (
                this.listCemuSaves(cemuSaves)
              )}
              <SMMButton text={cemuSaves.size === 0 ? 'Please select your Cemu SMM folder' : 'Load another Cemu SMM folder'} iconSrc='/img/profile.png' fontSize='13px' padding='3px' onClick={this.onAddSave} />
            </div>
            {
              cemuSaves.size === 0 && (
              <div style={styles.text}>
                Your SMM save folder is located at<br />'path\to\cemu\mlc01\emulatorSave\#saveID#'
              </div>
            )}
          </div>
        }
        {
          this.state.loading &&
          <img style={styles.center} src={'/img/load.gif'} />
        }
        {
          this.state.showApiKey &&
          <div style={styles.apiKey}>
            <div style={styles.cancel} onClick={this.hideApiKey}>
              <img style={styles.cancelImg} src='/img/cancel.svg' />
            </div>
            <div style={styles.apiKeyExplanation}>
              Go to <a href='http://smmdb.ddns.net' target='_blank'>SMMDB</a> > Login > Profile > Show API Key
            </div>
            <div style={styles.apiKeyExplanationSmall}>
              (With an API Key, you will be able to upload courses, star courses, flag courses as completed)
            </div>
            <input style={styles.apiKeyInput} type='text' value={!this.state.apiKey ? '' : this.state.apiKey} onChange={this.handleChange} />
            {
              apiKey &&
              <SMMButton text='Unlink account' iconSrc='/img/delete.png' fontSize='13px' padding='3px' onClick={this.deleteApiKey} />
            }
            <SMMButton text='Add API Key' iconSrc='/img/api.png' fontSize='13px' padding='3px' onClick={this.addApiKey} />
          </div>
        }
      </div>
    )
  }
}
export default connect((state) => ({
  cemuSaveData: state.getIn(['electron', 'appSaveData', 'cemuSaveData']),
  apiKey: state.getIn(['electron', 'appSaveData', 'apiKey']),
  saveFileEditor: state.getIn(['electron', 'saveFileEditor'])
}))(LoadSaveView)
