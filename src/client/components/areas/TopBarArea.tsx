import * as React from 'react'
import { connect } from 'react-redux'

import { LoginButton } from '../buttons/LoginButton'
import { SMMButton } from '../buttons/SMMButton'
import { NavigationArea } from './NavigationArea'
import { ScreenSize } from '../../reducers/mediaQuery'

class Area extends React.PureComponent<any, any> {
  public onMouseEnterButton: any
  public onMouseLeaveButton: any
  public onMouseEnterNav: any
  public onMouseLeaveNav: any

  constructor (props: any) {
    super(props)
    this.state = {
      buttonHover: false,
      navHover: false
    }
    this.onClick = this.onClick.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
    this.onMouseEnterButton = this.onMouseEnter.bind(this, 'buttonHover')
    this.onMouseLeaveButton = this.onMouseLeave.bind(this, 'buttonHover')
    this.onMouseEnterNav = this.onMouseEnter.bind(this, 'navHover')
    this.onMouseLeaveNav = this.onMouseLeave.bind(this, 'navHover')
  }
  onClick () {
    this.setState((prevState: any) => ({
      buttonHover: !prevState.buttonHover
    }))
  }
  onMouseEnter (type: any) {
    this.setState({
      [type]: true
    })
  }
  onMouseLeave (type: any) {
    if (typeof type === 'string') {
      this.setState({
        [type]: false
      })
    } else {
      this.setState({
        buttonHover: false,
        navHover: false
      })
    }
  }
  render () {
    const screenSize = this.props.screenSize
    const hover = this.state.buttonHover || this.state.navHover
    const styles: any = {
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
      },
      icon: {
        position: 'fixed',
        width: '40px',
        height: '40px',
        padding: '4px',
        top: '8px',
        left: '0',
        cursor: 'pointer',
        backgroundColor: '#ffcf00',
        boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.75)',
        borderRadius: '0 4px 4px 0',
        transform: hover ? 'translateX(+240px)' : 'none',
        transition: 'transform 0.5s linear',
        willChange: 'transform'
      },
      img: {
        width: '100%',
        height: '100%'
      }
    }
    return (
      <div style={styles.topbar}>
        <div style={styles.padding}>
          <div style={styles.bar}>
            {
              screenSize < ScreenSize.MEDIUM ? (
                <div style={styles.icon} onMouseLeave={this.onMouseLeaveButton} onClick={this.onClick}>
                  <img style={styles.img} src='/img/menu.svg' />
                </div>
              ) : (
                <SMMButton text='Navigation' iconSrc='/img/menu.png' iconColor='bright'
                  onMouseEnter={this.onMouseEnterButton}
                  onMouseLeave={this.onMouseLeaveButton}
                />
              )
            }
            <NavigationArea
              display={hover}
              onMouseEnter={screenSize < ScreenSize.MEDIUM ? this.onMouseEnterButton : this.onMouseEnterNav}
              onMouseLeave={screenSize < ScreenSize.MEDIUM ? this.onMouseLeaveButton : this.onMouseLeaveNav}
              onClick={this.onMouseLeave}
            />
          </div>
          <div style={styles.button}>
            {
              screenSize >= ScreenSize.MEDIUM &&
              <LoginButton />
            }
          </div>
        </div>
      </div>
    )
  }
}
export const TopBarArea = connect((state: any) => ({
  screenSize: state.getIn(['mediaQuery', 'screenSize'])
}))(Area) as any
