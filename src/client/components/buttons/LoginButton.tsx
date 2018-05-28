import * as React from 'react'
import { GoogleLogin } from 'react-google-login'
import { connect } from 'react-redux'

import { resolve } from 'url'

import ButtonSub from '../subs/ButtonSub'
import { setAccountData, setCourse, setCourse64 } from '../../actions'

class Button extends React.PureComponent<any, any> {
  constructor (props: any) {
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
  async componentDidMount () {
    try {
      const response = await fetch(resolve(process.env.DOMAIN!, '/signin'), {
        method: 'POST',
        credentials: 'include'
      })
      if (!response.ok) throw new Error(response.statusText)
      const accountData = await response.json()
      this.props.dispatch(setAccountData(accountData))
      this.updateCourseStars(this.props, accountData)
    } catch (err) {
      console.error(err)
    }
  }
  componentWillReceiveProps (nextProps: any) {
    if (this.props.accountData !== nextProps.accountData) {
      this.setState({
        hover: false
      })
    }
  }
  updateCourseStars (props: any, account: any) {
    const main: any = {}
    let i = 0
    props.courseData.get('main').forEach((course: any) => {
      main[course.get('id')] = i++
    })
    const main64: any = {}
    i = 0
    props.courseData.get('main64').forEach((course: any) => {
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
  async onGoogleLoginSuccess (accessKey: any) {
    try {
      const response = await fetch(resolve(process.env.DOMAIN!, '/tokensignin'), {
        method: 'POST',
        body: JSON.stringify(accessKey),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error(response.statusText)
      const accountData = await response.json()
      this.props.dispatch(setAccountData(accountData))
      this.updateCourseStars(this.props, accountData)
    } catch (err) {
      console.error(err)
    }
  }
  onGoogleLoginFailure (response: any) {
    console.log(response)
  }
  async onLogOut () {
    try {
      await fetch(resolve(process.env.DOMAIN!, '/signout'), {
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
      console.error(err)
    }
  }
  render () {
    const accountData = this.props.accountData.toJS()
    const loggedIn = !!accountData.id
    const styles: React.CSSProperties = {
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
export const LoginButton = connect((state: any) => ({
  accountData: state.getIn(['userData', 'accountData']),
  courseData: state.get('courseData')
}))(Button) as any
