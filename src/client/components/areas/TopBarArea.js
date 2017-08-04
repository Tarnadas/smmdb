import React from 'react'
import {
  connect
} from 'react-redux'

import LoginButton from '../buttons/LoginButton'
import SMMButton from '../buttons/SMMButton'
import NavigationArea from './NavigationArea'
import {
  ScreenSize
} from '../../reducers/mediaQuery'

class TopBarArea extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      buttonHover: false,
      navHover: false
    }
    this.onMouseEnterButton = this.onMouseEnter.bind(this, 'buttonHover')
    this.onMouseLeaveButton = this.onMouseLeave.bind(this, 'buttonHover')
    this.onMouseEnterNav = this.onMouseEnter.bind(this, 'navHover')
    this.onMouseLeaveNav = this.onMouseLeave.bind(this, 'navHover')
  }
  onMouseEnter (type) {
    this.setState({
      [type]: true
    })
  }
  onMouseLeave (type) {
    this.setState({
      [type]: false
    })
  }
  render () {
    const screenSize = this.props.screenSize
    const hover = this.state.buttonHover || this.state.navHover
    const styles = {
      topbar: {
        width: '100%',
        height: '0',
        flex: '0 0 auto',
        zIndex: '100',
        position: 'absolute'
      },
      padding: {
        display: 'flex',
        padding: '8px 20px'
      },
      bar: {
        flex: '1 0 0%'
      },
      button: {
        width: 'auto',
        height: 'auto',
        flexShrink: '0'
      }
    }
    return (
      <div style={styles.topbar}>
        <div style={styles.padding}>
          <div style={styles.bar}>
            <SMMButton text='Navigation' iconSrc='/img/menu.png' iconColor='bright' onMouseEnter={this.onMouseEnterButton} onMouseLeave={this.onMouseLeaveButton} />
            <NavigationArea display={hover} onMouseEnter={this.onMouseEnterNav} onMouseLeave={this.onMouseLeaveNav} onClick={this.onMouseLeaveNav} />
          </div>
          <div style={styles.button}>
            {
              !process.env.ELECTRON && <LoginButton />
            }
          </div>
        </div>
      </div>
    )
  }
}
export default connect(state => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(TopBarArea)
