import React from 'react'
import GoogleLogin from 'react-google-login'
import { connect } from 'react-redux'
import got from 'got'

import { resolve } from 'url'

import ButtonSub from '../subs/ButtonSub'
import { setAccountData, setCourse, setCourse64 } from '../../actions'

class LoginButton extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      hover: false
    }
    this.updateCourseStars = this.updateCourseStars.bind(this)
    this.mouseEnter = this.mouseEnter.bind(this)
    this.mouseLeave = this.mouseLeave.bind(this)
    this.onGoogleLoginSuccess = this.onGoogleLoginSuccess.bind(this)
    this.onGoogleLoginFailure = this.onGoogleLoginFailure.bind(this)
    this.onLogOut = this.onLogOut.bind(this)
  }
  componentDidMount () {
    (async () => {
      try {
        const res = (await got(resolve(process.env.DOMAIN, '/signin'), {
          method: 'POST',
          json: true,
          useElectronNet: false
        })).body
        this.props.dispatch(setAccountData(res))
        this.updateCourseStars(this.props, res)
      } catch (err) {
        if (err.response) {
          console.error(err.response.body)
        } else {
          console.error(err)
        }
      }
    })()
  }
  componentWillReceiveProps (nextProps, nextContext) {
    if (this.props.accountData !== nextProps.accountData) {
      this.setState({
        hover: false
      })
    }
  }
  updateCourseStars (props, account) {
    const main = {}
    let i = 0
    props.courseData.get('main').forEach(course => {
      main[course.get('id')] = i++
    })
    const main64 = {}
    i = 0
    props.courseData.get('main64').forEach(course => {
      main64[course.get('id')] = i++
    })
    for (let i in account.stars) {
      if (account.stars[i] in main) {
        const courseId = main[account.stars[i]]
        this.props.dispatch(setCourse(courseId, this.props.courseData.getIn(['main', courseId]).set('starred', true)))
      }
    }
    for (let i in account.stars64) {
      if (account.stars64[i] in main64) {
        const courseId = main64[account.stars64[i]]
        this.props.dispatch(setCourse64(courseId, this.props.courseData.getIn(['main64', courseId]).set('starred', true)))
      }
    }
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
      const res = (await got(resolve(process.env.DOMAIN, '/tokensignin'), {
        method: 'POST',
        body: Object.assign({}, response),
        json: true
      })).body
      this.props.dispatch(setAccountData(res))
      this.updateCourseStars(this.props, res)
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
      await got(resolve(process.env.DOMAIN, '/signout'), {
        method: 'POST'
      })
      const account = this.props.accountData.toJS()
      let i = 0
      for (let course of this.props.courseData.get('main')) {
        const courseId = course.get('id')
        if (account.stars.includes(courseId)) {
          this.props.dispatch(setCourse(i, this.props.courseData.getIn(['main', i]).set('starred', false)))
        }
        i++
      }
      i = 0
      for (let course of this.props.courseData.get('main64')) {
        const courseId = course.get('id')
        if (account.stars64.includes(courseId)) {
          this.props.dispatch(setCourse64(i, this.props.courseData.getIn(['main64', i]).set('starred', false)))
        }
        i++
      }
      this.props.dispatch(setAccountData())
    } catch (err) {
      if (err.response) {
        console.error(err.response.body)
      } else {
        console.error(err)
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
        width: 'auto',
        height: '40px',
        minHeight: '40px',
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
      google: {
        lineHeight: '40px',
        width: 'auto',
        height: '40px',
        backgroundColor: this.state.hover ? '#323245' : '#ffe500',
        cursor: 'pointer',
        padding: '0',
        textAlign: 'left',
        border: '0',
        borderRadius: '5px',
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
      text = 'Sign in with Google'
    }
    return (
      <div
        style={styles.smmButton}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        onClick={this.props.onClick && this.props.onClick}
      >
        {
          loggedIn ? (
            <div onClick={this.onLogOut}>
              <ButtonSub iconStyle={styles.smmIcon} iconSrc={iconSrc} text={text} hover={this.state.hover} />
            </div>
          ) : (
            <GoogleLogin
              style={styles.google}
              clientId='899493559187-bnvgqj1i8cnph7ilkl4h261836skee25.apps.googleusercontent.com'
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
  accountData: state.getIn(['userData', 'accountData']),
  courseData: state.get('courseData')
}))(LoginButton)
