import * as React from 'react'
import { connect } from 'react-redux'

import { SMMButton } from '../../../client/components/buttons/SMMButton'
import { addApiKey } from '../../actions'
import { setAccountData } from '../../../client/actions'
import { initAccount } from '../../../shared/Account'

export const LENGTH_API_KEY = 30

class Area extends React.PureComponent<any, any> {
  constructor (props: any) {
    super(props)
    this.state = {
      apiKey: ''
    }
    this.onAPIKeySubmit = this.onAPIKeySubmit.bind(this)
    this.onAPIKeyChange = this.onAPIKeyChange.bind(this)
  }
  async onAPIKeySubmit () {
    if (this.state.apiKey.length !== LENGTH_API_KEY) return
    const account = await initAccount(this.state.apiKey)
    if (!account) return
    this.props.dispatch(setAccountData(account))
    this.props.dispatch(addApiKey(this.state.apiKey))
  }
  onAPIKeyChange (e: any) {
    let apiKey = e.target.value
    if (apiKey.length > LENGTH_API_KEY) {
      apiKey = apiKey.substr(0, LENGTH_API_KEY)
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
      <div style={{
        height: '100%',
        alignItems: 'center',
        display: 'flex'
      }}>
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
export const EnterAPIKeyArea = connect((state: any) => ({
  apiKey: state.getIn(['electron', 'appSaveData', 'apiKey'])
}))(Area)
