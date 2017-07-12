import React from 'react'

const MAX_LENGTH_API_KEY = 20

export default class EnterAPIKeyArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      apiKey: ''
    }
    this.onAPIKeyChange = this.onAPIKeyChange.bind(this)
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
      </div>
    )
  }
}
