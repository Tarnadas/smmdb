import React from 'react'
import GoogleLogin from 'react-google-login'
import {
  connect
} from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import ButtonSub from '../subs/ButtonSub'
import {
  setAccountData
} from '../../actions'
import {
  domain
} from '../../../static'

class LoginButton extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hover: false
    }
    this.mouseEnter = this.mouseEnter.bind(this)
    this.mouseLeave = this.mouseLeave.bind(this)
    this.onGoogleLoginSuccess = this.onGoogleLoginSuccess.bind(this)
    this.onGoogleLoginFailure = this.onGoogleLoginFailure.bind(this)
    this.onLogOut = this.onLogOut.bind(this)
  }
  componentDidMount () {
    (async () => {
      try {
        const res = (await got(resolve(domain, '/signin'), {
          method: 'POST',
          json: true,
          useElectronNet: false
        })).body
        setTimeout(() => { // TODO this is just a workaround to prevent a warning
          this.props.dispatch(setAccountData(res))
        }, 1000)
      } catch (err) {
        console.error(err.response.body)
      }
    })()
  }
  mouseEnter () {
    this.setState({
      hover: true
    })
  }
  mouseLeave () {
    this.setState({
      hover: false
    })
  }
  async onGoogleLoginSuccess (response) {
    try {
      const res = (await got(resolve(domain, '/tokensignin'), {
        method: 'POST',
        body: Object.assign({}, response),
        json: true
      })).body
      this.props.dispatch(setAccountData(res))
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      }
    }
  }
  onGoogleLoginFailure (response) {
    console.log(response)
  }
  async onLogOut () {
    try {
      await got(resolve(domain, '/signout'), {
        method: 'POST'
      })
      this.props.dispatch(setAccountData())
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      }
    }
  }
  render () {
    const accountData = this.props.accountData.toJS()
    const loggedIn = !!accountData.id
    const styles = {
      smmButton: {
        margin: '0 10px 10px 10px',
        lineHeight: '40px',
        width: '120px',
        height: '40px',
        backgroundColor: this.state.hover ? '#323245' : '#ffe500',
        cursor: 'pointer',
        outline: 'none',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        border: '0',
        borderRadius: '5px',
        boxShadow: '1px 4px 13px 0 rgba(0,0,0,0.5)',
        padding: '0',
        textAlign: 'left',
        fontFamily: 'SuperMarioMakerExtended,SuperMarioMaker,Roboto,arial,sans-serif'
      },
      smmIcon: {
        margin: '4px',
        width: '32px',
        height: '32px',
        float: 'left',
        borderRadius: '4px'
      }
    }
    let iconSrc, text
    if (loggedIn) {
      iconSrc = '/img/logout.png'
      text = 'Sign out'
    } else {
      iconSrc = 'https://developers.google.com/identity/sign-in/g-normal.png'
      text = 'Sign in'
    }
    return (
      <div style={{float: 'right'}} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        {
          loggedIn ? (
            <div style={styles.smmButton} onClick={this.onLogOut}>
              <ButtonSub iconStyle={styles.smmIcon} iconSrc={iconSrc} text={text} hover={this.state.hover} />
            </div>
          ) : (
            <GoogleLogin
              clientId='899493559187-bnvgqj1i8cnph7ilkl4h261836skee25.apps.googleusercontent.com'
              style={styles.smmButton}
              onSuccess={this.onGoogleLoginSuccess}
              onFailure={this.onGoogleLoginFailure}
            >
              <ButtonSub iconStyle={styles.smmIcon} iconSrc={iconSrc} text={text} hover={this.state.hover} />
            </GoogleLogin>
          )
        }
      </div>
    )
  }
}
export default connect(state => ({
  accountData: state.getIn(['userData', 'accountData'])
}))(LoginButton)
