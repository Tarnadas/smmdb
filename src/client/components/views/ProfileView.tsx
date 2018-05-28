import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'

import { resolve } from 'url'

import { SMMButton, COLOR_SCHEME } from '../buttons/SMMButton'
import { ScreenSize } from '../../reducers/mediaQuery'
import { setAccountData } from '../../actions'
import { DOWNLOAD_FORMAT } from '../../reducers/userData'

const EnterAPIKeyArea = process.env.ELECTRON && require('../../../electron/components/areas/EnterAPIKeyArea').default

const USERNAME = /^[a-z0-9A-Z|.]+$/
const MIN_LENGTH_USERNAME = 3
const MAX_LENGTH_USERNAME = 20

class ProfileView extends React.PureComponent<any, any> {
  public onDownloadFormatChange: any

  constructor (props: any) {
    super(props)
    const accountData = props.accountData.toJS()
    this.state = {
      username: accountData.username ? accountData.username : '',
      downloadFormat: accountData.downloadformat ? accountData.downloadformat : DOWNLOAD_FORMAT.WII_U,
      changed: false,
      saved: false,
      showAPIKey: false
    }
    this.onProfileSubmit = this.onProfileSubmit.bind(this)
    this.onUsernameChange = this.onUsernameChange.bind(this)
    this.onDownloadFormatChange = this.onSelectChange.bind(this, 'downloadFormat')
    this.onAPIKeyShow = this.onAPIKeyShow.bind(this)
  }
  componentWillReceiveProps (nextProps: any) {
    if (nextProps.accountData === this.props.accountData) return
    const nextAccountData = nextProps.accountData.toJS()
    const accountData = this.props.accountData.toJS()
    const username = nextAccountData.username
    if (username !== accountData.username) {
      this.setState({
        username
      })
    }
    const downloadFormat = nextAccountData.downloadformat
    if (downloadFormat !== accountData.downloadformat) {
      this.setState({
        downloadFormat
      })
    }
    if (accountData.id === nextProps.accountData.toJS().id) {
      this.setState({
        saved: true
      })
    }
  }
  onProfileSubmit () {
    (async () => {
      if (!this.state.changed) return
      if (this.state.username < MIN_LENGTH_USERNAME || this.state.username > MAX_LENGTH_USERNAME) {
        console.log('Username must have between 3 and 20 characters') // TODO
        return
      }
      if (!USERNAME.test(this.state.username)) {
        console.log('Username contains invalid characters') // TODO
        return
      }
      const profile = {
        username: this.state.username,
        downloadformat: this.state.downloadFormat
      }
      try {
        const response = await fetch(resolve(process.env.DOMAIN!, '/api/setaccountdata'), {
          headers: {
            'Authorization': `APIKEY ${this.props.accountData.get('apikey')}`,
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify(profile)
        })
        if (!response.ok) throw new Error(response.statusText)
        const accountData = await response.json()
        this.props.dispatch(setAccountData(accountData))
        this.setState({
          changed: false,
          saved: true
        })
      } catch (err) {
        console.error(err)
      }
    })()
  }
  onUsernameChange (e: any) {
    let username = e.target.value
    if (username.length > MAX_LENGTH_USERNAME) {
      username = username.substr(0, MAX_LENGTH_USERNAME)
    }
    this.setState({
      username,
      changed: true,
      saved: false
    })
  }
  onSelectChange (value: any, e: any) {
    const val = e.target.value
    const res: any = {
      changed: true,
      saved: false
    }
    res[value] = val
    this.setState(res)
  }
  onAPIKeyShow () {
    this.setState((prevState: any) => ({
      showAPIKey: !prevState.showAPIKey
    }))
  }
  render () {
    const screenSize = this.props.screenSize
    const accountData = this.props.accountData.toJS()
    const apiKey = accountData && this.state.showAPIKey ? accountData.apikey : ''
    const colorScheme = this.state.changed ? COLOR_SCHEME.RED : (this.state.saved ? COLOR_SCHEME.GREEN : COLOR_SCHEME.YELLOW)
    const styles: any = {
      main: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      },
      profile: {
        width: screenSize >= ScreenSize.MEDIUM ? 'calc(100% - 260px)' : '100%',
        maxWidth: '926px',
        height: screenSize >= ScreenSize.MEDIUM ? 'calc(100% - 40px)' : 'auto',
        overflow: 'hidden',
        zIndex: '10',
        marginTop: '40px',
        color: '#fff'
      },
      flex: {
        overflow: 'hidden',
        display: screenSize >= ScreenSize.MEDIUM ? 'flex' : 'block',
        flexDirection: screenSize >= ScreenSize.MEDIUM ? 'column' : '',
        alignItems: screenSize >= ScreenSize.MEDIUM ? (accountData.id ? 'left' : 'center') : ''
      },
      option: {
        width: '100%',
        padding: '10px'
      },
      value: {
        width: '100%',
        height: '32px',
        lineHeight: '32px'
      },
      input: {
        width: '100%',
        height: '32px',
        fontSize: '18px'
      },
      select: {
        width: '100%',
        height: '32px',
        fontSize: '18px'
      }
    }
    return (
      <div style={styles.main}>
        <Helmet>
          <title>SMMDB - Profile</title>
        </Helmet>
        <div style={styles.profile}>
          {
            accountData.id ? (
              <div style={styles.flex}>
                <div style={styles.option}>
                  <div style={styles.value}>
                    Username:
                  </div>
                  <input style={styles.input} value={this.state.username} onChange={this.onUsernameChange} />
                </div>
                {
                  !process.env.ELECTRON && (
                  <div style={styles.option}>
                    <div style={styles.value}>
                      Preferred download format:
                    </div>
                    <select style={styles.select} value={this.state.downloadFormat} onChange={this.onDownloadFormatChange}>
                      <option value={DOWNLOAD_FORMAT.WII_U}>Wii U</option>
                      <option value={DOWNLOAD_FORMAT.N3DS}>3DS</option>
                      <option value={DOWNLOAD_FORMAT.PROTOBUF}>Protocol Buffer</option>
                    </select>
                  </div>
                )}
                <SMMButton
                  text='Save'
                  iconSrc='/img/profile.png'
                  fontSize='13px'
                  padding='3px'
                  colorScheme={colorScheme}
                  onClick={this.onProfileSubmit}
                />
                {
                  !process.env.ELECTRON &&
                  <div style={{ height: 'auto' }}>
                    <div style={{ height: '30px' }} />
                    <div style={styles.option}>
                      <input style={styles.input} value={apiKey} readOnly />
                    </div>
                    <SMMButton
                      text={apiKey ? 'Hide API Key' : 'Show API Key'}
                      iconSrc='/img/api.png'
                      fontSize='13px'
                      padding='3px'
                      onClick={this.onAPIKeyShow}
                    />
                  </div>
                }
              </div>
            ) : (
              process.env.ELECTRON
                ? <EnterAPIKeyArea />
                : <div style={styles.flex}>You are not logged in</div>
            )
          }
        </div>
      </div>
    )
  }
}
export default connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize']),
  accountData: state.getIn(['userData', 'accountData'])
}))(ProfileView)
