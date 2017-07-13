import React from 'react'
import {
  connect
} from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import SMMButton from '../buttons/SMMButton'
import {
  setAccountData
} from '../../actions'
import {
  domain
} from '../../../static'

const MAX_LENGTH_API_KEY = 20

class EnterAPIKeyArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      apiKey: ''
    }
    this.onAPIKeySubmit = this.onAPIKeySubmit.bind(this)
    this.onAPIKeyChange = this.onAPIKeyChange.bind(this)
  }
  async onAPIKeySubmit () {
    try {
      const account = (await got(resolve(domain, '/api/getaccountdata'), {
        headers: {
          'Authorization': `APIKEY ${this.props.apiKey}`
        },
        json: true,
        useElectronNet: false
      })).body
      this.props.dispatch(setAccountData(account))
    } catch (err) {
      console.error(err.response.body)
    }
  }
  onAPIKeyChange (e) {
    let apiKey = e.target.value
    if (apiKey.length > MAX_LENGTH_API_KEY) {
      apiKey = apiKey.substr(0, MAX_LENGTH_API_KEY)
    }
    this.setState({
      apiKey
    })
  }
  render () {
    const styles = {
      option: {
        height: 'auto',
        padding: '10px'
      },
      value: {
        height: '32px',
        lineHeight: '32px'
      },
      input: {
        height: '32px',
        fontSize: '18px'
      }
    }
    return (
      <div>
        <div style={styles.option}>
          <div style={styles.value}>
            Please enter your API key:
          </div>
          <input style={styles.input} value={this.state.apiKey} onChange={this.onAPIKeyChange} />
        </div>
        <SMMButton text='Submit' iconSrc='/img/api.png' fontSize='13px' padding='3px' onClick={this.onAPIKeySubmit} />
      </div>
    )
  }
}
export default connect(state => ({
  apiKey: state.getIn(['electron', 'appSaveData', 'apiKey'])
}))(EnterAPIKeyArea)
